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

    //ACCOUNT CREATION
    if (!account) {
      account = await accountService.createAccount(message.from);
      await messageGateway.sendMessage(
        Text.create(phoneNumber, { body: MessageLibrary.name }),
      );
      returnMessage = 'Name message sent';
    } else if (account.accountData.currentPage === 'name') {
      const firstName = message.messageBody.split(' ')[0];
      const name =
        firstName.toLowerCase().charAt(0).toUpperCase() +
        firstName.toLowerCase().slice(1);
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

    //HOME MENU
    else if (
      account.accountData.currentPage === 'home' &&
      ['1', '2', '3', '4', '5', '6', '7'].includes(message.messageBody)
    ) {
      if (message.messageBody === '1') {
      } else if (message.messageBody === '2') {
      } else if (message.messageBody === '3') {
        account = await accountService.updateAccount(message.from, {
          currentPage: 'registerCategory',
        });
        await messageGateway.sendMessage(
          Text.create(phoneNumber, {
            body: MessageLibrary.registerCategory,
          }),
        );
        returnMessage = 'Register category message sent';
      } else if (message.messageBody === '4') {
      } else if (message.messageBody === '5') {
      } else if (message.messageBody === '6') {
      } else if (message.messageBody === '7') {
      }
    }

    //CATEGORY REGISTRATION MENU
    else if (account.accountData.currentPage === 'registerCategory') {
      account = await accountService.updateAccount(message.from, {
        currentPage: 'home',
        categories: account.accountData.categories.push(message.messageBody),
      });
      await messageGateway.sendMessage(
        Text.create(phoneNumber, {
          body: MessageLibrary.registeredCategory.replace(
            '{{categoryName}}',
            message.messageBody,
          ),
        }),
      );
      const firstName = account.accountData.name.split(' ')[0];
      const name =
        firstName.toLowerCase().charAt(0).toUpperCase() +
        firstName.toLowerCase().slice(1);
      await messageGateway.sendMessage(
        Text.create(phoneNumber, {
          body: MessageLibrary.home.replace('{{name}}', name),
        }),
      );
      returnMessage = 'Registered category message sent';
    }

    //INVALID MESSAGE
    else {
      await messageGateway.sendMessage(
        Text.create(phoneNumber, {
          body: MessageLibrary.invalid,
        }),
      );
      returnMessage = 'Invalid message sent';
    }
    return {
      statusCode: HttpStatusCodes.OK,
      body: returnMessage,
    };
  } catch (error) {
    console.error(error);
  }
};
