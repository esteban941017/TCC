import crypto from 'node:crypto';

export default class Group {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly createdAt: string,
    readonly members: string[],
    readonly expenses: {
      date: string;
      description: string;
      createdBy: string;
      amount: string;
      members: string[];
    }[],
    readonly temporaryExpenses: {
      date: string;
      description: string;
      amount: string;
      members: string[];
      createdBy: string;
    }[],
  ) {}

  static create(name: string, createdBy: string) {
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const members: string[] = [];
    members.push(createdBy);
    const expenses: {
      date: string;
      description: string;
      createdBy: string;
      amount: string;
      members: string[];
    }[] = [];
    const temporaryExpenses: {
      date: string;
      description: string;
      amount: string;
      members: string[];
      createdBy: string;
    }[] = [];
    return new Group(id, name, createdAt, members, expenses, temporaryExpenses);
  }

  static restore(
    id: string,
    name: string,
    createdAt: string,
    members: string[],
    expenses: {
      date: string;
      description: string;
      createdBy: string;
      amount: string;
      members: string[];
    }[],
    temporaryExpenses: {
      date: string;
      description: string;
      amount: string;
      members: string[];
      createdBy: string;
    }[],
  ) {
    return new Group(id, name, createdAt, members, expenses, temporaryExpenses);
  }
}
