import SqsAdapter from '../../src/infra/sqs/SqsAdapter';

let sqsAdapter: SqsAdapter;

describe('SQS test', () => {
  beforeAll(() => {
    sqsAdapter = new SqsAdapter(String(process.env.QUEUE_URL));
  });

  test('Should publish a message', async () => {
    const inputPublishMessage = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: '535914459606172',
          changes: [
            {
              value: {
                messaging_product: 'whatsapp',
                metadata: {
                  display_phone_number: '15551378597',
                  phone_number_id: '505669475971321',
                },
                contacts: [
                  {
                    profile: {
                      name: 'Esteban Ramírez',
                    },
                    wa_id: '553190723700',
                  },
                ],
                messages: [
                  {
                    from: '553190723700',
                    id: 'wamid.HBgMNTUzMTkwNzIzNzAwFQIAEhgWM0VCMDBGNTA4NzkxMzU3NTk5NDFCMgA=',
                    timestamp: '1737754494',
                    text: {
                      body: 'Segunda mensagem',
                    },
                    type: 'text',
                  },
                ],
              },
              field: 'messages',
            },
          ],
        },
      ],
    };
    const outputPublishMessage = await sqsAdapter.publish(inputPublishMessage);
    expect(outputPublishMessage['$metadata'].httpStatusCode).toBe(200);
  });
});
