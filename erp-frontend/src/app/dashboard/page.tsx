"use client";
import Link from 'next/link';
import { Layout } from '@/components/Layout';
import dataView from '@/assets/common/DataView.module.scss';
import buttons from '@/assets/common/Button.module.scss';
import view from '@/assets/dashboard/WorkPage.module.scss';
import axios from 'axios';
import { useEffect, useState } from 'react';
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
  Legend
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

export default function DashboardPage() {
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

        setOrders(response.data);
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
      label: '미완료 오더',
      value: isLoading ? '조회 중' : isError ? '조회 실패' : `${orders.length - completedOrders}건`
    },
    {
      label: '재고 부족 품목',
      value: inventoryLoading ? '조회 중' : inventoryError ? '조회 실패' : `${items.filter((item) => item.status !== 'normal').length}건`
    },
    {
      label: '등록 임직원',
      value: employeeLoading ? '조회 중' : employeeError ? '조회 실패' : `${employees.length}명`
    }
  ];

  const productionChartData = [
    {
      status: '생산 대기',
      count: orders.filter((order) => order.status === 'planning').length
    },
    {
      status: '생산 중',
      count: orders.filter((order) => order.status === 'progress').length
    },
    {
      status: '생산 완료',
      count: orders.filter((order) => order.status === 'completed').length
    }
  ];

  const inventoryChartData = [
    {
      name: '정상',
      value: items.filter((item) => item.status === 'normal').length
    },
    {
      name: '재고 부족',
      value: items.filter((item) => item.status === 'low').length
    },
    {
      name: '품절',
      value: items.filter((item) => item.status === 'out').length
    }
  ];

  const inventoryColors = ['#22c55e', '#f59e0b', '#ef4444'];

  const employeeChartData = [
    {
      status: '재직',
      count: employees.filter((employee) => employee.status === 'active').length
    },
    {
      status: '휴직',
      count: employees.filter((employee) => employee.status === 'leave').length
    },
    {
      status: '퇴사',
      count: employees.filter((employee) => employee.status === 'resigned').length
    }
  ]

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
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: '20px' }}>
        <section className={dataView.panel}>
          <header className={dataView.panelHeader}>
            <div>
              <h2>생산 오더 현황</h2>
              <p>생산 상태별 오더 개수</p>
            </div>
          </header>

          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productionChartData}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="status"/>
                <YAxis allowDecimals={false}/>
                <Tooltip/>
                <Bar dataKey="count" name="오더 수" fill='#3b82f6' radius={[6, 6, 0, 0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className={dataView.panel}>
          <header className={dataView.panelHeader}>
            <div>
              <h2>재고 현황</h2>
              <p>재고 상태별 품목 비율</p>
            </div>
          </header>

          <div style={{ width: '100%', height: 300 }}>
            {inventoryLoading ? (
              <p>재고 데이터를 불러오는 중입니다...</p>
            ) : inventoryError ? (
              <p>재고 데이터를 불러오지 못했습니다.</p>
            ) : items.length === 0 ? (
              <p>등록된 재고가 없습니다.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={inventoryChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {inventoryChartData.map((entry, index) => (
                      <Cell key={entry.name} fill={inventoryColors[index]}/>
                    ))}
                  </Pie>
                  <Tooltip/>
                  <Legend/>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
      </div>

      <section className={dataView.panel}>
        <header className={dataView.panelHeader}>
          <div>
            <h2>인사 현황</h2>
            <p>재직 상태별 임직원 수</p>
          </div>
        </header>

        <div style={{ width: '100%', height: 300 }}>
          {employeeLoading ? (
            <p>임직원 데이터를 불러오는 중입니다...</p>
          ) : employeeError ? (
            <p>임직원 데이터를 불러오지 못했습니다.</p>
          ) : employees.length === 0 ? (
            <p>등록된 임직원이 없습니다.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={employeeChartData} layout='vertical' margin={{ top: 10, right: 30, left: 10, bottom: 10}}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis type='number' allowDecimals={false}/>
                <YAxis dataKey="status" type='category' width={50}/>
                <Tooltip/>
                <Bar dataKey="count" name="임직원 수" fill='#6366f1' radius={[0, 6, 6, 0]}/>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section className={dataView.panel}>
        <header className={dataView.panelHeader}>
          <div>
            <h2>최근 생산 오더</h2>
            <p>생산 완료 {completedOrders}건</p>
          </div>

          <Link href="/dashboard/production" className={buttons.button} data-variant="outline" data-size="small">전체 오더 보기</Link>
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
              {isLoading ? (
                <tr>
                  <td colSpan={6}>생산 오더를 불러오는 중입니다...</td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={6}>생산 오더를 불러오지 못했습니다.</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6}>등록된 생산 오더가 없습니다.</td>
                </tr>
              ) : (
                orders.slice(0, 5).map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong>{order.id}</strong>
                    </td>

                    <td>{order.productName}</td>

                    <td className={view.number}>
                      {order.quantity.toLocaleString()}개
                    </td>

                    <td>
                      <span className={dataView.badge} data-tone={order.status === 'completed' ? 'success' : order.status === 'progress' ? 'primary' : 'secondary'}>{statusLabels[order.status]}</span>
                    </td>

                    <td>
                      <div className={view.progress}>
                        <span>{order.progress}%</span>
                        <progress className={view.progressBar} value={order.progress} max={100} data-completed={order.status === 'completed' || undefined} aria-label={order.id + ' 진행률'}/>
                      </div>
                    </td>

                    <td>{order.dueDate}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </Layout>
  );
}
