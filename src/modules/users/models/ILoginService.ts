import ILoginRequest from "./ILoginRequest";
import ILoginResponse from "./ILoginResponse";

export default interface ILoginService {
  execute({email, password}: ILoginRequest): Promise<ILoginResponse>;
}