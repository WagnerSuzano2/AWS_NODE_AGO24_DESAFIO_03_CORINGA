import IUser from '../../modules/users/models/IUser';
import IFindUsersOptions from '../../modules/users/models/IFindUsersOptions';

export default class FakeUsersRepository {
  private users: IUser[] = [];

  public async save(user: IUser): Promise<IUser> {
    const index = this.users.findIndex(
      existingUser => existingUser.id === user.id,
    );

    if (index !== -1) {
      this.users[index] = user;
    } else {
      this.users.push(user);
    }

    return user;
  }

  public async create(userData: Omit<IUser, 'id'>): Promise<string> {
    const user: IUser = {
      id: this.generateId(),
      ...userData,
      createdAt: new Date(),
    };

    this.users.push(user);
    return user.id as string;
  }

  public async findById(id: string): Promise<IUser | null> {
    const user = this.users.find(user => user.id === id);
    if (!user) {
      return null;
    }

    return user;
  }

  public async findByEmail(email: string): Promise<IUser | null> {
    const user = this.users.find(user => user.email === email);

    return user || null;
  }

  public async findByName(name: string): Promise<IUser | null> {
    const user = this.users.find(user => user.name === name);

    return user || null;
  }

  public async findAll(options: IFindUsersOptions): Promise<[IUser[], number]> {
    const { filters, sort, pagination } = options;

    const filteredUsers = this.users.filter(user => {
      if (filters?.name && !(user.name as string).includes(filters.name)) {
        return false;
      }
      return true;
    });

    const sortedUsers = filteredUsers.sort((a, b) => {
      if (sort?.field && sort.order) {
        const fieldA = a[sort.field] as 'ASC' | 'DESC';
        const fieldB = b[sort.field] as 'ASC' | 'DESC';

        if (fieldA < fieldB) {
          return sort.order === 'ASC' ? -1 : 1;
        }
        if (fieldA > fieldB) {
          return sort.order === 'ASC' ? 1 : -1;
        }
      }
      return 0;
    });

    const page = pagination?.page || 1;
    const size = pagination?.size || 10;
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    const paginatedUsers = sortedUsers.slice(startIndex, endIndex);

    return [paginatedUsers, filteredUsers.length];
  }

  async update(id: string, userData: Partial<IUser>): Promise<IUser | null> {
    const userIndex = this.users.findIndex(user => user.id === id);

    if (userIndex === -1) {
      return null;
    }

    const updatedUser = { ...this.users[userIndex], ...userData };
    this.users[userIndex] = updatedUser;

    return updatedUser;
  }

  public async delete(id: string): Promise<void> {
    const userIndex = this.users.findIndex(user => user.id === id);

    if (userIndex === -1) {
      throw new Error('user not found'); 
    }

    this.users[userIndex].deletedAt = new Date(); 
  }

  private generateId(): string {
    return Math.random().toString(36);
  }
}
