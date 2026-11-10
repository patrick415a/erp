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

const statusLabels = { planning: '생산 대기', progress: '생산 중', completed: '생산 완료' };

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [inventoryError, setInventoryError] = useState(false);

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
    { label: '등록 임직원', value: '4명' }
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
    </Layout>
  );
}
