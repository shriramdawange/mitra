import type { ReactNode } from "react";

type SectionCardProps = {
  id?: string;
  title: string;
  subtitle?: string;
  className?: string;
  children: ReactNode;
};

export function SectionCard({ id, title, subtitle, className, children }: SectionCardProps) {
  return (
    <section
      id={id}
      className={`rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_20px_45px_rgba(15,23,42,0.08)] backdrop-blur md:p-6 ${className ?? ""}`}
    >
      <div className="mb-4">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}
