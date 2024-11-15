type CreateUserParams = {
  name: string;
  email: string;
  password: string;
};

export default interface ICreateUserService {
  execute(data: CreateUserParams): Promise<string>;
}