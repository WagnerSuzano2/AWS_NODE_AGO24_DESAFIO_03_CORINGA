import Customer from '../entities/Customer';
import ICustomer from '../interface/ICustomer';
import AppDataSource from '../../../db/data-source';

export const customerRepositorySource = AppDataSource.getRepository(Customer);

class CustomerRepository {
  async findCustomerByCpf(cpf: string): Promise<ICustomer | null> {
    return await customerRepositorySource.findOne({ where: { cpf } });
  }

  async findCustomerByEmail(email: string): Promise<ICustomer | null> {
    return await customerRepositorySource.findOne({ where: { email } });
  }
}

export default CustomerRepository;
