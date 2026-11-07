import Link from 'next/link';
import { Layout } from '@/components/Layout';
import dataView from '@/assets/common/DataView.module.scss';
import buttons from '@/assets/common/Button.module.scss';
import styles from '@/assets/dashboard/settings/Settings.module.scss';

const sections = [
  ['대시보드', '/dashboard', '생산·재고·인사 요약과 최근 생산 오더의 진행률을 확인합니다.'],
  [
    '생산관리',
    '/dashboard/production',
    '생산 오더를 등록하고, 상세보기에서 진행률·납기일을 수정하거나 오더를 삭제합니다.',
  ],
  [
    '재고관리',
    '/dashboard/inventory',
    '품목명이나 코드로 검색하고 재고 품목을 등록·수정·삭제합니다.',
  ],
  ['인사관리', '/dashboard/hr', '직원의 부서, 직급, 재직 상태를 확인합니다.'],
  [
    '일정관리',
    '/dashboard/calendar',
    '날짜를 눌러 일정을 등록합니다. 시간을 지정하면 ERP가 열려 있을 때 알림을 받을 수 있습니다.',
  ],
  [
    '마이페이지',
    '/dashboard/mypage',
    '비밀번호를 변경하고, 현재 브라우저에 저장된 일정을 확인합니다.',
  ],
  [
    '기준정보',
    '/dashboard/settings',
    '회사 정보, 품목 마스터, 역할별 권한을 화면에서 검토합니다. 변경 내용은 서버에 저장되지 않습니다.',
  ],
];

export default function ManualPage() {
  return (
    <Layout>
      <header className={dataView.pageHeader}>
        <div>
          <h1>사용자 매뉴얼</h1>
          <p>Smart ERP에서 자주 하는 업무를 안내합니다.</p>
        </div>
      </header>
      <article className={styles.mainPanel}>
        <h3>업무 화면 사용법</h3>
        {sections.map(([title, href, description]) => (
          <section className={styles.formGroup} key={href}>
            <h4>
              <Link className={buttons.button} data-variant="outline" data-size="small" href={href}>
                {title}
              </Link>
            </h4>
            <p>{description}</p>
          </section>
        ))}
      </article>
    </Layout>
  );
}
