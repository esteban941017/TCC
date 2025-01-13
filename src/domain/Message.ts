import { AudioContent } from './MessageTypes/Audio';
import { ContactContent } from './MessageTypes/Contacts';
import { DocumentContent } from './MessageTypes/Document';
// import { FlowContent } from './MessageTypes/Flow';
import { ImageContent } from './MessageTypes/Image';
import { InteractiveCallToActionContent } from './MessageTypes/InteractiveCallToAction';
import { InteractiveListContent } from './MessageTypes/InteractiveList';
import { InteractiveReplyButtonsContent } from './MessageTypes/InteractiveReplyButtons';
import { LocationContent } from './MessageTypes/Location';
import { LocationRequestContent } from './MessageTypes/LocationRequest';
import { ReactionContent } from './MessageTypes/Reaction';
import { StickerContent } from './MessageTypes/Sticker';
import { TextContent } from './MessageTypes/Text';
import { VideoContent } from './MessageTypes/Video';

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
  FLOW = 'interactive',
  INTERACTIVE_LIST = 'interactive',
  INTERACTIVE_REPLY_BUTTONS = 'interactive',
  LOCATION = 'location',
  LOCATION_REQUEST = 'interactive',
  REACTION = 'reaction',
  STICKER = 'sticker',
  TEMPLATE = 'template',
  TEXT = 'text',
  VIDEO = 'video',
}

type Content =
  | AudioContent
  | ContactContent
  | DocumentContent
  | ImageContent
  | InteractiveCallToActionContent
  // | FlowContent
  | InteractiveListContent
  | InteractiveReplyButtonsContent
  | LocationContent
  | LocationRequestContent
  | ReactionContent
  | StickerContent
  | TextContent
  | VideoContent;
