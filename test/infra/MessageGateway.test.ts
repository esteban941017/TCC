import { HttpStatusCodes } from '../../src/application/util/HttpStatusCodes';
import Audio from '../../src/domain/MessageTypes/Audio';
import MessageGateway from '../../src/infra/gateway/MessageGateway';

describe('Message gateway test', () => {
  let messageGateway: MessageGateway;

  beforeAll(() => {
    messageGateway = new MessageGateway();
  });

  test('Should send a message', async () => {
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
});
