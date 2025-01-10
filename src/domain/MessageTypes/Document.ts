import Message, { MessageTypes } from '../Message';

export default class Document extends Message {
  constructor(to: string, content: DocumentContent) {
    super(to, MessageTypes.DOCUMENT, content);
  }

  static create(to: string, content: DocumentContent) {
    return new Document(`+${to}`, content);
  }
}

export type DocumentContent = {
  id?: string;
  link?: string;
  caption?: string;
  filename?: string;
};
