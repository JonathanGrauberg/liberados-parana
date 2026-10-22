import clsx from "clsx";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function PageTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 text-text-mute">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx("rounded-3xl bg-white p-5 shadow-[0_1px_12px_rgba(0,0,0,.04)] md:p-6", className)}>{children}</div>;
}

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={clsx("block", className)}>
      <span className="mb-1.5 block text-sm font-semibold text-text-dark">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-text-mute">{hint}</span>}
    </label>
  );
}

const inputCls =
  "h-12 w-full rounded-xl border border-black/10 bg-white px-3.5 text-[16px] outline-none transition focus:border-violet focus:ring-4 focus:ring-violet/15";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={clsx(inputCls, props.className)} />;
}
export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={clsx(inputCls, "pr-8", props.className)} />;
}
export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={clsx(inputCls, "h-auto min-h-28 py-3", props.className)} />;
}

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" | "brand" }) {
  return (
    <button
      {...props}
      className={clsx(
        "inline-flex h-12 items-center justify-center gap-2 rounded-xl px-5 text-[15px] font-semibold transition active:scale-[.98] disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" && "bg-text-dark text-white hover:bg-black",
        variant === "brand" && "bg-brand text-ink hover:brightness-110",
        variant === "ghost" && "bg-black/[.05] text-text-dark hover:bg-black/10",
        variant === "danger" && "bg-red-50 text-red-600 hover:bg-red-100",
        className,
      )}
    />
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 text-[15px] font-medium"
    >
      <span className={clsx("relative h-7 w-12 rounded-full transition", checked ? "bg-violet" : "bg-black/15")}>
        <span className={clsx("absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all", checked ? "left-[22px]" : "left-0.5")} />
      </span>
      {label}
    </button>
  );
}

export function Stat({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "warn" }) {
  return (
    <Card className={clsx(tone === "warn" && "ring-2 ring-amber-300")}>
      <p className="text-sm font-medium text-text-mute">{label}</p>
      <p className="font-display mt-1 text-2xl font-bold tracking-tight md:text-3xl">{value}</p>
      {sub && <p className="mt-0.5 text-sm text-text-mute">{sub}</p>}
    </Card>
  );
}
