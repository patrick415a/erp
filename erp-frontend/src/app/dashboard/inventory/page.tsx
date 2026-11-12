import { Layout } from '@/components/Layout';
import { InventoryItems } from '@/components/inventory/InventoryItems';
import styles from '@/assets/dashboard/WorkPage.module.scss';

export default function InventoryPage() {
  return (
    <Layout>
      <div className={styles.page}>
        <InventoryItems variant="inventory" />
      </div>
    </Layout>
  );
}
