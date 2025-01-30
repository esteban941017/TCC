import Account from '../../src/domain/Account';

describe('Account domain test', () => {
  test('Should create an account', () => {
    const inputCreateAccount = '553190723700';
    const outputCreateAccount = Account.create(inputCreateAccount);
    expect(outputCreateAccount.phone).toBe(inputCreateAccount);
    expect(outputCreateAccount.accountData.createdAt).toBeTruthy();
  });

  test('Should restore an account', () => {
    const inputRestoreAccount = {
      phone: '553190723700',
      accountData: {
        createdAt: new Date().toISOString(),
        name: 'Test name',
        currentPage: 'home',
        categories: [],
      },
    };
    const outputRestoreAccount = Account.restore(
      inputRestoreAccount.phone,
      inputRestoreAccount.accountData,
    );
    expect(outputRestoreAccount.phone).toBe(inputRestoreAccount.phone);
    expect(outputRestoreAccount.accountData.createdAt).toEqual(
      inputRestoreAccount.accountData.createdAt,
    );
  });
});
