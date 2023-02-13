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

export class CreateExpenseDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  receiver_name: string;

  @IsString()
  @IsNotEmpty()
  receiver_bank: string;

  @IsString()
  @IsNotEmpty()
  receiver_bank_no: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsOptional()
  remark: string;

  @IsString()
  @IsNotEmpty()
  reporter: string;
}
