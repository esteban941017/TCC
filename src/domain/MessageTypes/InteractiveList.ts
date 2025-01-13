import Message, { MessageTypes } from '../Message';

export default class InteractiveList extends Message {
  constructor(to: string, content: InteractiveListContent) {
    super(to, MessageTypes.INTERACTIVE_LIST, content);
  }

  static create(to: string, content: InteractiveListContent) {
    return new InteractiveList(`+${to}`, content);
  }
}

export type InteractiveListContent = {
  type: 'list';
  header?: Header;
  body: {
    text: string;
  };
  footer?: {
    text: string;
  };
  action: {
    sections: {
      title: string;
      rows: {
        id: string;
        title: string;
        description?: string;
      }[];
    }[];
    button: string;
  };
};

type Header = {
  type: 'text';
  text: string;
};
