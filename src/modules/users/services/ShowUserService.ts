import AppError from '../../../shared/errors/AppError';
import IShowUserService from '../models/IShowUserService';
import IUser from '../models/IUser';
import IUsersRepository from '../models/IUsersRepository';

export default class ShowUserService implements IShowUserService {
  private usersRepository: IUsersRepository;

  constructor(usersRepository: IUsersRepository) {
    this.usersRepository = usersRepository;
  }

  public async execute(id: string): Promise<IUser> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new AppError('user not found', 404);
    }

    return user;
  }
}
