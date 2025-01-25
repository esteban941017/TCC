import {
  DynamoDBDocumentClient,
  PutCommand,
  UpdateCommandInput,
  UpdateCommand,
  QueryCommand,
  QueryCommandInput,
  QueryCommandOutput,
} from '@aws-sdk/lib-dynamodb';

export default class DynamoDBTableGateway {
  constructor(
    private readonly dynamoDBClient: DynamoDBDocumentClient,
    private readonly tableName: string,
  ) {}

  async put(item: any) {
    const command = new PutCommand({
      TableName: this.tableName,
      Item: item,
    });
    return this.dynamoDBClient.send(command);
  }

  async query(params: Partial<QueryCommandInput>): Promise<QueryCommandOutput> {
    const command = new QueryCommand({
      ...params,
      TableName: this.tableName,
    });

    const result = await this.dynamoDBClient.send(command);
    return result;
  }

  async queryWithPagination(params: Partial<QueryCommandInput>) {
    const allData = [];

    const result = await this.query(params);
    let lastKey: any = result.LastEvaluatedKey;

    for (const element of result.Items ?? []) {
      const rawData = element.data;
      allData.push(rawData);
    }

    while (lastKey) {
      params.ExclusiveStartKey = lastKey;
      const nextPage = await this.query(params);
      lastKey = nextPage.LastEvaluatedKey || false;

      for (const element of nextPage.Items ?? []) {
        const rawData = element.data;
        allData.push(rawData);
      }
    }

    return allData;
  }
}
