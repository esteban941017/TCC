import { Router } from 'express';
import { HttpStatusCodes } from '../util/HttpStatusCodes';
import { handler } from '../../event/Webhook';

const routes = Router();
const verificationToken = process.env.META_VERIFICATION_TOKEN;

routes.get('/webhook', async (req, res) => {
  try {
    const mode = req.query['hub.mode'];
    const challenge = Number(req.query['hub.challenge']);
    const verifyToken = req.query['hub.verify_token'];

    if (mode !== 'subscribe')
      return res
        .status(HttpStatusCodes.FORBIDDEN)
        .json({ message: 'Forbidden' });
    if (verifyToken !== verificationToken)
      return res
        .status(HttpStatusCodes.FORBIDDEN)
        .json({ message: 'Forbidden' });
    return res.status(HttpStatusCodes.OK).json(challenge);
  } catch (error) {
    console.error(error);
    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Internal Server Error',
    });
  }
});

// routes.post('/webhook', async (req, res) => {
//   try {
//     const webhookHandlerResponse = await handler(req);
//     return res.status(HttpStatusCodes.OK).json({ message: 'teste' });
//   } catch (error) {
//     console.error(error);
//     return res
//       .status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
//       .json({ message: 'Internal Server Error' });
//   }
// });

export default routes;

//http://localhost:8000/meu-cofrinho/webhook/verification?hub.mode=subscribe&hub.challenge=1158201444&hub.verify_token=a45c0c73-1b66-40a3-a969-1aea5c433844
//https://5g4szryhme.execute-api.us-east-1.amazonaws.com/dev/meu-cofrinho/webhook/verification?hub.mode=subscribe&hub.challenge=1158201444&hub.verify_token=a45c0c73-1b66-40a3-a969-1aea5c433844
