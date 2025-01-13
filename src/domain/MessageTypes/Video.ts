import Message, { MessageTypes } from '../Message';

export default class Video extends Message {
  constructor(to: string, content: VideoContent) {
    super(to, MessageTypes.VIDEO, content);
  }

  static create(to: string, content: VideoContent) {
    return new Video(`+${to}`, content);
  }
}

export type VideoContent = {
  id?: string;
  link?: string;
  caption?: string;
};
