import DynamoDBTableGateway from '../../src/infra/database/DynamoDBTableGateway';

describe('DynamoTableGateway test suite', () => {
  let dynamoDBTableGateway: DynamoDBTableGateway;

  beforeAll(() => {
    dynamoDBTableGateway = new DynamoDBTableGateway(
      String(process.env.ACCOUNT_TABLE),
    );
  });
  test('Should write to dynamo', async () => {
    const inputCreateItem = { phone: '553190723700', accountData: {} };
    const outputCreateItem = await dynamoDBTableGateway.put(inputCreateItem);
    expect(outputCreateItem.$metadata.httpStatusCode).toBe(200);
  });

  test('Should query an item', async () => {
    const inputCreateItem = {
      phone: '553190723700',
      accountData: {
        createdAt: new Date().toISOString(),
      },
    };
    await dynamoDBTableGateway.put(inputCreateItem);
    const inputGetData = {
      KeyConditionExpression: '#phone = :phone',
      ExpressionAttributeNames: {
        '#phone': 'phone',
      },
      ExpressionAttributeValues: {
        ':phone': inputCreateItem.phone,
      },
    };
    const outputGetData = await dynamoDBTableGateway.query(inputGetData);
    expect(outputGetData.$metadata.httpStatusCode).toBe(200);
    expect(outputGetData.Items && outputGetData.Items[0].phone).toBe(
      inputCreateItem.phone,
    );
    expect(
      outputGetData.Items && outputGetData.Items[0].accountData.createdAt,
    ).toBeDefined();
  });

  test('Should query with pagination', async () => {
    const inputCreateItem = {
      phone: '553190723700',
      accountData: {
        createdAt: new Date().toISOString(),
      },
    };
    await dynamoDBTableGateway.put(inputCreateItem);
    const inputGetData = {
      KeyConditionExpression: '#phone = :phone',
      ExpressionAttributeNames: {
        '#phone': 'phone',
      },
      ExpressionAttributeValues: {
        ':phone': inputCreateItem.phone,
      },
    };
    const outputGetData =
      await dynamoDBTableGateway.queryWithPagination(inputGetData);
    expect(outputGetData.length).toBe(1);
    expect(outputGetData[0].phone).toBe(inputCreateItem.phone);
    expect(outputGetData[0].accountData).toEqual(inputCreateItem.accountData);
  });

  test('Should delete an item', async () => {
    const inputCreateItem = {
      phone: '553190723700',
      accountData: {
        createdAt: new Date().toISOString(),
      },
    };
    await dynamoDBTableGateway.put(inputCreateItem);
    const inputDeleteData = { phone: inputCreateItem.phone };
    const outputDeleteData = await dynamoDBTableGateway.delete(inputDeleteData);
    expect(outputDeleteData.$metadata.httpStatusCode).toBe(200);
  });
});
