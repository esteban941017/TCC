import AccountRepository from '../application/repository/AccountRepository';
import AccountAlreadyExists from '../errors/AccountAlreadyExists';

export default class AccountService {
  constructor(private readonly accountRepository: AccountRepository) {}

  async createAccount(phone: string) {
    const exists = await this.accountRepository.getByPhone(phone);
    if (exists) throw new AccountAlreadyExists('Account already exists');
  }
}
