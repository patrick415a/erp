import axios from 'axios';
import { erpRequest, type CurrentAccess } from './access';

export const erpClient = axios.create();

erpClient.interceptors.request.use((config) => {
  const explicitToken = config.headers.get('Authorization');
  const token = typeof explicitToken === 'string' && explicitToken.startsWith('Bearer ')
    ? explicitToken.slice(7)
    : undefined;
  const { url, headers } = erpRequest(config.url ?? '', undefined, token);
  config.url = url;
  config.headers.set('Authorization', headers.Authorization);
  return config;
});

export async function requestCurrentAccess(token: string, signal?: AbortSignal) {
  const { data } = await erpClient.get<CurrentAccess>('/api/access', {
    headers: { Authorization: `Bearer ${token}` },
    signal,
    timeout: 5000,
  });
  return data;
}
