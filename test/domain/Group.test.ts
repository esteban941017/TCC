import crypto from 'node:crypto';
import Group from '../../src/domain/Group';

describe('Group domain test', () => {
  test('Should create a group', () => {
    const inputCreateGroup = { name: 'Group name', createdBy: '553190723700' };
    const outputCreateGroup = Group.create(
      inputCreateGroup.name,
      inputCreateGroup.createdBy,
    );
    expect(outputCreateGroup.id).toBeDefined();
    expect(outputCreateGroup.name).toBe(inputCreateGroup.name);
    expect(outputCreateGroup.createdAt).toBeDefined();
    expect(outputCreateGroup.members).toEqual([inputCreateGroup.createdBy]);
    expect(outputCreateGroup.expenses).toEqual([]);
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
    };
    const outputRestoreGroup = Group.restore(
      inputRestoreGroup.id,
      inputRestoreGroup.name,
      inputRestoreGroup.createdAt,
      inputRestoreGroup.members,
      inputRestoreGroup.expenses,
    );
    expect(outputRestoreGroup.id).toBe(inputRestoreGroup.id);
    expect(outputRestoreGroup.name).toBe(inputRestoreGroup.name);
    expect(outputRestoreGroup.createdAt).toBe(inputRestoreGroup.createdAt);
    expect(outputRestoreGroup.members).toEqual(inputRestoreGroup.members);
    expect(outputRestoreGroup.expenses).toEqual(inputRestoreGroup.expenses);
  });
});
