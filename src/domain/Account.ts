export default class Account {
  constructor(
    readonly phone: string,
    readonly accountData: {
      createdAt: string;
      name: string;
      currentPage: string;
      categories: string[];
      [key: string]: any;
    },
  ) {}

  static create(phone: string) {
    const createdAt = new Date().toISOString();
    const name = '';
    const currentPage = 'name';
    const categories: string[] = [];
    return new Account(phone, { createdAt, name, currentPage, categories });
  }

  static restore(
    phone: string,
    accountData: {
      createdAt: string;
      name: string;
      currentPage: string;
      categories: string[];
      [key: string]: any;
    },
  ) {
    return new Account(phone, {
      ...accountData,
      createdAt: accountData.createdAt,
      name: accountData.name,
      currentPage: accountData.currentPage,
      categories: accountData.categories,
    });
  }
}
