import CarStatus from './CarStatus';

interface ICars {
  id: string;
  plate: string;
  brand: string;
  model: string;
  mileage?: number | null;
  year: number;
  items: string;
  daily_price: number;
  status: CarStatus;
  registration_date: Date;
  updated_time: Date;
}

export default ICars;
