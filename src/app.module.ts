import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExpenseEntity } from './entity/expense.entity';
import { IncomeEntity } from './entity/income.entity';
import { configService } from './environment/config.service';

@Module({
  imports: [
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
    TypeOrmModule.forFeature([IncomeEntity, ExpenseEntity]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
