import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Repository } from 'typeorm';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { CreateIncomeDto } from './dto/create-income.dto';
import { VerifyDto } from './dto/verify.dto';
import { ExpenseEntity } from './entity/expense.entity';
import { IncomeEntity } from './entity/income.entity';
import { configService, Key } from './environment/config.service';
import { IResponses } from './interface';
import toShowCurrency from './lib/currency';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(IncomeEntity)
    private incomeEntity: Repository<IncomeEntity>,

    @InjectRepository(ExpenseEntity)
    private expenseEntity: Repository<ExpenseEntity>,
  ) {}
  getHello() {
    return {
      result: true,
      status: 200,
      message: 'Application is running',
    };
  }

  async getIncome(): Promise<IResponses> {
    try {
      let incomes = await this.incomeEntity.find({
        order: {
          create_date: 'DESC',
        },
      });

      return {
        result: true,
        status: 200,
        message: 'Load success',
        data: incomes,
      };
    } catch (error) {
      console.log(error);
      return {
        result: false,
        status: 500,
        message: 'Internal Error',
      };
    }
  }

  async getExpense(): Promise<IResponses> {
    try {
      let expenses = await this.expenseEntity.find({
        order: {
          create_date: 'DESC',
        },
      });

      return {
        result: true,
        status: 200,
        message: 'Load success',
        data: expenses,
      };
    } catch (error) {
      console.log(error);
      return {
        result: false,
        status: 500,
        message: 'Internal Error',
      };
    }
  }

  async createIncome(createIncomeDto: CreateIncomeDto): Promise<IResponses> {
    try {
      let income = new IncomeEntity();
      income.transferor_name = createIncomeDto.transferor_name;
      income.transferor_bank = createIncomeDto.transferor_bank;
      income.method = createIncomeDto.method;
      income.amount = createIncomeDto.amount;
      income.transaction_date = new Date(createIncomeDto.transaction_date);
      income.time = createIncomeDto.time;
      income.remark = createIncomeDto.remark || '';
      income.reporter = createIncomeDto.reporter;

      let new_transaction = await this.incomeEntity.save(income);
      console.log(new_transaction);

      //Noti
      let text =
        '\n' +
        '=== แจ้งเตือนรับยอด 🟢 ===' +
        '\n\n' +
        `UID:  ${new_transaction.id}` +
        '\n\n' +
        `รับเงินจาก:  ${new_transaction.transferor_name}` +
        '\n' +
        `ยอดเงิน:  ${toShowCurrency(new_transaction.amount)} ฿` +
        '\n\n' +
        `หมายเหตุ:  ${new_transaction.remark}` +
        '\n\n' +
        `ผู้แจ้ง:  ${new_transaction.reporter}` +
        '\n\n' +
        `==================`;

      let url = configService.getValue(Key.URL_LINE_NOTIFY);
      let body = {
        message: text,
      };
      let config = {
        headers: {
          Authorization: `Bearer ${configService.getValue(
            Key.LINE_NOTI_TOKEN,
          )}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      };
      let result_noti = await axios.post(url, body, config);
      if (result_noti.data.status == 200) {
        console.log('Notify income Success');
      }

      return {
        result: true,
        status: 201,
        message: 'Created',
        data: new_transaction,
      };
    } catch (error) {
      console.log(error);
      return {
        result: false,
        status: 500,
        message: 'Internal Error',
      };
    }
  }

  async createExpense(createExpenseDto: CreateExpenseDto): Promise<IResponses> {
    try {
      let expense = new ExpenseEntity();
      expense.type = createExpenseDto.type;
      expense.receiver_name = createExpenseDto.receiver_name;
      expense.receiver_bank = createExpenseDto.receiver_bank;
      expense.amount = createExpenseDto.amount;
      expense.remark = createExpenseDto.remark || '';
      expense.reporter = createExpenseDto.reporter;

      let new_transaction = await this.expenseEntity.save(expense);
      console.log(new_transaction);

      //Noti
      let text =
        '\n' +
        '=== แจ้งเตือนเบิกเงิน 🔴 ===' +
        '\n\n' +
        `UID:  ${new_transaction.id}` +
        '\n\n' +
        `เบิกค่า :  ${new_transaction.type}` +
        '\n\n' +
        `ผู้รับเงิน :  ${new_transaction.receiver_name}` +
        '\n' +
        `บัญชีผู้รับ :  ${new_transaction.receiver_bank}` +
        '\n' +
        `จำนวนเงินที่ขอเบิก:  ${toShowCurrency(new_transaction.amount)} ฿` +
        '\n\n' +
        `หมายเหตุ:  ${new_transaction.remark}` +
        '\n\n' +
        `ผู้แจ้ง:  ${new_transaction.reporter}` +
        '\n\n' +
        `==================`;

      let url = configService.getValue(Key.URL_LINE_NOTIFY);
      let body = {
        message: text,
      };
      let config = {
        headers: {
          Authorization: `Bearer ${configService.getValue(
            Key.LINE_NOTI_TOKEN,
          )}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      };
      let result_noti = await axios.post(url, body, config);
      if (result_noti.data.status == 200) {
        console.log('Notify expense Success');
      }

      return {
        result: true,
        status: 201,
        message: 'Created',
        data: new_transaction,
      };
    } catch (error) {
      console.log(error);
      return {
        result: false,
        status: 500,
        message: 'Internal Error',
      };
    }
  }

  async verifyIncome(verifyDto: VerifyDto): Promise<IResponses> {
    try {
      const income = await this.incomeEntity.findOneBy({
        id: verifyDto.id,
      });

      if (!income) {
        return {
          result: false,
          status: 400,
          message: 'Not Found Expense',
        };
      }

      if (income.verified) {
        return {
          result: false,
          status: 400,
          message: 'Verified already!',
        };
      }

      income.verified = true;
      await this.incomeEntity.update(
        {
          id: verifyDto.id,
        },
        income,
      );

      return {
        result: true,
        status: 200,
        message: 'Verify income success',
      };
    } catch (error) {
      console.log(error);
      return {
        result: false,
        status: 500,
        message: 'Internal Error',
      };
    }
  }

  async verifyExpense(verifyDto: VerifyDto): Promise<IResponses> {
    try {
      const expense = await this.expenseEntity.findOneBy({
        id: verifyDto.id,
      });

      if (!expense) {
        return {
          result: false,
          status: 400,
          message: 'Not Found Income',
        };
      }

      if (expense.verified) {
        return {
          result: false,
          status: 400,
          message: 'Verified already!',
        };
      }

      expense.verified = true;
      await this.expenseEntity.update(
        {
          id: verifyDto.id,
        },
        expense,
      );

      return {
        result: true,
        status: 200,
        message: 'Verify expense success',
      };
    } catch (error) {
      console.log(error);
      return {
        result: false,
        status: 500,
        message: 'Internal Error',
      };
    }
  }
}
