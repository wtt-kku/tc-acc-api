import { shortid } from 'src/lib/shortid';
import {
  BeforeInsert,
  CreateDateColumn,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

export class BaseColumnEntity {
  @PrimaryColumn('varchar', {
    length: 20,
  })
  id?: string;

  @BeforeInsert()
  setId() {
    this.id = shortid.generateId(13);
  }

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  create_date?: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  update_date?: Date;
}
