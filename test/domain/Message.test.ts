import Message, { MessageTypes } from '../../src/domain/Message';
import Audio, { AudioContent } from '../../src/domain/MessageTypes/Audio';
import Contacts, {
  ContactContent,
} from '../../src/domain/MessageTypes/Contacts';
import Document, {
  DocumentContent,
} from '../../src/domain/MessageTypes/Document';
import Image, { ImageContent } from '../../src/domain/MessageTypes/Image';
import InteractiveCallToAction, {
  InteractiveCallToActionContent,
} from '../../src/domain/MessageTypes/InteractiveCallToAction';

describe('Message domain test', () => {
  test('Should create an audio message', () => {
    const inputCreateMessage: { to: string; content: AudioContent } = {
      to: '5531990723700',
      content: { id: 'https://teste.com' },
    };
    const outputCreateMessage = Audio.create(
      inputCreateMessage.to,
      inputCreateMessage.content,
    );
    expect(outputCreateMessage.messaging_product).toBe('whatsapp');
    expect(outputCreateMessage.recipient_type).toBe('individual');
    expect(outputCreateMessage.to).toBe(`+${inputCreateMessage.to}`);
    expect(outputCreateMessage.type).toBe(MessageTypes.AUDIO);
    expect(outputCreateMessage.audio).toEqual(inputCreateMessage.content);
  });

  test('Should create a contact message', () => {
    const inputCreateMessage: { to: string; content: ContactContent } = {
      to: '5531990723700',
      content: [
        {
          name: {
            formatted_name: 'Formatted name',
            first_name: 'FirstName',
            last_name: 'LastName',
            middle_name: 'MiddleName',
            suffix: 'Jr.',
            prefix: 'Mr.',
          },
          addresses: [
            {
              street: 'Address 123',
              city: 'City',
              state: 'State',
              zip: '123456',
              country: 'Brazil',
              country_code: 'BR',
              type: 'Home',
            },
          ],
          birthday: '1999-01-23',
          emails: [
            {
              email: 'testemail@test.com',
              type: 'Work',
            },
          ],
          org: {
            company: 'Company name',
            department: 'Finance',
            title: 'Analyst',
          },
          phones: [
            {
              phone: '5531990723700',
              type: 'Personal',
              wa_id: '19175559999',
            },
          ],
          urls: [
            {
              url: 'https://url.com',
              type: 'Work',
            },
          ],
        },
      ],
    };
    const outputCreateMessage = Contacts.create(
      inputCreateMessage.to,
      inputCreateMessage.content,
    );
    expect(outputCreateMessage.messaging_product).toBe('whatsapp');
    expect(outputCreateMessage.recipient_type).toBe('individual');
    expect(outputCreateMessage.to).toBe(`+${inputCreateMessage.to}`);
    expect(outputCreateMessage.type).toBe(MessageTypes.CONTACTS);
    expect(outputCreateMessage.contacts).toEqual(inputCreateMessage.content);
  });

  test('Should create a document message', () => {
    const inputCreateMessage: { to: string; content: DocumentContent } = {
      to: '5531990723700',
      content: {
        link: 'https://teste.com',
        caption: 'Here is the requested document',
        filename: 'filename.txt',
      },
    };
    const outputCreateMessage = Document.create(
      inputCreateMessage.to,
      inputCreateMessage.content,
    );
    expect(outputCreateMessage.messaging_product).toBe('whatsapp');
    expect(outputCreateMessage.recipient_type).toBe('individual');
    expect(outputCreateMessage.to).toBe(`+${inputCreateMessage.to}`);
    expect(outputCreateMessage.type).toBe(MessageTypes.DOCUMENT);
    expect(outputCreateMessage.document).toEqual(inputCreateMessage.content);
  });

  test('Should create an image message', () => {
    const inputCreateMessage: { to: string; content: ImageContent } = {
      to: '5531990723700',
      content: {
        link: 'https://teste.com',
        caption: 'Here is the image',
      },
    };
    const outputCreateMessage = Image.create(
      inputCreateMessage.to,
      inputCreateMessage.content,
    );
    expect(outputCreateMessage.messaging_product).toBe('whatsapp');
    expect(outputCreateMessage.recipient_type).toBe('individual');
    expect(outputCreateMessage.to).toBe(`+${inputCreateMessage.to}`);
    expect(outputCreateMessage.type).toBe(MessageTypes.IMAGE);
    expect(outputCreateMessage.image).toEqual(inputCreateMessage.content);
  });

  test('Should create an interactive call to action message', () => {
    const inputCreateMessage: {
      to: string;
      content: InteractiveCallToActionContent;
    } = {
      to: '5531990723700',
      content: {
        type: 'cta_url',
        body: { text: 'Body text' },
        action: {
          name: 'cta_url',
          parameters: {
            display_text: 'Click the link',
            url: 'https://test.com',
          },
        },
      },
    };
    const outputCreateMessage = InteractiveCallToAction.create(
      inputCreateMessage.to,
      inputCreateMessage.content,
    );
    expect(outputCreateMessage.messaging_product).toBe('whatsapp');
    expect(outputCreateMessage.recipient_type).toBe('individual');
    expect(outputCreateMessage.to).toBe(`+${inputCreateMessage.to}`);
    expect(outputCreateMessage.type).toBe(
      MessageTypes.INTERACTIVE_CALL_TO_ACTION,
    );
    expect(outputCreateMessage.interactive).toEqual(inputCreateMessage.content);
  });
});
