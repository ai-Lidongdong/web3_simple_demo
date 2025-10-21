// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">  {/* 必须包含 <html> 标签 */}
      <body>{children}</body>  {/* 必须包含 <body> 标签 */}
    </html>
  );
}