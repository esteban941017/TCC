import Message, { MessageTypes } from '../Message';

export default class Reaction extends Message {
  constructor(to: string, content: ReactionContent) {
    super(to, MessageTypes.REACTION, content);
  }

  static create(to: string, content: ReactionContent) {
    return new Reaction(`+${to}`, content);
  }
}

export type ReactionContent = {
  message_id: string;
  emoji: string;
};
