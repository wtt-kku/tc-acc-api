import { Logger } from '@nestjs/common';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const ENV = process.env.NODE_ENV?.trim() || '';

Logger.log(`> set environment file : ${ENV}.env`, 'ConfigService');

if (ENV) {
  console.log('ENV');
  require('dotenv').config({
    path: __dirname + `/../../src/environments/${ENV}.env`,
  });
} else {
  require('dotenv').config();
}

enum Key {
  VERSION = 'VERSION',
  MODE = 'MODE',
  DATABASE_TYPE = 'DATABASE_TYPE',
  DATABASE_HOST = 'DATABASE_HOST',
  DATABASE_PORT = 'DATABASE_PORT',
  DATABASE_USER = 'DATABASE_USER',
  DATABASE_PASSWORD = 'DATABASE_PASSWORD',
  DATABASE = 'DATABASE',
  DATABASE_SYNCHRONIZE = 'DATABASE_SYNCHRONIZE',
}

class ConfigService {
  constructor(private env: { [k: string]: string | undefined }) {}

  public getValue(key: Key, throwOnMissing = true): string {
    const value = this.env[key];
    if (!value && throwOnMissing) {
      throw new Error(`config error - missing env.${key}`);
    }
    return value;
  }

  private getSynchronize(key: Key): boolean {
    return JSON.parse(this.env[key]) || false;
  }

  public getTypeOrmConfig(): TypeOrmModuleOptions {
    return {
      type: this.getValue(Key.DATABASE_TYPE) as any,
      host: this.getValue(Key.DATABASE_HOST),
      port: parseInt(this.getValue(Key.DATABASE_PORT)),
      username: this.getValue(Key.DATABASE_USER),
      password: this.getValue(Key.DATABASE_PASSWORD),
      database: this.getValue(Key.DATABASE),
      entities: ['dist/**/*.entity.js'],
      synchronize: this.getSynchronize(Key.DATABASE_SYNCHRONIZE),
    };
  }
}

const configService = new ConfigService(process.env);

export { configService, Key, ENV };
