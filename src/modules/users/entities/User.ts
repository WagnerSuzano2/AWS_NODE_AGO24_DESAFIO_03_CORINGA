import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn,  } from 'typeorm';
import IUser from '../models/IUser';

@Entity('users')
export default class User implements IUser{
    @PrimaryGeneratedColumn('uuid')
    id?: string

    @Column()
    name?: string

    @Column()
    email?: string

    @Column()
    password?: string;

    @CreateDateColumn()
    createdAt?: Date;

    @DeleteDateColumn()
    deletedAt?: Date | null;
}