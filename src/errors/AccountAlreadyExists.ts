import { HttpStatusCodes } from '../application/util/HttpStatusCodes';
import AppError from './AppError';

export default class AccountAlreadyExists extends AppError {
  constructor(message: string) {
    super(message, 'ACCOUNT_ALREADY_EXISTS', HttpStatusCodes.BAD_REQUEST);
  }
}
