export const webhookEventPayload = {
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
export const webhookMetaEventPayload = {
  object: 'whatsapp_business_account',
  entry: [
    {
      id: '526386813898597',
      changes: [
        {
          value: {
            messaging_product: 'whatsapp',
            metadata: {
              display_phone_number: '15551523104',
              phone_number_id: '570580906132568',
            },
            statuses: [
              {
                id: 'wamid.HBgMNTUzMTkwNzIzNzAwFQIAERgSMkNDNjYwNzMxMzg0QTU4MDg3AA==',
                status: 'delivered',
                timestamp: '1738169368',
                recipient_id: '553190723700',
                conversation: {
                  id: '409a172c09a0d382c507e3945e10fe75',
                  origin: {
                    type: 'utility',
                  },
                },
                pricing: {
                  billable: true,
                  pricing_model: 'CBP',
                  category: 'utility',
                },
              },
            ],
          },
          field: 'messages',
        },
      ],
    },
  ],
};
