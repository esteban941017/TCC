import { HttpStatusCodes } from '../../src/application/util/HttpStatusCodes';
import Audio from '../../src/domain/MessageTypes/Audio';
import Template from '../../src/domain/MessageTypes/Template';
import Text from '../../src/domain/MessageTypes/Text';
import MessageGateway from '../../src/infra/gateway/MessageGateway';

describe('Message gateway test', () => {
  let messageGateway: MessageGateway;

  beforeAll(() => {
    messageGateway = new MessageGateway();
  });

  test('Should send a text message', async () => {
    const inputCreateMessage = {
      body: 'Text test message',
    };
    const outputCreateMessage = Text.create(
      '5531990723700',
      inputCreateMessage,
    );
    console.dir(outputCreateMessage, { depth: null });
    const outputSendMessage =
      await messageGateway.sendMessage(outputCreateMessage);
    expect(outputSendMessage?.status).toBe(HttpStatusCodes.OK);
    expect(outputSendMessage?.data.messaging_product).toBe('whatsapp');
    expect(outputSendMessage?.data.contacts[0].input).toBe(
      outputCreateMessage.to,
    );
    expect(outputSendMessage?.data.messages[0].id).toBeDefined();
  });

  test('Should send an audio message', async () => {
    const inputCreateMessage = {
      link: 'https://download.samplelib.com/mp3/sample-3s.mp3',
    };
    const outputCreateMessage = Audio.create(
      '5531990723700',
      inputCreateMessage,
    );
    const outputSendMessage =
      await messageGateway.sendMessage(outputCreateMessage);
    expect(outputSendMessage?.status).toBe(HttpStatusCodes.OK);
    expect(outputSendMessage?.data.messaging_product).toBe('whatsapp');
    expect(outputSendMessage?.data.contacts[0].input).toBe(
      outputCreateMessage.to,
    );
    expect(outputSendMessage?.data.messages[0].id).toBeDefined();
  });

  test('Should send a template message', async () => {
    const inputCreateMessage = {
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
              text: 'Esteban',
            },
            {
              type: 'text',
              text: 'Cerveja',
            },
            {
              type: 'text',
              text: 'Viajem',
            },
            {
              type: 'text',
              text: 'R$ 350.00',
            },
          ],
        },
      ],
    };

    const outputCreateMessage = Template.create(
      '5531990723700',
      inputCreateMessage,
    );
    const outputSendMessage =
      await messageGateway.sendMessage(outputCreateMessage);
    expect(outputSendMessage?.status).toBe(HttpStatusCodes.OK);
    expect(outputSendMessage?.data.messaging_product).toBe('whatsapp');
    expect(outputSendMessage?.data.contacts[0].input).toBe(
      outputCreateMessage.to,
    );
    expect(outputSendMessage?.data.messages[0].id).toBeDefined();
  });
});
