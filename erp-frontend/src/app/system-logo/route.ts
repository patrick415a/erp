import { requestAppearanceResource } from '@/app/api/appearanceServer';
import { defaultLogo } from '@/app/api/appearance';

export async function GET(request: Request) {
  try {
    const logo = await requestAppearanceResource('/api/system/logo');
    if (logo.ok && logo.headers.get('content-type') === 'image/png') {
      return new Response(logo.body, {
        headers: { 'Content-Type': 'image/png', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' },
      });
    }
  } catch {
    // Fall back to the bundled logo when the API is unavailable.
  }
  return Response.redirect(new URL(defaultLogo, request.url), 307);
}
