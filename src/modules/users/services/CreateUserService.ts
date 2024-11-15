import AppError from '../../../shared/errors/AppError';
import IUser from '../models/IUser';
import IUsersRepository from '../models/IUsersRepository';
import IHashProvider from '../models/IHashProvider';
import ICreateUserService from '../models/ICreateUserServices';

export default class CreateUser implements ICreateUserService {
  private usersRepository: IUsersRepository;
  private hashProvider: IHashProvider;

  constructor(usersRepository: IUsersRepository, hashProvider: IHashProvider) {
    this.usersRepository = usersRepository;
    this.hashProvider = hashProvider;
  }

  public async execute({ name, email, password }: IUser): Promise<string> {
    if (!name) {
      throw new AppError('full name is required', 400);
    }

    if (name.split(' ').length < 2) {
      throw new AppError('name and surname is required', 400);
    }

    if (!email) {
      throw new AppError('email is required', 400);
    }

    const emailRegex = /^[\w\-.]+@([\w-]+\.)+[\w-]{2,4}$/;

    if (!emailRegex.test(email)) {
      throw new AppError('email format is invalid', 400);
    }

    const emailDuplicate = await this.usersRepository.findByEmail(email);

    if (emailDuplicate) {
      throw new AppError('a user with this email address already exists', 409);
    }

    if (!password) {
      throw new AppError('password is required', 400);
    }

    const hashedPassword = await this.hashProvider.generateHash(password);

    const userId = await this.usersRepository.create({
      name,
      email,
      password: hashedPassword,
    });

    if (!userId) {
      throw new AppError('failed to create user', 500);
    }

    return userId;
  }
}
