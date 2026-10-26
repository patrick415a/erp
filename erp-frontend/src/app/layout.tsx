import ConditionalLayout from '@/components/ConditionalLayout';
import '@/assets/common/globals.scss';
import type { Metadata } from 'next';
import ReduxProvider from "@/store/provider";

export const metadata: Metadata = {
  title: { template: '%s | ERP', default: 'ERP 시스템' },
  description: '사내 ERP 시스템 입니다.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        <ReduxProvider>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </ReduxProvider>
      </body>
    </html>
  );
}