import Cars from '../entities/Cars';

export default interface ICarsResponse {
  cars: Cars[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}
