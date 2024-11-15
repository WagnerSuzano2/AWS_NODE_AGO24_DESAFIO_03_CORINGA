import { Request, Response } from 'express';
import ILoginService from '../models/ILoginService';

export default class LoginController {
  private loginService: ILoginService;

  constructor(loginService: ILoginService) {
    this.loginService = loginService;
  }

  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    const token = await this.loginService.execute({ email, password });

    res.status(201).json({token});
  }
}
