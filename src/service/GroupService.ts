import GroupRepository from '../application/repository/GroupRepository';
import Group from '../domain/Group';
import GroupNotFound from '../errors/GroupNotFound';

export default class GroupService {
  constructor(private readonly groupRepository: GroupRepository) {}

  async createGroup(name: string, createdBy: string) {
    const group = Group.create(name, createdBy);
    return this.groupRepository.createGroup(group);
  }

  async getGroup(groupId: string) {
    const group = await this.groupRepository.getById(groupId);
    if (!group) return null;
    return Group.restore(
      group.id,
      group.name,
      group.createdAt,
      group.members,
      group.expenses,
    );
  }

  async updateGroup(groupId: string, data: any) {
    const group = await this.groupRepository.getById(groupId);
    if (!group) throw new GroupNotFound('Group not found');
    const updatedGroup = Group.restore(
      group.id,
      group.name,
      group.createdAt,
      data.members ? data.members : group.members,
      data.expenses ? data.expenses : group.expenses,
    );
    return this.groupRepository.updateGroup(updatedGroup);
  }

  async deleteGroup(groupId: string) {
    const group = await this.groupRepository.getById(groupId);
    if (!group) throw new GroupNotFound('Group not found');
    return this.groupRepository.deleteGroup(groupId);
  }
}
