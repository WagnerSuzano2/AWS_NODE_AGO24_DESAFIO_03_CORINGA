import { Router } from 'express';
import UsersRepository from '../repositories/UsersRepository';
import HashProvider from '../providers/BcryptHashProvider';
import CreateUserService from '../services/CreateUserService';
import UsersController from '../controllers/UsersController';
import User from '../entities/User';
import { celebrate, Joi, Segments } from 'celebrate';
import AppDataSource from '../../../db/data-source';
import ListUsersService from '../services/ListUsersService';
import DeleteUserService from '../services/DeleteUserService';
import ShowUserService from '../services/ShowUserService';
import UpdateUserService from '../services/UpdateUserService';


const userRouter = Router();

const userRepository = AppDataSource.getRepository(User);
const usersRepository = new UsersRepository(userRepository);

const hashProvider = new HashProvider();

const createUserService = new CreateUserService(usersRepository, hashProvider);
const listUsersService = new ListUsersService(usersRepository);
const showUserService = new ShowUserService(usersRepository);
const deleteUserService = new DeleteUserService(usersRepository);
const updateUserService = new UpdateUserService(usersRepository, hashProvider);

const usersController = new UsersController(
  createUserService,
  listUsersService,
  showUserService,
  deleteUserService,
  updateUserService
);

userRouter.get(
  '/',
  celebrate({
    [Segments.QUERY]: {
      filters: Joi.string().optional(),
      sort: Joi.object({
        field: Joi.string().valid('name', 'email', 'createdAt').optional(),
        order: Joi.string().valid('ASC', 'DESC').optional(),
      }),
      pagination: Joi.object({
        page: Joi.number().integer().min(1).optional(),
        size: Joi.number().integer().min(1).optional(),
      }),
    },
  }),
  (req, res) => usersController.listUsers(req, res),
);

userRouter.get(
  '/:id',
  celebrate({
    [Segments.PARAMS]: {
      id: Joi.string().uuid().required(),
    },
  }),
  (req, res) => usersController.show(req, res),
);

userRouter.post(
  '/',
  celebrate({
    [Segments.BODY]: {
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
    },
  }),
  (req, res) => usersController.create(req, res),
);

userRouter.patch(
  '/:id',
  celebrate({
    [Segments.PARAMS]: {
      id: Joi.string().uuid().required(),
    },
    [Segments.BODY]: {
      name: Joi.string().optional(),
      email: Joi.string().email().optional(),
      password: Joi.string().min(8).optional(),
    },
  }),
  (req, res) => usersController.update(req, res),
);

userRouter.delete(
  '/:id',
  celebrate({
    [Segments.PARAMS]: {
      id: Joi.string().uuid().required(),
    },
  }),
  (req, res) => usersController.remove(req, res),
);

export default userRouter;
