import loadEnvironment from './infra/env/environment';
loadEnvironment();

import serverless from 'serverless-http';
import { HttpServer } from './infra/http/HttpServer';
import DynamoDBTableGateway from './infra/database/DynamoDBTableGateway';
import AccountRepository from './application/repository/AccountRepository';
import AccountService from './service/AccountService';
import GroupRepository from './application/repository/GroupRepository';
import GroupService from './service/GroupService';

const httpServer = new HttpServer();
if (process.env.NODE_ENV === 'local') httpServer.start(8000);

const ApiHandler = serverless(httpServer.app);

let accountDbTableGateway: DynamoDBTableGateway;
accountDbTableGateway = new DynamoDBTableGateway(
  String(process.env.ACCOUNT_TABLE),
);
let accountRepository: AccountRepository;
accountRepository = new AccountRepository(accountDbTableGateway);
let accountService: AccountService;
accountService = new AccountService(accountRepository);

let groupDbTableGateway: DynamoDBTableGateway;
groupDbTableGateway = new DynamoDBTableGateway(String(process.env.GROUP_TABLE));
let groupRepository: GroupRepository;
groupRepository = new GroupRepository(groupDbTableGateway);
let groupService: GroupService;
groupService = new GroupService(groupRepository);

export { ApiHandler, accountService, groupService };
