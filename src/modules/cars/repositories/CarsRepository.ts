import Cars from '../entities/Cars';
import AppDataSource from '../../../db/data-source';

export const carsRepository = AppDataSource.getRepository(Cars);
