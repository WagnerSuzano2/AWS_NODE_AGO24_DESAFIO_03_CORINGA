import Cars from '../entities/Cars';
import AppDataSource from '../../../db/data-source';
import CarStatus from '../interface/CarStatus';
import Order from '../../Order/entities/OrderEntity';
import AppError from '../../../shared/errors/AppError';

class DeleteCarService {
  deleteCar = async (id: string): Promise<void> => {
    const carsRepository = AppDataSource.getRepository(Cars);
    const orderRepository = AppDataSource.getRepository(Order);

    const car = await carsRepository.findOneBy({ id });

    if (!car) {
      throw new AppError('Car not found!', 404);
    }
    if (car.status == CarStatus.Deleted) {
      throw new AppError('This car is already deleted!', 409);
    }

    const order = await orderRepository.findOne({
      where: { id },
      select: ['statusRequest'],
    });

    if (order) {
      const statusRequest = order.statusRequest;
      if (statusRequest !== 'cancelled' && statusRequest !== 'closed') {
        throw new AppError(
          "This car can't be deleted due to outstanding issues or open orders",
          409,
        );
      }
    }

    car.status = CarStatus.Deleted;

    await carsRepository.save(car);
  };
}
export default DeleteCarService;
