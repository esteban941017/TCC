import DynamoDBTableGateway from '../../infra/database/DynamoDBTableGateway';

export default class AccountRepository {
  constructor(private readonly table: DynamoDBTableGateway) {}

  async saveAccount(phone: string) {
    await this.table.put({ phone });
  }

  async updateAccount(phone: string, data: any) {
    await this.table.put({ phone, data });
  }

  async getByPhone(phone: string) {
    const { Items } = await this.table.query({
      KeyConditionExpression: '#phone = :phone',
      ExpressionAttributeNames: {
        '#phone': 'phone',
      },
      ExpressionAttributeValues: {
        ':phone': phone,
      },
    });
    if (!Items) return null;
    const account = Items.shift();
    if (!account) return null;
    return account;
  }
}
