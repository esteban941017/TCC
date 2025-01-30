export default class Account {
  constructor(
    readonly phone: string,
    readonly accountData: {
      createdAt: string;
      name: string;
      currentPage: string;
      temporaryPersonalExpense: {
        date: string;
        description: string;
        amount: string;
      };
      personalExpenses: {
        date: string;
        description: string;
        amount: string;
        category: string;
      }[];
      categories: string[];
      [key: string]: any;
    },
  ) {}

  static create(phone: string) {
    const createdAt = new Date().toISOString();
    const name = '';
    const currentPage = 'name';
    const temporaryPersonalExpense = {
      date: '',
      description: '',
      amount: '',
    };
    const personalExpenses: {
      date: string;
      description: string;
      amount: string;
      category: string;
    }[] = [];
    const categories: string[] = [];
    return new Account(phone, {
      createdAt,
      name,
      currentPage,
      temporaryPersonalExpense,
      personalExpenses,
      categories,
    });
  }

  static restore(
    phone: string,
    accountData: {
      createdAt: string;
      name: string;
      currentPage: string;
      temporaryPersonalExpense: {
        date: string;
        description: string;
        amount: string;
      };
      personalExpenses: {
        date: string;
        description: string;
        amount: string;
        category: string;
      }[];
      categories: string[];
      [key: string]: any;
    },
  ) {
    return new Account(phone, {
      ...accountData,
      createdAt: accountData.createdAt,
      name: accountData.name,
      currentPage: accountData.currentPage,
      temporaryPersonalExpense: accountData.temporaryPersonalExpense,
      personalExpenses: accountData.personalExpenses,
      categories: accountData.categories,
    });
  }
}
