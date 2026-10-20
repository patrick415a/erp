import type { ReactNode } from 'react';
// 업무 레이아웃은 각 페이지의 Layout이 담당합니다. 기존 URL 구조를 그대로 사용합니다.
export default function ConditionalLayout({ children }: { children: ReactNode; }) { 
  return (
    <>
      {children}
    </>
  ); 
}
