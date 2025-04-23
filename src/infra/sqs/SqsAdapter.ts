import {
  SQSClient,
  DeleteMessageCommand,
  SendMessageCommand,
  SendMessageBatchCommand,
  ReceiveMessageCommand,
  GetQueueAttributesCommand,
} from '@aws-sdk/client-sqs';
import crypto from 'node:crypto';

export default class SqsAdapter {
  private readonly sqsClient: SQSClient;
  constructor(private readonly queueUrl: string) {
    this.sqsClient = new SQSClient({ region: process.env.AWS_REGION });
  }

  async publish(message: any) {
    return this.sqsClient.send(
      new SendMessageCommand({
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify(message),
      }),
    );
  }

  async publishBatch(batch: any[]) {
    try {
      return this.sqsClient.send(
        new SendMessageBatchCommand({
          QueueUrl: this.queueUrl,
          Entries: batch.map(message => ({
            Id: crypto.randomUUID(),
            MessageBody: JSON.stringify(message),
          })),
        }),
      );
    } catch (error) {
      console.error(error);
    }
  }

  async getMessage() {
    const command = await this.sqsClient.send(
      new ReceiveMessageCommand({
        QueueUrl: this.queueUrl,
      }),
    );
    if (!command.Messages?.length) return;
    return command.Messages[0];
  }

  async checkForMessages() {
    const command = await this.sqsClient.send(
      new GetQueueAttributesCommand({
        QueueUrl: this.queueUrl,
        AttributeNames: ['ApproximateNumberOfMessages'],
      }),
    );
    return command.Attributes?.ApproximateNumberOfMessages ?? 0;
  }

  async deleteMessage(receiptHandle: string) {
    return this.sqsClient.send(
      new DeleteMessageCommand({
        QueueUrl: this.queueUrl,
        ReceiptHandle: receiptHandle,
      }),
    );
  }
}
