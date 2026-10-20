import { CalendarDotsIcon } from '@phosphor-icons/react/dist/ssr/CalendarDots';
import { CaretDownIcon } from '@phosphor-icons/react/dist/ssr/CaretDown';
import { CaretLeftIcon } from '@phosphor-icons/react/dist/ssr/CaretLeft';
import { CaretRightIcon } from '@phosphor-icons/react/dist/ssr/CaretRight';
import { CaretUpIcon } from '@phosphor-icons/react/dist/ssr/CaretUp';
import { ChartBarIcon } from '@phosphor-icons/react/dist/ssr/ChartBar';
import { CheckCircleIcon } from '@phosphor-icons/react/dist/ssr/CheckCircle';
import { CubeIcon } from '@phosphor-icons/react/dist/ssr/Cube';
import { EnvelopeSimpleIcon } from '@phosphor-icons/react/dist/ssr/EnvelopeSimple';
import { GearSixIcon } from '@phosphor-icons/react/dist/ssr/GearSix';
import { HouseIcon } from '@phosphor-icons/react/dist/ssr/House';
import { ListIcon } from '@phosphor-icons/react/dist/ssr/List';
import { LockKeyIcon } from '@phosphor-icons/react/dist/ssr/LockKey';
import { QuestionIcon } from '@phosphor-icons/react/dist/ssr/Question';
import { SignOutIcon } from '@phosphor-icons/react/dist/ssr/SignOut';
import { SlidersHorizontalIcon } from '@phosphor-icons/react/dist/ssr/SlidersHorizontal';
import { SquaresFourIcon } from '@phosphor-icons/react/dist/ssr/SquaresFour';
import { StackIcon } from '@phosphor-icons/react/dist/ssr/Stack';
import { UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';
import { WalletIcon } from '@phosphor-icons/react/dist/ssr/Wallet';
import { WarningCircleIcon } from '@phosphor-icons/react/dist/ssr/WarningCircle';
import { XIcon } from '@phosphor-icons/react/dist/ssr/X';
import type { Icon as PhosphorIcon } from '@phosphor-icons/react';
import type { CSSProperties } from 'react';
import styles from './Icon.module.scss';

// 무료 Phosphor 아이콘입니다. 필요한 아이콘 파일만 가져와 전체 라이브러리 로딩을 피합니다.
// 옅은 duotone 배경 위에 light 외곽선을 겹칩니다. 모양과 배경은 유지하면서 선만 가볍게 표현합니다.
const icons = {
  grid: SquaresFourIcon,
  production: GearSixIcon,
  box: CubeIcon,
  boxes: StackIcon,
  users: UsersIcon,
  settings: SlidersHorizontalIcon,
  calendar: CalendarDotsIcon,
  chevron: CaretRightIcon,
  left: CaretLeftIcon,
  right: CaretRightIcon,
  up: CaretUpIcon,
  down: CaretDownIcon,
  home: HouseIcon,
  logout: SignOutIcon,
  help: QuestionIcon,
  lock: LockKeyIcon,
  mail: EnvelopeSimpleIcon,
  menu: ListIcon,
  close: XIcon,
  chart: ChartBarIcon,
  check: CheckCircleIcon,
  warning: WarningCircleIcon,
  wallet: WalletIcon,
} satisfies Record<string, PhosphorIcon>;

const simpleIcons = new Set<keyof typeof icons>(['chevron', 'left', 'right', 'up', 'down', 'menu', 'close', 'logout']);

export type IconName = keyof typeof icons;
export function Icon({ name, size = 18, style }: { name: IconName; size?: number; style?: CSSProperties; }) {
  const Symbol = icons[name];
  return(
    <span aria-hidden="true" className={styles.icon} style={{ width: size, height: size, ...style }}>
      {!simpleIcons.has(name) && <Symbol size={size} weight="duotone" className={styles.tone} focusable="false" />}
      <Symbol size={size} weight="light" className={styles.line} focusable="false" />
    </span>
  );
}
