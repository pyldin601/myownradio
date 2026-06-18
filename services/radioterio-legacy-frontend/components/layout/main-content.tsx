export function MainContent({ children }: { children: React.ReactNode }) {
  return (
    <div id="contents">
      <div id="body">{children}</div>
    </div>
  );
}
