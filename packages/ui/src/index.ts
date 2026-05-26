// Shared UI components will be exported here
// This package will contain shadcn/ui components

export const Button = ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90" {...props}>
    {children}
  </button>
);

export const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2" {...props} />
);

export const Card = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className="rounded-lg border bg-white p-4" {...props}>
    {children}
  </div>
);

export const Dialog = ({ children, open }: { children: React.ReactNode; open: boolean }) => (
  open ? <div className="fixed inset-0 bg-black/50 flex items-center justify-center">{children}</div> : null
);
