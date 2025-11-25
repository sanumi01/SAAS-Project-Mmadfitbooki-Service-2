import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, type = 'button', ...rest }, ref) => {
    const base = 'btn';
    const variantClass =
      variant === 'primary' ? 'btn-primary' : variant === 'secondary' ? 'btn-secondary' : 'btn-ghost';
    const sizeClass = size === 'sm' ? 'btn--sm' : size === 'lg' ? 'btn--lg' : 'btn--md';

    // Include focus-ring by default to encourage keyboard focus visibility
    const classes = [base, variantClass, sizeClass, 'focus-ring', className].filter(Boolean).join(' ');

    return (
      <button
        ref={ref}
        type={type}
        className={classes}
        aria-disabled={rest.disabled ? true : undefined}
        {...rest}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
