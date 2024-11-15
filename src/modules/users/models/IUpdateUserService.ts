import IUser from './IUser';

export default interface IUpdateUserService {
  execute(user: IUser): Promise<IUser>;
}

