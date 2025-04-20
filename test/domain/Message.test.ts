import { MessageTypes } from '../../src/domain/Message';
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
import InteractiveList, {
  InteractiveListContent,
} from '../../src/domain/MessageTypes/InteractiveList';
import InteractiveReplyButtons, {
  InteractiveReplyButtonsContent,
} from '../../src/domain/MessageTypes/InteractiveReplyButtons';
import Location, {
  LocationContent,
} from '../../src/domain/MessageTypes/Location';
import LocationRequest, {
  LocationRequestContent,
} from '../../src/domain/MessageTypes/LocationRequest';
import Reaction, {
  ReactionContent,
} from '../../src/domain/MessageTypes/Reaction';
import Sticker, { StickerContent } from '../../src/domain/MessageTypes/Sticker';
import Template from '../../src/domain/MessageTypes/Template';
import Text, { TextContent } from '../../src/domain/MessageTypes/Text';
import Video, { VideoContent } from '../../src/domain/MessageTypes/Video';

describe('Message domain test', () => {
  test('Should create an audio message', () => {
    const inputCreateMessage: { to: string; content: AudioContent } = {
      to: '5531990723700',
      content: { link: 'https://teste.com' },
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

  test('Should create an interactive list message', () => {
    const inputCreateMessage: {
      to: string;
      content: InteractiveListContent;
    } = {
      to: '5531990723700',
      content: {
        type: 'list',
        header: { type: 'text', text: 'My header' },
        body: { text: 'Body text' },
        action: {
          sections: [
            {
              title: 'Title 1 section 1',
              rows: [
                {
                  id: 'Row1Id',
                  title: 'Title Row 1',
                  description: 'My first description',
                },
                {
                  id: 'Row2Id',
                  title: 'Title Row 2',
                  description: 'My second description',
                },
              ],
            },
          ],
          button: 'My Button Text',
        },
      },
    };
    const outputCreateMessage = InteractiveList.create(
      inputCreateMessage.to,
      inputCreateMessage.content,
    );
    expect(outputCreateMessage.messaging_product).toBe('whatsapp');
    expect(outputCreateMessage.recipient_type).toBe('individual');
    expect(outputCreateMessage.to).toBe(`+${inputCreateMessage.to}`);
    expect(outputCreateMessage.type).toBe(MessageTypes.INTERACTIVE_LIST);
    expect(outputCreateMessage.interactive).toEqual(inputCreateMessage.content);
  });

  test('Should create an interactive reply buttons message', () => {
    const inputCreateMessage: {
      to: string;
      content: InteractiveReplyButtonsContent;
    } = {
      to: '5531990723700',
      content: {
        type: 'button',
        header: {
          type: 'text',
          text: 'Mu header text',
        },
        body: { text: 'Body text' },
        footer: {
          text: 'Footer text',
        },
        action: {
          buttons: [
            {
              type: 'reply',
              reply: {
                id: 'Id1',
                title: 'Id 1 reply',
              },
            },
            {
              type: 'reply',
              reply: {
                id: 'Id2',
                title: 'Id 2 reply',
              },
            },
          ],
        },
      },
    };
    const outputCreateMessage = InteractiveReplyButtons.create(
      inputCreateMessage.to,
      inputCreateMessage.content,
    );
    expect(outputCreateMessage.messaging_product).toBe('whatsapp');
    expect(outputCreateMessage.recipient_type).toBe('individual');
    expect(outputCreateMessage.to).toBe(`+${inputCreateMessage.to}`);
    expect(outputCreateMessage.type).toBe(
      MessageTypes.INTERACTIVE_REPLY_BUTTONS,
    );
    expect(outputCreateMessage.interactive).toEqual(inputCreateMessage.content);
  });

  test('Should create a location message', () => {
    const inputCreateMessage: {
      to: string;
      content: LocationContent;
    } = {
      to: '5531990723700',
      content: {
        latitude: '37.44216251868683',
        longitude: '-122.16153582049394',
        name: 'Philz Coffee',
        address: '101 Forest Ave, Palo Alto, CA 94301',
      },
    };
    const outputCreateMessage = Location.create(
      inputCreateMessage.to,
      inputCreateMessage.content,
    );
    expect(outputCreateMessage.messaging_product).toBe('whatsapp');
    expect(outputCreateMessage.recipient_type).toBe('individual');
    expect(outputCreateMessage.to).toBe(`+${inputCreateMessage.to}`);
    expect(outputCreateMessage.type).toBe(MessageTypes.LOCATION);
    expect(outputCreateMessage.location).toEqual(inputCreateMessage.content);
  });

  test('Should create a location request message', () => {
    const inputCreateMessage: {
      to: string;
      content: LocationRequestContent;
    } = {
      to: '5531990723700',
      content: {
        type: 'location_request_message',
        body: {
          text: 'Please share your location',
        },
        action: {
          name: 'send_location',
        },
      },
    };
    const outputCreateMessage = LocationRequest.create(
      inputCreateMessage.to,
      inputCreateMessage.content,
    );
    expect(outputCreateMessage.messaging_product).toBe('whatsapp');
    expect(outputCreateMessage.recipient_type).toBe('individual');
    expect(outputCreateMessage.to).toBe(`+${inputCreateMessage.to}`);
    expect(outputCreateMessage.type).toBe(MessageTypes.LOCATION_REQUEST);
    expect(outputCreateMessage.interactive).toEqual(inputCreateMessage.content);
  });

  test('Should create a reaction message', () => {
    const inputCreateMessage: {
      to: string;
      content: ReactionContent;
    } = {
      to: '5531990723700',
      content: {
        message_id: 'MyMessageId',
        emoji: '😀',
      },
    };
    const outputCreateMessage = Reaction.create(
      inputCreateMessage.to,
      inputCreateMessage.content,
    );
    expect(outputCreateMessage.messaging_product).toBe('whatsapp');
    expect(outputCreateMessage.recipient_type).toBe('individual');
    expect(outputCreateMessage.to).toBe(`+${inputCreateMessage.to}`);
    expect(outputCreateMessage.type).toBe(MessageTypes.REACTION);
    expect(outputCreateMessage.reaction).toEqual(inputCreateMessage.content);
  });

  test('Should create a sticker message', () => {
    const inputCreateMessage: {
      to: string;
      content: StickerContent;
    } = {
      to: '5531990723700',
      content: {
        id: 'MyMessageId',
      },
    };
    const outputCreateMessage = Sticker.create(
      inputCreateMessage.to,
      inputCreateMessage.content,
    );
    expect(outputCreateMessage.messaging_product).toBe('whatsapp');
    expect(outputCreateMessage.recipient_type).toBe('individual');
    expect(outputCreateMessage.to).toBe(`+${inputCreateMessage.to}`);
    expect(outputCreateMessage.type).toBe(MessageTypes.STICKER);
    expect(outputCreateMessage.sticker).toEqual(inputCreateMessage.content);
  });

  test('Should create a text message', () => {
    const inputCreateMessage: {
      to: string;
      content: TextContent;
    } = {
      to: '5531990723700',
      content: {
        body: 'MyMessageId https://google.com',
        preview_url: true,
      },
    };
    const outputCreateMessage = Text.create(
      inputCreateMessage.to,
      inputCreateMessage.content,
    );
    expect(outputCreateMessage.messaging_product).toBe('whatsapp');
    expect(outputCreateMessage.recipient_type).toBe('individual');
    expect(outputCreateMessage.to).toBe(`+${inputCreateMessage.to}`);
    expect(outputCreateMessage.type).toBe(MessageTypes.TEXT);
    expect(outputCreateMessage.text).toEqual(inputCreateMessage.content);
  });

  test('Should create a video message', () => {
    const inputCreateMessage: {
      to: string;
      content: VideoContent;
    } = {
      to: '5531990723700',
      content: {
        link: 'MyVideoLink',
        caption: 'My video caption',
      },
    };
    const outputCreateMessage = Video.create(
      inputCreateMessage.to,
      inputCreateMessage.content,
    );
    expect(outputCreateMessage.messaging_product).toBe('whatsapp');
    expect(outputCreateMessage.recipient_type).toBe('individual');
    expect(outputCreateMessage.to).toBe(`+${inputCreateMessage.to}`);
    expect(outputCreateMessage.type).toBe(MessageTypes.VIDEO);
    expect(outputCreateMessage.video).toEqual(inputCreateMessage.content);
  });

  test('Should create a template message', () => {
    const inputCreateMessage = {
      to: '5531990723700',
      content: {
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
      },
    };

    const outputCreateMessage = Template.create(
      inputCreateMessage.to,
      inputCreateMessage.content,
    );
    console.dir(outputCreateMessage, { depth: null });
    expect(outputCreateMessage.messaging_product).toBe('whatsapp');
    expect(outputCreateMessage.recipient_type).toBe('individual');
    expect(outputCreateMessage.to).toBe(`+${inputCreateMessage.to}`);
    expect(outputCreateMessage.type).toBe(MessageTypes.TEMPLATE);
    expect(outputCreateMessage.template).toEqual(inputCreateMessage.content);
  });
});
