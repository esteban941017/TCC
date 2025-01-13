import Message, { MessageTypes } from '../Message';

export default class InteractiveReplyButtons extends Message {
  constructor(to: string, content: InteractiveReplyButtonsContent) {
    super(to, MessageTypes.INTERACTIVE_REPLY_BUTTONS, content);
  }

  static create(to: string, content: InteractiveReplyButtonsContent) {
    return new InteractiveReplyButtons(`+${to}`, content);
  }
}

export type InteractiveReplyButtonsContent = {
  type: 'button';
  header?: Header;
  body: {
    text: string;
  };
  footer?: {
    text: string;
  };
  action: {
    buttons: {
      type: 'reply';
      reply: {
        id: string;
        title: string;
      };
    }[];
  };
};

type Header =
  | {
      type: 'document';
      document: string;
    }
  | {
      type: 'image';
      image: string;
    }
  | {
      type: 'text';
      text: string;
    }
  | {
      type: 'video';
      video: string;
    };
