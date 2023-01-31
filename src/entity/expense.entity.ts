import { Column, Entity } from 'typeorm';
import { BaseColumnEntity } from './base.entity';

@Entity('expense')
export class ExpenseEntity extends BaseColumnEntity {
  @Column({ nullable: false })
  type: string;

  @Column({ nullable: false })
  receiver_name: string;

  @Column({ nullable: false })
  receiver_bank: string;

  @Column({ type: 'numeric', nullable: false })
  amount: number;

  @Column({ type: 'timestamp', nullable: true })
  transaction_date: Date;

  @Column({ nullable: true })
  time: string;

  @Column({ nullable: true })
  remark: string;

  @Column({ nullable: false })
  reporter: string;

  @Column({ default: false, nullable: false })
  verified: boolean;
}
