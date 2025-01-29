import loadEnvironment from './infra/env/environment';
loadEnvironment();

import serverless from 'serverless-http';
import { HttpServer } from './infra/http/HttpServer';
import DynamoDBTableGateway from './infra/database/DynamoDBTableGateway';
import AccountRepository from './application/repository/AccountRepository';
import AccountService from './service/AccountService';

const httpServer = new HttpServer();
if (process.env.NODE_ENV === 'local') httpServer.start(8000);

const ApiHandler = serverless(httpServer.app);

let dynamoDbTableGateway: DynamoDBTableGateway;
dynamoDbTableGateway = new DynamoDBTableGateway(
  String(process.env.ACCOUNT_TABLE),
);

let accountRepository: AccountRepository;
accountRepository = new AccountRepository(dynamoDbTableGateway);
let accountService: AccountService;
accountService = new AccountService(accountRepository);

export { ApiHandler, accountService };
