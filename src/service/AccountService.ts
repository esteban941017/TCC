import AccountRepository from '../application/repository/AccountRepository';
import Account from '../domain/Account';
import AccountAlreadyExists from '../errors/AccountAlreadyExists';
import AccountNotFound from '../errors/AccountNotFound';

export default class AccountService {
  constructor(private readonly accountRepository: AccountRepository) {}

  async createAccount(phone: string) {
    const exists = await this.accountRepository.getByPhone(phone);
    if (exists) throw new AccountAlreadyExists('Account already exists');
    const account = Account.create(phone);
    return this.accountRepository.createAccount(account);
  }

  async getAccount(phone: string) {
    const account = await this.accountRepository.getByPhone(phone);
    if (!account) return null;
    return Account.restore(account.phone, account.accountData);
  }

  async updateAccount(phone: string, data: any) {
    const account = await this.accountRepository.getByPhone(phone);
    if (!account) throw new AccountNotFound('Account not found');
    console.log(data);
    const updatedAccount = Account.restore(phone, {
      ...account.accountData,
      ...data,
    });
    return this.accountRepository.updateAccount(updatedAccount);
  }

  async deleteAccount(phone: string) {
    const account = await this.accountRepository.getByPhone(phone);
    if (!account) throw new AccountNotFound('Account not found');
    return this.accountRepository.deleteAccount(phone);
  }
}
