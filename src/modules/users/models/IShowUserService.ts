import IUser from "./IUser";

export default interface IShowUserService {
    execute(id: string): Promise<IUser>;
}
