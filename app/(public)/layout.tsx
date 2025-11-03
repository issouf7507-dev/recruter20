import Header from "@/app/components/publicc/Header";
import Footer from "@/app/components/publicc/Footer";
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
        <div className="bg-[#ffffff] text-black">{children}</div>
      </LenisProvider>
      <Footer />
    </>
  );
}
