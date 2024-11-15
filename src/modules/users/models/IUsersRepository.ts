import IUser from './IUser';
import IFindUsersOptions from './IFindUsersOptions';

export default interface IUsersRepository {
  save(user: IUser): Promise<IUser>;
  create(user: IUser): Promise<string>;
  findByEmail(email: string): Promise<IUser | null>;
  findById(id: string): Promise<IUser | null>;
  findByName(name: string): Promise<IUser | null>;
  findAll(options: IFindUsersOptions): Promise<[IUser[], number]>;
  update(id: string, user: Partial<IUser>): Promise<IUser | null>;
  delete(id: string): Promise<void>;
}
