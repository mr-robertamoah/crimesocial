import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SuggestionType, User } from '@prisma/client';
import CreateCrimeDTO from './dto/create-crime.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { FileService } from 'src/file/file.service';
import UpdateCrimeDTO from './dto/update-crime.dto';
import { AdminService } from 'src/admin/admin.service';
import { PostService } from 'src/post/post.service';
import { SuggestionService } from 'src/suggestion/suggestion.service';
import { DescriptiveMarkers } from 'src/constants';

type CrimeDataType = {
  anonymous?: boolean;
  crimeTypeId?: number;
  crimeTypeName?: string;
  description?: string;
  name?: string;
  severity?: number;
  lat?: number;
  lon?: number;
  landmark?: string;
  occurredOn?: string;
  victim?: object;
  suspect?: object;
};
@Injectable()
export class CrimeService {
  constructor(
    private prisma: PrismaService,
    private fileService: FileService,
    private adminService: AdminService,
    private postService: PostService,
    private suggestionService: SuggestionService,
  ) {
    this.updateDescriptiveMarkers();
  }

  descriptiveMarkers: Array<string>;

  private doesNotContainMainMarkers(victimOrSuspect: object) {
    let doesNotContain = true;
    console.log(victimOrSuspect);

    Object.keys(victimOrSuspect).forEach((key) => {
      console.log(key);
      if (this.descriptiveMarkers.includes(key)) {
        doesNotContain = false;
      }
    });

    return doesNotContain;
  }

  private getMarkersAsString() {
    return this.descriptiveMarkers.join(', ');
  }

  private async updateDescriptiveMarkers() {
    const markers = await this.prisma.descriptiveMarker.findMany({
      select: {
        name: true,
      },
    });
    this.descriptiveMarkers = markers.map((marker) => marker.name);

    if (!this.descriptiveMarkers.length) {
      this.descriptiveMarkers = DescriptiveMarkers;
    }
  }

  private getVictimAndSuspectFromDTO(dto: CreateCrimeDTO | UpdateCrimeDTO) {
    return {
      victim: this.checkAndGetDescriptiveMarkersFromDTO(dto, 'victim'),
      suspect: this.checkAndGetDescriptiveMarkersFromDTO(dto, 'suspect'),
    };
  }

  private checkAndGetDescriptiveMarkersFromDTO(
    dto: CreateCrimeDTO | UpdateCrimeDTO,
    key: string,
  ) {
    const value = dto[key] ? JSON.parse(dto[key]) : null;
    if (Object.keys(value).length && this.doesNotContainMainMarkers(value)) {
      throw new BadRequestException(
        `Please add any of the following key markers to the ${key} description: ${this.getMarkersAsString()}`,
      );
    }

    return value;
  }

  async createCrime(
    user: User,
    dto: CreateCrimeDTO,
    files: Array<Express.Multer.File>,
  ) {
    console.log(dto, files);
    const { victim, suspect } = this.getVictimAndSuspectFromDTO(dto);

    const data = {
      anonymous: dto.anonymous == 'true' ? true : false,
      crimeTypeId: dto.crimeTypeId ? Number(dto.crimeTypeId) : null,
      crimeTypeName: dto.crimeTypeName,
      description: dto.description,
      name: dto.name,
      severity: Number(dto.severity),
      lat: Number(dto.lat),
      lon: Number(dto.lon),
      landmark: dto.landmark,
      occurredOn: new Date(dto.occurredOn).toISOString(),
      victim,
      suspect,
    };

    const post = await this.prisma.$transaction(async () => {
      if (dto.anonymous == 'true') data['anonymous'] = true;
      const crime = await this.prisma.crime.create({
        data: { userId: user.id, ...data },
      });

      await this.fileService.createAndStoreFilesFor(
        { userId: user.id, crimeId: crime.id },
        files,
      );

      if (dto.crimeTypeName && !dto.crimeTypeId)
        await this.suggestionService.createSuggestionFor({
          byId: user.id,
          byType: 'User',
          type: SuggestionType.CRIMETYPE,
          message: 'add crime type if missing.',
        });

      return await this.postService.createPostFrom({
        crimeId: crime.id,
        userId: user.id,
      });
    });

    post.crime[0].files = post.crime[0].files.map((file) => {
      delete file.path;
      return file;
    });

    delete post.user.password;
    delete post.user.refreshToken;

    return post;
  }

  async ensureCrimeIdIsValid(crimeId: string | number) {
    const crime = await this.prisma.crime.findFirst({
      where: { id: Number(crimeId) },
      include: { files: true },
    });

    if (crime) return crime;

    throw new BadRequestException(`Crime with id of ${crimeId} was not found.`);
  }

  async updateCrime(
    user: User,
    dto: UpdateCrimeDTO,
    files?: Array<Express.Multer.File>,
  ) {
    let crime = await this.ensureCrimeIdIsValid(dto.crimeId);

    if (
      user.id !== crime.userId &&
      (await this.adminService.isNotAdmin(user.id))
    )
      throw new UnauthorizedException('You cannot update this crime.');

    const data: CrimeDataType = {};
    Object.keys(dto).forEach((key: string) => {
      if (!dto[key] || ['deletedFiles', 'crimeId'].includes(key)) return;

      data[key] = dto[key];
    });

    if (data.suspect)
      data.suspect = this.checkAndGetDescriptiveMarkersFromDTO(dto, 'suspect');

    if (data.victim)
      data.victim = this.checkAndGetDescriptiveMarkersFromDTO(dto, 'victim');

    if (files && files.length)
      await this.fileService.createAndStoreFilesFor(
        {
          userId: user.id,
          crimeId: crime.id,
        },
        files,
      );

    if (dto.deletedFiles) {
      this.fileService.deleteFilesUsingIds(JSON.parse(dto.deletedFiles));
    }

    crime = await this.prisma.updateMultipleFields({
      field: 'crime',
      fieldId: crime.id,
      keyAndValuePairs: data,
      include: { files: true },
    });

    crime.files = crime.files.map((file) => {
      delete file.path;
      return file;
    });

    return await this.postService.getPostFor({
      postableType: 'crime',
      postableId: crime.id,
    });
  }

  async deleteCrime(user: User, crimeId: number) {
    const crime = await this.ensureCrimeIdIsValid(crimeId);

    if (
      user.id !== crime.userId &&
      (await this.adminService.isNotAdmin(user.id))
    )
      throw new UnauthorizedException('You cannot delete this crime.');

    if (crime?.files && crime.files?.length)
      await this.fileService.deleteFilesUsingIds(
        crime.files.map((file) => file.id),
      );

    await this.postService.deletePostFor({
      postableType: 'crime',
      postableId: crime.id,
    });

    return await this.prisma.crime.delete({
      where: { id: crime.id },
    });
  }
}
