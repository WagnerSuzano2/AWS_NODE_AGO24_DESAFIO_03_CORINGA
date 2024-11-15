import IUsersRepository from '../modules/users/models/IUsersRepository';
import AppError from '../shared/errors/AppError';
import DeleteUserService from '../modules/users/services/DeleteUserService';
import IDeleteUserService from '../modules/users/models/IDeleteUserService';
import AppDataSource from '../db/data-source';
import FakeUsersRepository from './fakes/FakeUsersRepository';

let deleteUserService: IDeleteUserService;
let fakeUsersRepository: IUsersRepository;

describe.only('show user test suite', () => {
  beforeAll(async () => {
    await AppDataSource.initialize();
  });

  beforeEach(() => {
    fakeUsersRepository = new FakeUsersRepository();
    deleteUserService = new DeleteUserService(fakeUsersRepository);
  });

  it('should show user delete date', async () => {
    const user = await fakeUsersRepository.create({
      name: 'João Silva',
      email: 'joao.s@example.com',
      password: '12233456',
    });

    await deleteUserService.execute(user);

    const deletedUser = await fakeUsersRepository.findById(user);
    expect(deletedUser).not.toBeNull();
    expect(deletedUser?.deletedAt).toBeInstanceOf(Date); 
  });

  it('should return an error when trying to delete a non-existent user', async () => {
    await expect(
      deleteUserService.execute('non-existent-user-id'),
    ).rejects.toBeInstanceOf(AppError); 
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });
});
