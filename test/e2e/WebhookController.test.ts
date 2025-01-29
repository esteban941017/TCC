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

  test('GET /webhook - should verify webhook', async () => {
    const inputVerifyToken = {
      'hub.mode': 'subscribe',
      'hub.challenge': Math.round(Math.random() * 1000000),
      'hub.verify_token': process.env.META_VERIFICATION_TOKEN,
    };
    const outputVerifyToken = await request(httpClient.app).get(
      `/${BaseRoute}/webhook?hub.mode=${inputVerifyToken['hub.mode']}&hub.challenge=${inputVerifyToken['hub.challenge']}&hub.verify_token=${inputVerifyToken['hub.verify_token']}`,
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
      `/${BaseRoute}/webhook?hub.mode=${inputVerifyToken['hub.mode']}&hub.challenge=${inputVerifyToken['hub.challenge']}&hub.verify_token=${inputVerifyToken['hub.verify_token']}`,
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
      `/${BaseRoute}/webhook?hub.mode=${inputVerifyToken['hub.mode']}&hub.challenge=${inputVerifyToken['hub.challenge']}&hub.verify_token=${inputVerifyToken['hub.verify_token']}`,
    );
    expect(outputVerifyToken.statusCode).toBe(HttpStatusCodes.FORBIDDEN);
    expect(outputVerifyToken.body.message).toBe('Forbidden');
  });
});
