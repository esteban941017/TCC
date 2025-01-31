import AccountRepository from '../application/repository/AccountRepository';
import { getMessageVariables } from '../application/util/GetMessageVariables';
import { HttpStatusCodes } from '../application/util/HttpStatusCodes';
import { MessageLibrary } from '../application/util/MessageLibrary';
import adjustPhone from '../application/util/PhoneAdjuster';
import { validateAmount } from '../application/util/ValidateAmount';
import { validateDate } from '../application/util/ValidateDate';
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
      ['1', '2', '3', '4', '5', '6', '7', '8'].includes(message.messageBody)
    ) {
      //REGISTER EXPENSE
      if (message.messageBody === '1') {
        if (!account.accountData.categories.length) {
          await messageGateway.sendMessage(
            Text.create(phoneNumber, {
              body: MessageLibrary.noRegisteredCategories,
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
          returnMessage = 'No registered categories message sent';
        } else {
          account = await accountService.updateAccount(message.from, {
            currentPage: 'registerPersonalExpenseDate',
          });
          await messageGateway.sendMessage(
            Text.create(phoneNumber, {
              body: MessageLibrary.registerPersonalExpenseDate,
            }),
          );
          returnMessage = 'Register personal expense date message sent';
        }
      } else if (message.messageBody === '2') {
        if (!account.accountData.personalExpenses.length) {
          await messageGateway.sendMessage(
            Text.create(phoneNumber, {
              body: MessageLibrary.noRegisteredExpenses,
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
          returnMessage = 'No registered expenses message sent';
        } else {
          account = await accountService.updateAccount(message.from, {
            currentPage: 'listPersonalExpensesCategories',
          });
          const mappedCategories = account.accountData.categories.reduce(
            (acc, curr, index) => {
              return (acc += `${index + 1}. ${curr}\n`);
            },
            '',
          );
          await messageGateway.sendMessage(
            Text.create(phoneNumber, {
              body:
                MessageLibrary.listPersonalExpensesCategories +
                mappedCategories,
            }),
          );
          returnMessage = 'List personal expense select category message sent';
        }
      }

      //REGISTER CATEGORY
      else if (message.messageBody === '3') {
        account = await accountService.updateAccount(message.from, {
          currentPage: 'registerCategory',
        });
        await messageGateway.sendMessage(
          Text.create(phoneNumber, {
            body: MessageLibrary.registerCategory,
          }),
        );
        returnMessage = 'Register category message sent';
      }
      //LIST CATEGORIES
      else if (message.messageBody === '4') {
        account = await accountService.updateAccount(message.from, {
          currentPage: 'home',
        });
        const mappedCategories = account.accountData.categories.reduce(
          (acc, curr, index) => {
            return (acc += `${index + 1}. ${curr}\n`);
          },
          '',
        );
        await messageGateway.sendMessage(
          Text.create(phoneNumber, {
            body: MessageLibrary.listCategories + mappedCategories,
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
        returnMessage = 'List categories message sent';
      } else if (message.messageBody === '5') {
      } else if (message.messageBody === '6') {
      } else if (message.messageBody === '7') {
      }
    }

    //PERSONAL EXPENSE DATE REGISTRATION MENU
    else if (
      account.accountData.currentPage === 'registerPersonalExpenseDate'
    ) {
      const validDate = validateDate(message.messageBody);
      if (!validDate) {
        await messageGateway.sendMessage(
          Text.create(phoneNumber, {
            body: MessageLibrary.registerPersonalExpenseDate,
          }),
        );
      } else {
        account = await accountService.updateAccount(message.from, {
          temporaryPersonalExpense: {
            ...account.accountData.temporaryPersonalExpense,
            date: validDate,
          },
          currentPage: 'registerPersonalExpenseDescription',
        });
        await messageGateway.sendMessage(
          Text.create(phoneNumber, {
            body: MessageLibrary.registerPersonalExpenseDescription,
          }),
        );
        returnMessage = 'Register personal expense description message sent';
      }
    }

    //PERSONAL EXPENSE DESCRIPTION REGISTRATION MENU
    else if (
      account.accountData.currentPage === 'registerPersonalExpenseDescription'
    ) {
      account = await accountService.updateAccount(message.from, {
        temporaryPersonalExpense: {
          ...account.accountData.temporaryPersonalExpense,
          description: message.messageBody,
        },
        currentPage: 'registerPersonalExpenseAmount',
      });
      await messageGateway.sendMessage(
        Text.create(phoneNumber, {
          body: MessageLibrary.registerPersonalExpenseAmount,
        }),
      );
      returnMessage = 'Register personal expense amount message sent';
    }

    //PERSONAL EXPENSE AMOUNT MENU
    else if (
      account.accountData.currentPage === 'registerPersonalExpenseAmount'
    ) {
      const validAmount = validateAmount(message.messageBody);
      if (!validAmount) {
        await messageGateway.sendMessage(
          Text.create(phoneNumber, {
            body: MessageLibrary.registerPersonalExpenseAmount,
          }),
        );
      } else {
        account = await accountService.updateAccount(message.from, {
          temporaryPersonalExpense: {
            ...account.accountData.temporaryPersonalExpense,
            amount: validAmount,
          },
          currentPage: 'registerPersonalExpenseCategory',
        });
        const mappedCategories = account.accountData.categories.reduce(
          (acc, curr, index) => {
            return (acc += `${index + 1}. ${curr}\n`);
          },
          '',
        );
        await messageGateway.sendMessage(
          Text.create(phoneNumber, {
            body:
              MessageLibrary.registerPersonalExpenseCategory + mappedCategories,
          }),
        );
        returnMessage = 'Register personal expense category message sent';
      }
    }

    //PERSONAL EXPENSE CATEGORY MENU
    else if (
      account.accountData.currentPage === 'registerPersonalExpenseCategory'
    ) {
      const validCategories = account.accountData.categories
        .map((category, index) => String(index + 1))
        .includes(message.messageBody);
      if (!validCategories) {
        const mappedCategories = account.accountData.categories.reduce(
          (acc, curr, index) => {
            return (acc += `${index + 1}. ${curr}\n`);
          },
          '',
        );
        await messageGateway.sendMessage(
          Text.create(phoneNumber, {
            body:
              MessageLibrary.registerPersonalExpenseCategory + mappedCategories,
          }),
        );
      } else {
        account = await accountService.updateAccount(message.from, {
          temporaryPersonalExpense: {
            date: '',
            description: '',
            amount: '',
          },
          personalExpenses: [
            ...account.accountData.personalExpenses,
            {
              date: account.accountData.temporaryPersonalExpense.date,
              description:
                account.accountData.temporaryPersonalExpense.description,
              amount: account.accountData.temporaryPersonalExpense.amount,
              category:
                account.accountData.categories[Number(message.messageBody) - 1],
            },
          ],
          currentPage: 'home',
        });
        await messageGateway.sendMessage(
          Text.create(phoneNumber, {
            body: MessageLibrary.registeredPersonalExpense,
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
        returnMessage = 'Home message sent';
      }
    }

    //LIST PERSONAL EXPENSE CATEGORY MENU
    else if (
      account.accountData.currentPage === 'listPersonalExpensesCategories'
    ) {
      const validCategories = account.accountData.categories
        .map((category, index) => String(index + 1))
        .includes(message.messageBody);
      if (!validCategories) {
        const mappedCategories = account.accountData.categories.reduce(
          (acc, curr, index) => {
            return (acc += `${index + 1}. ${curr}\n`);
          },
          '',
        );
        await messageGateway.sendMessage(
          Text.create(phoneNumber, {
            body:
              MessageLibrary.listPersonalExpensesCategories + mappedCategories,
          }),
        );
      } else {
        account = await accountService.updateAccount(message.from, {
          currentPage: 'home',
        });
        const personalExpenses = account.accountData.personalExpenses
          .filter(expense => {
            const selectedCategory =
              account?.accountData.categories[Number(message.messageBody) - 1];
            return expense.category === selectedCategory;
          })
          .reduce((acc, expense) => {
            const description = `*Descrição:* ${expense.description}` + '\n';
            const date =
              `*Data:* ${new Date(expense.date).toLocaleDateString('pt-BR')}` +
              '\n';
            const amount = `*Valor:* R$ ${expense.amount}` + '\n\n';
            return (acc += description + date + amount);
          }, '');
        if (personalExpenses.length)
          await messageGateway.sendMessage(
            Text.create(phoneNumber, {
              body:
                MessageLibrary.listPersonalExpenses.replace(
                  '{{category}}',
                  `*${account.accountData.categories[Number(message.messageBody) - 1]}*`,
                ) + personalExpenses,
            }),
          );
        else
          await messageGateway.sendMessage(
            Text.create(phoneNumber, {
              body: MessageLibrary.listEmptyPersonalExpenses.replace(
                '{{category}}',
                `*${account.accountData.categories[Number(message.messageBody) - 1]}*`,
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
        returnMessage = 'Home message sent';
      }
    }

    //CATEGORY REGISTRATION MENU
    else if (account.accountData.currentPage === 'registerCategory') {
      account = await accountService.updateAccount(message.from, {
        currentPage: 'home',
        categories: [
          ...new Set([...account.accountData.categories, message.messageBody]),
        ],
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
