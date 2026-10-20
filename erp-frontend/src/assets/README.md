# SCSS 관리 방법

스타일은 이 폴더에서 관리하고, JSX의 일반 HTML 태그에 CSS Module 클래스를 직접 적용합니다.
스타일만 적용하기 위한 `Input`, `Grid`, `AuthLayout` 등의 래퍼 컴포넌트는 만들지 않습니다.
이벤트, 상태, 데이터 처리 또는 아이콘 렌더링이 필요한 기능 컴포넌트는 `src/components`에서 관리합니다.

## 파일 위치

```text
assets/
├── common/
│   ├── globals.scss             # 전체 초기화·전역 스타일 (app/layout.tsx에서만 import)
│   ├── _tokens.scss             # 색상·크기·테마 변수
│   ├── _mixins.scss             # 공통 mixin·반응형 기준
│   ├── _fonts.scss              # 폰트 선언
│   ├── Button.module.scss       # 버튼
│   ├── FormControls.module.scss # 입력·라벨·셀렉트
│   ├── DataView.module.scss     # 제목·통계 카드·표·상태 배지
│   ├── Content.module.scss      # 공통 제목·필드 간격
│   └── Icon.module.scss         # 아이콘
├── layout/                      # 헤더·사이드바·푸터·브랜드·업무 레이아웃
├── auth/                        # 로그인·회원가입·비밀번호 찾기
├── dashboard/
│   ├── WorkPage.module.scss     # 업무 화면 공통 스타일
│   ├── calendar/               # 달력·월별 일정 목록
│   ├── mypage/                 # 마이페이지
│   └── settings/               # 기준정보
└── modal/                       # 모달·일정 편집 영역
```

## 적용 예시

```tsx
import styles from '@/assets/auth/AuthForm.module.scss';
import formStyles from '@/assets/common/FormControls.module.scss';
import buttonStyles from '@/assets/common/Button.module.scss';

<div className={styles.grid}>
  <div className={formStyles.field}>
    <label className={formStyles.label} htmlFor="email">이메일</label>
    <input className={formStyles.input} id="email" type="email" />
  </div>
  <button className={buttonStyles.button} type="submit" data-variant="outline">
    저장
  </button>
</div>
```

한 파일만 불러올 때는 `styles`, 여러 파일을 불러올 때는 `buttonStyles`, `formControlsStyles`처럼 구분합니다.
새 화면 전용 스타일은 해당 경로에 맞는 하위 폴더에 `화면명.module.scss`로 추가합니다.
여러 화면에서 실제로 함께 사용하는 규칙만 `common`에 둡니다.

버튼 종류·크기는 `data-variant`, `data-size`, 소셜 버튼 종류는 `data-provider`로 지정합니다.
달력·모달 등의 상태 스타일은 기존 `data-*` 선택자를 유지합니다.
`[data-closing]`처럼 속성 존재 여부로 스타일을 적용하는 경우 `data-closing={isClosing || undefined}`처럼 비활성 상태에서 속성을 제거합니다.

SCSS에서 공통 mixin을 사용할 때는 파일 위치에 맞는 상대 경로를 사용합니다.

```scss
// assets/dashboard/calendar/예시.module.scss
@use '../../common/mixins';

.card {
  @include mixins.surface;
}
```
