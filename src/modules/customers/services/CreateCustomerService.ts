import { NextFunction, Request, Response } from 'express';
import CustomerRepository from '../repositories/CustomerRepository';
import validator from 'validator';
import AppError from '../../../shared/errors/AppError';

const customerClassRepository = new CustomerRepository();

function isValidPhone(phone: string): boolean {
  return validator.isMobilePhone(phone, ['pt-BR']);
}

function isValidDate(birthDate: string): boolean {
  return validator.isDate(birthDate, { format: 'DD/MM/YYYY' });
}

const isValidCpf = (cpf: string): boolean => {
  cpf = cpf.replace(/[^\d]+/g, '');

  if (cpf.length !== 11) return false;

  if (/^(\d)\1{10}$/.test(cpf)) return false;

  const calculateDigit = (digits: string): number => {
    let sum = 0;
    for (let i = 0; i < digits.length; i++) {
      sum += parseInt(digits[i]) * (digits.length + 1 - i);
    }
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const firstDigit = calculateDigit(cpf.substring(0, 9));
  if (firstDigit !== parseInt(cpf[9])) return false;

  const secondDigit = calculateDigit(cpf.substring(0, 10));
  if (secondDigit !== parseInt(cpf[10])) return false;

  return true;
};
class CreateCustomerService {
  async validateCustomer(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const { fullName, birthDate, cpf, email, phone } = req.body;

    if (!fullName || typeof fullName !== 'string' || fullName.length < 3) {
      throw new AppError(
        'Name must be letters and must be more than 3 letters',
        400,
      );
    }

    if (!birthDate) {
      throw new AppError('Birth date id required', 400);
    } else if (!isValidDate(birthDate)) {
      throw new AppError('Send a valid date', 400);
    }

    if (!cpf) {
      throw new AppError('CPF is required', 400);
    } else if (!isValidCpf(cpf)) {
      throw new AppError('Send a valid CPF', 400);
    }

    if (!email) {
      throw new AppError('Email is required', 400);
    } else if (!validator.isEmail(email)) {
      throw new AppError('Send a valid email', 400);
    }

    if (!phone) {
      throw new AppError('Phone is required', 400);
    } else if (!isValidPhone(phone)) {
      throw new AppError('Send a valid phone number', 400);
    }

    const customerExistsCpf =
      await customerClassRepository.findCustomerByCpf(cpf);
    if (customerExistsCpf) {
      throw new AppError('A customer with this CPF already exists', 400);
    }

    const customerExistsEmail =
      await customerClassRepository.findCustomerByEmail(email);
    if (customerExistsEmail) {
      throw new AppError('A customer with this email already exists', 400);
    }

    const [day, month, year] = birthDate.split('/');
    req.body.birthDate = new Date(`${year}-${month}-${day}`);
    next();
  }
}

export default CreateCustomerService;
