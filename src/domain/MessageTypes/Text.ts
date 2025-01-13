import Message, { MessageTypes } from '../Message';

export default class Text extends Message {
  constructor(to: string, content: TextContent) {
    super(to, MessageTypes.TEXT, content);
  }

  static create(to: string, content: TextContent) {
    return new Text(`+${to}`, content);
  }
}

export type TextContent = {
  body: string;
  preview_url?: boolean;
};
