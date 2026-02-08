/**
 * 子要素に safe-area の余白を付与。layout で main に pb を入れているため、
 * 画面単位で追加の safe-area が必要なときにラップする。
 */
export default function SafeArea({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
      }}
    >
      {children}
    </div>
  );
}
