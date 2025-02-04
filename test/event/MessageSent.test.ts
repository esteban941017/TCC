import axios from 'axios';
import Text from '../../src/domain/MessageTypes/Text';
import { HttpStatusCodes } from '../../src/application/util/HttpStatusCodes';
import Audio from '../../src/domain/MessageTypes/Audio';
import Contacts from '../../src/domain/MessageTypes/Contacts';
import Document from '../../src/domain/MessageTypes/Document';
import Image from '../../src/domain/MessageTypes/Image';
import InteractiveCallToAction, {
  InteractiveCallToActionContent,
} from '../../src/domain/MessageTypes/InteractiveCallToAction';
import InteractiveList, {
  InteractiveListContent,
} from '../../src/domain/MessageTypes/InteractiveList';
import InteractiveReplyButtons, {
  InteractiveReplyButtonsContent,
} from '../../src/domain/MessageTypes/InteractiveReplyButtons';
import Location from '../../src/domain/MessageTypes/Location';
import LocationRequest, {
  LocationRequestContent,
} from '../../src/domain/MessageTypes/LocationRequest';
import Reaction from '../../src/domain/MessageTypes/Reaction';
import Sticker from '../../src/domain/MessageTypes/Sticker';
import Video from '../../src/domain/MessageTypes/Video';

describe('Send messages test suite', () => {
  const facebookUrl = `https://graph.facebook.com/v21.0/${process.env.PHONE_NUMBER_ID}/messages`;

  test('Should send an audio message', async () => {
    const inputCreateMessage = {
      link: 'https://download.samplelib.com/mp3/sample-3s.mp3',
    };
    const outputCreateMessage = Audio.create(
      '5531990723700',
      inputCreateMessage,
    );
    try {
      const outputSendMessage = await axios.post(
        facebookUrl,
        outputCreateMessage,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.API_KEY}`,
          },
        },
      );
      expect(outputSendMessage.status).toBe(HttpStatusCodes.OK);
      expect(outputSendMessage.data.messaging_product).toBe('whatsapp');
      expect(outputSendMessage.data.contacts).toEqual([
        { input: '+5531990723700', wa_id: '553190723700' },
      ]);
      expect(outputSendMessage.data.messages[0].id).toBeDefined();
    } catch (error) {
      if (axios.isAxiosError(error)) console.error(error.response?.data);
    }
  });

  test('Should send a contact message', async () => {
    const inputCreateMessage = [
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
            phone: '19175559999',
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
    ];
    const outputCreateMessage = Contacts.create(
      '5531990723700',
      inputCreateMessage,
    );
    try {
      const outputSendMessage = await axios.post(
        facebookUrl,
        outputCreateMessage,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.API_KEY}`,
          },
        },
      );
      expect(outputSendMessage.status).toBe(HttpStatusCodes.OK);
      expect(outputSendMessage.data.messaging_product).toBe('whatsapp');
      expect(outputSendMessage.data.contacts).toEqual([
        { input: '+5531990723700', wa_id: '553190723700' },
      ]);
      expect(outputSendMessage.data.messages[0].id).toBeDefined();
    } catch (error) {
      if (axios.isAxiosError(error)) console.error(error.response?.data);
    }
  });

  test('Should send a document message', async () => {
    const inputCreateMessage = {
      link: 'https://download.samplelib.com/mp3/sample-3s.mp3',
      caption: 'File caption',
      filename: 'Filename',
    };
    const outputCreateMessage = Document.create(
      '5531990723700',
      inputCreateMessage,
    );
    try {
      const outputSendMessage = await axios.post(
        facebookUrl,
        outputCreateMessage,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.API_KEY}`,
          },
        },
      );
      expect(outputSendMessage.status).toBe(HttpStatusCodes.OK);
      expect(outputSendMessage.data.messaging_product).toBe('whatsapp');
      expect(outputSendMessage.data.contacts).toEqual([
        { input: '+5531990723700', wa_id: '553190723700' },
      ]);
      expect(outputSendMessage.data.messages[0].id).toBeDefined();
    } catch (error) {
      if (axios.isAxiosError(error)) console.error(error.response?.data);
    }
  });

  test('Should send an image message', async () => {
    const inputCreateMessage = {
      link: 'https://freeiconshop.com/wp-content/uploads/edd/image-outline-filled.png',
      caption: 'Image caption',
    };
    const outputCreateMessage = Image.create(
      '5531990723700',
      inputCreateMessage,
    );
    try {
      const outputSendMessage = await axios.post(
        facebookUrl,
        outputCreateMessage,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.API_KEY}`,
          },
        },
      );
      expect(outputSendMessage.status).toBe(HttpStatusCodes.OK);
      expect(outputSendMessage.data.messaging_product).toBe('whatsapp');
      expect(outputSendMessage.data.contacts).toEqual([
        { input: '+5531990723700', wa_id: '553190723700' },
      ]);
      expect(outputSendMessage.data.messages[0].id).toBeDefined();
    } catch (error) {
      if (axios.isAxiosError(error)) console.error(error.response?.data);
    }
  });

  test('Should send an interactive call to action message', async () => {
    const inputCreateMessage: InteractiveCallToActionContent = {
      type: 'cta_url',
      body: { text: 'My body' },
      action: {
        name: 'cta_url',
        parameters: {
          display_text: 'See Dates',
          url: 'https://test.com',
        },
      },
    };
    const outputCreateMessage = InteractiveCallToAction.create(
      '5531990723700',
      inputCreateMessage,
    );
    try {
      const outputSendMessage = await axios.post(
        facebookUrl,
        outputCreateMessage,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.API_KEY}`,
          },
        },
      );
      expect(outputSendMessage.status).toBe(HttpStatusCodes.OK);
      expect(outputSendMessage.data.messaging_product).toBe('whatsapp');
      expect(outputSendMessage.data.contacts).toEqual([
        { input: '+5531990723700', wa_id: '553190723700' },
      ]);
      expect(outputSendMessage.data.messages[0].id).toBeDefined();
    } catch (error) {
      if (axios.isAxiosError(error)) console.error(error.response?.data);
    }
  });

  test('Should send an interactive list message', async () => {
    const inputCreateMessage: InteractiveListContent = {
      type: 'list',
      header: {
        type: 'text',
        text: 'Choose Shipping Option',
      },
      body: {
        text: 'Which shipping option do you prefer?',
      },
      footer: {
        text: 'Lucky Shrub: Your gateway to succulents™',
      },
      action: {
        button: 'Shipping Options',
        sections: [
          {
            title: 'I want it ASAP!',
            rows: [
              {
                id: 'priority_express',
                title: 'Priority Mail Express',
                description: 'Next Day to 2 Days',
              },
              {
                id: 'priority_mail',
                title: 'Priority Mail',
                description: '1–3 Days',
              },
            ],
          },
          {
            title: 'I can wait a bit',
            rows: [
              {
                id: 'usps_ground_advantage',
                title: 'USPS Ground Advantage',
                description: '2–5 Days',
              },
              {
                id: 'media_mail',
                title: 'Media Mail',
                description: '2–8 Days',
              },
            ],
          },
        ],
      },
    };
    const outputCreateMessage = InteractiveList.create(
      '5531990723700',
      inputCreateMessage,
    );
    try {
      const outputSendMessage = await axios.post(
        facebookUrl,
        outputCreateMessage,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.API_KEY}`,
          },
        },
      );
      expect(outputSendMessage.status).toBe(HttpStatusCodes.OK);
      expect(outputSendMessage.data.messaging_product).toBe('whatsapp');
      expect(outputSendMessage.data.contacts).toEqual([
        { input: '+5531990723700', wa_id: '553190723700' },
      ]);
      expect(outputSendMessage.data.messages[0].id).toBeDefined();
    } catch (error) {
      if (axios.isAxiosError(error)) console.error(error.response?.data);
    }
  });

  test('Should send an interactive reply buttons message', async () => {
    const inputCreateMessage: InteractiveReplyButtonsContent = {
      type: 'button',
      header: { type: 'text', text: '2762702990552401' },
      body: {
        text: 'Hi Pablo! Your gardening workshop is scheduled for 9am tomorrow. Use the buttons if you need to reschedule. Thank you!',
      },
      footer: { text: 'Lucky Shrub: Your gateway to succulents!™' },
      action: {
        buttons: [
          {
            type: 'reply',
            reply: { id: 'change-button', title: 'Change' },
          },
          {
            type: 'reply',
            reply: { id: 'cancel-button', title: 'Cancel' },
          },
        ],
      },
    };
    const outputCreateMessage = InteractiveReplyButtons.create(
      '5531990723700',
      inputCreateMessage,
    );
    try {
      const outputSendMessage = await axios.post(
        facebookUrl,
        outputCreateMessage,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.API_KEY}`,
          },
        },
      );
      expect(outputSendMessage.status).toBe(HttpStatusCodes.OK);
      expect(outputSendMessage.data.messaging_product).toBe('whatsapp');
      expect(outputSendMessage.data.contacts).toEqual([
        { input: '+5531990723700', wa_id: '553190723700' },
      ]);
      expect(outputSendMessage.data.messages[0].id).toBeDefined();
    } catch (error) {
      if (axios.isAxiosError(error)) console.error(error.response?.data);
    }
  });

  test('Should send a location message', async () => {
    const inputCreateMessage = {
      latitude: '37.44216251868683',
      longitude: '-122.16153582049394',
      name: 'Philz Coffee',
      address: '101 Forest Ave, Palo Alto, CA 94301',
    };
    const outputCreateMessage = Location.create(
      '5531990723700',
      inputCreateMessage,
    );
    try {
      const outputSendMessage = await axios.post(
        facebookUrl,
        outputCreateMessage,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.API_KEY}`,
          },
        },
      );
      expect(outputSendMessage.status).toBe(HttpStatusCodes.OK);
      expect(outputSendMessage.data.messaging_product).toBe('whatsapp');
      expect(outputSendMessage.data.contacts).toEqual([
        { input: '+5531990723700', wa_id: '553190723700' },
      ]);
      expect(outputSendMessage.data.messages[0].id).toBeDefined();
    } catch (error) {
      if (axios.isAxiosError(error)) console.error(error.response?.data);
    }
  });

  test('Should send a location request message', async () => {
    const inputCreateMessage: LocationRequestContent = {
      type: 'location_request_message',
      body: {
        text: 'Please share your location',
      },
      action: {
        name: 'send_location',
      },
    };
    const outputCreateMessage = LocationRequest.create(
      '5531990723700',
      inputCreateMessage,
    );
    try {
      const outputSendMessage = await axios.post(
        facebookUrl,
        outputCreateMessage,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.API_KEY}`,
          },
        },
      );
      expect(outputSendMessage.status).toBe(HttpStatusCodes.OK);
      expect(outputSendMessage.data.messaging_product).toBe('whatsapp');
      expect(outputSendMessage.data.contacts).toEqual([
        { input: '+5531990723700', wa_id: '553190723700' },
      ]);
      expect(outputSendMessage.data.messages[0].id).toBeDefined();
    } catch (error) {
      if (axios.isAxiosError(error)) console.error(error.response?.data);
    }
  });

  test('Should send a text message and react to it', async () => {
    const inputCreateMessage = {
      body: 'Text to react',
    };
    const outputCreateMessage = Text.create(
      '5531990723700',
      inputCreateMessage,
    );
    try {
      const outputSendMessage = await axios.post(
        facebookUrl,
        outputCreateMessage,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.API_KEY}`,
          },
        },
      );
      const inputCreateReactMessage = {
        message_id: outputSendMessage.data.messages[0].id,
        emoji: '👍',
      };
      const outputCreateReactMessage = Reaction.create(
        '5531990723700',
        inputCreateReactMessage,
      );
      const outputReactMessage = await axios.post(
        facebookUrl,
        outputCreateReactMessage,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.API_KEY}`,
          },
        },
      );
      expect(outputReactMessage.status).toBe(HttpStatusCodes.OK);
      expect(outputReactMessage.data.messaging_product).toBe('whatsapp');
      expect(outputReactMessage.data.contacts).toEqual([
        { input: '+5531990723700', wa_id: '553190723700' },
      ]);
      expect(outputReactMessage.data.messages[0].id).toBeDefined();
    } catch (error) {
      if (axios.isAxiosError(error)) console.error(error.response?.data);
    }
  });

  test('Should send a sticker message', async () => {
    try {
      const inputCreateMessage = {
        link: 'https://offerwise-images.s3.us-east-1.amazonaws.com/gen/ESTEBAN/STK-20190121-WA0045.webp',
      };
      const outputCreateMessage = Sticker.create(
        '5531990723700',
        inputCreateMessage,
      );
      const outputSendMessage = await axios.post(
        facebookUrl,
        outputCreateMessage,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.API_KEY}`,
          },
        },
      );
      expect(outputSendMessage.status).toBe(HttpStatusCodes.OK);
      expect(outputSendMessage.data.messaging_product).toBe('whatsapp');
      expect(outputSendMessage.data.contacts).toEqual([
        { input: '+5531990723700', wa_id: '553190723700' },
      ]);
      expect(outputSendMessage.data.messages[0].id).toBeDefined();
    } catch (error) {
      if (axios.isAxiosError(error)) console.error(error.response?.data);
    }
  });

  test('Should send a text message', async () => {
    const inputCreateMessage = {
      body: 'This is my text message',
    };
    const outputCreateMessage = Text.create(
      '5531990723700',
      inputCreateMessage,
    );
    try {
      const outputSendMessage = await axios.post(
        facebookUrl,
        outputCreateMessage,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.API_KEY}`,
          },
        },
      );
      expect(outputSendMessage.status).toBe(HttpStatusCodes.OK);
      expect(outputSendMessage.data.messaging_product).toBe('whatsapp');
      expect(outputSendMessage.data.contacts).toEqual([
        { input: '+5531990723700', wa_id: '553190723700' },
      ]);
      expect(outputSendMessage.data.messages[0].id).toBeDefined();
    } catch (error) {
      if (axios.isAxiosError(error)) console.error(error.response?.data);
    }
  });

  test('Should send a video message', async () => {
    const inputCreateMessage = {
      link: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    };
    const outputCreateMessage = Video.create(
      '5531990723700',
      inputCreateMessage,
    );
    try {
      const outputSendMessage = await axios.post(
        facebookUrl,
        outputCreateMessage,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.API_KEY}`,
          },
        },
      );
      expect(outputSendMessage.status).toBe(HttpStatusCodes.OK);
      expect(outputSendMessage.data.messaging_product).toBe('whatsapp');
      expect(outputSendMessage.data.contacts).toEqual([
        { input: '+5531990723700', wa_id: '553190723700' },
      ]);
      expect(outputSendMessage.data.messages[0].id).toBeDefined();
    } catch (error) {
      if (axios.isAxiosError(error)) console.error(error.response?.data);
    }
  });

  // test('Should send a template message', async () => {
  //   const inputCreateMessage = {};
  //   const outputCreateMessage = {};
  //   try {
  //     const outputSendMessage = await axios.post(
  //       facebookUrl,
  //       {
  //         messaging_product: 'whatsapp',
  //         to: '+5531990723700',
  //         type: 'template',
  //         template: {
  //           name: 'registered_expense',
  //           language: {
  //             code: 'pt_BR',
  //           },
  //           components: [
  //             {
  //               type: 'body',
  //               parameters: [
  //                 {
  //                   type: 'text',
  //                   text: 'Esteban',
  //                 },
  //                 {
  //                   type: 'text',
  //                   text: 'Cerveja',
  //                 },
  //                 {
  //                   type: 'text',
  //                   text: 'Viagem',
  //                 },
  //               ],
  //             },
  //           ],
  //         },
  //       },
  //       {
  //         headers: {
  //           'Content-Type': 'application/json',
  //           Authorization: `Bearer ${process.env.API_KEY}`,
  //         },
  //       },
  //     );
  //   } catch (error) {
  //     if (axios.isAxiosError(error)) console.error(error.response?.data);
  //   }
  // });
});
