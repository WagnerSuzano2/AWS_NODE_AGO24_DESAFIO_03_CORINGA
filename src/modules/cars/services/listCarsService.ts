import Cars from '../entities/Cars';
import AppDataSource from '../../../db/data-source';
import IFilter from '../interface/IFilter';
import ICarsResponse from '../interface/ICarsResponse';
import { listCarValidator } from './validators';
import CarStatus from '../interface/CarStatus';

class ListCarsService {
  private carsRepository = AppDataSource.getRepository(Cars);

  listCars = async (filters: IFilter): Promise<ICarsResponse> => {
    const queryBuilder = this.carsRepository.createQueryBuilder('car');

    const { error } = listCarValidator.validate(filters);

    if (error) {
      throw new Error(error.message);
    }

    if (filters.status) {
      queryBuilder.andWhere('car.status = :status', { status: filters.status });
    } else {
      queryBuilder.andWhere('car.status != :status', {
        status: CarStatus.Deleted,
      });
    }

    if (filters.plateEnd) {
      queryBuilder.andWhere('car.plate LIKE :plateEnd', {
        plateEnd: `%${filters.plateEnd}`,
      });
    }

    if (filters.brand) {
      queryBuilder.andWhere('car.brand = :brand', { brand: filters.brand });
    }

    if (filters.model) {
      queryBuilder.andWhere('car.model = :model', { model: filters.model });
    }

    if (filters.mileage) {
      queryBuilder.andWhere('car.mileage <= :mileage', {
        mileage: filters.mileage,
      });
    }

    if (filters.yearFrom) {
      queryBuilder.andWhere('car.year >= :yearFrom', {
        yearFrom: filters.yearFrom,
      });
    }

    if (filters.yearTo) {
      queryBuilder.andWhere('car.year <= :yearTo', { yearTo: filters.yearTo });
    }

    if (filters.dailyPriceMin) {
      queryBuilder.andWhere('car.daily_price >= :dailyPriceMin', {
        dailyPriceMin: filters.dailyPriceMin,
      });
    }

    if (filters.dailyPriceMax) {
      queryBuilder.andWhere('car.daily_price <= :dailyPriceMax', {
        dailyPriceMax: filters.dailyPriceMax,
      });
    }

    if (filters.items) {
      queryBuilder.andWhere('car.items = :items', {
        items: JSON.stringify(filters.items),
      });
    }

    if (filters.sortFields) {
      const sortFields = filters.sortFields.split(',');
      sortFields.forEach(field => {
        const trimmedField = field.trim();
        const order = filters.sortOrder === 'desc' ? 'DESC' : 'ASC';
        queryBuilder.addOrderBy(`car.${trimmedField}`, order);
      });
    } else {
      queryBuilder.addOrderBy('car.daily_price', 'ASC');
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;

    queryBuilder.skip((page - 1) * limit).take(limit);

    queryBuilder.skip((page - 1) * limit).take(limit);

    const [cars, totalCount] = await queryBuilder.getManyAndCount();

    return {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      cars: cars,
    };
  };
}

export default ListCarsService;
