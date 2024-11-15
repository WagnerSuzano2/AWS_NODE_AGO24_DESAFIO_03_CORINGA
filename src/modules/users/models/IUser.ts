export default interface IUser {
    id?: string;
    name?: string;
    email?: string;
    password?: string;
    createdAt?: Date;
    deletedAt?: Date | null;
}