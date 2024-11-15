import { Request, Response } from 'express';
import ICreateUserService from '../models/ICreateUserServices';
import IListUsersService from '../models/IListUsersService';
import IPagedList from '../models/IPagedList';
import IUser from '../models/IUser';
import IShowUserService from '../models/IShowUserService';
import IDeleteUserService from '../models/IDeleteUserService';
import IUpdateUserService from '../models/IUpdateUserService';

export default class UsersController {
  private createUserService: ICreateUserService;
  private listUsersService: IListUsersService;
  private showUserService: IShowUserService;
  private deleteUserService: IDeleteUserService;
  private updateUserService: IUpdateUserService;

  constructor(
    createUserService: ICreateUserService,
    listUsersService: IListUsersService,
    showUserService: IShowUserService,
    deleteUserService: IDeleteUserService,
    updateUserService: IUpdateUserService,
  ) {
    this.createUserService = createUserService;
    this.listUsersService = listUsersService;
    this.showUserService = showUserService;
    this.deleteUserService = deleteUserService;
    this.updateUserService = updateUserService;
  }

  async create(req: Request, res: Response): Promise<void> {
    const user = req.body;

    const id = await this.createUserService.execute(user);

    res.status(201).json({ id });
  }

  async listUsers(req: Request, res: Response): Promise<void> {
    type Filters = {
      name?: string;
      email?: string;
      isDeleted?: boolean;
    };

    type Sort = {
      field: keyof IUser;
      order: 'ASC' | 'DESC';
    };

    type Pagination = {
      page: number;
      size: number;
    };

    const filters: Filters = (req.query.filters as Filters) || {};
    const sort: Sort = (req.query.sort as Sort) || {
      field: 'createdAt',
      order: 'ASC',
    };

    const paginationQuery = req.query.pagination as
      | { page?: string; size?: string }
      | undefined;

    const pagination: Pagination = {
      page: parseInt((paginationQuery?.page as string) || '1', 10),
      size: parseInt((paginationQuery?.size as string) || '10', 10),
    };

    const users: IPagedList<IUser> = await this.listUsersService.execute({
      filters,
      sort,
      pagination,
    });

    res.status(200).json(users);
  }

  async show(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const user = await this.showUserService.execute(id);

    res.status(200).json({ user });
  }

  async remove(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    await this.deleteUserService.execute(id);

    res.status(200).json({});
  }

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { name, email, password } = req.body;

    const user = await this.updateUserService.execute({
      id,
      name,
      email,
      password,
    });

    res.status(200).json({ user });
  }
}
