import loadEnvironment from './infra/env/environment';
loadEnvironment();

import serverless from 'serverless-http';
import { HttpServer } from './infra/http/HttpServer';

const httpServer = new HttpServer();
if (process.env.NODE_ENV === 'local') httpServer.start(8000);

export const ApiHandler = serverless(httpServer.app);
