export const handler = async (event: any): Promise<any> => {
  try {
    console.log(String(event.body));
  } catch (error) {
    console.error(error);
  }
};

export function getMessageVariables(webhookMessage: any) {
  if (
    !Object.keys(webhookMessage.entry[0].changes[0].value).includes('messages')
  )
    return null;
  const {
    entry: [
      {
        changes: [
          {
            value: {
              metadata: { phone_number_id: phoneNumberId },
              contacts: [
                {
                  profile: { name },
                },
              ],
              messages: [
                {
                  from,
                  timestamp,
                  id: messageId,
                  type,
                  [type]: { [type === 'text' ? 'body' : 'text']: messageBody },
                },
              ],
            },
          },
        ],
      },
    ],
  } = webhookMessage;
  return {
    messageId,
    phoneNumberId,
    name,
    from,
    timestamp,
    messageBody: messageBody.toLowerCase(),
    type,
  };
}
