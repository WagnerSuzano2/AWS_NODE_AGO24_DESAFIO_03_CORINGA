import AppDataSource from '../../../db/data-source';
import { Request, Response } from 'express';
import Order from '../entities/OrderEntity';
import Customer from '../../customers/entities/Customer';
import Cars from '../../cars/entities/Cars';
import { getData } from './getCEP';
import AppError from '../../../shared/errors/AppError';
import fretePorUF from './checkUF';
import { In } from 'typeorm';
import { parse, isBefore, differenceInDays } from 'date-fns';
import { formatPlate } from '../../cars/services/formatters';

export class OrderController {
  private orderRepository = AppDataSource.getRepository(Order);
  private customerRepository = AppDataSource.getRepository(Customer);
  private carsRepository = AppDataSource.getRepository(Cars);

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { cpf_cliente, plate } = req.body;

      if (!cpf_cliente || !plate) {
        throw new AppError("Customer CPF and car plate are required.", 400);
      }

      const formattedPlate = formatPlate(plate);

      const customer = await this.customerRepository.findOne({
        where: { cpf: cpf_cliente },
      });
      if (!customer) {
        throw new AppError("Customer not found.", 404);
      }

      const car = await this.carsRepository.findOne({ where: { plate: formattedPlate } });
      if (!car) {
        throw new AppError("Car not found.", 404);
      }

      const existingOrder = await this.orderRepository.findOne({
        relations: ['customer'],
        where: {
          customer: { cpf: cpf_cliente },
          statusRequest: In(['open', 'approved']),
        },
      });

      if (existingOrder) {
        throw new AppError("Customer already has an open order.", 400);
      }

      const orderRequest = this.orderRepository.create({
        customer,
        car,
        statusRequest: "open",
      });

      await this.orderRepository.save(orderRequest);

      res.status(201).json({
        status: 'success',
        data: orderRequest,
      });
    } catch (error) {
      if (error instanceof AppError) {
         res.status(error.statusCode).json({ status: 'error', message: error.message });
      }
      res.status(500).json({ status: 'error', message: `Internal Server Error. ${error}` });
    }
  }

  async showById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const rental = await this.orderRepository
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.customer', 'customer')
        .leftJoinAndSelect('order.car', 'car')
        .select([
          'order.id',
          'order.statusRequest',
          'order.dateRequest',
          'order.startDate',
          'order.endDate',
          'order.rentalTax',
          'order.totalValue',
          'order.cep',
          'order.uf',
          'order.city',
          'customer.id',
          'customer.fullName',
          'customer.email',
          'customer.cpf',
          'car.id',
          'car.brand',
          'car.model',
          'car.year',
          'car.mileage',
          'car.items',
          'car.plate',
          'car.daily_price',
        ])
        .where('order.id = :id', { id })
        .getOne();

      if (!rental) {
         res.status(404).json({ status: 'error', message: "Order not found." });
      }

      res.status(200).json({
        status: 'success',
        data: rental,
      });
    } catch (error) {
      res.status(500).json({ status: 'error', message: `Internal Server Error. ${error}` });
    }
  }

  async show(req: Request, res: Response): Promise<void> {
    try {
      const { status, cpf, startDate, endDate } = req.query;
      const { page = '1', limit = '10', order = 'dateRequest', direction = 'DESC' } = req.query;

     

      const pageNumber = parseInt(page as string, 10);
      const limitNumber = parseInt(limit as string, 10);

      if (isNaN(pageNumber) || pageNumber < 1) {
        throw new AppError("Invalid page number.", 400);
      }

      if (isNaN(limitNumber) || limitNumber < 1) {
        throw new AppError("Invalid limit value.", 400);
      }

      const validOrderFields = ['dateRequest'];
      const validDirections = ['ASC', 'DESC'];


      const orderField = validOrderFields.includes(order as string) ? order : 'dateRequest';
      const orderDirection = validDirections.includes(direction?.toString().toUpperCase() || 'DESC')

        ? direction.toString().toUpperCase()
        : 'DESC';

      const query = this.orderRepository
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.customer', 'customer')
        .select([
          'order.id',
          'order.statusRequest',
          'order.dateRequest',
          'order.startDate',
          'order.endDate',
          'order.rentalTax',
          'order.totalValue',
          'order.cep',
          'order.uf',
          'order.city',
          'customer.id',
          'customer.fullName',
          'customer.cpf',
        ]);

      if (status) {
        query.andWhere('order.statusRequest = :status', { status });
      }

      if (cpf) {
        query.andWhere('customer.cpf = :cpf', { cpf });
      }

      if (startDate && endDate) {
        query.andWhere('order.dateRequest BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        });
      } else if (startDate) {
        query.andWhere('order.dateRequest >= :startDate', { startDate });
      } else if (endDate) {
        query.andWhere('order.dateRequest <= :endDate', { endDate });
      }


      query.orderBy(`order.${orderField}`, orderDirection as 'ASC' | 'DESC');


      const total = await query.getCount();
      const rentals = await query.skip((pageNumber - 1) * limitNumber).take(limitNumber).getMany();

      if (rentals.length === 0) {

        res.status(200).json({
          status: 'success',
          message: "No orders found.",

          data: [],
          pagination: { total, page: pageNumber, lastPage: 0, limit: limitNumber },
        });
      }

      rentals.forEach(rental => {
        rental.rentalTax = Number(rental.rentalTax);
        rental.totalValue = Number(rental.totalValue);
      });

      res.status(200).json({
        status: 'success',
        data: rentals,
        pagination: {
          total,
          page: pageNumber,
          lastPage: Math.ceil(total / limitNumber),
          limit: limitNumber,
        },
      });
    } catch (error) {
      res.status(500).json({ status: 'error', message: `Internal Server Error. ${error}` });
    }
  }

  public async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const order = await this.orderRepository.findOne({
        where: { id },
        relations: ['car'],
      });
      if (!order) {
        res.status(404).json({ message: "Order was not found" });
        return; 
      }

      const { cep, startDate, endDate, statusRequest } = req.body;
  
      const dateFormat = 'dd/MM/yyyy';
  
      
      if (startDate) {
        const start = parse(startDate, dateFormat, new Date());
  
        if (isNaN(start.getTime())) {
          res.status(400).json({ message: "Start date is invalid" });
          return;
        }

        if (isBefore(start, new Date())) {
          res.status(400).json({ message: "Start date cannot be earlier than now" });
          return;
        }

        order.startDate = start;
      }

      if (endDate) {

        const end = parse(endDate, dateFormat, new Date());
  
        if (isNaN(end.getTime())) {
          res.status(400).json({ message: "End date is invalid" });
          return;
        }

        if (isBefore(end, order.startDate || new Date())) {
          res.status(400).json({ message: "End date should be later than start date" });
        }

        order.endDate = end;

      }

      if (cep) {
        const cep_cliente = cep.toString().trim().replace('-', '');

        if (cep_cliente.length !== 8) {
          res.status(400).json({ message: "CEP must have 8 digits" });
          return;
        }

        const data = await getData(cep_cliente);
        if (!data) {
          res.status(404).json({ message: "CEP was not found" });
          return;
        }
  
        const uf = data.uf;
        const rentalTax = fretePorUF[uf] ?? 170.00;
  
        order.cep = data.cep;
        order.city = data.localidade;
        order.uf = uf;
        order.rentalTax = rentalTax;
      }
  
      if (statusRequest) {
        const status = statusRequest.toLowerCase();
  
        if (!['approved', 'closed', 'cancelled'].includes(status)) {
          res.status(400).json({ message: "Status is not valid" });
        }
  
        if (status === 'approved') {
          if (order.statusRequest !== 'open') {
            res.status(400).json({ message: "Only open orders can be approved" });
          }

          if (
            !order.startDate ||
            !order.endDate ||
            !order.cep ||
            !order.city ||
            !order.uf ||
            order.rentalTax === undefined
          ) {
            res.status(400).json({ message: "All values must be provided" });
            return;
          }
  
          order.statusRequest = 'approved';
        } else if (status === 'cancelled') {
          if (order.statusRequest !== 'open') {
            res.status(400).json({ message: "Only open orders can be cancelled" });
          }
  
          order.statusRequest = 'cancelled';
          order.cancelDate = new Date();
        } else if (status === 'closed') {
          if (order.statusRequest !== 'approved') {
            res.status(400).json({ message: "Only accepted orders can be closed" });
          }

          const today = new Date();
          const end = order.endDate || today;

          if (isBefore(end, today)) {
            const dayOver = differenceInDays(today, end);
            const dailyRate = Number(order.car.daily_price) || 0;
  
            order.fine = dailyRate * 2 * dayOver;
          }
  
          order.statusRequest = 'closed';
          order.finishDate = today;
        }
      }
  
      if (order.startDate && order.endDate) {
        const rentalDays = differenceInDays(order.endDate, order.startDate) || 1; 

        const dailyRate = Number(order.car.daily_price) || 0;
        const totalDailyRate = rentalDays * dailyRate;

        order.totalValue =
          totalDailyRate + (order.rentalTax || 0) + (order.fine || 0);
      }
  
      await this.orderRepository.save(order);
  
      res.status(200).json({
        status: 'success',
        data: order,
      });
    } catch (error) {
      res.status(500).json({ status: 'error', message: `Internal Server Error. ${error}` });
    }
  }

  async cancelOrder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
  
      const order = await this.orderRepository.findOne({
        where: { id },
        relations: ['customer', 'car'],
      });
  
      if (!order) {
        throw new AppError("Order not found.", 404);
      }
  
      if (order.statusRequest !== 'open') {
        throw new AppError("Only open orders can be cancelled.", 400);
      }
      
      order.statusRequest = 'cancelled';
      await this.orderRepository.save(order);
  
     
      res.status(200).json({
        status: 'success',
        message: "Order cancelled successfully.",
        data: order,
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ status: 'error', message: error.message });
      } else {
        res.status(500).json({ status: 'error', message: `Internal Server Error. ${error}` });
      }
    }
  }
}
