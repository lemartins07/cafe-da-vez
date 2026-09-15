import type { ReactNode } from 'react';

type ElementProps = { children: ReactNode; className?: string };

export function Table({ children, className = '' }: ElementProps) {
  return <table className={`min-w-full ${className}`}>{children}</table>;
}

export function TableHeader({ children, className }: ElementProps) {
  return <thead className={className}>{children}</thead>;
}

export function TableBody({ children, className }: ElementProps) {
  return <tbody className={className}>{children}</tbody>;
}

export function TableRow({ children, className }: ElementProps) {
  return <tr className={className}>{children}</tr>;
}

export function TableCell({
  children,
  className = '',
  isHeader = false,
}: ElementProps & { isHeader?: boolean }) {
  const Cell = isHeader ? 'th' : 'td';
  return <Cell className={className}>{children}</Cell>;
}
