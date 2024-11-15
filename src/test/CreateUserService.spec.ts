import ICreateUserService from '../modules/users/models/ICreateUserServices';
import CreateUser from '../modules/users/services/CreateUserService';
import IHashProvider from '../modules/users/models/IHashProvider';
import IUsersRepository from '../modules/users/models/IUsersRepository';
import FakeHashProvider from './fakes/FakeHashProvider';
import AppError from '../shared/errors/AppError';
import FakeUsersRepository from './fakes/FakeUsersRepository';
import AppDataSource from '../db/data-source';

let createUser: ICreateUserService;
let fakeUsersRepository: IUsersRepository;
let fakeHashProvider: IHashProvider;

describe('create user test suite', () => {
  beforeAll(async () => {
    await AppDataSource.initialize();
  });

  beforeEach(() => {
    fakeHashProvider = new FakeHashProvider();
    fakeUsersRepository = new FakeUsersRepository();
    createUser = new CreateUser(fakeUsersRepository, fakeHashProvider);
  });

it('should successfully create user', async () => {
  const userId = await createUser.execute({
    name: 'Ana Silva',
    email: 'ana.silva@example.com',
    password: 'password123',
  });

  expect(userId).toBeTruthy();
});

  it('should not create user with duplicate email', async () => {
    await createUser.execute({
      name: 'João Silva',
      email: 'joao.almeida@example.com',
      password: 'password123',
    });

    await expect(
      createUser.execute({
        name: 'João Almeida',
        email: 'joao.almeida@example.com',
        password: 'password1234',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not create user missing required fields', async () => {
    await expect(
      createUser.execute({
        name: '',
        email: 'julis.silva@example.com',
        password: 'password123',
      }),
    ).rejects.toBeInstanceOf(AppError);

    await expect(
      createUser.execute({
        name: 'Maria Souza',
        email: '',
        password: 'password123',
      }),
    ).rejects.toBeInstanceOf(AppError);

    await expect(
      createUser.execute({
        name: 'Maria Souza',
        email: 'maria.souza@example.com',
        password: '',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not create user with invalid email format', async () => {
    await expect(
      createUser.execute({
        name: 'Maria Gonçalves',
        email: 'email-invalido',
        password: 'password123',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should hash user password', async () => {
    const hashSpy = jest.spyOn(fakeHashProvider, 'generateHash');

    await createUser.execute({
      name: 'Mario Fernandez',
      email: 'mario.fernandes@example.com',
      password: 'password123',
    });

    expect(hashSpy).toHaveBeenCalledWith('password123');
  });

  it('should register user create date', async () => {
    const userId = await createUser.execute({
      name: 'José Alvarez',
      email: 'jose.alvarez@example.com',
      password: 'password123',
    });

    const user = await fakeUsersRepository.findById(userId);

    expect(user).toBeTruthy();
    expect(user?.createdAt).toBeInstanceOf(Date);
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });
});
