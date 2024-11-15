import { Router } from 'express';
import { OrderController } from '../controllers/OrderController';

const orderRouter = Router();
const orderController = new OrderController();

orderRouter.post('/', (req, res) => orderController.create(req, res));
orderRouter.get('/:id', (req, res) => orderController.showById(req, res));
orderRouter.get('/', (req, res) => orderController.show(req, res));
orderRouter.patch('/:id', (req, res) => orderController.update(req, res));
orderRouter.delete('/:id', (req, res) => orderController.cancelOrder(req, res));

export default orderRouter;
