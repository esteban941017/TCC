import { HttpStatusCodes } from '../application/util/HttpStatusCodes';
import AppError from './AppError';

export default class AccountNotFound extends AppError {
  constructor(message: string) {
    super(message, 'ACCOUNT_NOT_FOUND', HttpStatusCodes.NOT_FOUND);
  }
}
