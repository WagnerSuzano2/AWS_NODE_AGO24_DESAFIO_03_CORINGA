import IPagedList from "./IPagedList";
import IUser from "./IUser";
import IFindUsersOptions from './IFindUsersOptions'; 

export default interface IListUsersService {
  execute(options: IFindUsersOptions): Promise<IPagedList<IUser>>;
}

