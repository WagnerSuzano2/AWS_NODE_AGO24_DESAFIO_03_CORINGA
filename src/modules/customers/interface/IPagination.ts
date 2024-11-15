export default interface IPagination {
  name: string;
  email: string;
  cpf: string;
  exclude: boolean;
  orderBy: string;
  orderDirection: string;
  page: number;
  limit: number;
}
