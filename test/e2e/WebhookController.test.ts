import { HttpStatusCodes } from '../../src/application/util/HttpStatusCodes';
import { BaseRoute, HttpServer } from '../../src/infra/http/HttpServer';
import request from 'supertest';

import loadEnvironment from '../../src/infra/env/environment';

describe('Webhook Controller', () => {
  let httpClient: HttpServer;

  beforeAll(() => {
    loadEnvironment();
    httpClient = new HttpServer();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('GET /webhook/verification - should verify webhook', async () => {
    const inputVerifyToken = {
      'hub.mode': 'subscribe',
      'hub.challenge': Math.round(Math.random() * 1000000),
      'hub.verify_token': process.env.META_VERIFICATION_TOKEN,
    };
    const outputVerifyToken = await request(httpClient.app).get(
      `/${BaseRoute}/webhook/verification?hub.mode=${inputVerifyToken['hub.mode']}&hub.challenge=${inputVerifyToken['hub.challenge']}&hub.verify_token=${inputVerifyToken['hub.verify_token']}`,
    );
    expect(outputVerifyToken.statusCode).toBe(HttpStatusCodes.OK);
    expect(outputVerifyToken.body).toBe(inputVerifyToken['hub.challenge']);
  });

  test('GET /webhook/verification - should not verify webhook if mode is not subscribe', async () => {
    const inputVerifyToken = {
      'hub.mode': '',
      'hub.challenge': Math.round(Math.random() * 1000000),
      'hub.verify_token': process.env.META_VERIFICATION_TOKEN,
    };
    const outputVerifyToken = await request(httpClient.app).get(
      `/${BaseRoute}/webhook/verification?hub.mode=${inputVerifyToken['hub.mode']}&hub.challenge=${inputVerifyToken['hub.challenge']}&hub.verify_token=${inputVerifyToken['hub.verify_token']}`,
    );
    expect(outputVerifyToken.statusCode).toBe(HttpStatusCodes.FORBIDDEN);
    expect(outputVerifyToken.body.message).toBe('Forbidden');
  });

  test('GET /webhook/verification - should not verify webhook if token does not match', async () => {
    const inputVerifyToken = {
      'hub.mode': 'subscribe',
      'hub.challenge': Math.round(Math.random() * 1000000),
      'hub.verify_token': '',
    };
    const outputVerifyToken = await request(httpClient.app).get(
      `/${BaseRoute}/webhook/verification?hub.mode=${inputVerifyToken['hub.mode']}&hub.challenge=${inputVerifyToken['hub.challenge']}&hub.verify_token=${inputVerifyToken['hub.verify_token']}`,
    );
    expect(outputVerifyToken.statusCode).toBe(HttpStatusCodes.FORBIDDEN);
    expect(outputVerifyToken.body.message).toBe('Forbidden');
  });

  test('should handle internal server error', async () => {
    // Simulate an error by mocking req.query to throw
    jest.spyOn(request(httpClient.app), 'get').mockImplementation(() => {
      throw new Error('Simulated error');
    });
    const inputVerifyToken = {
      'hub.mode': 'subscribe',
      'hub.challenge': Math.round(Math.random() * 1000000),
      'hub.verify_token': '',
    };
    const outputVerifyToken = await request(httpClient.app).get(
      `/${BaseRoute}/webhook/verification?hub.mode=${inputVerifyToken['hub.mode']}&hub.challenge=${inputVerifyToken['hub.challenge']}&hub.verify_token=${inputVerifyToken['hub.verify_token']}`,
    );
    console.log(outputVerifyToken.status);
    expect(outputVerifyToken.status).toBe(500);
    expect(outputVerifyToken.body.message).toBe('Internal Server Error');
  });

  // test('POST /account/manage/operators - should throw client not found', async () => {
  //   const inputCreateClient = ClientObjectMother.valid();
  //   const outputCreateClient = await clientService.create(inputCreateClient);
  //   const inputCreateAccess = AccountObjectMother.validAdmin(
  //     outputCreateClient.clientId,
  //   );
  //   await accountService.createOperator(inputCreateAccess);
  //   const inputLogin = {
  //     email: inputCreateAccess.email,
  //     password: MOCK_PASSWORD,
  //   };
  //   const outputLogin = await accountService.login(inputLogin);
  //   const clientId = 'not existent';
  //   const inputCreateAccount = AccountObjectMother.validAdmin(clientId);
  //   const outputCreateAccount = await request(httpClient.app)
  //     .post(`/${BaseRoute}/account/manage/operators`)
  //     .send(inputCreateAccount)
  //     .set({ authorization: `Bearer ${outputLogin.accessToken}` });
  //   expect(outputCreateAccount.statusCode).toBe(HttpStatusCodes.NOT_FOUND);
  //   expect(outputCreateAccount.body.error).toBe('CLIENT_NOT_FOUND');
  //   expect(outputCreateAccount.body.message).toBe(`Client not found`);
  // });
});
