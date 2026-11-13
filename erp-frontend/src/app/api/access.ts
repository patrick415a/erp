import { erpApiUrl } from './baseUrl';

export const permissionGroups = [
  { label: '대시보드', icon: 'grid', entries: [['DASHBOARD_VIEW', '조회']] },
  { label: '생산관리', icon: 'production', entries: [
    ['PRODUCTION_VIEW', '조회'], ['PRODUCTION_CREATE', '등록'], ['PRODUCTION_UPDATE', '수정'], ['PRODUCTION_DELETE', '삭제'],
  ] },
  { label: '재고관리', icon: 'box', entries: [
    ['INVENTORY_VIEW', '조회'], ['INVENTORY_CREATE', '등록'], ['INVENTORY_UPDATE', '수정'], ['INVENTORY_DELETE', '삭제'],
  ] },
  { label: '인사관리', icon: 'employeeCard', entries: [
    ['HR_VIEW', '조회'], ['HR_CREATE', '등록'], ['HR_UPDATE', '수정'], ['HR_DELETE', '삭제'],
  ] },
  { label: '기준정보', icon: 'settings', entries: [
    ['SETTINGS_VIEW', '조회'], ['SETTINGS_CREATE', '등록'], ['SETTINGS_UPDATE', '수정'], ['SETTINGS_DELETE', '삭제'],
  ] },
  { label: '일정관리', icon: 'calendar', entries: [
    ['CALENDAR_VIEW', '조회'], ['CALENDAR_CREATE', '등록'], ['CALENDAR_UPDATE', '수정'], ['CALENDAR_DELETE', '삭제'],
  ] },
  { label: '사용자 권한 관리', icon: 'userGear', entries: [
    ['USERS_VIEW', '조회'], ['USERS_UPDATE', '권한 변경'],
  ] },
  { label: '시스템 환경설정', icon: 'settings', entries: [['SYSTEM_SETTINGS_VIEW', '조회'], ['SYSTEM_SETTINGS_UPDATE', '수정']] },
] as const;

export type Permission = (typeof permissionGroups)[number]['entries'][number][0];
export type MemberRole = 'SYSTEM_ADMIN' | 'PRODUCTION_MANAGER' | 'EMPLOYEE';

export interface CurrentAccess {
  role: MemberRole | null;
  permissions: Permission[];
}

export const roles = {
  SYSTEM_ADMIN: { label: '시스템 관리자', tone: 'primary', icon: 'lock' },
  PRODUCTION_MANAGER: { label: '생산 관리자', tone: 'warning', icon: 'production' },
  EMPLOYEE: { label: '일반 임직원', tone: 'secondary', icon: 'users' },
} as const;

export const menuPermissions: Readonly<Record<string, Permission>> = {
  '/dashboard': 'DASHBOARD_VIEW',
  '/dashboard/production': 'PRODUCTION_VIEW',
  '/dashboard/inventory': 'INVENTORY_VIEW',
  '/dashboard/hr': 'HR_VIEW',
  '/dashboard/settings': 'SETTINGS_VIEW',
  '/dashboard/calendar': 'CALENDAR_VIEW',
  '/users': 'USERS_VIEW',
  '/settings': 'SYSTEM_SETTINGS_VIEW',
};

export function firstAvailableMenu(access: CurrentAccess) {
  return Object.keys(menuPermissions).find((href) => access.permissions.includes(menuPermissions[href]))
    ?? '/dashboard/mypage';
}

export function erpRequest(path: string, signal?: AbortSignal, token = localStorage.getItem('token')) {
  return {
    url: erpApiUrl(path),
    headers: { Authorization: token ? `Bearer ${token}` : undefined },
    signal,
  };
}
