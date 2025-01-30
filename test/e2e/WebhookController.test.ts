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

  afterAll(async () => {
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

  test('POST /test - should send invalid message if selected option is invalid', async () => {
    const inputFirstMessage = webhookEventPayload;
    inputFirstMessage.entry[0].changes[0].value.messages[0].text.body = 'Oi';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputFirstMessage);
    const inputSecondMessage = webhookEventPayload;
    inputSecondMessage.entry[0].changes[0].value.messages[0].text.body =
      'Esteban Ramirez';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputSecondMessage);
    const inputThirdMessage = webhookEventPayload;
    inputSecondMessage.entry[0].changes[0].value.messages[0].text.body = 'Test';
    const outputThirdMessage = await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputThirdMessage);
    expect(outputThirdMessage.status).toBe(HttpStatusCodes.OK);
    expect(outputThirdMessage.body).toBe('Invalid message sent');
  });

  test('POST /test - should register a category', async () => {
    const inputFirstMessage = webhookEventPayload;
    inputFirstMessage.entry[0].changes[0].value.messages[0].text.body = 'Oi';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputFirstMessage);
    const inputSecondMessage = webhookEventPayload;
    inputSecondMessage.entry[0].changes[0].value.messages[0].text.body =
      'Esteban Ramirez';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputSecondMessage);
    const inputThirdMessage = webhookEventPayload;
    inputThirdMessage.entry[0].changes[0].value.messages[0].text.body = '3';
    const outputThirdMessage = await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputThirdMessage);
    const inputFourthMessage = webhookEventPayload;
    inputFourthMessage.entry[0].changes[0].value.messages[0].text.body =
      'Minha Categoria';
    const outputFourthMessage = await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputFourthMessage);
    expect(outputThirdMessage.status).toBe(HttpStatusCodes.OK);
    expect(outputThirdMessage.body).toBe('Register category message sent');
    expect(outputFourthMessage.status).toBe(HttpStatusCodes.OK);
    expect(outputFourthMessage.body).toBe('Registered category message sent');
  });

  test('POST /test - should list categories', async () => {
    const inputFirstMessage = webhookEventPayload;
    inputFirstMessage.entry[0].changes[0].value.messages[0].text.body = 'Oi';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputFirstMessage);
    const inputSecondMessage = webhookEventPayload;
    inputSecondMessage.entry[0].changes[0].value.messages[0].text.body =
      'Esteban Ramirez';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputSecondMessage);
    const inputThirdMessage = webhookEventPayload;
    inputThirdMessage.entry[0].changes[0].value.messages[0].text.body = '3';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputThirdMessage);
    const inputFourthMessage = webhookEventPayload;
    inputFourthMessage.entry[0].changes[0].value.messages[0].text.body =
      'Categoria 1';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputFourthMessage);
    const inputFifthMessage = webhookEventPayload;
    inputFifthMessage.entry[0].changes[0].value.messages[0].text.body = '3';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputFifthMessage);
    const inputSixthMessage = webhookEventPayload;
    inputSixthMessage.entry[0].changes[0].value.messages[0].text.body =
      'Categoria 2';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputSixthMessage);
    const inputSeventhMessage = webhookEventPayload;
    inputSeventhMessage.entry[0].changes[0].value.messages[0].text.body = '4';
    const outputSeventhMessage = await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputSeventhMessage);
    expect(outputSeventhMessage.status).toBe(HttpStatusCodes.OK);
    expect(outputSeventhMessage.body).toBe('List categories message sent');
  });

  test('POST /test - should register an expense if no category is registered', async () => {
    const inputFirstMessage = webhookEventPayload;
    inputFirstMessage.entry[0].changes[0].value.messages[0].text.body = 'Oi';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputFirstMessage);
    const inputSecondMessage = webhookEventPayload;
    inputSecondMessage.entry[0].changes[0].value.messages[0].text.body =
      'Esteban Ramirez';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputSecondMessage);
    const inputThirdMessage = webhookEventPayload;
    inputThirdMessage.entry[0].changes[0].value.messages[0].text.body = '1';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputThirdMessage);
    const inputFourthMessage = webhookEventPayload;
    inputFourthMessage.entry[0].changes[0].value.messages[0].text.body = '3';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputFourthMessage);
    const inputFifthMessage = webhookEventPayload;
    inputFifthMessage.entry[0].changes[0].value.messages[0].text.body =
      'Minha categoria';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputFifthMessage);
    const inputSixthMessage = webhookEventPayload;
    inputSixthMessage.entry[0].changes[0].value.messages[0].text.body = '1';
    const outputSixthMessage = await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputSixthMessage);
    const inputSeventhMessage = webhookEventPayload;
    inputSeventhMessage.entry[0].changes[0].value.messages[0].text.body =
      '28/02/2025';
    const outputSeventhMessage = await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputSeventhMessage);
    const inputEightMessage = webhookEventPayload;
    inputEightMessage.entry[0].changes[0].value.messages[0].text.body =
      'Comida e bebida';
    const outputEightMessage = await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputEightMessage);
    const inputNinthMessage = webhookEventPayload;
    inputNinthMessage.entry[0].changes[0].value.messages[0].text.body =
      '350,45';
    const outputNinthMessage = await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputNinthMessage);
    const inputTenthMessage = webhookEventPayload;
    inputTenthMessage.entry[0].changes[0].value.messages[0].text.body = '1';
    const outputTenthMessage = await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputTenthMessage);
    expect(outputSixthMessage.status).toBe(HttpStatusCodes.OK);
    expect(outputSixthMessage.body).toBe(
      'Register personal expense date message sent',
    );
    expect(outputSeventhMessage.status).toBe(HttpStatusCodes.OK);
    expect(outputSeventhMessage.body).toBe(
      'Register personal expense description message sent',
    );
    expect(outputEightMessage.status).toBe(HttpStatusCodes.OK);
    expect(outputEightMessage.body).toBe(
      'Register personal expense amount message sent',
    );
    expect(outputNinthMessage.status).toBe(HttpStatusCodes.OK);
    expect(outputNinthMessage.body).toBe(
      'Register personal expense category message sent',
    );
    expect(outputTenthMessage.status).toBe(HttpStatusCodes.OK);
    expect(outputTenthMessage.body).toBe('Home message sent');
    // expect(outputFourthMessage.status).toBe(HttpStatusCodes.OK);
    // expect(outputFourthMessage.body).toBe('Registered category message sent');
  });
});
