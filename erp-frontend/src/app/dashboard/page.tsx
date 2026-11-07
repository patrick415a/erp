import Link from 'next/link';
import { Layout } from '@/components/Layout';
import dataView from '@/assets/common/DataView.module.scss';
import buttons from '@/assets/common/Button.module.scss';
import view from '@/assets/dashboard/WorkPage.module.scss';
import content from '@/assets/common/Content.module.scss';

interface Order {
  id: string;
  productName: string;
  quantity: number;
  dueDate: string;
  progress: number;
  status: 'planning' | 'progress' | 'completed';
}

const orders: Order[] = [
  {
    id: 'PRD-2026-001',
    productName: '알루미늄 프레임 A형',
    quantity: 500,
    status: 'progress',
    progress: 65,
    dueDate: '2026-11-20',
  },
  {
    id: 'PRD-2026-002',
    productName: '공업용 모터 250W',
    quantity: 120,
    status: 'planning',
    progress: 0,
    dueDate: '2026-11-25',
  },
  {
    id: 'PRD-2026-003',
    productName: '제어용 메인보드 v2',
    quantity: 300,
    status: 'completed',
    progress: 100,
    dueDate: '2026-11-15',
  },
];
const statusLabels = { planning: '생산 대기', progress: '생산 중', completed: '생산 완료' };
const completedOrders = orders.filter((order) => order.status === 'completed').length;
const metrics = [
  { label: '미완료 오더', value: orders.length - completedOrders + '건' },
  { label: '재고 부족 품목', value: '2건' },
  { label: '등록 임직원', value: '4명' },
];
const systems = ['Next.js 프론트엔드', 'Spring Boot API', 'Oracle DB'];

export default function DashboardPage() {
  return (
    <Layout>
      <header className={dataView.pageHeader}>
        <div>
          <h1>대시보드</h1>
          <p>생산 오더, 재고, 인사 현황을 확인합니다.</p>
        </div>
      </header>
      <div className={dataView.statsGrid}>
        {metrics.map(({ label, value }) => (
          <section key={label} className={dataView.statCard}>
            <span className={dataView.statLabel}>{label}</span>
            <strong className={dataView.statValue}>{value}</strong>
          </section>
        ))}
      </div>
      <section className={dataView.panel}>
        <header className={dataView.panelHeader}>
          <div>
            <h2>최근 생산 오더</h2>
            <p>생산 완료 {completedOrders}건</p>
          </div>
          <Link
            href="/dashboard/production"
            className={buttons.button}
            data-variant="outline"
            data-size="small"
          >
            전체 오더 보기
          </Link>
        </header>
        <div className={dataView.tableScroller}>
          <table className={dataView.table}>
            <thead>
              <tr>
                <th>오더 번호</th>
                <th>제품명</th>
                <th className={view.number}>수량</th>
                <th>상태</th>
                <th className={view.progressCell}>진행률</th>
                <th>납기일</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <strong>{order.id}</strong>
                  </td>
                  <td>{order.productName}</td>
                  <td className={view.number}>{order.quantity.toLocaleString()}개</td>
                  <td>
                    <span
                      className={dataView.badge}
                      data-tone={
                        order.status === 'completed'
                          ? 'success'
                          : order.status === 'progress'
                            ? 'primary'
                            : 'secondary'
                      }
                    >
                      {statusLabels[order.status]}
                    </span>
                  </td>
                  <td>
                    <div className={view.progress}>
                      <span>{order.progress}%</span>
                      <progress
                        className={view.progressBar}
                        value={order.progress}
                        max={100}
                        data-completed={order.status === 'completed' || undefined}
                        aria-label={order.id + ' 진행률'}
                      />
                    </div>
                  </td>
                  <td>{order.dueDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <div className={content.fieldSpacing}>
        <section className={dataView.panel}>
          <header className={dataView.panelHeader}>
            <h2>시스템 구성</h2>
          </header>
          <div className={dataView.panelHeader}>
            {systems.map((name) => (
              <span key={name}>{name}</span>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}
