// 달력·월별 목록·일정 모달에서 함께 사용하는 일정 데이터입니다.
export interface Schedule {
  id: string;
  date: string;
  content: string;
  status: '대기' | '진행' | '완료';
  createdAt: string;
}
