# ERP 디자인 수정 안내

기존 업무 기능을 유지하면서 참고 시안의 밝은 배경, 흰색 패널, 파란 강조색, 얇은 테두리와 정돈된 간격을 반영했습니다.

## 어떤 파일을 수정하면 되나요?

아래 경로는 `E:/erp/erp-frontend` 기준입니다.

| 바꾸고 싶은 부분 | 파일 |
| --- | --- |
| 전체 색상·기본 모서리·헤더 높이·메뉴 너비 | `src/styles/_tokens.scss` |
| 기본 글꼴·페이지 배경·기본 HTML 스타일 | `src/styles/globals.scss` |
| 기존 Pretendard 폰트 파일 경로 | `src/styles/_fonts.scss` |
| 공통 카드·포커스·모바일 규칙 | `src/styles/_mixins.scss` |
| 로고 | `src/components/Brand.tsx`, `Brand.module.scss` |
| 상단 메뉴 | `src/components/Header.tsx`, `Header.module.scss` |
| 왼쪽 메뉴 | `src/components/SideBar.tsx`, `SideBar.module.scss` |
| 업무 화면 전체 배치·본문 여백 | `src/components/Layout.module.scss` |
| 로그인·회원가입 카드와 배경 | `src/components/auth/AuthLayout.module.scss` |
| 로그인·회원가입 폼의 열·간격 | `src/components/auth/AuthForm.module.scss` |
| 공통 버튼과 크기·색상 변형 | `src/components/ui/Button.tsx`, `Button.module.scss` |
| 공통 입력창·라벨·선택창 | `src/components/ui/FormControls.tsx`, `FormControls.module.scss` |
| 공통 아이콘의 종류·크기·표현 방식 | `src/components/ui/Icon.tsx` |
| 업무 화면 제목·요약 카드·표·상태 표시 | `src/components/ui/DataView.tsx`, `DataView.module.scss` |
| 일정 달력과 날짜 상태 | `src/components/ui/CalendarParts.tsx`, `CalendarParts.module.scss` |
| 알림·일정 모달 | `src/components/ui/ModalParts.tsx`, `ModalParts.module.scss` |
| 업무별 숫자 정렬·검색·진행률·비밀번호 카드 | `src/styles/WorkPage.module.scss` |
| 기준정보 내부 화면 | `src/app/dashboard/settings/Settings.module.scss` |

## 스타일을 분리한 기준

- `.tsx`는 구조와 상태·이벤트 연결, 같은 이름의 `.module.scss`는 디자인을 담당합니다.
- CSS Modules가 클래스 이름을 구분하므로 서로 다른 컴포넌트에서 같은 클래스 이름을 사용해도 충돌하지 않습니다.
- 여러 화면에서 반복되는 버튼·입력창·표·요약 카드만 공통 컴포넌트로 묶었습니다. 업무 데이터와 API 처리는 각 페이지에 있습니다.
- 색상 같은 공통 값은 `_tokens.scss`에서 정의합니다. SCSS 모듈에서는 `var(--primary)`, `var(--border)`처럼 사용합니다.
- `_mixins.scss`는 SCSS의 `@use`로 필요한 파일에서 불러옵니다. 페이지 스타일 전체를 하나의 파일에 합치지 않습니다.
- 휴대폰에서는 상단 메뉴를 접고, 왼쪽 메뉴를 숨깁니다. 넓은 표는 표 영역 안에서 가로 스크롤됩니다.

달력은 1200px보다 넓은 화면에서 왼쪽 달력·오른쪽 월별 목록으로 나뉘고, 작은 화면에서는 세로로 배치합니다. 날짜 사이는 1px 선으로 구분합니다. 이전·다음 버튼은 연·월 제목 옆의 `CalendarToolbar` 안에 배치하며 `absolute`를 사용하지 않습니다. 칸 높이·좌우 비율은 `CalendarParts.module.scss`, 제목 옆 버튼 연결은 `src/app/dashboard/calendar/page.tsx`에서 수정합니다. 오늘 날짜는 파란 원으로 표시하며 날짜 칸을 클릭하거나 Enter·Space를 누르면 기존 일정 모달이 열립니다.

월별 목록의 디자인은 `src/components/calendar/MonthlyScheduleList.module.scss`에서 수정합니다. 등록 일정은 달력·모달과 같은 상태를 사용하므로 등록·수정·삭제가 바로 반영됩니다. `src/app/api/holidays.ts`의 기존 공휴일 데이터도 함께 날짜순으로 표시합니다. 일정과 공휴일 개수는 따로 집계합니다. 기존처럼 등록 일정은 현재 페이지 메모리에만 있어 새로고침하면 초기화됩니다.

## 공통 컴포넌트 사용 예시

```tsx
import { Button } from '@/components/ui/Button';
import { FormField, Input } from '@/components/ui/FormControls';

<FormField label="이메일" htmlFor="email" required>
  <Input id="email" type="email" value={email}
    onChange={(event) => setEmail(event.target.value)} required />
</FormField>

<Button type="submit" fullWidth>로그인</Button>
<Button type="button" variant="outline" size="small" onClick={handleClose}>
  닫기
</Button>
```

`FormField`의 `required`는 라벨의 별표 표시입니다. 실제 필수 입력 검사는 `Input`의 `required`로 처리합니다. 기존 페이지의 필수 입력 여부는 유지했습니다.

버튼의 `type`은 원래 동작에 맞게 전달합니다. 기존 소셜 가입 버튼의 기본 제출 동작도 유지했습니다.

## 기능 유지 범위

- 로그인·회원가입·비밀번호 찾기·비밀번호 변경의 API 주소, 전송 데이터, 검증과 토큰 처리를 유지했습니다.
- 회원가입의 성·이름·이메일·비밀번호·성별·회사명·직급·전화번호·주소·상세주소를 유지했습니다.
- 다음 주소 검색 스크립트와 호출 처리를 유지했습니다.
- 생산 오더 조회·등록 처리와 기존 요약 숫자를 유지했습니다.
- 재고·인사의 기존 샘플 데이터와 계산식을 유지했습니다.
- 일정의 날짜 이동·공휴일 표시·등록·수정·삭제와 모달 닫기 처리를 유지했습니다.
- 기존 메뉴의 이동 경로를 유지했습니다. 연결되지 않은 메뉴나 버튼에 새 기능을 추가하지 않았습니다.
- 대시보드는 기존에 내용이 비어 있어 화면 제목만 추가했습니다.
- 백엔드 소스는 수정하지 않았습니다.

Bootstrap, React Bootstrap, Tailwind, styled-components는 패키지와 스타일 연결에서 제거했습니다. React, Next.js, Axios, Temporal 등 기능에 사용하는 의존성은 유지했습니다.

아이콘은 무료 오픈소스인 [Phosphor](https://github.com/phosphor-icons/react)의 `@phosphor-icons/react`를 사용합니다. 업무 메뉴와 요약 카드에는 옅은 `duotone` 면과 가는 `light` 외곽선을 함께 사용하고, 작은 화살표·닫기 등에는 `light`를 사용합니다. 생산관리 아이콘은 둥근 기어 모양인 `GearSixIcon`입니다. `src/components/ui/Icon.tsx`에서 교체할 수 있으며, 필요한 개별 아이콘만 직접 불러옵니다. 전체 레이아웃을 제공하는 UI 프레임워크는 추가하지 않았습니다.

아이콘은 원래 크기(메뉴·요약 카드 19px)를 유지합니다. 옅은 `duotone` 배경 위에 더 가는 `light` 외곽선을 겹쳐 선의 무게를 줄입니다. 작은 이동·닫기 표시는 `light`만 사용합니다. 표현 방식은 `Icon.tsx`, 레이어 스타일은 `Icon.module.scss`에서 수정합니다. 메뉴 행 높이는 44px로 맞춰 소수점 위치가 누적되는 것을 줄였습니다.

회원가입의 성별은 네이티브 `input type="radio"`를 유지하고, 선택 시 항목 전체에 파란 테두리·배경을 표시합니다. 가운데 정렬과 선택 스타일은 `AuthForm.module.scss`의 `.radioGroup`, `FormControls.module.scss`의 `.radioLabel`에서 수정할 수 있습니다.

회원가입 성별의 기본값은 사용자 요청에 따라 `male`(남자)로 설정했습니다. 로그인 상태 유지 체크박스의 디자인은 `AuthForm.module.scss`의 `.checkbox`에서 수정합니다. 하단 링크는 로그인 화면에서 회원가입 → 비밀번호 찾기, 회원가입 화면에서 비밀번호 찾기 → 로그인으로 돌아가기 순서입니다.

소셜 버튼은 로그인·회원가입 모두 Google과 Kakao로 통일했습니다. 기존 코드처럼 실제 소셜 인증 연동은 구현되어 있지 않습니다.

## 실행과 확인

프로젝트 폴더에서 `npm run dev`를 실행한 후 다음 화면을 확인할 수 있습니다.

- 로그인: `http://localhost:3000/`
- 회원가입: `http://localhost:3000/member`
- 재고관리: `http://localhost:3000/dashboard/inventory`
- 인사관리: `http://localhost:3000/dashboard/hr`
- 기준정보: `http://localhost:3000/dashboard/settings`
- 일정관리: `http://localhost:3000/dashboard/calendar`

`npm run build`로 전체 빌드, `node node_modules/typescript/bin/tsc --noEmit`으로 타입 검사를 할 수 있습니다.

이번 작업의 원본은 `E:/erp/.design-backup/2026-10-19`에 보관했습니다. 백업이 있는 동안 `node scripts/verify-preserved-behavior.cjs`를 실행하면 원본과 주요 이벤트 처리·API 호출·입력 속성·상태·효과를 비교할 수 있습니다. 실제 로그인·회원가입 등 서버 연동 확인은 기존 백엔드를 실행한 상태에서 진행해야 합니다.
