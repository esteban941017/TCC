import { getMessageVariables } from '../../src/application/util/GetMessageVariables';
import { webhookEventPayload } from '../mock/WebhookEventPayload';

describe('Get webhook message variables unit test', () => {
  test('Should get all message variables from webhook payload', () => {
    const inputGetVariables = webhookEventPayload;
    const outputGetVariables = getMessageVariables(inputGetVariables);
    expect(outputGetVariables?.from).toBe(
      inputGetVariables.entry[0].changes[0].value.messages[0].from,
    );
    expect(outputGetVariables?.phoneNumberId).toBe(
      inputGetVariables.entry[0].changes[0].value.metadata.phone_number_id,
    );
    expect(outputGetVariables?.name).toBe(
      inputGetVariables.entry[0].changes[0].value.contacts[0].profile.name,
    );
    expect(outputGetVariables?.timestamp).toBe(
      inputGetVariables.entry[0].changes[0].value.messages[0].timestamp,
    );
    expect(outputGetVariables?.messageBody).toBe(
      inputGetVariables.entry[0].changes[0].value.messages[0].text.body,
    );
    expect(outputGetVariables?.type).toBe(
      inputGetVariables.entry[0].changes[0].value.messages[0].type,
    );
    expect(outputGetVariables?.messageId).toBe(
      inputGetVariables.entry[0].changes[0].value.messages[0].id,
    );
  });
});
