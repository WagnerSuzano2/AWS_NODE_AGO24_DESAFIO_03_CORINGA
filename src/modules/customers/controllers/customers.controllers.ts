import { Request, Response } from 'express';
import ICustomer from '../interface/ICustomer';
import { validate as isUuid } from 'uuid';
import { customerRepositorySource } from '../repositories/CustomerRepository';
import IPagination from '../interface/IPagination';
import ReadCustomerService from '../services/ReadCustomerService';
import AppError from '../../../shared/errors/AppError';

class CustomerController {
  async create(req: Request, res: Response): Promise<void> {
    const customer: ICustomer = req.body;

    try {
      const newCustomer = customerRepositorySource.create(customer);
      await customerRepositorySource.save(newCustomer);
      res.status(201).json({ newCustomer });
      return;
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error', error });
      return;
    }
  }

  async readById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const customer = await customerRepositorySource.findOneBy({ id });

      if (!id || !isUuid(id)) {
        res.status(400).json({ message: 'Valid ID is required' });
        return;
      }

      if (!customer) {
        res.status(404).json({ message: 'Customer not found' });
        return;
      }
      res.status(200).json({ customer });
      return;
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error', error });
      return;
    }
  }

  async read(req: Request, res: Response): Promise<void> {
    const queryParams: IPagination = req.query as unknown as IPagination;

    try {
      const result = await ReadCustomerService.listCustomers(queryParams);
      if (result.customers.length === 0) {
        res.status(404).json({ message: 'No customers found' });
        return;
      }

      res.status(200).json(result);
      return;
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error', error });
      return;
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const customer = await customerRepositorySource.findOne({
      where: { id },
      withDeleted: true,
    });
    await customerRepositorySource.softDelete({ id });

    if (!id || !isUuid(id)) {
      throw new AppError('Valid ID is required', 400);
    }

    if (!customer) {
      throw new AppError('Customer not found', 400);
    }

    if (customer.deletedAt) {
      throw new AppError('Customer already deleted', 400);
    }

    res.status(200).json({ message: 'Customer deleted' });
    return;
  }

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const customerData: ICustomer = req.body;

    try {
      const existsCustomer = await customerRepositorySource.findOne({
        where: { id },
      });
      if (!existsCustomer) {
        throw new AppError('Customer not found', 404);
      }
      await customerRepositorySource.update({ id }, customerData);
      res.status(200).json({ message: 'Customer updated' });
      return;
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}
export default CustomerController;
