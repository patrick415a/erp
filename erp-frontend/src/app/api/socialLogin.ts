import axios from 'axios';
import { memberApiUrl } from './members';

export type SocialProvider = 'google' | 'kakao';

const verifierKey = 'erp.oauthVerifier';

export async function redirectForSocialLogin(provider: SocialProvider) {
  const { data } = await axios.post<{ authorizationUrl: string; verifier: string }>(
    `${memberApiUrl()}/oauth/${provider}/authorize`,
    null,
    { timeout: 90000 },
  );
  if (!data.authorizationUrl || !data.verifier) throw new Error('Missing login settings');
  window.sessionStorage.setItem(verifierKey, data.verifier);
  window.location.assign(data.authorizationUrl);
}

export function takeSocialLoginVerifier() {
  try {
    const verifier = window.sessionStorage.getItem(verifierKey);
    window.sessionStorage.removeItem(verifierKey);
    return verifier;
  } catch {
    return null;
  }
}
