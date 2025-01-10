import Message, { MessageTypes } from '../Message';

export default class Image extends Message {
  constructor(to: string, content: ImageContent) {
    super(to, MessageTypes.IMAGE, content);
  }

  static create(to: string, content: ImageContent) {
    return new Image(`+${to}`, content);
  }
}

export type ImageContent = {
  id?: string;
  link?: string;
  caption?: string;
};
