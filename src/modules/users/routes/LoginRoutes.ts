import  { Router } from 'express';
import { celebrate, Joi, Segments } from 'celebrate';
import LoginController from "../controllers/LoginController";
import LoginService from "../services/LoginService";

const loginRouter = Router();

const loginService = new LoginService()

const loginController = new LoginController(loginService);

loginRouter.post(
    '/',
    celebrate({
        [Segments.BODY]: {
            email: Joi.string().email().required(),
            password: Joi.string().required(),
        },
    }),
    (req, res) => loginController.login(req, res),
);

export default loginRouter;