import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { FileableType, PostableType, User } from '@prisma/client';
import CreateCrimeDTO from './dto/create-crime.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { FileService } from 'src/file/file.service';
import UpdateCrimeDTO from './dto/update-crime.dto';
import { AdminService } from 'src/admin/admin.service';
import { PostService } from 'src/post/post.service';

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
  ) {
    this.updateDescriptiveMarkers();
  }

  descriptiveMarkers: Array<string>;

  private doesNotContainMainMarkers(victimOrSuspect: object) {
    let doesNotContain = true;

    Object.keys(victimOrSuspect).forEach((key) => {
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
    if (value && this.doesNotContainMainMarkers(value)) {
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
    const { victim, suspect } = this.getVictimAndSuspectFromDTO(dto);

    const data = {
      anonymous: dto.anonymous == 'true' ? true : false,
      crimeTypeId: dto.crimeTypeId,
      crimeTypeName: dto.crimeTypeName,
      description: dto.description,
      name: dto.name,
      severity: dto.severity,
      lat: dto.lat,
      lon: dto.lon,
      landmark: dto.landmark,
      occurredOn: dto.occurredOn,
      victim,
      suspect,
    };

    if (dto.anonymous == 'true') data['anonymous'] = true;
    const crime = await this.prisma.crime.create({
      data: { userId: user.id, ...data },
    });

    const fileModels = await this.fileService.createAndStoreFilesFor(
      { userId: user.id, modelId: crime.id, modelType: 'Crime' },
      files,
    );

    await this.postService.createPostFrom({
      postableId: crime.id,
      postableType: PostableType.Crime,
      userId: user.id,
    });

    return {
      ...crime,
      files: fileModels.map((f) => {
        delete f.path;
        delete f.fileableId;
        delete f.fileableType;
        return f;
      }),
    };
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
          modelType: FileableType.Crime,
          modelId: crime.id,
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

    await this.fileService.createAndStoreFilesFor(
      { userId: user.id, modelId: crime.id, modelType: 'Crime' },
      files,
    );

    return crime;
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

    return await this.prisma.crime.delete({
      where: { id: crime.id },
    });
  }
}
