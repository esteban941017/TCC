export default class Account {
  constructor(
    readonly phone: string,
    readonly accountData: {
      createdAt: string;
      currentPage: string;
      [key: string]: any;
    },
  ) {}

  static create(phone: string) {
    const createdAt = new Date().toISOString();
    const currentPage = 'name';
    return new Account(phone, { createdAt, currentPage });
  }

  static restore(
    phone: string,
    accountData: {
      createdAt: string;
      currentPage: string;
      [key: string]: any;
    },
  ) {
    return new Account(phone, {
      ...accountData,
      createdAt: accountData.createdAt,
      currentPage: accountData.currentPage,
    });
  }
}
