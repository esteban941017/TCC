import Message, { MessageTypes } from '../Message';

export default class Location extends Message {
  constructor(to: string, content: LocationContent) {
    super(to, MessageTypes.LOCATION, content);
  }

  static create(to: string, content: LocationContent) {
    return new Location(`+${to}`, content);
  }
}

export type LocationContent = {
  latitude: string;
  longitude: string;
  name?: string;
  address?: string;
};
