import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import IOrder from './IOrder';
import Customer from '../../customers/entities/Customer';
import Cars from '../../cars/entities/Cars';

@Entity('Order')
export default class Order implements IOrder {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  dateRequest!: Date;

  @Column('enum', {
    enum: ['open', 'approved', 'closed', 'cancelled']
  })
  statusRequest!: string;

  @Column({ type: 'varchar', default: null })
  cep!: string;

  @Column({ type: 'varchar', default: null })
  city!: string;

  @Column({ type: 'varchar', default: null })
  uf!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  rentalTax!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalValue!: number;

  @Column({ type: 'timestamp', nullable: true })
  startDate!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  endDate!: Date | null;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  cancelDate!: Date | null;

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  finishDate!: Date | null;

  @Column({ type: 'decimal', default: 0 })
  fine!: number;

  @OneToOne(() => Customer, customer => customer.order, {nullable: false})
  @JoinColumn()
  customer!: Customer;

  @OneToOne(() => Cars, cars => cars.order, {nullable: false})
  @JoinColumn()
  car!: Cars;
}
