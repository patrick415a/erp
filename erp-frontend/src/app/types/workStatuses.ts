export const productionStatuses = {
  progress: { label: '생산중', chartLabel: '진행', tone: 'primary' },
  planning: { label: '생산대기', chartLabel: '대기', tone: 'secondary' },
  completed: { label: '생산완료', chartLabel: '완료', tone: 'success' },
} as const;

export const employeeStatuses = {
  active: { label: '재직중', chartLabel: '재직', tone: 'success' },
  leave: { label: '휴직', chartLabel: '휴직', tone: 'warning' },
  resigned: { label: '퇴사', chartLabel: '퇴사', tone: 'danger' },
} as const;
