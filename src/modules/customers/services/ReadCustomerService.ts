import { Like, Not, IsNull, FindOptionsWhere, FindOptionsOrder } from 'typeorm';
import { customerRepositorySource } from '../repositories/CustomerRepository';
import IPagination from '../interface/IPagination';
import Customer from '../entities/Customer';

class ReadCustomerServices {
  async listCustomers(queryParams: IPagination) {
    const {
      name,
      email,
      cpf,
      exclude,
      orderBy,
      orderDirection = 'DESC',
      page = 1,
      limit = 10,
    }: IPagination = queryParams;

    const condition: FindOptionsWhere<Customer> = {};

    if (name) {
      condition.fullName = Like(`%${name}%`);
    }

    if (email) {
      condition.email = Like(`%${email}%`);
    }

    if (cpf) {
      condition.cpf = cpf;
    }

    if (exclude === true) {
      condition.deletedAt = Not(IsNull());
    } else if (exclude === false) {
      condition.deletedAt = IsNull();
    }

    const order: FindOptionsOrder<Customer> = {};
    const validOrderFields: Array<keyof Customer> = [
      'fullName',
      'createdAt',
      'deletedAt',
    ];

    if (orderBy && validOrderFields.includes(orderBy as keyof Customer)) {
      order[orderBy as keyof Customer] =
        orderDirection.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    }

    const [customers, total] = await customerRepositorySource.findAndCount({
      where: condition,
      order,
      withDeleted: true,
      take: Number(limit),
      skip: (Number(page) - 1) * Number(limit),
    });

    const totalPages = Math.ceil(total / Number(limit));

    return {
      total,
      page: Number(page),
      totalPages,
      customers,
    };
  }
}

export default new ReadCustomerServices();
