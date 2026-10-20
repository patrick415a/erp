import type { ComponentProps, CSSProperties } from 'react';
import styles from './Button.module.scss';
import { Icon } from './Icon';

type ButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'danger' | 'outline' | 'ghost' | 'kakao' | 'white' | 'gray';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  width?: string;
};

// 클릭 처리와 type을 그대로 전달하는, 디자인 전용 공통 버튼입니다.
export function Button({ variant = 'primary', size = 'medium', fullWidth, width, className = '', style, ...props }: ButtonProps) {
  return (
    <button 
      {...props} 
      data-variant={variant} 
      data-size={size} 
      data-full-width={fullWidth || undefined}
      className={`${styles.button} ${className}`} 
      style={{ ...(width ? { width } : {}), ...style } as CSSProperties} 
    />
  );
}

export function SocialButton({ provider, className = '', ...props }: ComponentProps<'button'> & { provider: 'google' | 'kakao'; }) {
  return (
    <button 
      {...props} 
      data-provider={provider} 
      className={`${styles.socialButton} ${className}`} 
    />);
}

export function CloseButton({ className = '', ...props }: ComponentProps<'button'>) {
  return (
    <button aria-label="닫기" {...props} className={`${styles.closeButton} ${className}`}>
      <Icon name="close" size={18} />
    </button>
  );
}

export function BtnCenterWrap({ className = '', ...props }: ComponentProps<'div'>) {
  return (
    <div {...props} className={`${styles.buttonCenter} ${className}`} />
  );
}

export function BtnWrap({ className = '', ...props }: ComponentProps<'div'>) {
  return (
    <div {...props} className={`${styles.buttonLeft} ${className}`} />
  );
}