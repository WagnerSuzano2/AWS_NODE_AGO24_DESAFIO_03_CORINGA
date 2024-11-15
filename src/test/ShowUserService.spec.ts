import IUsersRepository from '../modules/users/models/IUsersRepository';
import AppError from '../shared/errors/AppError';
import ShowUserService from '../modules/users/services/ShowUserService';
import FakeUsersRepository from './fakes/FakeUsersRepository';
import AppDataSource from '../db/data-source';

let showUserService: ShowUserService;
let fakeUsersRepository: IUsersRepository;

describe.only('show user test suite', () => {
  beforeAll(async () => {
    await AppDataSource.initialize();
  });

  beforeEach(() => {
    fakeUsersRepository = new FakeUsersRepository();
    showUserService = new ShowUserService(fakeUsersRepository);
  });

  it('should find and show user by id', async () => {
    const userId = await fakeUsersRepository.create({
      name: 'João Silva',
      email: 'joao@example.com',
      password: '12233456',
    });

    const foundUser = await showUserService.execute(userId);

    expect(foundUser.id).toEqual(userId);
  });

  it('should return an error if user does not exist', async () => {
    await expect(
      showUserService.execute('non-existent-id'),
    ).rejects.toBeInstanceOf(AppError);
    await expect(
      showUserService.execute('non-existent-id'),
    ).rejects.toHaveProperty('message', 'user not found');
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });
});
