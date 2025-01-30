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
