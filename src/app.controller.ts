import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { CreateIncomeDto } from './dto/create-income.dto';
import { VerifyDto } from './dto/verify.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    return this.appService.getHello();
  }

  @Post('/incomes')
  getIncome() {
    return this.appService.getIncome();
  }

  @Post('/expenses')
  getExpense() {
    return this.appService.getExpense();
  }

  @Post('/add-income')
  createIncome(@Body() createIncomeDto: CreateIncomeDto) {
    return this.appService.createIncome(createIncomeDto);
  }

  @Post('/add-expense')
  createExpense(@Body() createExpenseDto: CreateExpenseDto) {
    return this.appService.createExpense(createExpenseDto);
  }

  @Post('/verify-income')
  verifyIncome(@Body() verifyDto: VerifyDto) {
    return this.appService.verifyIncome(verifyDto);
  }

  @Post('/verify-expense')
  verifyExpense(@Body() verifyDto: VerifyDto) {
    return this.appService.verifyExpense(verifyDto);
  }
}
