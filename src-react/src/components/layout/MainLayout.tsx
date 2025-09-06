import NavMenu from "./NavMenu";
import Footer from "./Footer";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <>
      <NavMenu />
      <main id="main" className="d-flex flex-column min-vh-100">
        {children}
        <Footer />
      </main>
    </>
  );
}