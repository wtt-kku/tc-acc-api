import { Column, Entity } from 'typeorm';
import { BaseColumnEntity } from './base.entity';

@Entity('income')
export class IncomeEntity extends BaseColumnEntity {
  @Column({ nullable: false })
  transferor_name: string;

  @Column({ nullable: false })
  transferor_bank: string;

  @Column({ nullable: false })
  method: string;

  @Column({ type: 'numeric', nullable: false })
  amount: number;

  @Column({ type: 'timestamp', nullable: false })
  transaction_date: Date;

  @Column({ nullable: false })
  time: string;

  @Column({ nullable: true })
  remark: string;

  @Column({ nullable: false })
  reporter: string;

  @Column({ default: false, nullable: false })
  verified: boolean;
}
