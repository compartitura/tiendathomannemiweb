// components/ui/Button.jsx
export default function Button({
  children,
  variant = 'primary',  // 'primary' | 'secondary' | 'outline'
  className = '',
  ...props
}) {
  const base = 'font-sans px-4 py-2 rounded focus:outline-none transition';
  let colors;

  switch (variant) {
    case 'secondary':
      colors = 'bg-secondary text-white hover:bg-primary';
      break;
    case 'outline':
      colors = 'border border-primary text-primary hover:bg-primary hover:text-white';
      break;
    case 'primary':
    default:
      colors = 'bg-primary text-white hover:bg-accent';
  }

  return (
    <button
      className={`${base} ${colors} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
