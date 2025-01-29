import { DynamoDB } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocument,
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  QueryCommandInput,
  QueryCommandOutput,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
export const TYPE_INDEX = 'type_index';

export default class DynamoDBTableGateway {
  private readonly dynamoDBClient: DynamoDBDocumentClient =
    DynamoDBDocument.from(
      new DynamoDB({
        region: process.env.AWS_REGION,
      }),
      {
        marshallOptions: {
          convertEmptyValues: false,
          removeUndefinedValues: true,
          convertClassInstanceToMap: true,
        },
        unmarshallOptions: {
          wrapNumbers: false,
        },
      },
    );

  constructor(private readonly tableName: string) {}

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
      const rawData = element;
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

  async delete(params: { [key: string]: any }) {
    const command = new DeleteCommand({
      Key: { ...params },
      TableName: this.tableName,
    });

    const result = await this.dynamoDBClient.send(command);
    return result;
  }
}
