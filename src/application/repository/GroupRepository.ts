import Group from '../../domain/Group';
import DynamoDBTableGateway from '../../infra/database/DynamoDBTableGateway';

export default class GroupRepository {
  constructor(private readonly table: DynamoDBTableGateway) {}

  async createGroup(group: Group) {
    await this.table.put(group);
    return group;
  }

  async getById(id: string) {
    const { Items } = await this.table.query({
      KeyConditionExpression: '#id = :id',
      ExpressionAttributeNames: {
        '#id': 'id',
      },
      ExpressionAttributeValues: {
        ':id': id,
      },
    });
    if (!Items) return null;
    const group = Items.shift();
    if (!group) return null;
    return group;
  }

  async updateGroup(group: Group) {
    await this.table.put(group);
    return group;
  }

  async deleteGroup(id: string) {
    await this.table.delete({ id });
    return true;
  }
}
