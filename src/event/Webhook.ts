import AccountRepository from '../application/repository/AccountRepository';
import { getMessageVariables } from '../application/util/GetMessageVariables';
import { HttpStatusCodes } from '../application/util/HttpStatusCodes';
import { MessageLibrary } from '../application/util/MessageLibrary';
import adjustPhone from '../application/util/PhoneAdjuster';
import Text from '../domain/MessageTypes/Text';
import DynamoDBTableGateway from '../infra/database/DynamoDBTableGateway';
import MessageGateway from '../infra/gateway/MessageGateway';
import AccountService from '../service/AccountService';

let dynamoDbTableGateway: DynamoDBTableGateway;
let accountRepository: AccountRepository;
let accountService: AccountService;
let messageGateway: MessageGateway;

dynamoDbTableGateway = new DynamoDBTableGateway(
  String(process.env.ACCOUNT_TABLE),
);
accountRepository = new AccountRepository(dynamoDbTableGateway);
accountService = new AccountService(accountRepository);
messageGateway = new MessageGateway();

export const handler = async (event: any): Promise<any> => {
  try {
    const message =
      typeof event.body === 'string'
        ? getMessageVariables(JSON.parse(event.body))
        : getMessageVariables(event.body);
    let returnMessage = '';
    if (!message)
      return {
        statusCode: HttpStatusCodes.OK,
        message: 'Message sent',
      };
    let account = await accountService.getAccount(message.from);
    const phoneNumber = adjustPhone(message.from);
    if (!account) {
      account = await accountService.createAccount(message.from);
      await messageGateway.sendMessage(
        Text.create(phoneNumber, { body: MessageLibrary.name }),
      );

      returnMessage = 'Name message sent';
    } else if (account.accountData.currentPage === 'name') {
      const firstName = message.messageBody.split(' ')[0];
      const name = firstName.charAt(0).toUpperCase() + firstName.slice(1);
      account = await accountService.updateAccount(message.from, {
        name: message.messageBody,
        currentPage: 'home',
      });
      await messageGateway.sendMessage(
        Text.create(phoneNumber, {
          body: MessageLibrary.home.replace('{{name}}', name),
        }),
      );
      returnMessage = 'Home message sent';
    }
    return {
      statusCode: HttpStatusCodes.OK,
      body: returnMessage,
    };
  } catch (error) {
    console.error(error);
  }
};
