import AccountRepository from '../../src/application/repository/AccountRepository';
import GroupRepository from '../../src/application/repository/GroupRepository';
import Group from '../../src/domain/Group';
import DynamoDBTableGateway from '../../src/infra/database/DynamoDBTableGateway';

describe('Account repository test', () => {
  let dynamoDbTableGateway: DynamoDBTableGateway;
  let groupRepository: GroupRepository;

  beforeAll(() => {
    dynamoDbTableGateway = new DynamoDBTableGateway(
      String(process.env.GROUP_TABLE),
    );
    groupRepository = new GroupRepository(dynamoDbTableGateway);
  });

  test('Should create a group', async () => {
    const inputCreateGroup = { name: 'My group', ceatedBy: '553190723700' };
    const group = Group.create(
      inputCreateGroup.name,
      inputCreateGroup.ceatedBy,
    );
    const outputCreateGroup = await groupRepository.createGroup(group);
    expect(outputCreateGroup.id).toBe(group.id);
    expect(outputCreateGroup.name).toBe(group.name);
    expect(outputCreateGroup.createdAt).toBe(group.createdAt);
    expect(outputCreateGroup.members).toEqual(group.members);
    expect(outputCreateGroup.expenses).toEqual(group.expenses);
    await groupRepository.deleteGroup(group.id);
  });

  test('Should get a group by id', async () => {
    const inputCreateGroup = { name: 'Group name', createdBy: '553190723700' };
    const group = Group.create(
      inputCreateGroup.name,
      inputCreateGroup.createdBy,
    );
    await groupRepository.createGroup(group);
    const inputGetById = group.id;
    const outputGetById = await groupRepository.getById(inputGetById);
    expect(outputGetById?.id).toBe(group.id);
    expect(outputGetById?.name).toBe(group.name);
    expect(outputGetById?.createdAt).toBe(group.createdAt);
    expect(outputGetById?.members).toEqual(group.members);
    expect(outputGetById?.expenses).toEqual(group.expenses);
    await groupRepository.deleteGroup(group.id);
  });

  test('Should update a group', async () => {
    const inputCreateGroup = { name: 'My group', createdBy: '553190723700' };
    const group = Group.create(
      inputCreateGroup.name,
      inputCreateGroup.createdBy,
    );
    await groupRepository.createGroup(group);
    const inputUpdateGroup = {
      ...group,
      name: 'Adjusted name',
      members: ['5531990723700'],
      expenses: [
        {
          date: new Date().toISOString(),
          description: 'Despense description',
          createdBy: '5531990723700',
          amount: '55.00',
          members: ['5531990723700'],
        },
      ],
    };
    const outputUpdateGroup =
      await groupRepository.updateGroup(inputUpdateGroup);
    expect(outputUpdateGroup?.id).toBe(outputUpdateGroup.id);
    expect(outputUpdateGroup?.name).toBe(outputUpdateGroup.name);
    expect(outputUpdateGroup?.createdAt).toBe(outputUpdateGroup.createdAt);
    expect(outputUpdateGroup?.members).toEqual(outputUpdateGroup.members);
    expect(outputUpdateGroup?.expenses).toEqual(outputUpdateGroup.expenses);
    await groupRepository.deleteGroup(group.id);
  });

  test('Should delete a group', async () => {
    const inputCreateGroup = { name: 'My group', createdBy: '553190723700' };
    const group = Group.create(
      inputCreateGroup.name,
      inputCreateGroup.createdBy,
    );
    await groupRepository.createGroup(group);
    const inputDeleteGroup = group.id;
    const outputDeleteGroup =
      await groupRepository.deleteGroup(inputDeleteGroup);
    expect(outputDeleteGroup).toBeTruthy();
  });
});
