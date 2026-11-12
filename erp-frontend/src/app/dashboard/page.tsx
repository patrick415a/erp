"use client";
import Link from 'next/link';
import { Layout } from '@/components/Layout';
import dataView from '@/assets/common/DataView.module.scss';
import buttons from '@/assets/common/Button.module.scss';
import view from '@/assets/dashboard/WorkPage.module.scss';
import styles from '@/assets/dashboard/Dashboard.module.scss';
import { Icon } from '@/components/ui/Icon';
import { Pagination } from '@/components/ui/Pagination';
import axios from 'axios';
import { useEffect, useState, type ReactNode } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface Order {
  id: string;
  productName: string;
  quantity: number;
  dueDate: string;
  progress: number;
  status: 'planning' | 'progress' | 'completed';
}

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  unitPrice: number;
  status: 'normal' | 'low' | 'out';
}

interface Employee {
  id: string;
  name: string;
  department: string;
  role: string;
  status: 'active' | 'leave' | 'resigned';
  joinDate: string;
}

const statusLabels = { planning: '생산 대기', progress: '생산 중', completed: '생산 완료' };

const ordersPerPage = 5;
const productionOrderId = /^PRD-\d{4}-\d+$/;
const orderIdCollator = new Intl.Collator('en', { numeric: true });

function compareRecentOrders(left: Order, right: Order) {
  const leftHasSequence = productionOrderId.test(left.id);
  const rightHasSequence = productionOrderId.test(right.id);

  if (leftHasSequence !== rightHasSequence) return leftHasSequence ? -1 : 1;
  if (!leftHasSequence) return 0;
  return orderIdCollator.compare(right.id, left.id);
}

const chartTick = { fill: 'var(--chart-label)', fontSize: 12 };
const inventoryStatuses = [
  { status: 'normal', name: '정상', color: 'var(--stock-normal)' },
  { status: 'low', name: '재고 부족', color: 'var(--stock-low)' },
  { status: 'out', name: '품절', color: 'var(--stock-out)' },
];

function getDataMessage(label: string, loading: boolean, error: boolean, count: number, emptyMessage: string) {
  if (loading) return label + ' 목록을 불러오는 중입니다.';
  if (error) return label + ' 목록을 불러오지 못했습니다.';
  return count === 0 ? emptyMessage : null;
}

function ChartPanel({ title, description, message, error, children }: {
  title: string;
  description: string;
  message: string | null;
  error: boolean;
  children: ReactNode;
}) {
  return (
    <section className={dataView.panel}>
      <header className={`${dataView.panelHeader} ${styles.panelHeader}`}>
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </header>
      <div className={styles.chartBody}>
        {message ? (
          <div className={styles.chartState} data-error={error || undefined} role="status">
            <span className={styles.stateIcon}><Icon name={error ? 'warning' : 'chart'} size={21} /></span>
            <p>{message}</p>
          </div>
        ) : children}
      </div>
    </section>
  );
}

export default function DashboardPage() {
  const [currentOrderPage, setCurrentOrderPage] = useState(1);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [inventoryError, setInventoryError] = useState(false);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeLoading, setEmployeeLoading] = useState(true);
  const [employeeError, setEmployeeError] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get<Order[]>('http://127.0.0.1:8080/api/production/orders');

        setOrders([...response.data].sort(compareRecentOrders));
      } catch (error) {
        console.error('생산 오더 조회 실패: ', error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await axios.get<InventoryItem[]>('http://127.0.0.1:8080/api/inventory/items');

        setItems(response.data);
      } catch (error) {
        console.error('재고 조회 실패: ', error);
        setInventoryError(true);
      } finally {
        setInventoryLoading(false);
      }
    };

    fetchInventory();
  }, []);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get<Employee[]>('http://127.0.0.1:8080/api/hr/employees');

        setEmployees(response.data);
      } catch (error) {
        console.error('임직원 조회 실패: ', error);
        setEmployeeError(true);
      } finally {
        setEmployeeLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const completedOrders = orders.filter((order) => order.status === 'completed').length;

  const metrics = [
    {
      href: '/dashboard/production', area: 'production', icon: 'production', label: '미완료 오더',
      value: orders.length - completedOrders, unit: '건', loading: isLoading, error: isError,
    },
    {
      href: '/dashboard/inventory', area: 'inventory', icon: 'box', label: '재고 부족 품목',
      value: items.filter((item) => item.status !== 'normal').length, unit: '건',
      loading: inventoryLoading, error: inventoryError,
    },
    {
      href: '/dashboard/hr', area: 'hr', icon: 'users', label: '등록 임직원',
      value: employees.length, unit: '명', loading: employeeLoading, error: employeeError,
    },
  ] as const;

  const productionChartData = [
    { name: '대기', count: orders.filter((order) => order.status === 'planning').length },
    { name: '진행', count: orders.filter((order) => order.status === 'progress').length },
    { name: '완료', count: completedOrders },
  ];

  const inventoryChartData = inventoryStatuses.map((entry) => ({
    ...entry,
    value: items.filter((item) => item.status === entry.status).length,
  }));

  const employeeChartData = [
    { name: '재직', count: employees.filter((employee) => employee.status === 'active').length },
    { name: '휴직', count: employees.filter((employee) => employee.status === 'leave').length },
    { name: '퇴사', count: employees.filter((employee) => employee.status === 'resigned').length },
  ];

  const orderMessage = getDataMessage('생산 오더', isLoading, isError, orders.length, '등록된 생산 오더가 없습니다.');
  const inventoryMessage = getDataMessage('재고', inventoryLoading, inventoryError, items.length, '등록된 재고가 없습니다.');
  const employeeMessage = getDataMessage('임직원', employeeLoading, employeeError, employees.length, '등록된 임직원이 없습니다.');
  const totalOrderPages = Math.max(1, Math.ceil(orders.length / ordersPerPage));
  const orderPage = Math.min(currentOrderPage, totalOrderPages);
  const visibleOrders = orders.slice((orderPage - 1) * ordersPerPage, orderPage * ordersPerPage);

  return (
    <Layout>
      <header className={dataView.pageHeader}>
        <div>
          <h1>대시보드</h1>
          <p>생산 오더, 재고, 인사 현황을 확인합니다.</p>
        </div>
      </header>

      <div className={styles.metrics}>
        {metrics.map(({ href, area, icon, label, value, unit, loading, error }) => (
          <Link key={area} href={href} className={styles.metricCard} data-area={area}>
            <span className={styles.metricIcon}><Icon name={icon} size={22} /></span>
            <span>
              <span className={styles.metricLabel}>{label}</span>
              <strong className={styles.metricValue} data-status={loading || error || undefined}>
                {loading ? '조회 중' : error ? '조회 실패' : (
                  <>{value.toLocaleString()}<span className={styles.metricUnit}>{unit}</span></>
                )}
              </strong>
            </span>
            <span className={styles.metricArrow}><Icon name="chevron" size={15} /></span>
          </Link>
        ))}
      </div>

      <div className={styles.chartGrid}>
        <ChartPanel title="생산 오더 현황" description="생산 상태별 오더 수" message={orderMessage} error={isError}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={productionChartData}>
              <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={chartTick} tickMargin={8} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={chartTick} width={36} />
              <Tooltip cursor={{ fill: 'var(--background)' }} />
              <Bar dataKey="count" name="오더 수" fill="var(--chart-blue)" maxBarSize={36} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="재고 현황" description="재고 상태별 품목 비율" message={inventoryMessage} error={inventoryError}>
          <div className={styles.inventoryChart}>
            <div className={styles.donut}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={inventoryChartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="68%"
                    outerRadius="95%"
                    startAngle={90}
                    endAngle={-270}
                    stroke="var(--surface)"
                    strokeWidth={2}
                  >
                    {inventoryChartData.map((entry) => (
                      <Cell key={entry.status} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className={styles.donutTotal}>
                <strong>{items.length.toLocaleString()}</strong>
                <span>전체 품목</span>
              </div>
            </div>
            <dl className={styles.legend}>
              {inventoryChartData.map(({ name, value, status }) => (
                <div key={status}>
                  <dt data-status={status}>{name}</dt>
                  <dd>{value.toLocaleString()}</dd>
                </div>
              ))}
            </dl>
          </div>
        </ChartPanel>

        <ChartPanel title="인사 현황" description="재직 상태별 임직원 수" message={employeeMessage} error={employeeError}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={employeeChartData} layout="vertical" margin={{ right: 12 }}>
              <CartesianGrid horizontal={false} stroke="var(--chart-grid)" />
              <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} tick={chartTick} tickMargin={8} />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={chartTick} width={36} />
              <Tooltip cursor={{ fill: 'var(--background)' }} />
              <Bar dataKey="count" name="임직원 수" fill="var(--chart-teal)" maxBarSize={22} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>

      <section className={dataView.panel}>
        <header className={`${dataView.panelHeader} ${styles.panelHeader}`}>
          <div>
            <h2>최근 생산 오더</h2>
            {!isLoading && !isError && <p>전체 {orders.length.toLocaleString()}건 · 완료 {completedOrders.toLocaleString()}건</p>}
          </div>
          <Link href="/dashboard/production" className={buttons.button} data-variant="outline" data-size="small">
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
              {orderMessage ? (
                <tr>
                  <td colSpan={6} className={dataView.tableMessage}>
                    <p role="status">{orderMessage}</p>
                  </td>
                </tr>
              ) : visibleOrders.map((order) => (
                <tr key={order.id}>
                  <td><strong>{order.id}</strong></td>
                  <td>{order.productName}</td>
                  <td className={view.number}>{order.quantity.toLocaleString()}개</td>
                  <td>
                    <span className={dataView.badge} data-tone={order.status === 'completed' ? 'success' : order.status === 'progress' ? 'primary' : 'secondary'}>
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
        {!orderMessage && (
          <Pagination currentPage={orderPage} totalPages={totalOrderPages} onPageChange={setCurrentOrderPage} label="최근 생산 오더 페이지" />
        )}
      </section>
    </Layout>
  );
}
