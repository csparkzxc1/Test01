export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none">
      {children}
    </article>
  );
}
