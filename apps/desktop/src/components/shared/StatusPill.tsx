import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
}

export function StatusPill({ children, tone = 'neutral' }: Props) {
  return <span className={`status-pill status-pill--${tone}`}>{children}</span>;
}
