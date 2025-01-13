import Message, { MessageTypes } from '../Message';

export default class LocationRequest extends Message {
  constructor(to: string, content: LocationRequestContent) {
    super(to, MessageTypes.LOCATION_REQUEST, content);
  }

  static create(to: string, content: LocationRequestContent) {
    return new LocationRequest(`+${to}`, content);
  }
}

export type LocationRequestContent = {
  type: 'location_request_message';
  body: {
    text: string;
  };
  action: {
    name: 'send_location';
  };
};
