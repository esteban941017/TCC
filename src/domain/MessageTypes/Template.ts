import Message, { MessageTypes } from '../Message';

export default class Template extends Message {
  constructor(to: string, content: TemplateContent) {
    super(to, MessageTypes.TEMPLATE, content);
  }

  static create(to: string, content: TemplateContent) {
    return new Template(`+${to}`, content);
  }
}

export type TemplateContent = {
  name: string;
  language: {
    code: string;
  };
  components?: {
    type: string;
    parameters: {
      type: string;
      [key: string]: any;
    }[];
  }[];
};
