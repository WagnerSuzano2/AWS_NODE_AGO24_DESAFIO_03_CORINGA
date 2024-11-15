import { Router } from 'express';
import orderRouter from '../../modules/Order/routes/OrderRoutes';
import carRoutes from '../../modules/cars/routes/routes';
import customerRouter from '../../modules/customers/routes/CustomerRoute';
import userRouter from '../../modules/users/routes/UsersRoutes';
import { authMiddleware } from '../middlewares/verifyauth';
import loginRouter from '../../modules/users/routes/LoginRoutes';

const routes = Router();

routes.use('/login', loginRouter);

routes.use('/orders', authMiddleware, orderRouter);
routes.use('/cars', authMiddleware, carRoutes);
routes.use('/customers', authMiddleware, customerRouter);
routes.use('/users', authMiddleware, userRouter);

export default routes;
