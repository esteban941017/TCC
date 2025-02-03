import { HttpStatusCodes } from '../application/util/HttpStatusCodes';
import AppError from './AppError';

export default class GroupNotFound extends AppError {
  constructor(message: string) {
    super(message, 'GROUP_NOT_FOUND', HttpStatusCodes.BAD_REQUEST);
  }
}
