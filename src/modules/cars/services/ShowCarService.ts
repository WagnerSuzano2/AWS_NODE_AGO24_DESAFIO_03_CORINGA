import Cars from '../entities/Cars';
import AppDataSource from '../../../db/data-source';
import AppError from '../../../shared/errors/AppError';

class ShowCarService {
  findCarById = async (id: string) => {
    const carsRepository = AppDataSource.getRepository(Cars);

    const car = await carsRepository.findOneBy({ id });

    if (!car) {
      throw new AppError('Car not found', 404);
    }

    car.items = JSON.parse(car.items!);
    car.items = Array.isArray(car.items) ? car.items.join(', ') : '';

    return car;
  };
}
export default ShowCarService;
