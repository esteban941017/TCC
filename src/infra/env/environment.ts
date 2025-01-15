import { config } from 'dotenv';
import { join } from 'path';

export default function loadEnvironment() {
  const nodeEnv = process.env.NODE_ENV;
  if (nodeEnv === 'local') {
    console.log('configure dot env file for running local');
    config({ path: join(`${__dirname}/`, '.env') });
  }
}
