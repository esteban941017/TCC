// import Message, { MessageTypes } from '../Message';

// export default class Flow extends Message {
//   constructor(to: string, content: FlowContent) {
//     super(to, MessageTypes.FLOW, content);
//   }

//   static create(to: string, content: FlowContent) {
//     return new Flow(`+${to}`, content);
//   }
// }

// export type FlowContent = {
//   type: 'flow';
//   header?: {
//     type: 'text';
//     text: string;
//   };
//   body: {
//     text: string;
//   };
//   footer?: {
//     text: string;
//   };
//   action: {
//     name: 'flow';
//     parameters: {
//       flow_message_version: '3';
//       flow_name: string;
//       flow_token: string;
//       flow_id: string;
//       flow_cta: string;
//       mode: 'draft' | 'published';
//       flow_action: 'navigate' | 'data_exchange';
//       /*PAYLOAD ONLY FOR NAVIGATE */
//       flow_action_payload?: {
//         screen: string;
//         data: any;
//       };
//     };
//   };
// };
