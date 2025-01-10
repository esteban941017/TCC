export default class Message {
  messaging_product: string;
  recipient_type: string;
  [key: string]: any;

  constructor(
    readonly to: string,
    readonly type: MessageTypes,
    content: Content,
  ) {
    this.messaging_product = 'whatsapp';
    this.recipient_type = 'individual';
    this[type] = content;
    Object.freeze(this);
  }
}

export enum MessageTypes {
  AUDIO = 'audio',
  CONTACTS = 'contacts',
  DOCUMENT = 'document',
  IMAGE = 'image',
  INTERACTIVE_CALL_TO_ACTION = 'interactive',
  FLOW = 'flow',
  INTERACTIVE_LIST = 'interactive',
  INTERACTIVE_REPLY_BUTTONS = 'interactiveReplyButtons',
  LOCATION = 'location',
  LOCATION_REQUEST = 'locationRequest',
  REACTION = 'reaction',
  STICKER = 'sticker',
  TEMPLATE = 'template',
  TEXT = 'text',
  VIDEO = 'video',
  READ_RECEIPT = 'readReceipt',
}

type Content = any;
