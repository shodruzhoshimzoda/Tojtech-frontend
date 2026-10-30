import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { CartProvider } from "./cart/CartContext";
import StorefrontNav from "./components/StorefrontNav";
import StorefrontFooter from "./components/StorefrontFooter";
import AdminLayout from "./components/AdminLayout";
import RequireRole from "./components/RequireRole";

import CatalogPage from "./pages/storefront/CatalogPage";
import ProductPage from "./pages/storefront/ProductPage";
import CartPage from "./pages/storefront/CartPage";
import LoginPage from "./pages/storefront/LoginPage";
import RegisterPage from "./pages/storefront/RegisterPage";
import AdminOverviewPage from "./pages/admin/AdminOverviewPage";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage";

function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <StorefrontNav />
      <div className="flex-1">{children}</div>
      <StorefrontFooter />
    </div>
  );
}

// React Router keeps the scroll position between pages; start each page at the top.
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<StorefrontLayout><CatalogPage /></StorefrontLayout>} />
            <Route path="/products/:uuid" element={<StorefrontLayout><ProductPage /></StorefrontLayout>} />
            <Route path="/cart" element={<StorefrontLayout><CartPage /></StorefrontLayout>} />
            <Route path="/login" element={<StorefrontLayout><LoginPage /></StorefrontLayout>} />
            <Route path="/register" element={<StorefrontLayout><RegisterPage /></StorefrontLayout>} />

            <Route
              path="/admin"
              element={
                <RequireRole role="admin">
                  <AdminLayout />
                </RequireRole>
              }
            >
              <Route index element={<AdminOverviewPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
