import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { IResponses } from '../interface';
import { MESSAGE } from '../constants';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    Logger.log(`[is Array] ${Array.isArray(value)}`, ValidationPipe.name);
    Logger.log(
      `[VALIDATION] Body ${JSON.stringify(value)}`,
      ValidationPipe.name,
    );

    await this.isArrayValue(metatype, value);

    Logger.log(`[VALIDATION] Pass`, ValidationPipe.name);
    return value;
  }

  private resErr(errors: any[], index?: number) {
    const res: IResponses = {
      result: false,
      status: HttpStatus.BAD_REQUEST,
      message: MESSAGE.VALIDATION_FAILED,
      error:
        index > -1 ? [{ [index]: this.mapErr(errors) }] : this.mapErr(errors),
    };

    Logger.log(`[VALIDATION] ${JSON.stringify(res)}`, ValidationPipe.name);

    throw new BadRequestException(res);
  }

  private mapErr(errors: ValidationError[]) {
    return errors.map((e) => {
      if (e.constraints) {
        return { [e.property]: e.constraints };
      } else {
        if (e.children.length) {
          return { [e.property]: this.mapErr(e.children) };
        }
      }
    });
  }

  private async isArrayValue(metatype: any, value: any) {
    if (Array.isArray(value)) {
      for (let index = 0; index < value.length; index++) {
        const element = value[index];
        const object = plainToClass(metatype, element);
        const errors = await validate(object);
        if (errors.length) {
          return this.resErr(errors, index);
        }
      }
    } else {
      const object = plainToClass(metatype, value);
      const errors = await validate(object);
      if (errors.length) {
        return this.resErr(errors);
      }
    }
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
