import { Repository } from 'typeorm';
import User from '../entities/User';
import IUsersRepository from '../models/IUsersRepository';
import IFindUsersOptions from '../models/IFindUsersOptions';
import IUser from '../models/IUser';

export default class UsersRepository implements IUsersRepository {
  private usersRepository: Repository<User>;

  constructor(usersRepository: Repository<User>) {
    this.usersRepository = usersRepository;
  }

  public async save(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }

  public async create(user: IUser): Promise<string> {
    const newUser = await this.usersRepository.create(user);
    await this.usersRepository.save(newUser);

    return newUser.id as string;
  }

  public async findByEmail(email: string): Promise<IUser | null> {
    const user = await this.usersRepository.findOne({
      where: { email },
    });

    return user || null;
  }

  public async findById(id: string): Promise<IUser | null> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    return user || null;
  }

  public async findByName(name: string): Promise<IUser | null> {
    const user = await this.usersRepository.findOne({
      where: { name },
    });

    return user || null;
  }

  public async findAll(options: IFindUsersOptions): Promise<[IUser[], number]> {
    const { filters, sort, pagination } = options;

    const queryBuilder = this.usersRepository.createQueryBuilder('user');

    if (filters.name) {
      queryBuilder.andWhere('user.name LIKE : name', {
        name: `%${filters.name.trim()}%`,
      });
    }

    if (filters.email) {
      queryBuilder.andWhere('user.email LIKE : email', {
        email: `%${filters.email.trim()}%`,
      });
    }

    if (filters.isDeleted !== undefined) {
      queryBuilder.andWhere(
        'user.deletedAt IS' + (filters.isDeleted ? 'NOT NULL' : 'NULL'),
      );
    }

    if (sort && sort.field && sort.order) {
      queryBuilder.orderBy(`user.${sort.field}`, sort.order);
    }

    queryBuilder
      .skip((pagination.page - 1) * pagination.size)
      .take(pagination.size);

    const [users, count] = await queryBuilder.getManyAndCount();

    return [users, count];
  }

  public async update(id: string, user: Partial<IUser>): Promise<IUser | null> {
    const result = await this.usersRepository.update(id, user);

    if (result.affected === 0) {
      return null;
    }

    return await this.findById(id);
  }

  public async delete(id: string): Promise<void> {
    const user = await this.findById(id);

    if (!user) {
      throw new Error('User not found');
    }

    await this.usersRepository.softRemove(user);
  }
}
