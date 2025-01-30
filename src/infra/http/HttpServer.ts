import express, { Express } from 'express';
import cors from 'cors';

import WebhookController from '../../application/controller/WebhookController';

export const BaseRoute = 'meu-cofrinho';

export class HttpServer {
  app: Express;

  constructor() {
    this.app = express();
    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.app.use(express.json());
    this.app.use(cors());
  }

  routes() {
    this.app.use(`/${BaseRoute}/webhook`, WebhookController);
  }

  start(port: number) {
    this.app.listen(port, () => console.log(`server started at ${port}`));
  }
}
