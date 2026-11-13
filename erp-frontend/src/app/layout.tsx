import ConditionalLayout from '@/components/ConditionalLayout';
import '@/assets/common/globals.scss';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import ReduxProvider from "@/store/provider";
import { loadAppearance } from '@/app/api/appearanceServer';
import { isTheme, logoUrl, themeCookie } from '@/app/api/appearance';
import { AppearanceProvider } from '@/store/appearance';

export async function generateMetadata(): Promise<Metadata> {
  const appearance = await loadAppearance();
  return {
    title: { template: `%s | ${appearance.name}`, default: appearance.name },
    description: '사내 ERP 시스템입니다.',
    icons: { icon: logoUrl(appearance) },
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [appearance, cookieStore] = await Promise.all([loadAppearance(), cookies()]);
  const cookie = cookieStore.get(themeCookie)?.value;
  const savedTheme = isTheme(cookie) ? cookie : null;
  return (
    <html lang="ko" data-theme={(savedTheme ?? appearance.defaultTheme).toLowerCase()} suppressHydrationWarning>
      <body>
        <AppearanceProvider initial={appearance} savedTheme={savedTheme}>
          <ReduxProvider>
            <ConditionalLayout>{children}</ConditionalLayout>
          </ReduxProvider>
        </AppearanceProvider>
      </body>
    </html>
  );
}
