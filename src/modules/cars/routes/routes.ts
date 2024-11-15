import { Router } from 'express';
import { CarsController } from '../controllers/CarsController';
import CarsService from '../services';

const carRoutes = Router();

const carsController = new CarsController(
  new CarsService.CreateCarService(),
  new CarsService.ListCarsService(),
  new CarsService.ShowCarService(),
  new CarsService.UpdateCarService(),
  new CarsService.DeleteCarService(),
);

carRoutes.post('/', carsController.create);
carRoutes.get('/:id', carsController.getById.bind(carsController));
carRoutes.get('/', carsController.list);
carRoutes.patch('/:id', carsController.updateCar);
carRoutes.delete('/:id', carsController.deleteCar);

export default carRoutes;
