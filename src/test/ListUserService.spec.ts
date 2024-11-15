import ListUsersService from '../modules/users/services/ListUsersService';
import IUsersRepository from '../modules/users/models/IUsersRepository';
import AppError from '../shared/errors/AppError';
import IFindUsersOptions from '../modules/users/models/IFindUsersOptions';
import AppDataSource from '../db/data-source';
import FakeUsersRepository from './fakes/FakeUsersRepository';

let listUsersService: ListUsersService;
let fakeUsersRepository: IUsersRepository;

describe('list users test suite', () => {
  beforeAll(async () => {
    await AppDataSource.initialize();
  });

  beforeEach(() => {
    fakeUsersRepository = new FakeUsersRepository();
    listUsersService = new ListUsersService(fakeUsersRepository);
  });

  it('should return users ordered by name', async () => {
    const fakeRepo = new FakeUsersRepository();

    await fakeRepo.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: '123456',
    });

    await fakeRepo.create({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: '123456',
    });

    const options: IFindUsersOptions = {
      filters: { name: 'Doe' },
      sort: { field: 'name', order: 'DESC' },
      pagination: { page: 1, size: 10 },
    };

    const [users, totalResults] = await fakeRepo.findAll(options);

    expect(users).toHaveLength(2);
    expect(users[0].name).toBe('John Doe');
    expect(totalResults).toBe(2);
  });

  it('should list all users successfully', async () => {
    await fakeUsersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: '123456',
    });

    await fakeUsersRepository.create({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: '123456',
    });

    const users = await listUsersService.execute({
      filters: {},
      sort: { field: 'name', order: 'ASC' },
      pagination: { page: 1, size: 10 },
    });

    expect(users).toHaveProperty('data');
    expect(users.data).toBeInstanceOf(Array);
    expect(users.data).toHaveLength(2);
  });

  it('should filter users by name', async () => {
    const user1 = await fakeUsersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: '123456',
    });

    await fakeUsersRepository.create({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: '123456',
    });

    const users = await listUsersService.execute({
      filters: { name: 'John' },
      sort: { field: 'name', order: 'ASC' },
      pagination: { page: 1, size: 10 },
    });

    expect(users.data).toHaveLength(1);
    expect(users.data[0].id).toBe(user1);
  });

  it('should filter users by e-mail', async () => {
    const userId1 = await fakeUsersRepository.create({
      name: 'Alice',
      email: 'alice@example.com',
      password: '123456',
    });

    await fakeUsersRepository.create({
      name: 'Bob',
      email: 'bob@example.com',
      password: '123456',
    });

    const user = await fakeUsersRepository.findByEmail('alice@example.com');

    expect(user).toBeTruthy();
    expect(user?.id).toBe(userId1);
  });

  it('should filter users by delete date', async () => {
    const user1 = await fakeUsersRepository.create({
      name: 'User 1',
      email: 'user1@example.com',
      password: '123456',
    });
    await fakeUsersRepository.delete(user1);

    const users = await listUsersService.execute({
      filters: { isDeleted: true },
      sort: { field: 'name', order: 'ASC' },
      pagination: { page: 1, size: 10 },
    });

    expect(users.data).toHaveLength(1);
    expect(users.data[0].id).toBe(user1);
  });

  it('should show pagintion to page 2', async () => {
    for (let i = 0; i < 15; i++) {
      await fakeUsersRepository.create({
        name: `User ${i}`,
        email: `user${i}@example.com`,
        password: '123456',
      });
    }

    const users = await listUsersService.execute({
      filters: {},
      sort: { field: 'name', order: 'ASC' },
      pagination: { page: 2, size: 10 },
    });

    expect(users.data).toHaveLength(5);
    expect(users.totalPages).toBe(2);
    expect(users.currentPage).toBe(2);
  });

  it('should return user not found error', async () => {
    await expect(
      listUsersService.execute({
        filters: { name: 'Nonexistent' },
        sort: { field: 'name', order: 'ASC' },
        pagination: { page: 1, size: 10 },
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });
});
