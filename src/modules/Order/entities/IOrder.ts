import Cars from "../../cars/entities/Cars";
import Customer from "../../customers/entities/Customer";

export default interface IOrder {
  id?: string;
  dateRequest?: Date;
  statusRequest?: string;
  cep?: string | null;
  city?: string | null;
  uf?: string | null;
  rentalTax?: number;       
  totalValue?: number;      
  startDate?: Date | null;
  endDate?: Date | null;
  cancelDate?: Date | null;
  finishDate?: Date | null;
  fine?: number;           
  car: Cars;
  customer: Customer;
}
