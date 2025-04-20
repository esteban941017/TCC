import loadEnvironment from '../../src/infra/env/environment';
import { HttpStatusCodes } from '../../src/application/util/HttpStatusCodes';
import { BaseRoute, HttpServer } from '../../src/infra/http/HttpServer';
import request from 'supertest';
import {
  webhookEventPayload,
  webhookSecondUserEventPayload,
} from '../mock/WebhookEventPayload';
import DynamoDBTableGateway from '../../src/infra/database/DynamoDBTableGateway';
import AccountRepository from '../../src/application/repository/AccountRepository';
import { accountService } from '../../src/main';

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
    const account1 = await accountRepository.getByPhone('553190723700');
    const account2 = await accountRepository.getByPhone('573507098262');
    if (account1) await accountRepository.deleteAccount('553190723700');
    if (account2) await accountRepository.deleteAccount('573507098262');
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    const account1 = await accountRepository.getByPhone('553190723700');
    const account2 = await accountRepository.getByPhone('573507098262');
    if (account1) await accountRepository.deleteAccount('553190723700');
    if (account2) await accountRepository.deleteAccount('573507098262');
  });

  afterAll(async () => {
    const account1 = await accountRepository.getByPhone('553190723700');
    const account2 = await accountRepository.getByPhone('573507098262');
    if (account1) await accountRepository.deleteAccount('553190723700');
    if (account2) await accountRepository.deleteAccount('573507098262');
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
  });

  test('POST /test - should not list expenses if there are any registered', async () => {
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
    inputThirdMessage.entry[0].changes[0].value.messages[0].text.body = '2';
    const outputThirdMessage = await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputThirdMessage);
    expect(outputThirdMessage.status).toBe(HttpStatusCodes.OK);
    expect(outputThirdMessage.body).toBe('No registered expenses message sent');
  });

  test('POST /test - Should list expenses', async () => {
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
      'Minha categoria 1';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputFifthMessage);
    const inputSixthMessage = webhookEventPayload;
    inputSixthMessage.entry[0].changes[0].value.messages[0].text.body = '3';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputSixthMessage);
    const inputSeventhMessage = webhookEventPayload;
    inputSeventhMessage.entry[0].changes[0].value.messages[0].text.body =
      'Minha categoria 2';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputSeventhMessage);
    const inputEightMessage = webhookEventPayload;
    inputEightMessage.entry[0].changes[0].value.messages[0].text.body = '1';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputEightMessage);
    const inputNinethMessage = webhookEventPayload;
    inputNinethMessage.entry[0].changes[0].value.messages[0].text.body =
      '27/02/2025';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputNinethMessage);
    const inputTenthMessage = webhookEventPayload;
    inputTenthMessage.entry[0].changes[0].value.messages[0].text.body = 'Pizza';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputTenthMessage);
    const inputEleventhMessage = webhookEventPayload;
    inputEleventhMessage.entry[0].changes[0].value.messages[0].text.body =
      '50,45';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputEleventhMessage);
    const inputTwelvethMessage = webhookEventPayload;
    inputTwelvethMessage.entry[0].changes[0].value.messages[0].text.body = '1';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputTwelvethMessage);

    const inputThirteenthMessage = webhookEventPayload;
    inputThirteenthMessage.entry[0].changes[0].value.messages[0].text.body =
      '1';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputThirteenthMessage);
    const inputFourteenthMessage = webhookEventPayload;
    inputFourteenthMessage.entry[0].changes[0].value.messages[0].text.body =
      '28/02/2025';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputFourteenthMessage);
    const inputFiveteenthMessage = webhookEventPayload;
    inputFiveteenthMessage.entry[0].changes[0].value.messages[0].text.body =
      'Hamburguer';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputFiveteenthMessage);
    const inputSixteenthMessage = webhookEventPayload;
    inputSixteenthMessage.entry[0].changes[0].value.messages[0].text.body =
      '350,45';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputSixteenthMessage);
    const inputSeventeenthMessage = webhookEventPayload;
    inputSeventeenthMessage.entry[0].changes[0].value.messages[0].text.body =
      '1';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputSeventeenthMessage);
    const inputEighteenthMessage = webhookEventPayload;
    inputEighteenthMessage.entry[0].changes[0].value.messages[0].text.body =
      '2';
    const outputEighteenthMessage = await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputEighteenthMessage);
    const inputNineteenthMessage = webhookEventPayload;
    inputNineteenthMessage.entry[0].changes[0].value.messages[0].text.body =
      '1';
    const outputNineteenthMessage = await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputNineteenthMessage);
    expect(outputEighteenthMessage.status).toBe(HttpStatusCodes.OK);
    expect(outputEighteenthMessage.body).toBe(
      'List personal expense select category message sent',
    );
    expect(outputNineteenthMessage.status).toBe(HttpStatusCodes.OK);
    expect(outputNineteenthMessage.body).toBe('Home message sent');
  });

  test('POST /test - should not add group expense if there are no registered groups', async () => {
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
    inputThirdMessage.entry[0].changes[0].value.messages[0].text.body = '5';
    const outputThirdMessage = await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputThirdMessage);
    expect(outputThirdMessage.status).toBe(HttpStatusCodes.OK);
    expect(outputThirdMessage.body).toBe('No registered groups message sent');
  });

  test('POST /test - should register a new group', async () => {
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
    inputThirdMessage.entry[0].changes[0].value.messages[0].text.body = '6';
    const outputThirdMessage = await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputThirdMessage);
    const inputFourthMessage = webhookEventPayload;
    inputFourthMessage.entry[0].changes[0].value.messages[0].text.body = '1';
    const outputFourthMessage = await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputFourthMessage);
    const inputFifthMessage = webhookEventPayload;
    inputFifthMessage.entry[0].changes[0].value.messages[0].text.body =
      'My group name';
    const outputFifthMessage = await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputFifthMessage);
    expect(outputThirdMessage.status).toBe(HttpStatusCodes.OK);
    expect(outputThirdMessage.body).toBe('Register group message sent');
    expect(outputFourthMessage.status).toBe(HttpStatusCodes.OK);
    expect(outputFourthMessage.body).toBe('Register group name message sent');
    expect(outputFifthMessage.status).toBe(HttpStatusCodes.OK);
    expect(outputFifthMessage.body).toBe('Home message sent');
  });

  test('POST /test - should enter a new group', async () => {
    const inputUser1FirstMessage = webhookEventPayload;
    inputUser1FirstMessage.entry[0].changes[0].value.messages[0].text.body =
      'Oi';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputUser1FirstMessage);
    const inputUser2FirstMessage = webhookSecondUserEventPayload;
    inputUser2FirstMessage.entry[0].changes[0].value.messages[0].text.body =
      'Oi';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputUser2FirstMessage);
    const inputUser1SecondMessage = webhookEventPayload;
    inputUser1SecondMessage.entry[0].changes[0].value.messages[0].text.body =
      'Esteban Ramirez';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputUser1SecondMessage);
    const inputUser2SecondMessage = webhookSecondUserEventPayload;
    inputUser2SecondMessage.entry[0].changes[0].value.messages[0].text.body =
      'Nicolas';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputUser2SecondMessage);
    const inputUser2ThirdMessage = webhookSecondUserEventPayload;
    inputUser2ThirdMessage.entry[0].changes[0].value.messages[0].text.body =
      '6';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputUser2ThirdMessage);
    const inputUser2FourthMessage = webhookSecondUserEventPayload;
    inputUser2FourthMessage.entry[0].changes[0].value.messages[0].text.body =
      '1';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputUser2FourthMessage);
    const inputUser2FifthMessage = webhookSecondUserEventPayload;
    inputUser2FifthMessage.entry[0].changes[0].value.messages[0].text.body =
      'My group name';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputUser2FifthMessage);
    const createdGroup = (
      await accountService.getAccount(
        webhookSecondUserEventPayload.entry[0].changes[0].value.messages[0]
          .from,
      )
    )?.accountData.groups[0];
    const inputUser1ThirdMessage = webhookEventPayload;
    inputUser1ThirdMessage.entry[0].changes[0].value.messages[0].text.body =
      '6';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputUser1ThirdMessage);
    const inputUser1FourthMessage = webhookEventPayload;
    inputUser1FourthMessage.entry[0].changes[0].value.messages[0].text.body =
      '2';
    const outputUser1FourthMessage = await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputUser1FourthMessage);
    const inputUser1FifthMessage = webhookEventPayload;
    inputUser1FifthMessage.entry[0].changes[0].value.messages[0].text.body =
      String(createdGroup);
    const outputUser1FifthMessage = await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputUser1FifthMessage);
    expect(outputUser1FourthMessage.status).toBe(HttpStatusCodes.OK);
    expect(outputUser1FourthMessage.body).toBe('Enter group message sent');
    expect(outputUser1FifthMessage.status).toBe(HttpStatusCodes.OK);
    expect(outputUser1FifthMessage.body).toBe('Home message sent');
  });

  test('POST /test - should register a group expense', async () => {
    const inputUser1FirstMessage = webhookEventPayload;
    inputUser1FirstMessage.entry[0].changes[0].value.messages[0].text.body =
      'Oi';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputUser1FirstMessage);
    const inputUser2FirstMessage = webhookSecondUserEventPayload;
    inputUser2FirstMessage.entry[0].changes[0].value.messages[0].text.body =
      'Oi';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputUser2FirstMessage);
    const inputUser1SecondMessage = webhookEventPayload;
    inputUser1SecondMessage.entry[0].changes[0].value.messages[0].text.body =
      'Esteban Ramirez';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputUser1SecondMessage);
    const inputUser2SecondMessage = webhookSecondUserEventPayload;
    inputUser2SecondMessage.entry[0].changes[0].value.messages[0].text.body =
      'Nicolas';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputUser2SecondMessage);
    const inputUser2ThirdMessage = webhookSecondUserEventPayload;
    inputUser2ThirdMessage.entry[0].changes[0].value.messages[0].text.body =
      '6';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputUser2ThirdMessage);
    const inputUser2FourthMessage = webhookSecondUserEventPayload;
    inputUser2FourthMessage.entry[0].changes[0].value.messages[0].text.body =
      '1';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputUser2FourthMessage);
    const inputUser2FifthMessage = webhookSecondUserEventPayload;
    inputUser2FifthMessage.entry[0].changes[0].value.messages[0].text.body =
      'My group name';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputUser2FifthMessage);
    const createdGroup = (
      await accountService.getAccount(
        webhookSecondUserEventPayload.entry[0].changes[0].value.messages[0]
          .from,
      )
    )?.accountData.groups[0];
    const inputUser1ThirdMessage = webhookEventPayload;
    inputUser1ThirdMessage.entry[0].changes[0].value.messages[0].text.body =
      '6';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputUser1ThirdMessage);
    const inputUser1FourthMessage = webhookEventPayload;
    inputUser1FourthMessage.entry[0].changes[0].value.messages[0].text.body =
      '2';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputUser1FourthMessage);
    const inputUser1FifthMessage = webhookEventPayload;
    inputUser1FifthMessage.entry[0].changes[0].value.messages[0].text.body =
      String(createdGroup);
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputUser1FifthMessage);
    const inputUser1SixthMessage = webhookEventPayload;
    inputUser1SixthMessage.entry[0].changes[0].value.messages[0].text.body =
      '6';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputUser1SixthMessage);
    const inputUser1SeventhMessage = webhookEventPayload;
    inputUser1SeventhMessage.entry[0].changes[0].value.messages[0].text.body =
      '1';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputUser1SeventhMessage);
    const inputUser1EightMessage = webhookEventPayload;
    inputUser1EightMessage.entry[0].changes[0].value.messages[0].text.body =
      'Group Number 2';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputUser1EightMessage);
    const inputUser1NinethMessage = webhookEventPayload;
    inputUser1NinethMessage.entry[0].changes[0].value.messages[0].text.body =
      '5';
    const outputUser1NinethMessage = await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputUser1NinethMessage);
    const inputUser1TenthMessage = webhookEventPayload;
    inputUser1TenthMessage.entry[0].changes[0].value.messages[0].text.body =
      '1';
    const outputUser1TenthMessage = await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputUser1TenthMessage);
    const inputUser1EleventhMessage = webhookEventPayload;
    inputUser1EleventhMessage.entry[0].changes[0].value.messages[0].text.body =
      '28/01/2025';
    const outputUser1EleventhMessage = await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputUser1EleventhMessage);
    const inputUser1TwelvethMessage = webhookEventPayload;
    inputUser1TwelvethMessage.entry[0].changes[0].value.messages[0].text.body =
      'Test description';
    const outputUser1TwelvethMessage = await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputUser1TwelvethMessage);
    const inputUser1ThirteenthMessage = webhookEventPayload;
    inputUser1ThirteenthMessage.entry[0].changes[0].value.messages[0].text.body =
      '130,01';
    const outputUser1ThirteenthMessage = await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputUser1ThirteenthMessage);
    const inputUser1FourteenthMessage = webhookEventPayload;
    inputUser1FourteenthMessage.entry[0].changes[0].value.messages[0].text.body =
      '1, 2';
    const outputUser1FourteenthMessage = await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputUser1FourteenthMessage);

    expect(outputUser1NinethMessage.status).toBe(HttpStatusCodes.OK);
    expect(outputUser1NinethMessage.body).toBe(
      'Register group expense menu message sent',
    );
    expect(outputUser1TenthMessage.status).toBe(HttpStatusCodes.OK);
    expect(outputUser1TenthMessage.body).toBe(
      'Register group expense date message sent',
    );
    expect(outputUser1EleventhMessage.status).toBe(HttpStatusCodes.OK);
    expect(outputUser1EleventhMessage.body).toBe(
      'Register group expense description message sent',
    );
    expect(outputUser1TwelvethMessage.status).toBe(HttpStatusCodes.OK);
    expect(outputUser1TwelvethMessage.body).toBe(
      'Register group expense amount message sent',
    );
    expect(outputUser1ThirteenthMessage.status).toBe(HttpStatusCodes.OK);
    expect(outputUser1ThirteenthMessage.body).toBe(
      'Register group expense members message sent',
    );
    expect(outputUser1FourteenthMessage.status).toBe(HttpStatusCodes.OK);
    expect(outputUser1FourteenthMessage.body).toBe('Home message sent');
  });

  test('POST /test - should list group expenses', async () => {
    const inputUser1FirstMessage = webhookEventPayload;
    inputUser1FirstMessage.entry[0].changes[0].value.messages[0].text.body =
      'Oi';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputUser1FirstMessage);
    const inputUser2FirstMessage = webhookSecondUserEventPayload;
    inputUser2FirstMessage.entry[0].changes[0].value.messages[0].text.body =
      'Oi';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputUser2FirstMessage);
    const inputUser1SecondMessage = webhookEventPayload;
    inputUser1SecondMessage.entry[0].changes[0].value.messages[0].text.body =
      'Esteban Ramirez';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputUser1SecondMessage);
    const inputUser2SecondMessage = webhookSecondUserEventPayload;
    inputUser2SecondMessage.entry[0].changes[0].value.messages[0].text.body =
      'Nicolas';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputUser2SecondMessage);
    const inputUser2ThirdMessage = webhookSecondUserEventPayload;
    inputUser2ThirdMessage.entry[0].changes[0].value.messages[0].text.body =
      '6';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputUser2ThirdMessage);
    const inputUser2FourthMessage = webhookSecondUserEventPayload;
    inputUser2FourthMessage.entry[0].changes[0].value.messages[0].text.body =
      '1';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputUser2FourthMessage);
    const inputUser2FifthMessage = webhookSecondUserEventPayload;
    inputUser2FifthMessage.entry[0].changes[0].value.messages[0].text.body =
      'My group name';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputUser2FifthMessage);
    const createdGroup = (
      await accountService.getAccount(
        webhookSecondUserEventPayload.entry[0].changes[0].value.messages[0]
          .from,
      )
    )?.accountData.groups[0];
    const inputUser1ThirdMessage = webhookEventPayload;
    inputUser1ThirdMessage.entry[0].changes[0].value.messages[0].text.body =
      '6';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputUser1ThirdMessage);
    const inputUser1FourthMessage = webhookEventPayload;
    inputUser1FourthMessage.entry[0].changes[0].value.messages[0].text.body =
      '2';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputUser1FourthMessage);
    const inputUser1FifthMessage = webhookEventPayload;
    inputUser1FifthMessage.entry[0].changes[0].value.messages[0].text.body =
      String(createdGroup);
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputUser1FifthMessage);
    const inputUser1SixthMessage = webhookEventPayload;
    inputUser1SixthMessage.entry[0].changes[0].value.messages[0].text.body =
      '6';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputUser1SixthMessage);
    const inputUser1SeventhMessage = webhookEventPayload;
    inputUser1SeventhMessage.entry[0].changes[0].value.messages[0].text.body =
      '1';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputUser1SeventhMessage);
    const inputUser1EightMessage = webhookEventPayload;
    inputUser1EightMessage.entry[0].changes[0].value.messages[0].text.body =
      'Group Number 2';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputUser1EightMessage);
    const inputUser1NinethMessage = webhookEventPayload;
    inputUser1NinethMessage.entry[0].changes[0].value.messages[0].text.body =
      '5';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputUser1NinethMessage);
    const inputUser1TenthMessage = webhookEventPayload;
    inputUser1TenthMessage.entry[0].changes[0].value.messages[0].text.body =
      '1';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputUser1TenthMessage);
    const inputUser1EleventhMessage = webhookEventPayload;
    inputUser1EleventhMessage.entry[0].changes[0].value.messages[0].text.body =
      '28/01/2025';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputUser1EleventhMessage);
    const inputUser1TwelvethMessage = webhookEventPayload;
    inputUser1TwelvethMessage.entry[0].changes[0].value.messages[0].text.body =
      'Test description';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputUser1TwelvethMessage);
    const inputUser1ThirteenthMessage = webhookEventPayload;
    inputUser1ThirteenthMessage.entry[0].changes[0].value.messages[0].text.body =
      '130,01';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputUser1ThirteenthMessage);
    const inputUser1FourteenthMessage = webhookEventPayload;
    inputUser1FourteenthMessage.entry[0].changes[0].value.messages[0].text.body =
      '1, 2';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputUser1FourteenthMessage);
    const inputUser1FiveteenthMessage = webhookEventPayload;
    inputUser1FiveteenthMessage.entry[0].changes[0].value.messages[0].text.body =
      '5';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputUser1FiveteenthMessage);
    const inputUser1SixteenthMessage = webhookEventPayload;
    inputUser1SixteenthMessage.entry[0].changes[0].value.messages[0].text.body =
      '1';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputUser1SixteenthMessage);
    const inputUser1SeventeenthMessage = webhookEventPayload;
    inputUser1SeventeenthMessage.entry[0].changes[0].value.messages[0].text.body =
      '29/01/2025';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputUser1SeventeenthMessage);
    const inputUser1EighteenthMessage = webhookEventPayload;
    inputUser1EighteenthMessage.entry[0].changes[0].value.messages[0].text.body =
      'Test description 2';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputUser1EighteenthMessage);
    const inputUser1NineteenthMessage = webhookEventPayload;
    inputUser1NineteenthMessage.entry[0].changes[0].value.messages[0].text.body =
      '50,99';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputUser1NineteenthMessage);
    const inputUser1TweniethMessage = webhookEventPayload;
    inputUser1TweniethMessage.entry[0].changes[0].value.messages[0].text.body =
      '1';
    await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputUser1TweniethMessage);
    const inputUser1TwentyfirstMessage = webhookEventPayload;
    inputUser1TwentyfirstMessage.entry[0].changes[0].value.messages[0].text.body =
      '7';
    const outputUser1TwentyfirstMessage = await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputUser1TwentyfirstMessage);
    const inputUser1TwentysecondMessage = webhookEventPayload;
    inputUser1TwentysecondMessage.entry[0].changes[0].value.messages[0].text.body =
      '1';
    const outputUser1TwentysecondMessage = await request(httpClient.app)
      .post(`/${BaseRoute}/webhook/test`)
      .send(inputUser1TwentysecondMessage);

    expect(outputUser1TwentyfirstMessage.status).toBe(HttpStatusCodes.OK);
    expect(outputUser1TwentyfirstMessage.body).toBe(
      'List group expense menu message sent',
    );
    expect(outputUser1TwentysecondMessage.status).toBe(HttpStatusCodes.OK);
    expect(outputUser1TwentysecondMessage.body).toBe('Home message sent');
  });
});
