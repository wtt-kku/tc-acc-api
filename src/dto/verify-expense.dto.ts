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

export class VerifyExpenseDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  transaction_date: Date;

  @IsString()
  @IsNotEmpty()
  time: string;
}
