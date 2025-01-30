import axios from 'axios';
import Message from '../../domain/Message';

export default class MessageGateway {
  private facebookUrl = `https://graph.facebook.com/v21.0/${process.env.PHONE_NUMBER_ID}/messages`;
  private headers = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.API_KEY}`,
    },
  };

  constructor() {}

  async sendMessage(payload: Message) {
    try {
      const response = await axios.post(
        this.facebookUrl,
        payload,
        this.headers,
      );
      return {
        status: response.status,
        data: response.data,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) console.error(error.response?.data);
    }
  }
}
