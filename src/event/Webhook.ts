import AccountRepository from '../application/repository/AccountRepository';
import GroupRepository from '../application/repository/GroupRepository';
import { getMessageVariables } from '../application/util/GetMessageVariables';
import { HttpStatusCodes } from '../application/util/HttpStatusCodes';
import { MessageLibrary } from '../application/util/MessageLibrary';
import adjustPhone from '../application/util/PhoneAdjuster';
import { validateAmount } from '../application/util/ValidateAmount';
import { validateDate } from '../application/util/ValidateDate';
import Template from '../domain/MessageTypes/Template';
import Text from '../domain/MessageTypes/Text';
import DynamoDBTableGateway from '../infra/database/DynamoDBTableGateway';
import MessageGateway from '../infra/gateway/MessageGateway';
import AccountService from '../service/AccountService';
import GroupService from '../service/GroupService';

let accountDbTableGateway: DynamoDBTableGateway;
let accountRepository: AccountRepository;
let accountService: AccountService;
let groupDbTableGateway: DynamoDBTableGateway;
let groupRepository: GroupRepository;
let groupService: GroupService;
let messageGateway: MessageGateway;

accountDbTableGateway = new DynamoDBTableGateway(
  String(process.env.ACCOUNT_TABLE),
);
accountRepository = new AccountRepository(accountDbTableGateway);
accountService = new AccountService(accountRepository);
groupDbTableGateway = new DynamoDBTableGateway(String(process.env.GROUP_TABLE));
groupRepository = new GroupRepository(groupDbTableGateway);
groupService = new GroupService(groupRepository);
messageGateway = new MessageGateway();

export const handler = async (event: any): Promise<any> => {
  try {
    const message =
      typeof event.Records[0].body === 'string'
        ? getMessageVariables(JSON.parse(event.Records[0].body))
        : getMessageVariables(event.Records[0].body);

    console.log(JSON.stringify(message));

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
      }

      //LIST EXPENSES
      else if (message.messageBody === '2') {
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
      }

      //REGISTER GROUP EXPENSE
      else if (message.messageBody === '5') {
        if (!account.accountData.groups.length) {
          await messageGateway.sendMessage(
            Text.create(phoneNumber, {
              body: MessageLibrary.noRegisteredGroups,
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
          returnMessage = 'No registered groups message sent';
        } else {
          account = await accountService.updateAccount(message.from, {
            currentPage: 'registerGroupExpenseMenu',
          });
          const groups = await Promise.all(
            await account.accountData.groups.map(async id => {
              return groupService.getGroup(id);
            }),
          );
          const mappedGroups = groups.reduce((acc, group, index) => {
            return (acc += `${index + 1}. ${group?.name}\n`);
          }, '');
          await messageGateway.sendMessage(
            Text.create(phoneNumber, {
              body: MessageLibrary.registerGroupExpenseMenu + mappedGroups,
            }),
          );
          returnMessage = 'Register group expense menu message sent';
        }
      }

      //REGISTER GROUP
      else if (message.messageBody === '6') {
        account = await accountService.updateAccount(message.from, {
          currentPage: 'registerGroup',
        });
        await messageGateway.sendMessage(
          Text.create(phoneNumber, {
            body: MessageLibrary.registerGroup,
          }),
        );
        returnMessage = 'Register group message sent';
      }

      //LIST GROUP EXPENSES
      else if (message.messageBody === '7') {
        if (!account.accountData.groups.length) {
          await messageGateway.sendMessage(
            Text.create(phoneNumber, {
              body: MessageLibrary.noRegisteredGroups,
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
          returnMessage = 'No registered groups message sent';
        } else {
          account = await accountService.updateAccount(message.from, {
            currentPage: 'listGroupExpenseMenu',
          });
          const groups = await Promise.all(
            account.accountData.groups.map(async groupId =>
              groupService.getGroup(groupId),
            ),
          );
          const mappedGroups = groups.reduce((acc, curr, index) => {
            return (acc += `${index + 1}. ${curr?.name}\n`);
          }, '');
          await messageGateway.sendMessage(
            Text.create(phoneNumber, {
              body: MessageLibrary.listGroupExpenseMenu + mappedGroups,
            }),
          );
          returnMessage = 'List group expense menu message sent';
        }
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
          .reduce((acc: any, expense) => {
            const description = `*Descrição:* ${expense.description}` + '\n';
            const date =
              `*Data:* ${new Date(expense.date).toLocaleDateString('pt-BR')}` +
              '\n';
            const amount =
              `*Valor:* R$ ${expense.amount.replace('.', ',')}` + '\n\n';
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

    //GROUP REGISTRATION MENU
    else if (account.accountData.currentPage === 'registerGroup') {
      if (message.messageBody !== '1' && message.messageBody !== '2') {
        await messageGateway.sendMessage(
          Text.create(phoneNumber, {
            body: MessageLibrary.registerGroup,
          }),
        );
      } else if (message.messageBody === '1') {
        account = await accountService.updateAccount(message.from, {
          currentPage: 'registerGroupName',
        });
        await messageGateway.sendMessage(
          Text.create(phoneNumber, {
            body: MessageLibrary.registerGroupName,
          }),
        );
        returnMessage = 'Register group name message sent';
      } else if (message.messageBody === '2') {
        account = await accountService.updateAccount(message.from, {
          currentPage: 'enterGroup',
        });
        await messageGateway.sendMessage(
          Text.create(phoneNumber, {
            body: MessageLibrary.enterGroup,
          }),
        );
        returnMessage = 'Enter group message sent';
      }
    }

    //GROUP NAME REGISTRATION
    else if (account.accountData.currentPage === 'registerGroupName') {
      const group = await groupService.createGroup(
        message.messageBody,
        account.phone,
      );
      account = await accountService.updateAccount(message.from, {
        currentPage: 'home',
        groups: [...new Set([...account.accountData.groups, group.id])],
      });
      await messageGateway.sendMessage(
        Text.create(phoneNumber, {
          body: MessageLibrary.registeredGroup.replace(
            '{{groupName}}',
            message.messageBody,
          ),
        }),
      );
      await messageGateway.sendMessage(
        Text.create(phoneNumber, {
          body: group.id,
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

    //ENTER GROUP
    else if (account.accountData.currentPage === 'enterGroup') {
      let group = await groupService.getGroup(message.messageBody);
      if (!group) {
        account = await accountService.updateAccount(message.from, {
          currentPage: 'home',
        });
        await messageGateway.sendMessage(
          Text.create(phoneNumber, {
            body: MessageLibrary.invalidGroupId,
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
        returnMessage = 'Invalid enter group message sent';
      } else {
        account = await accountService.updateAccount(message.from, {
          currentPage: 'home',
          groups: [
            ...new Set([...account.accountData.groups, message.messageBody]),
          ],
        });
        group = await groupService.updateGroup(group.id, {
          members: [...new Set([...group.members, account.phone])],
        });
        await messageGateway.sendMessage(
          Text.create(phoneNumber, {
            body: MessageLibrary.enteredGroup.replace(
              '{{groupName}}',
              group.name,
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

    //GROUP EXPENSE REGISTRATION MENU
    else if (account.accountData.currentPage === 'registerGroupExpenseMenu') {
      const groups = await Promise.all(
        await account.accountData.groups.map(async id => {
          return groupService.getGroup(id);
        }),
      );
      const filteredGroups = groups.filter((group, index) => {
        return String(index + 1) === message.messageBody;
      });
      if (!filteredGroups.length) {
        const mappedGroups = groups.reduce((acc, group, index) => {
          return (acc += `${index + 1}. ${group?.name}\n`);
        }, '');
        await messageGateway.sendMessage(
          Text.create(phoneNumber, {
            body: MessageLibrary.registerGroupExpenseMenu + mappedGroups,
          }),
        );
      } else {
        const selectedGroup = filteredGroups[0];
        account = await accountService.updateAccount(message.from, {
          currentPage: 'registerGroupExpenseDate',
          temporaryGroupExpense: {
            ...account.accountData.temporaryGroupExpense,
            groupId: selectedGroup?.id,
            createdBy: message.from,
          },
        });
        await messageGateway.sendMessage(
          Text.create(phoneNumber, {
            body: MessageLibrary.registerGroupExpenseDate,
          }),
        );
        returnMessage = 'Register group expense date message sent';
      }
    }

    //GROUP EXPENSE DATE REGISTRATION MENU
    else if (account.accountData.currentPage === 'registerGroupExpenseDate') {
      const validDate = validateDate(message.messageBody);
      if (!validDate) {
        await messageGateway.sendMessage(
          Text.create(phoneNumber, {
            body: MessageLibrary.registerGroupExpenseDate,
          }),
        );
      } else {
        account = await accountService.updateAccount(message.from, {
          temporaryGroupExpense: {
            ...account.accountData.temporaryGroupExpense,
            date: validDate,
          },
          currentPage: 'registerGroupExpenseDescription',
        });
        await messageGateway.sendMessage(
          Text.create(phoneNumber, {
            body: MessageLibrary.registerGroupExpenseDescription,
          }),
        );
        returnMessage = 'Register group expense description message sent';
      }
    }

    //GROUP EXPENSE DESCRIPTION REGISTRATION MENU
    else if (
      account.accountData.currentPage === 'registerGroupExpenseDescription'
    ) {
      account = await accountService.updateAccount(message.from, {
        temporaryGroupExpense: {
          ...account.accountData.temporaryGroupExpense,
          description: message.messageBody,
        },
        currentPage: 'registerGroupExpenseAmount',
      });
      await messageGateway.sendMessage(
        Text.create(phoneNumber, {
          body: MessageLibrary.registerGroupExpenseAmount,
        }),
      );
      returnMessage = 'Register group expense amount message sent';
    }

    //GROUP EXPENSE AMOUNT MENU
    else if (account.accountData.currentPage === 'registerGroupExpenseAmount') {
      const validAmount = validateAmount(message.messageBody);
      if (!validAmount) {
        await messageGateway.sendMessage(
          Text.create(phoneNumber, {
            body: MessageLibrary.registerGroupExpenseAmount,
          }),
        );
      } else {
        account = await accountService.updateAccount(message.from, {
          temporaryGroupExpense: {
            ...account.accountData.temporaryGroupExpense,
            amount: validAmount,
          },
          currentPage: 'registerGroupExpenseMembers',
        });
        const group = await groupService.getGroup(
          account.accountData.temporaryGroupExpense.groupId,
        );
        const groupMembers =
          group &&
          (await Promise.all(
            group?.members.map(async member =>
              accountService.getAccount(member),
            ),
          ));
        const mappedMembers = groupMembers?.reduce((acc, curr, index) => {
          return (acc += `${index + 1}. ${curr?.accountData.name}\n`);
        }, '');
        await messageGateway.sendMessage(
          Text.create(phoneNumber, {
            body: MessageLibrary.registerGroupExpenseMembers + mappedMembers,
          }),
        );
        returnMessage = 'Register group expense members message sent';
      }
    }

    //GROUP EXPENSE MEMBERS MENU
    else if (
      account.accountData.currentPage === 'registerGroupExpenseMembers'
    ) {
      const declaredMembers: string[] = message.messageBody
        .replace(/\D+/g, ',')
        .replace(/^,|,$/g, '')
        .split(',');
      let group = await groupService.getGroup(
        account.accountData.temporaryGroupExpense.groupId,
      );
      const groupMembers =
        group &&
        (await Promise.all(
          group?.members.map(async member => accountService.getAccount(member)),
        ));
      const groupMemberCheck = declaredMembers.every(member => {
        const mappedGroupMembers = groupMembers
          ?.map((m, i) => {
            return String(i + 1);
          })
          .includes(member);
        return mappedGroupMembers;
      });

      if (
        !group ||
        !groupMembers ||
        !declaredMembers.length ||
        declaredMembers.some(member => Number.isNaN(member)) ||
        !groupMemberCheck
      ) {
        const mappedMembers = groupMembers?.reduce((acc, curr, index) => {
          return (acc += `${index + 1}. ${curr?.accountData.name}\n`);
        }, '');
        await messageGateway.sendMessage(
          Text.create(phoneNumber, {
            body: MessageLibrary.registerGroupExpenseMembers + mappedMembers,
          }),
        );
      } else {
        group = await groupService.updateGroup(group.id, {
          expenses: [
            ...group.expenses,
            {
              ...account.accountData.temporaryGroupExpense,
              members: [
                ...groupMembers.filter((member: any, index) => {
                  return declaredMembers.includes(String(index + 1));
                }),
              ].map(member => member?.phone),
            },
          ],
        });
        const mappedDeclaredMembers = declaredMembers.map(declaredMember => {
          return groupMembers.filter(
            (member, index) => Number(declaredMember) === index + 1,
          )[0];
        });
        const membersToNotify = mappedDeclaredMembers.filter(
          member => member?.phone !== account?.phone,
        );
        await Promise.all(
          membersToNotify.map(async member => {
            if (member)
              await messageGateway.sendMessage(
                Template.create(adjustPhone(member.phone), {
                  name: 'registered_expense',
                  language: {
                    code: 'pt_BR',
                  },
                  components: [
                    {
                      type: 'body',
                      parameters: [
                        {
                          type: 'text',
                          text: account?.accountData.name,
                        },
                        {
                          type: 'text',
                          text: account?.accountData.temporaryGroupExpense
                            .description,
                        },
                        {
                          type: 'text',
                          text: group?.name,
                        },
                        {
                          type: 'text',
                          text: `R$ ${account?.accountData.temporaryGroupExpense.amount}`,
                        },
                      ],
                    },
                  ],
                }),
              );
          }),
        );
        account = await accountService.updateAccount(message.from, {
          temporaryGroupExpense: {
            amount: '',
            createdBy: '',
            date: '',
            description: '',
            groupId: '',
            members: [],
          },
          currentPage: 'home',
        });
        await messageGateway.sendMessage(
          Text.create(phoneNumber, {
            body: MessageLibrary.registeredGroupExpense,
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

    //LIST GROUP EXPENSE MENU
    else if (account.accountData.currentPage === 'listGroupExpenseMenu') {
      const validGroups = account.accountData.groups
        .map((group, index) => String(index + 1))
        .includes(message.messageBody);
      const groups = await Promise.all(
        account.accountData.groups.map(async groupId =>
          groupService.getGroup(groupId),
        ),
      );
      if (!validGroups) {
        const mappedGroups = groups.reduce((acc, curr, index) => {
          return (acc += `${index + 1}. ${curr?.name}\n`);
        }, '');
        await messageGateway.sendMessage(
          Text.create(phoneNumber, {
            body: MessageLibrary.listGroupExpenseMenu + mappedGroups,
          }),
        );
      } else {
        const selectedGroup = groups.filter(
          (group, index) => String(index + 1) === message.messageBody,
        )[0];
        account = await accountService.updateAccount(message.from, {
          currentPage: 'home',
        });
        if (!selectedGroup?.expenses.length) {
          await messageGateway.sendMessage(
            Text.create(phoneNumber, {
              body: MessageLibrary.noRegisteredGroupExpenses,
            }),
          );
        } else {
          const mappedExpenses = await Promise.all(
            selectedGroup.expenses.map(async expense => {
              const description = `*Descrição*: ${expense.description}\n`;
              const date = `*Data:* ${new Date(expense.date).toLocaleDateString('pt-BR')}\n`;
              const value = `*Valor:* R$ ${expense.amount.replace('.', ',')}\n`;
              const involvedAccounts = await Promise.all(
                expense.members.map(async member =>
                  accountService.getAccount(member),
                ),
              );
              const members = `*Envolvidos*: \n${involvedAccounts
                .map(account => `- ${account?.accountData.name}`)
                .join('\n')}\n`;

              return description + date + value + members + '\n';
            }),
          );
          const finalResult = mappedExpenses.join('');
          await messageGateway.sendMessage(
            Text.create(phoneNumber, {
              body:
                MessageLibrary.listGroupExpenses.replace(
                  '{{group}}',
                  selectedGroup.name,
                ) + finalResult,
            }),
          );
        }
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

export const handlerMock = async (event: any): Promise<any> => {
  try {
    const message =
      typeof event.Records[0].body === 'string'
        ? getMessageVariables(JSON.parse(event.Records[0].body))
        : getMessageVariables(event.Records[0].body);

    console.log(JSON.stringify(message));

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
      returnMessage = 'Home message sent';
    }

    //HOME MENU
    else if (
      account.accountData.currentPage === 'home' &&
      ['1', '2', '3', '4', '5', '6', '7'].includes(message.messageBody)
    ) {
      //REGISTER EXPENSE
      if (message.messageBody === '1') {
        if (!account.accountData.categories.length) {
          const firstName = account.accountData.name.split(' ')[0];
          const name =
            firstName.toLowerCase().charAt(0).toUpperCase() +
            firstName.toLowerCase().slice(1);
          returnMessage = 'No registered categories message sent';
        } else {
          account = await accountService.updateAccount(message.from, {
            currentPage: 'registerPersonalExpenseDate',
          });
          returnMessage = 'Register personal expense date message sent';
        }
      }

      //LIST EXPENSES
      else if (message.messageBody === '2') {
        if (!account.accountData.personalExpenses.length) {
          const firstName = account.accountData.name.split(' ')[0];
          const name =
            firstName.toLowerCase().charAt(0).toUpperCase() +
            firstName.toLowerCase().slice(1);
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
          returnMessage = 'List personal expense select category message sent';
        }
      }

      //REGISTER CATEGORY
      else if (message.messageBody === '3') {
        account = await accountService.updateAccount(message.from, {
          currentPage: 'registerCategory',
        });
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
        const firstName = account.accountData.name.split(' ')[0];
        const name =
          firstName.toLowerCase().charAt(0).toUpperCase() +
          firstName.toLowerCase().slice(1);
        returnMessage = 'List categories message sent';
      }

      //REGISTER GROUP EXPENSE
      else if (message.messageBody === '5') {
        if (!account.accountData.groups.length) {
          const firstName = account.accountData.name.split(' ')[0];
          const name =
            firstName.toLowerCase().charAt(0).toUpperCase() +
            firstName.toLowerCase().slice(1);
          returnMessage = 'No registered groups message sent';
        } else {
          account = await accountService.updateAccount(message.from, {
            currentPage: 'registerGroupExpenseMenu',
          });
          const groups = await Promise.all(
            await account.accountData.groups.map(async id => {
              return groupService.getGroup(id);
            }),
          );
          const mappedGroups = groups.reduce((acc, group, index) => {
            return (acc += `${index + 1}. ${group?.name}\n`);
          }, '');
          returnMessage = 'Register group expense menu message sent';
        }
      }

      //REGISTER GROUP
      else if (message.messageBody === '6') {
        account = await accountService.updateAccount(message.from, {
          currentPage: 'registerGroup',
        });
        returnMessage = 'Register group message sent';
      }

      //LIST GROUP EXPENSES
      else if (message.messageBody === '7') {
        if (!account.accountData.groups.length) {
          const firstName = account.accountData.name.split(' ')[0];
          const name =
            firstName.toLowerCase().charAt(0).toUpperCase() +
            firstName.toLowerCase().slice(1);
          returnMessage = 'No registered groups message sent';
        } else {
          account = await accountService.updateAccount(message.from, {
            currentPage: 'listGroupExpenseMenu',
          });
          const groups = await Promise.all(
            account.accountData.groups.map(async groupId =>
              groupService.getGroup(groupId),
            ),
          );
          const mappedGroups = groups.reduce((acc, curr, index) => {
            return (acc += `${index + 1}. ${curr?.name}\n`);
          }, '');
          returnMessage = 'List group expense menu message sent';
        }
      }
    }

    //PERSONAL EXPENSE DATE REGISTRATION MENU
    else if (
      account.accountData.currentPage === 'registerPersonalExpenseDate'
    ) {
      const validDate = validateDate(message.messageBody);
      if (!validDate) {
      } else {
        account = await accountService.updateAccount(message.from, {
          temporaryPersonalExpense: {
            ...account.accountData.temporaryPersonalExpense,
            date: validDate,
          },
          currentPage: 'registerPersonalExpenseDescription',
        });
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
      returnMessage = 'Register personal expense amount message sent';
    }

    //PERSONAL EXPENSE AMOUNT MENU
    else if (
      account.accountData.currentPage === 'registerPersonalExpenseAmount'
    ) {
      const validAmount = validateAmount(message.messageBody);
      if (!validAmount) {
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
        const firstName = account.accountData.name.split(' ')[0];
        const name =
          firstName.toLowerCase().charAt(0).toUpperCase() +
          firstName.toLowerCase().slice(1);
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
          .reduce((acc: any, expense) => {
            const description = `*Descrição:* ${expense.description}` + '\n';
            const date =
              `*Data:* ${new Date(expense.date).toLocaleDateString('pt-BR')}` +
              '\n';
            const amount =
              `*Valor:* R$ ${expense.amount.replace('.', ',')}` + '\n\n';
            return (acc += description + date + amount);
          }, '');
        if (personalExpenses.length) {
        } else {
        }
        const firstName = account.accountData.name.split(' ')[0];
        const name =
          firstName.toLowerCase().charAt(0).toUpperCase() +
          firstName.toLowerCase().slice(1);
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
      const firstName = account.accountData.name.split(' ')[0];
      const name =
        firstName.toLowerCase().charAt(0).toUpperCase() +
        firstName.toLowerCase().slice(1);
      returnMessage = 'Registered category message sent';
    }

    //GROUP REGISTRATION MENU
    else if (account.accountData.currentPage === 'registerGroup') {
      if (message.messageBody !== '1' && message.messageBody !== '2') {
      } else if (message.messageBody === '1') {
        account = await accountService.updateAccount(message.from, {
          currentPage: 'registerGroupName',
        });
        returnMessage = 'Register group name message sent';
      } else if (message.messageBody === '2') {
        account = await accountService.updateAccount(message.from, {
          currentPage: 'enterGroup',
        });
        returnMessage = 'Enter group message sent';
      }
    }

    //GROUP NAME REGISTRATION
    else if (account.accountData.currentPage === 'registerGroupName') {
      const group = await groupService.createGroup(
        message.messageBody,
        account.phone,
      );
      account = await accountService.updateAccount(message.from, {
        currentPage: 'home',
        groups: [...new Set([...account.accountData.groups, group.id])],
      });
      const firstName = account.accountData.name.split(' ')[0];
      const name =
        firstName.toLowerCase().charAt(0).toUpperCase() +
        firstName.toLowerCase().slice(1);
      returnMessage = 'Home message sent';
    }

    //ENTER GROUP
    else if (account.accountData.currentPage === 'enterGroup') {
      let group = await groupService.getGroup(message.messageBody);
      if (!group) {
        account = await accountService.updateAccount(message.from, {
          currentPage: 'home',
        });
        const firstName = account.accountData.name.split(' ')[0];
        const name =
          firstName.toLowerCase().charAt(0).toUpperCase() +
          firstName.toLowerCase().slice(1);
        returnMessage = 'Invalid enter group message sent';
      } else {
        account = await accountService.updateAccount(message.from, {
          currentPage: 'home',
          groups: [
            ...new Set([...account.accountData.groups, message.messageBody]),
          ],
        });
        group = await groupService.updateGroup(group.id, {
          members: [...new Set([...group.members, account.phone])],
        });
        const firstName = account.accountData.name.split(' ')[0];
        const name =
          firstName.toLowerCase().charAt(0).toUpperCase() +
          firstName.toLowerCase().slice(1);
        returnMessage = 'Home message sent';
      }
    }

    //GROUP EXPENSE REGISTRATION MENU
    else if (account.accountData.currentPage === 'registerGroupExpenseMenu') {
      const groups = await Promise.all(
        await account.accountData.groups.map(async id => {
          return groupService.getGroup(id);
        }),
      );
      const filteredGroups = groups.filter((group, index) => {
        return String(index + 1) === message.messageBody;
      });
      if (!filteredGroups.length) {
        const mappedGroups = groups.reduce((acc, group, index) => {
          return (acc += `${index + 1}. ${group?.name}\n`);
        }, '');
      } else {
        const selectedGroup = filteredGroups[0];
        account = await accountService.updateAccount(message.from, {
          currentPage: 'registerGroupExpenseDate',
          temporaryGroupExpense: {
            ...account.accountData.temporaryGroupExpense,
            groupId: selectedGroup?.id,
            createdBy: message.from,
          },
        });
        returnMessage = 'Register group expense date message sent';
      }
    }

    //GROUP EXPENSE DATE REGISTRATION MENU
    else if (account.accountData.currentPage === 'registerGroupExpenseDate') {
      const validDate = validateDate(message.messageBody);
      if (!validDate) {
      } else {
        account = await accountService.updateAccount(message.from, {
          temporaryGroupExpense: {
            ...account.accountData.temporaryGroupExpense,
            date: validDate,
          },
          currentPage: 'registerGroupExpenseDescription',
        });
        returnMessage = 'Register group expense description message sent';
      }
    }

    //GROUP EXPENSE DESCRIPTION REGISTRATION MENU
    else if (
      account.accountData.currentPage === 'registerGroupExpenseDescription'
    ) {
      account = await accountService.updateAccount(message.from, {
        temporaryGroupExpense: {
          ...account.accountData.temporaryGroupExpense,
          description: message.messageBody,
        },
        currentPage: 'registerGroupExpenseAmount',
      });
      returnMessage = 'Register group expense amount message sent';
    }

    //GROUP EXPENSE AMOUNT MENU
    else if (account.accountData.currentPage === 'registerGroupExpenseAmount') {
      const validAmount = validateAmount(message.messageBody);
      if (!validAmount) {
      } else {
        account = await accountService.updateAccount(message.from, {
          temporaryGroupExpense: {
            ...account.accountData.temporaryGroupExpense,
            amount: validAmount,
          },
          currentPage: 'registerGroupExpenseMembers',
        });
        const group = await groupService.getGroup(
          account.accountData.temporaryGroupExpense.groupId,
        );
        const groupMembers =
          group &&
          (await Promise.all(
            group?.members.map(async member =>
              accountService.getAccount(member),
            ),
          ));
        const mappedMembers = groupMembers?.reduce((acc, curr, index) => {
          return (acc += `${index + 1}. ${curr?.accountData.name}\n`);
        }, '');
        returnMessage = 'Register group expense members message sent';
      }
    }

    //GROUP EXPENSE MEMBERS MENU
    else if (
      account.accountData.currentPage === 'registerGroupExpenseMembers'
    ) {
      const declaredMembers: string[] = message.messageBody
        .replace(/\D+/g, ',')
        .replace(/^,|,$/g, '')
        .split(',');
      let group = await groupService.getGroup(
        account.accountData.temporaryGroupExpense.groupId,
      );
      const groupMembers =
        group &&
        (await Promise.all(
          group?.members.map(async member => accountService.getAccount(member)),
        ));
      const groupMemberCheck = declaredMembers.every(member => {
        const mappedGroupMembers = groupMembers
          ?.map((m, i) => {
            return String(i + 1);
          })
          .includes(member);
        return mappedGroupMembers;
      });

      if (
        !group ||
        !groupMembers ||
        !declaredMembers.length ||
        declaredMembers.some(member => Number.isNaN(member)) ||
        !groupMemberCheck
      ) {
        const mappedMembers = groupMembers?.reduce((acc, curr, index) => {
          return (acc += `${index + 1}. ${curr?.accountData.name}\n`);
        }, '');
      } else {
        group = await groupService.updateGroup(group.id, {
          expenses: [
            ...group.expenses,
            {
              ...account.accountData.temporaryGroupExpense,
              members: [
                ...groupMembers.filter((member: any, index) => {
                  return declaredMembers.includes(String(index + 1));
                }),
              ].map(member => member?.phone),
            },
          ],
        });
        const mappedDeclaredMembers = declaredMembers.map(declaredMember => {
          return groupMembers.filter(
            (member, index) => Number(declaredMember) === index + 1,
          )[0];
        });
        const membersToNotify = mappedDeclaredMembers.filter(
          member => member?.phone !== account?.phone,
        );
        await Promise.all(
          membersToNotify.map(async member => {
            if (member) {
            }
          }),
        );
        account = await accountService.updateAccount(message.from, {
          temporaryGroupExpense: {
            amount: '',
            createdBy: '',
            date: '',
            description: '',
            groupId: '',
            members: [],
          },
          currentPage: 'home',
        });
        const firstName = account.accountData.name.split(' ')[0];
        const name =
          firstName.toLowerCase().charAt(0).toUpperCase() +
          firstName.toLowerCase().slice(1);
        returnMessage = 'Home message sent';
      }
    }

    //LIST GROUP EXPENSE MENU
    else if (account.accountData.currentPage === 'listGroupExpenseMenu') {
      const validGroups = account.accountData.groups
        .map((group, index) => String(index + 1))
        .includes(message.messageBody);
      const groups = await Promise.all(
        account.accountData.groups.map(async groupId =>
          groupService.getGroup(groupId),
        ),
      );
      if (!validGroups) {
        const mappedGroups = groups.reduce((acc, curr, index) => {
          return (acc += `${index + 1}. ${curr?.name}\n`);
        }, '');
      } else {
        const selectedGroup = groups.filter(
          (group, index) => String(index + 1) === message.messageBody,
        )[0];
        account = await accountService.updateAccount(message.from, {
          currentPage: 'home',
        });
        if (!selectedGroup?.expenses.length) {
        } else {
          const mappedExpenses = await Promise.all(
            selectedGroup.expenses.map(async expense => {
              const description = `*Descrição*: ${expense.description}\n`;
              const date = `*Data:* ${new Date(expense.date).toLocaleDateString('pt-BR')}\n`;
              const value = `*Valor:* R$ ${expense.amount.replace('.', ',')}\n`;
              const involvedAccounts = await Promise.all(
                expense.members.map(async member =>
                  accountService.getAccount(member),
                ),
              );
              const members = `*Envolvidos*: \n${involvedAccounts
                .map(account => `- ${account?.accountData.name}`)
                .join('\n')}\n`;

              return description + date + value + members + '\n';
            }),
          );
          const finalResult = mappedExpenses.join('');
        }
        const firstName = account.accountData.name.split(' ')[0];
        const name =
          firstName.toLowerCase().charAt(0).toUpperCase() +
          firstName.toLowerCase().slice(1);
        returnMessage = 'Home message sent';
      }
    }

    //INVALID MESSAGE
    else {
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
