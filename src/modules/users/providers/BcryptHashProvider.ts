import { compare, hash } from 'bcryptjs';
import IHashProvider from '../models/IHashProvider';

export default class HashProvider implements IHashProvider {
  public async generateHash(payload: string): Promise<string> {
    return hash(payload, 6);
  }

  compareHash(payload: string, hashed: string): Promise<boolean> {
    return compare(payload, hashed);
  }
}
