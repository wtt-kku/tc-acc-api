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

export class CreateIncomeDto {
  @IsString()
  @IsNotEmpty()
  transferor_name: string;

  @IsString()
  @IsNotEmpty()
  transferor_bank: string;

  @IsString()
  @IsNotEmpty()
  method: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  transaction_date: Date;

  @IsString()
  @IsNotEmpty()
  time: string;

  @IsString()
  @IsOptional()
  remark: string;

  @IsString()
  @IsNotEmpty()
  reporter: string;
}
