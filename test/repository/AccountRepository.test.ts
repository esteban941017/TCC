import AccountRepository from '../../src/application/repository/AccountRepository';
import Account from '../../src/domain/Account';
import DynamoDBTableGateway from '../../src/infra/database/DynamoDBTableGateway';

describe('Account repository test', () => {
  let dynamoDbTableGateway: DynamoDBTableGateway;
  let accountRepository: AccountRepository;

  beforeAll(() => {
    dynamoDbTableGateway = new DynamoDBTableGateway(
      String(process.env.ACCOUNT_TABLE),
    );
    accountRepository = new AccountRepository(dynamoDbTableGateway);
  });

  test('Should create an account', async () => {
    const inputCreateAccount = {
      phone: '55' + Math.floor(Math.random() * 10000000000),
    };
    const account = Account.create(inputCreateAccount.phone);
    const outputCreateAccount = await accountRepository.createAccount(account);
    expect(outputCreateAccount.phone).toBe(inputCreateAccount.phone);
    expect(outputCreateAccount.accountData.createdAt).toBeDefined();
    await accountRepository.deleteAccount(inputCreateAccount.phone);
  });

  test('Should get an account by phone', async () => {
    const inputCreateAccount = {
      phone: '55' + Math.floor(Math.random() * 10000000000),
    };
    const account = Account.create(inputCreateAccount.phone);
    await accountRepository.createAccount(account);
    const inputGetByPhone = inputCreateAccount.phone;
    const outputGetByPhone =
      await accountRepository.getByPhone(inputGetByPhone);
    expect(outputGetByPhone?.phone).toBe(inputGetByPhone);
    await accountRepository.deleteAccount(inputCreateAccount.phone);
  });

  test('Should update an acount', async () => {
    const inputCreateAccount = {
      phone: '55' + Math.floor(Math.random() * 10000000000),
    };
    const account = Account.create(inputCreateAccount.phone);
    await accountRepository.createAccount(account);
    const inputUpdateAccount = {
      ...account,
      accountData: {
        ...account.accountData,
        name: 'test name',
      },
    };
    const outputUpdateAccount =
      await accountRepository.updateAccount(inputUpdateAccount);
    expect(outputUpdateAccount?.phone).toBe(inputUpdateAccount.phone);
    expect(outputUpdateAccount?.accountData).toEqual(
      inputUpdateAccount.accountData,
    );
    await accountRepository.deleteAccount(inputCreateAccount.phone);
  });

  test('Should delete an account', async () => {
    const inputCreateAccount = {
      phone: '55' + Math.floor(Math.random() * 10000000000),
    };
    const account = Account.create(inputCreateAccount.phone);
    await accountRepository.createAccount(account);
    const inputDeleteAccount = account.phone;
    const outputDeleteAccount =
      await accountRepository.deleteAccount(inputDeleteAccount);
    expect(outputDeleteAccount).toBeTruthy();
  });
});
