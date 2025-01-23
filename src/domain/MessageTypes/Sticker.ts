import Message, { MessageTypes } from '../Message';

export default class Sticker extends Message {
  constructor(to: string, content: StickerContent) {
    super(to, MessageTypes.STICKER, content);
  }

  static create(to: string, content: StickerContent) {
    return new Sticker(`+${to}`, content);
  }
}

export type StickerContent = {
  id?: string;
  link?: string;
};
