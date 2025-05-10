// components/ui/Button.jsx
import React from 'react';

export default function Button({
  children,
  variant = 'solid',    // 'solid' | 'outline'
  disabled = false,
  className = '',
  ...props
}) {
  const base = 'inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition';
  const variants = {
    solid:
      'bg-primary text-white hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed',
    outline:
      'border border-primary text-primary hover:bg-primary/10 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed'
  };
  const classes = [base, variants[variant], className].filter(Boolean).join(' ');
  return (
    <button className={classes} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
