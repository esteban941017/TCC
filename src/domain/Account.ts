export default class Account {
  constructor(
    readonly phone: string,
    readonly accountData: {
      createdAt: Date;
      [key: string]: any;
    },
  ) {}

  static create(phone: string) {
    const createdAt = new Date();
    return new Account(phone, { createdAt });
  }

  static restore(
    phone: string,
    accountData: {
      createdAt: string;
      [key: string]: any;
    },
  ) {
    return new Account(phone, {
      ...accountData,
      createdAt: new Date(accountData.createdAt),
    });
  }
}
