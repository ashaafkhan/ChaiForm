import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'primary', size = 'md', className = '', ...props }, ref) => {
    let baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
    
    let variantStyles = 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500';
    if (variant === 'secondary') variantStyles = 'bg-slate-200 text-slate-800 hover:bg-slate-300 focus:ring-slate-400';
    else if (variant === 'outline') variantStyles = 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-blue-500';
    else if (variant === 'ghost') variantStyles = 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-400';
    else if (variant === 'destructive') variantStyles = 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500';

    let sizeStyles = 'px-4 py-2 text-sm';
    if (size === 'sm') sizeStyles = 'px-3 py-1.5 text-xs';
    else if (size === 'lg') sizeStyles = 'px-5 py-2.5 text-base';

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${className}`}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`rounded-xl border border-slate-200 bg-white shadow-sm p-5 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

export interface DialogProps {
  children: React.ReactNode;
  open: boolean;
  onClose?: () => void;
}

export const Dialog: React.FC<DialogProps> = ({ children, open, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-200">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
          >
            ✕
          </button>
        )}
        {children}
      </div>
    </div>
  );
};

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={`text-sm font-semibold text-slate-700 ${className}`}
        {...props}
      >
        {children}
      </label>
    );
  }
);
Label.displayName = 'Label';

export interface SwitchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onCheckedChange, className = '', ...props }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        checked ? 'bg-blue-600' : 'bg-slate-200'
      } ${className}`}
      {...props}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
};

export interface TabsProps {
  defaultValue: string;
  className?: string;
  children: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({ defaultValue, className = '', children }) => {
  const [activeTab, setActiveTab] = React.useState(defaultValue);
  return (
    <div className={className}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { activeTab, setActiveTab });
        }
        return child;
      })}
    </div>
  );
};

export interface TabsListProps {
  className?: string;
  children: React.ReactNode;
  activeTab?: string;
  setActiveTab?: (value: string) => void;
}

export const TabsList: React.FC<TabsListProps> = ({ className = '', children, activeTab, setActiveTab }) => {
  return (
    <div className={`flex space-x-1 rounded-lg bg-slate-100 p-1 ${className}`}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { activeTab, setActiveTab });
        }
        return child;
      })}
    </div>
  );
};

export interface TabsTriggerProps {
  value: string;
  className?: string;
  children: React.ReactNode;
  activeTab?: string;
  setActiveTab?: (value: string) => void;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, className = '', children, activeTab, setActiveTab }) => {
  const isActive = activeTab === value;
  return (
    <button
      type="button"
      onClick={() => setActiveTab?.(value)}
      className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-all ${
        isActive ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
      } ${className}`}
    >
      {children}
    </button>
  );
};

export interface TabsContentProps {
  value: string;
  className?: string;
  children: React.ReactNode;
  activeTab?: string;
}

export const TabsContent: React.FC<TabsContentProps> = ({ value, className = '', children, activeTab }) => {
  if (activeTab !== value) return null;
  return <div className={`mt-2 ${className}`}>{children}</div>;
};
