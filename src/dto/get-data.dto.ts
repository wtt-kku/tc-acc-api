import { Type } from 'class-transformer';
import {
  IsDate,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class GetdataDto {
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  date?: Date;
}
