import Message, { MessageTypes } from '../Message';

export default class Contacts extends Message {
  constructor(to: string, content: ContactContent) {
    super(to, MessageTypes.CONTACTS, content);
  }

  static create(to: string, content: ContactContent) {
    return new Contacts(`+${to}`, content);
  }
}

export type ContactContent = {
  name: {
    formatted_name: string;
    first_name?: string;
    last_name?: string;
    middle_name?: string;
    suffix?: string;
    prefix?: string;
  };
  addresses?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    country_code?: string;
    type?: string;
  }[];
  birthday?: string;
  emails?: {
    email?: string;
    type?: string;
  }[];
  org?: {
    company?: string;
    department?: string;
    title?: string;
  };
  phones?: {
    phone?: string;
    type?: string;
    wa_id?: string;
  }[];
  urls?: {
    url?: string;
    type?: string;
  }[];
}[];
