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
import * as moment from 'moment';
import { GetdataDto } from './dto/get-data.dto';
import removeVat from './lib/remove-vat';
import { VerifyExpenseDto } from './dto/verify-expense.dto';

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

  // async getIncome(): Promise<IResponses> {
  //   try {
  //     let incomes = await this.incomeEntity.find({
  //       order: {
  //         create_date: 'DESC',
  //       },
  //     });

  //     return {
  //       result: true,
  //       status: 200,
  //       message: 'Load success',
  //       data: incomes,
  //     };
  //   } catch (error) {
  //     console.log(error);
  //     return {
  //       result: false,
  //       status: 500,
  //       message: 'Internal Error',
  //     };
  //   }
  // }

  async getExpense(): Promise<IResponses> {
    try {
      let dateCurrent = new Date();
      let expenses = await this.expenseEntity
        .createQueryBuilder('ic')
        .where('ic.create_date >= :after', {
          after: moment(dateCurrent).startOf('month').format('YYYY-MM-DD'),
        })
        .andWhere('ic.create_date <= :before', {
          before: moment(dateCurrent).endOf('month').format('YYYY-MM-DD'),
        })
        .orderBy('ic.create_date', 'DESC')
        .getMany();

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
      income.create_date = new Date();
      income.update_date = new Date();
      income.transferor_name = createIncomeDto.transferor_name;
      income.transferor_bank = createIncomeDto.transferor_bank;
      income.method = createIncomeDto.method;
      income.amount = createIncomeDto.amount;
      income.transaction_date = new Date(
        createIncomeDto.transaction_date,
      ).toISOString();
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
      expense.receiver_bank_no = createExpenseDto.receiver_bank_no;
      expense.amount = createExpenseDto.amount;
      expense.remark = createExpenseDto.remark || '';
      expense.reporter = createExpenseDto.reporter;
      expense.create_date = new Date();
      expense.update_date = new Date();

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
          message: 'Not found income',
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

  async verifyExpense(verifyExpenseDto: VerifyExpenseDto): Promise<IResponses> {
    try {
      const expense = await this.expenseEntity.findOneBy({
        id: verifyExpenseDto.id,
      });

      if (!expense) {
        return {
          result: false,
          status: 400,
          message: 'Not found expense',
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
      expense.transaction_date = new Date(
        verifyExpenseDto.transaction_date,
      ).toISOString();

      expense.time = verifyExpenseDto.time;

      await this.expenseEntity.update(
        {
          id: verifyExpenseDto.id,
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

  async getIncome(getdataDto: GetdataDto): Promise<IResponses> {
    try {
      var dateCurrent = new Date();

      if (getdataDto.date) {
        dateCurrent = getdataDto.date;
      }

      // let obj = {
      //   after: moment(dateCurrent).startOf('month').format('YYYY-MM-DD'),
      //   before: moment(dateCurrent).endOf('month').format('YYYY-MM-DD'),
      // };

      let incomes = await this.incomeEntity
        .createQueryBuilder('ic')
        .where('ic.transaction_date >= :after', {
          after: moment(dateCurrent).startOf('month').format('YYYY-MM-DD'),
        })
        .andWhere('ic.transaction_date <= :before', {
          before: moment(dateCurrent).endOf('month').format('YYYY-MM-DD'),
        })
        .orderBy('ic.create_date', 'DESC')
        .getMany();

      let success_summary = 0;
      let all_summary = 0;
      incomes.forEach((item) => {
        all_summary += Number(item.amount);
        if (item.verified) {
          success_summary += Number(item.amount);
        }
      });

      const resData = {
        all_summary: all_summary,
        success_summary: success_summary,
        records: incomes || [],
      };

      return {
        result: true,
        status: 200,
        message: 'Load success',
        data: resData,
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

  async getExpenseTD(getdataDto: GetdataDto): Promise<IResponses> {
    try {
      var dateCurrent = new Date();

      if (getdataDto.date) {
        dateCurrent = getdataDto.date;
      }

      let incomes = await this.expenseEntity
        .createQueryBuilder('ep')
        .where('ep.transaction_date >= :after', {
          after: moment(dateCurrent).startOf('month').format('YYYY-MM-DD'),
        })
        .andWhere('ep.transaction_date <= :before', {
          before: moment(dateCurrent).endOf('month').format('YYYY-MM-DD'),
        })
        .getMany();

      let success_summary = 0;
      let all_summary = 0;
      incomes.forEach((item) => {
        all_summary += Number(item.amount);
        if (item.verified) {
          success_summary += Number(item.amount);
        }
      });

      const resData = {
        all_summary: all_summary,
        success_summary: success_summary,
        records: incomes || [],
      };

      return {
        result: true,
        status: 200,
        message: 'Load success',
        data: resData,
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

  async showMoney(getdataDto: GetdataDto): Promise<IResponses> {
    try {
      let dateCurrent = new Date();

      if (getdataDto.date) {
        dateCurrent = getdataDto.date;
      }

      let round1 = {
        start: moment(dateCurrent).startOf('month').format('YYYY-MM-DD'),
        end: moment(dateCurrent).startOf('month').format('YYYY-MM-09'),
      };

      let round2 = {
        start: moment(dateCurrent).startOf('month').format('YYYY-MM-10'),
        end: moment(dateCurrent).endOf('month').format('YYYY-MM-19'),
      };

      let round3 = {
        start: moment(dateCurrent).startOf('month').format('YYYY-MM-20'),
        end: moment(dateCurrent).endOf('month').format('YYYY-MM-DD'),
      };

      let incomesRound1 = await this.incomeEntity
        .createQueryBuilder('ic1')
        .where('ic1.transaction_date >= :after', {
          after: round1.start,
        })
        .andWhere('ic1.transaction_date <= :before', {
          before: round1.end,
        })
        .orderBy('ic1.create_date', 'DESC')
        .getMany();

      let incomesRound2 = await this.incomeEntity
        .createQueryBuilder('ic2')
        .where('ic2.transaction_date >= :after', {
          after: round2.start,
        })
        .andWhere('ic2.transaction_date <= :before', {
          before: round2.end,
        })
        .orderBy('ic2.create_date', 'DESC')
        .getMany();

      let incomesRound3 = await this.incomeEntity
        .createQueryBuilder('ic3')
        .where('ic3.transaction_date >= :after', {
          after: round3.start,
        })
        .andWhere('ic3.transaction_date <= :before', {
          before: round3.end,
        })
        .orderBy('ic3.create_date', 'DESC')
        .getMany();

      let successSumR1 = 0;
      let successSumR2 = 0;
      let successSumR3 = 0;
      incomesRound1.forEach((item) => {
        if (item.verified) {
          successSumR1 += Number(item.amount);
        }
      });

      incomesRound2.forEach((item) => {
        if (item.verified) {
          successSumR2 += Number(item.amount);
        }
      });

      incomesRound3.forEach((item) => {
        if (item.verified) {
          successSumR3 += Number(item.amount);
        }
      });

      let res = {
        sum:
          removeVat(successSumR1) +
          removeVat(successSumR2) +
          removeVat(successSumR3),
        r1: removeVat(successSumR1),
        r2: removeVat(successSumR2),
        r3: removeVat(successSumR3),
      };

      return {
        result: true,
        status: 200,
        message: 'Load success',
        data: res,
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
