import Account from '../../domain/Account';
import DynamoDBTableGateway from '../../infra/database/DynamoDBTableGateway';

export default class AccountRepository {
  constructor(private readonly table: DynamoDBTableGateway) {}

  async createAccount(account: Account) {
    await this.table.put(account);
    return account;
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

  async updateAccount(account: Account) {
    await this.table.put(account);
    return account;
  }

  async deleteAccount(phone: string) {
    await this.table.delete({ phone });
    return true;
  }
}
