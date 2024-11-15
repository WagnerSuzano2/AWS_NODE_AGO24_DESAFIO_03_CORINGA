import Cars from '../entities/Cars';
import AppDataSource from '../../../db/data-source';
import ICars from '../interface/ICars';
import { formatPlate } from './formatters';
import CarStatus from '../interface/CarStatus';
import AppError from '../../../shared/errors/AppError';

class CreateCarService {
  createCar = async (carData: ICars): Promise<Cars> => {
    const carsRepository = AppDataSource.getRepository(Cars);

    const { plate, brand, model, mileage, year, items, daily_price, status } =
      carData;
    const formattedPlate = formatPlate(plate!);
    const itemsString = JSON.stringify(items);

    const newCar = new Cars();
    newCar.plate = formattedPlate;
    newCar.brand = brand.trim();
    newCar.model = model.trim();
    newCar.mileage = mileage ?? null!;
    newCar.year = year;
    newCar.items = itemsString.trim().toLowerCase();
    newCar.daily_price = daily_price;
    newCar.status = status;

    const existingCar = await carsRepository.findOne({
      where: { plate: formattedPlate },
    });

    if (existingCar && existingCar.status !== CarStatus.Deleted) {
      throw new AppError('This car is already registrated!', 409);
    }

    await carsRepository.save(newCar);

    return newCar;
  };
}
export default CreateCarService;
