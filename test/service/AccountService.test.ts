import loadEnvironment from '../../src/infra/env/environment';
import AccountRepository from '../../src/application/repository/AccountRepository';
import DynamoDBTableGateway from '../../src/infra/database/DynamoDBTableGateway';
import AccountService from '../../src/service/AccountService';

describe('Account service test', () => {
  let dynamoDbTableGateway: DynamoDBTableGateway;
  let accountRepository: AccountRepository;
  let accountService: AccountService;

  beforeAll(async () => {
    loadEnvironment();
    dynamoDbTableGateway = new DynamoDBTableGateway(
      String(process.env.ACCOUNT_TABLE),
    );
    accountRepository = new AccountRepository(dynamoDbTableGateway);
    accountService = new AccountService(accountRepository);
    const account = await accountRepository.getByPhone('553190723700');
    if (account) await accountRepository.deleteAccount('553190723700');
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    const account = await accountRepository.getByPhone('553190723700');
    if (account) await accountRepository.deleteAccount('553190723700');
  });

  test('Should create an account', async () => {
    const inputCreateAccount = '553190723700';
    const outputCreateAccount =
      await accountService.createAccount(inputCreateAccount);
    expect(outputCreateAccount.phone).toBe(inputCreateAccount);
    expect(outputCreateAccount.accountData.createdAt).toBeDefined();
    expect(outputCreateAccount.accountData.name).toBe('');
    expect(outputCreateAccount.accountData.currentPage).toBe('name');
    expect(outputCreateAccount.accountData.temporaryPersonalExpense).toEqual({
      date: '',
      description: '',
      amount: '',
    });
    expect(outputCreateAccount.accountData.personalExpenses).toEqual([]);
    expect(outputCreateAccount.accountData.categories).toEqual([]);
    expect(outputCreateAccount.accountData.groups).toEqual([]);
  });

  test('Should get an account', async () => {
    const inputCreateAccount = '553190723700';
    await accountService.createAccount(inputCreateAccount);
    const outputGetAccount =
      await accountService.getAccount(inputCreateAccount);
    expect(outputGetAccount?.phone).toBe(inputCreateAccount);
    expect(outputGetAccount?.accountData.createdAt).toBeDefined();
    expect(outputGetAccount?.accountData.name).toBe('');
    expect(outputGetAccount?.accountData.currentPage).toBe('name');
    expect(outputGetAccount?.accountData.temporaryPersonalExpense).toEqual({
      date: '',
      description: '',
      amount: '',
    });
    expect(outputGetAccount?.accountData.personalExpenses).toEqual([]);
    expect(outputGetAccount?.accountData.categories).toEqual([]);
    expect(outputGetAccount?.accountData.groups).toEqual([]);
  });

  test('Should update an account', async () => {
    const inputCreateAccount = '553190723700';
    await accountService.createAccount(inputCreateAccount);
    const inputUpdateAccount = {
      name: 'Test name',
      currentPage: 'testCurrentPage',
      categories: ['TestCategory'],
      groups: ['TestGroup1', 'TestGroup2'],
    };
    const outputUpdateAccount = await accountService.updateAccount(
      inputCreateAccount,
      inputUpdateAccount,
    );
    expect(outputUpdateAccount.phone).toBe(inputCreateAccount);
    expect(outputUpdateAccount.accountData.createdAt).toBeDefined();
    expect(outputUpdateAccount.accountData.name).toBe(inputUpdateAccount.name);
    expect(outputUpdateAccount.accountData.currentPage).toBe(
      inputUpdateAccount.currentPage,
    );
    expect(outputUpdateAccount.accountData.temporaryPersonalExpense).toEqual({
      date: '',
      description: '',
      amount: '',
    });
    expect(outputUpdateAccount.accountData.personalExpenses).toEqual([]);
    expect(outputUpdateAccount.accountData.categories).toEqual(
      inputUpdateAccount.categories,
    );
    expect(outputUpdateAccount.accountData.groups).toEqual(
      inputUpdateAccount.groups,
    );
  });

  test('Should delete an account', async () => {
    const inputCreateAccount = '553190723700';
    await accountService.createAccount(inputCreateAccount);
    const outputDeleteAccount =
      await accountService.deleteAccount(inputCreateAccount);
    expect(outputDeleteAccount).toBeTruthy();
  });
});
