import type { Metadata } from "next";
import "./globals.css";
import { CatalogProvider } from "./context/CatalogContext";
import { StoreProvider } from "./context/StoreContext";
import CartDrawer from "./components/CartDrawer";

export const metadata: Metadata = {
  title: "Vortex Import EC",
  description: "Productos para cocina y hogar con envíos a todo Ecuador.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <CatalogProvider>
          <StoreProvider>
            {children}
            <CartDrawer />
          </StoreProvider>
        </CatalogProvider>
      </body>
    </html>
  );
}
