import Link from "next/link";

export function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-block px-2 py-1 text-sm rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 hover:text-slate-900 dark:hover:text-slate-900"
    >
      {children}
    </Link>
  );
}
