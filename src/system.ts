import axios from 'axios';
import { buildBaseUri } from './tools.js';

const baseUri = buildBaseUri(process.env.ADDRESS || '127.0.0.1:8080');

export const routes = {
  models_apply: '/models/apply',
  models_available: '/models/available',
  models_active: '/models',
  models_jobs: '/models/jobs',
  completions: 'v1/chat/completions'
}

export const connect = axios.create({ baseURL: baseUri.toString() });
