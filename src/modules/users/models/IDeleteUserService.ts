export default interface IDeleteUserService {
  execute(id: string): Promise<void>;
}
