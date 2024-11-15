export default interface ICustomer {
  id?: string;
  fullName: string;
  birthDate: Date;
  cpf: string;
  email: string;
  phone: string;
  createdAt: Date;
  deletedAt?: Date;
}


