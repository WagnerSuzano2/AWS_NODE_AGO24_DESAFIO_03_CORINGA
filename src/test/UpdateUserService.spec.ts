import IUsersRepository from '../modules/users/models/IUsersRepository';
import AppError from '../shared/errors/AppError';
import IUpdateUserService from '../modules/users/models/IUpdateUserService';
import UpdateUserService from '../modules/users/services/UpdateUserService';
import IHashProvider from '../modules/users/models/IHashProvider';
import FakeHashProvider from './fakes/FakeHashProvider';
import FakeUsersRepository from './fakes/FakeUsersRepository';
import AppDataSource from '../db/data-source';

let updateUserService: IUpdateUserService;
let fakeUsersRepository: IUsersRepository;
let fakeHashProvider: IHashProvider;

describe.only('update user test suite', () => {
  beforeAll(async () => {
    await AppDataSource.initialize();
  });

  beforeEach(() => {
    fakeUsersRepository = new FakeUsersRepository();
    fakeHashProvider = new FakeHashProvider();
    updateUserService = new UpdateUserService(
      fakeUsersRepository,
      fakeHashProvider,
    );
  });

  it('should throw an error if user id is not provided', async () => {
    await expect(
      updateUserService.execute({ id: '', name: 'New Name' }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should return an error if user doesn\'t exist', async () => {
    await fakeUsersRepository.create({
      name: 'João Silva',
      email: 'joao@example.com',
      password: '12233456',
    });

    await expect(
      updateUserService.execute({ id: 'non-existent-id', name: 'New Name' }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should return an error if full name is not provided', async () => {
    const user = await fakeUsersRepository.create({
      name: 'João Silva',
      email: 'joao@example.com',
      password: '12233456',
    });

    await expect(
      updateUserService.execute({ id: `${user}`, name: 'João' }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should return an error if email format is invalid', async () => {
    const user = await fakeUsersRepository.create({
      name: 'João Silva',
      email: 'joao@example.com',
      password: '12233456',
    });

    await expect(
      updateUserService.execute({ id: `${user}`, email: 'invalid-email' }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should return an error if email is already in use', async () => {
    const user = await fakeUsersRepository.create({
      name: 'João Silva',
      email: 'joao@example.com',
      password: '12233456',
    });

    await expect(
      updateUserService.execute({ id: `${user}`, email: 'joao@example.com' }),
    ).rejects.toBeInstanceOf(AppError);

  });

  it('should successfully update the user name', async () => {
    const user = await fakeUsersRepository.create({
      name: 'João Silva',
      email: 'joao@example.com',
      password: '12233456',
    });

    const updatedUser = await updateUserService.execute({
      id: user,
      name: 'Maria Silva',
    });

    expect(updatedUser.name).toBe('Maria Silva');
  });

  it('should successfully update the user email', async () => {
    const user = await fakeUsersRepository.create({
      name: 'João Silva',
      email: 'joao-@example.com',
      password: '12233456',
    });

    const updatedUser = await updateUserService.execute({
      id: user,
      email: 'joao@example.com',
    });

    expect(updatedUser.email).toBe('joao@example.com');
  });

  it('should successfully update the user password', async () => {
    const user = await fakeUsersRepository.create({
      name: 'João Silva',
      email: 'joao@example.com',
      password: '12233456',
    });

    const updatedUser = await updateUserService.execute({
      id: user,
      password: 'newpassword123',
    });

    const passwordMatch = await fakeHashProvider.compareHash(
      'newpassword123',
      updatedUser.password as string,
    );

    expect(passwordMatch).toBe(true);
  });  

  afterAll(async () => {
    await AppDataSource.destroy();
  });
});
