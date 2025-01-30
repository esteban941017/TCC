import loadEnvironment from '../../src/infra/env/environment';
import { HttpStatusCodes } from '../../src/application/util/HttpStatusCodes';
import { BaseRoute, HttpServer } from '../../src/infra/http/HttpServer';
import request from 'supertest';
import { webhookEventPayload } from '../mock/WebhookEventPayload';
import DynamoDBTableGateway from '../../src/infra/database/DynamoDBTableGateway';
import AccountRepository from '../../src/application/repository/AccountRepository';

describe('Webhook Controller', () => {
  let httpClient: HttpServer;
  let dynamoDbTableGateway: DynamoDBTableGateway;
  let accountRepository: AccountRepository;

  beforeAll(async () => {
    loadEnvironment();
    httpClient = new HttpServer();

    dynamoDbTableGateway = new DynamoDBTableGateway(
      String(process.env.ACCOUNT_TABLE),
    );
    accountRepository = new AccountRepository(dynamoDbTableGateway);
    const account = await accountRepository.getByPhone('553190723700');
    if (account) await accountRepository.deleteAccount('553190723700');
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    const account = await accountRepository.getByPhone('553190723700');
    // if (account) await accountRepository.deleteAccount('553190723700');
  });

  test('GET / - should verify webhook', async () => {
    const inputVerifyToken = {
      'hub.mode': 'subscribe',
      'hub.challenge': Math.round(Math.random() * 1000000),
      'hub.verify_token': process.env.META_VERIFICATION_TOKEN,
    };
    const outputVerifyToken = await request(httpClient.app).get(
      `/${BaseRoute}/webhook/?hub.mode=${inputVerifyToken['hub.mode']}&hub.challenge=${inputVerifyToken['hub.challenge']}&hub.verify_token=${inputVerifyToken['hub.verify_token']}`,
    );
    expect(outputVerifyToken.statusCode).toBe(HttpStatusCodes.OK);
    expect(outputVerifyToken.body).toBe(inputVerifyToken['hub.challenge']);
  });

  test('GET / - should not verify webhook if mode is not subscribe', async () => {
    const inputVerifyToken = {
      'hub.mode': '',
      'hub.challenge': Math.round(Math.random() * 1000000),
      'hub.verify_token': process.env.META_VERIFICATION_TOKEN,
    };
    const outputVerifyToken = await request(httpClient.app).get(
      `/${BaseRoute}/webhook?hub.mode=${inputVerifyToken['hub.mode']}&hub.challenge=${inputVerifyToken['hub.challenge']}&hub.verify_token=${inputVerifyToken['hub.verify_token']}`,
    );
    expect(outputVerifyToken.statusCode).toBe(HttpStatusCodes.FORBIDDEN);
    expect(outputVerifyToken.body.message).toBe('Forbidden');
  });

  test('GET / - should not verify webhook if token does not match', async () => {
    const inputVerifyToken = {
      'hub.mode': 'subscribe',
      'hub.challenge': Math.round(Math.random() * 1000000),
      'hub.verify_token': '',
    };
    const outputVerifyToken = await request(httpClient.app).get(
      `/${BaseRoute}/webhook?hub.mode=${inputVerifyToken['hub.mode']}&hub.challenge=${inputVerifyToken['hub.challenge']}&hub.verify_token=${inputVerifyToken['hub.verify_token']}`,
    );
    expect(outputVerifyToken.statusCode).toBe(HttpStatusCodes.FORBIDDEN);
    expect(outputVerifyToken.body.message).toBe('Forbidden');
  });

  test('POST /test - should create an account', async () => {
    const inputFirstMessage = webhookEventPayload;
    inputFirstMessage.entry[0].changes[0].value.messages[0].text.body = 'Oi';
    const outputFirstMessage = await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputFirstMessage);
    const inputSecondMessage = webhookEventPayload;
    inputSecondMessage.entry[0].changes[0].value.messages[0].text.body =
      'Esteban Ramirez';
    const outputSecondMessage = await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputSecondMessage);
    expect(outputFirstMessage.status).toBe(HttpStatusCodes.OK);
    expect(outputFirstMessage.body).toBe('Name message sent');
    expect(outputSecondMessage.status).toBe(HttpStatusCodes.OK);
    expect(outputSecondMessage.body).toBe('Home message sent');
  });
});
