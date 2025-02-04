import loadEnvironment from '../../src/infra/env/environment';
import GroupRepository from '../../src/application/repository/GroupRepository';
import DynamoDBTableGateway from '../../src/infra/database/DynamoDBTableGateway';
import GroupService from '../../src/service/GroupService';

describe('Group service test', () => {
  let dynamoDbTableGateway: DynamoDBTableGateway;
  let groupRepository: GroupRepository;
  let groupService: GroupService;

  beforeAll(async () => {
    loadEnvironment();
    dynamoDbTableGateway = new DynamoDBTableGateway(
      String(process.env.GROUP_TABLE),
    );
    groupRepository = new GroupRepository(dynamoDbTableGateway);
    groupService = new GroupService(groupRepository);
  });

  test('Should create a group', async () => {
    const inputCreateGroup = {
      name: 'Test Group Name',
      createdBy: '553190723700',
    };
    const outputCreateGroup = await groupService.createGroup(
      inputCreateGroup.name,
      inputCreateGroup.createdBy,
    );
    expect(outputCreateGroup.id).toBeDefined();
    expect(outputCreateGroup.name).toBe(inputCreateGroup.name);
    expect(outputCreateGroup.createdAt).toBeDefined();
    expect(outputCreateGroup.members).toEqual([inputCreateGroup.createdBy]);
    expect(outputCreateGroup.expenses).toEqual([]);
    expect(outputCreateGroup.temporaryExpenses).toEqual([]);
    await groupRepository.deleteGroup(outputCreateGroup.id);
  });

  test('Should get a group', async () => {
    const inputCreateGroup = {
      name: 'Test Group Name',
      createdBy: '553190723700',
    };
    const outputCreateGroup = await groupService.createGroup(
      inputCreateGroup.name,
      inputCreateGroup.createdBy,
    );
    const inputGetGroup = outputCreateGroup.id;
    const outputGetGroup = await groupRepository.getById(inputGetGroup);
    expect(outputGetGroup?.id).toBe(outputCreateGroup.id);
    expect(outputGetGroup?.name).toBe(outputCreateGroup.name);
    expect(outputGetGroup?.createdAt).toBe(outputCreateGroup.createdAt);
    expect(outputGetGroup?.members).toEqual(outputCreateGroup.members);
    expect(outputGetGroup?.expenses).toEqual(outputCreateGroup.expenses);
    expect(outputGetGroup?.temporaryExpenses).toEqual(
      outputCreateGroup.temporaryExpenses,
    );
    await groupRepository.deleteGroup(outputCreateGroup.id);
  });

  test('Should update a group', async () => {
    const inputCreateGroup = {
      name: 'Test group name',
      createdBy: '553190723700',
    };
    const outputCreateGroup = await groupService.createGroup(
      inputCreateGroup.name,
      inputCreateGroup.createdBy,
    );
    const inputUpdateGroup = {
      members: [...outputCreateGroup.members, '553111111111'],
      expenses: [
        {
          date: new Date().toISOString(),
          description: 'Test description',
          createdBy: '553190723700',
          amount: '55.00',
          members: ['553190723700', '553111111111'],
        },
      ],
      temporaryExpenses: [
        {
          date: new Date().toISOString(),
          description: 'Test temporary expense',
          amount: '10.00',
          members: ['553190723700'],
          createdBy: '553190723700',
        },
      ],
    };
    const outputUpdateGroup = await groupService.updateGroup(
      outputCreateGroup.id,
      inputUpdateGroup,
    );
    expect(outputUpdateGroup.id).toBe(outputCreateGroup.id);
    expect(outputUpdateGroup.name).toBe(outputCreateGroup.name);
    expect(outputUpdateGroup.createdAt).toBe(outputCreateGroup.createdAt);
    expect(outputUpdateGroup.members).toEqual(inputUpdateGroup.members);
    expect(outputUpdateGroup.expenses).toEqual(inputUpdateGroup.expenses);
    expect(outputUpdateGroup.temporaryExpenses).toEqual(
      inputUpdateGroup.temporaryExpenses,
    );
    await groupRepository.deleteGroup(outputCreateGroup.id);
  });

  test('Should delete a group', async () => {
    const inputCreateGroup = {
      name: 'Test group name',
      createdBy: '553190723700',
    };
    const outputCreateGroup = await groupService.createGroup(
      inputCreateGroup.name,
      inputCreateGroup.createdBy,
    );
    const inputDeleteGroup = outputCreateGroup.id;
    const outputDeleteGroup = await groupService.deleteGroup(inputDeleteGroup);
    expect(outputDeleteGroup).toBeTruthy();
  });
});
