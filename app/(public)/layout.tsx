import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import { LenisProvider } from "../providers/LenisProvider";
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <LenisProvider>
        <div style={{ background: "var(--y-bg)", color: "var(--y-ink)" }}>
          {children}
        </div>
      </LenisProvider>
      <Footer />
    </>
  );
}
