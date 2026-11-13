import axios from 'axios';
import { erpRequest, type CurrentAccess } from './access';

export const erpClient = axios.create();

erpClient.interceptors.request.use((config) => {
  const { url, headers } = erpRequest(config.url ?? '');
  config.url = url;
  config.headers.set('Authorization', headers.Authorization);
  return config;
});

export async function requestCurrentAccess(token: string, signal?: AbortSignal) {
  const { url, ...config } = erpRequest('/api/access', signal, token);
  const { data } = await axios.get<CurrentAccess>(url, { ...config, timeout: 5000 });
  return data;
}
