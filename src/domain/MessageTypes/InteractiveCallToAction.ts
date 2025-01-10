import Message, { MessageTypes } from '../Message';

export default class InteractiveCallToAction extends Message {
  constructor(to: string, content: InteractiveCallToActionContent) {
    super(to, MessageTypes.INTERACTIVE_CALL_TO_ACTION, content);
  }

  static create(to: string, content: InteractiveCallToActionContent) {
    return new InteractiveCallToAction(`+${to}`, content);
  }
}

export type InteractiveCallToActionContent = {
  type: 'cta_url';
  header?: {
    type: 'text';
    text: string;
  };
  body: {
    text: string;
  };
  footer?: {
    text: string;
  };
  action: {
    name: string;
    parameters: {
      display_text: string;
      url: string;
    };
  };
};
