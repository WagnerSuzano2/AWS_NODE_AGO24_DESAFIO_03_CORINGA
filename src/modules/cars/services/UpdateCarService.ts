import Cars from '../entities/Cars';
import AppDataSource from '../../../db/data-source';
import ICars from '../interface/ICars';
import { formatPlate } from './formatters';
import AppError from '../../../shared/errors/AppError';

class UpdateCarService {
  updateCar = async (id: string, updates: Partial<ICars>) => {
    const carsRepository = AppDataSource.getRepository(Cars);
    const car = await carsRepository.findOneBy({ id });

    if (!car) {
      throw new AppError('Car not found', 404);
    }

    const updateFields = [
      'plate',
      'brand',
      'model',
      'mileage',
      'year',
      'items',
      'daily_price',
    ] as const;

    for (let i = 0; i < updateFields.length; i++) {
      const field = updateFields[i];
      if (updates[field] !== undefined) {
        if (field === 'plate') {
          car.plate = formatPlate(updates.plate!);
        } else if (
          field === 'mileage' ||
          field === 'year' ||
          field === 'daily_price'
        ) {
          car[field] = updates[field] as number;
        } else if (field === 'items') {
          car.items = JSON.stringify(updates.items).trim().toLowerCase();
        } else {
          car[field] = updates[field]!.trim();
        }
      }
    }

    await carsRepository.save(car);

    return car;
  };
}

export default UpdateCarService;
