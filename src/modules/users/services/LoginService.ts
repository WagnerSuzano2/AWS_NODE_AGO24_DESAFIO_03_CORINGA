import AppError from "../../../shared/errors/AppError";
import ILoginRequest from "../models/ILoginRequest";
import ILoginResponse from "../models/ILoginResponse";
import ILoginService from "../models/ILoginService";
import jwt from 'jsonwebtoken';
import authConfig from '../../../config/auth';

export default class LoginService implements ILoginService {
    public async execute({email, password}: ILoginRequest): Promise<ILoginResponse> {
        if (!email) {
            throw new AppError('email is required', 400);
        }

        const emailRegex = /^[\w\-.]+@([\w-]+\.)+[\w-]{2,4}$/;
        if (!emailRegex.test(email)) {
          throw new AppError('Invalid email format', 400);
        }

        if (!password) {
          throw new AppError('password is required', 400);
        }

        const token = jwt.sign({ email }, authConfig.jwt.secret, {
        expiresIn: authConfig.jwt.expiresIn,
        });

        return { token };
    }
}