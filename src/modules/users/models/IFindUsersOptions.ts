import IUser from "./IUser";

export default interface FindUsersOptions {
  filters: {
    name?: string;
    email?: string;
    isDeleted?: boolean;
  };
  sort: {
    field: keyof IUser;
    order: 'ASC' | 'DESC';
  };
  pagination: {
    page: number;
    size: number;
  };
}