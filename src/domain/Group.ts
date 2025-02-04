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
    return new Group(id, name, createdAt, members, expenses);
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
  ) {
    return new Group(id, name, createdAt, members, expenses);
  }
}
