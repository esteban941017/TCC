import Message, { MessageTypes } from '../Message';

export default class Audio extends Message {
  constructor(to: string, content: AudioContent) {
    super(to, MessageTypes.AUDIO, content);
  }

  static create(to: string, content: AudioContent) {
    return new Audio(`+${to}`, content);
  }
}

export type AudioContent = { id: string };
