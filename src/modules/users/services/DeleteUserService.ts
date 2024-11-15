import AppError from '../../../shared/errors/AppError';
import IDeleteUserService from '../models/IDeleteUserService';
import IUsersRepository from '../models/IUsersRepository';

export default class DeleteUserService implements IDeleteUserService {
  private usersRepository: IUsersRepository;

  constructor(usersRepository: IUsersRepository) {
    this.usersRepository = usersRepository;
  }

    public async execute(id: string): Promise<void> {
        const user = await this.usersRepository.findById(id);

        if (!user) {
            throw new AppError('user not found', 404);
        }

        user.deletedAt = new Date();

        await this.usersRepository.save(user);
    }
}
