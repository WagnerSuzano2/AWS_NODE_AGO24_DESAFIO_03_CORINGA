interface IFilter {
  status?: string;
  plateEnd?: string;
  brand?: string;
  model?: string;
  mileage?: number;
  yearFrom?: number;
  yearTo?: number;
  dailyPriceMin?: number;
  dailyPriceMax?: number;
  items?: string[];
  sortFields?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}

export default IFilter;
