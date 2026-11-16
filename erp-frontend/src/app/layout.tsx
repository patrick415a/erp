import ConditionalLayout from '@/components/ConditionalLayout';
import '@/assets/common/globals.scss';
import type { Metadata } from 'next';
import ReduxProvider from "@/store/provider";
import { defaultAppearance, emptyFavicon } from '@/app/api/appearance';
import { AppearanceProvider } from '@/store/appearance';

export const metadata: Metadata = {
  title: '',
  description: '사내 ERP 시스템입니다.',
  icons: { icon: emptyFavicon },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" data-theme={defaultAppearance.defaultTheme.toLowerCase()} suppressHydrationWarning>
      <body>
        <AppearanceProvider>
          <ReduxProvider>
            <ConditionalLayout>{children}</ConditionalLayout>
          </ReduxProvider>
        </AppearanceProvider>
      </body>
    </html>
  );
}
