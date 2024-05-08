import { RequestState } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export default class ResponseDTO {
  @IsNotEmpty()
  @IsString()
  @IsIn([RequestState.ACCEPTED, RequestState.DECLINED])
  @Transform((data) =>
    data.value == 'ACCEPTED' ? RequestState.ACCEPTED : RequestState.DECLINED,
  )
  response: RequestState;
}
