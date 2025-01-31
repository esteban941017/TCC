import crypto from 'node:crypto';
import Group from '../../src/domain/Group';

describe('Group domain test', () => {
  test('Should create a group', () => {
    const inputCreateGroup = 'Group name';
    const outputCreateGroup = Group.create(inputCreateGroup);
    expect(outputCreateGroup.id).toBeDefined();
    expect(outputCreateGroup.name).toBe(inputCreateGroup);
    expect(outputCreateGroup.createdAt).toBeDefined();
    expect(outputCreateGroup.members).toEqual([]);
    expect(outputCreateGroup.expenses).toEqual([]);
    expect(outputCreateGroup.temporaryExpense).toEqual({
      date: '',
      description: '',
      amount: '',
      members: [],
    });
  });

  test('Should restore a group', () => {
    const inputRestoreGroup = {
      id: crypto.randomUUID(),
      name: 'Group name',
      createdAt: new Date().toISOString(),
      members: [
        String(Math.floor(Math.random() * 10000000000)),
        String(Math.floor(Math.random() * 10000000000)),
        String(Math.floor(Math.random() * 10000000000)),
      ],
      expenses: [],
      temporaryExpense: {
        date: '',
        description: '',
        amount: '',
        members: [],
      },
    };
    const outputRestoreGroup = Group.restore(
      inputRestoreGroup.id,
      inputRestoreGroup.name,
      inputRestoreGroup.createdAt,
      inputRestoreGroup.members,
      inputRestoreGroup.expenses,
      inputRestoreGroup.temporaryExpense,
    );
    expect(outputRestoreGroup.id).toBe(inputRestoreGroup.id);
    expect(outputRestoreGroup.name).toBe(inputRestoreGroup.name);
    expect(outputRestoreGroup.createdAt).toBe(inputRestoreGroup.createdAt);
    expect(outputRestoreGroup.members).toEqual(inputRestoreGroup.members);
    expect(outputRestoreGroup.expenses).toEqual(inputRestoreGroup.expenses);
    expect(outputRestoreGroup.temporaryExpense).toEqual(
      inputRestoreGroup.temporaryExpense,
    );
  });
});
