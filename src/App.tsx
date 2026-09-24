import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import StorefrontNav from "./components/StorefrontNav";
import AdminLayout from "./components/AdminLayout";
import RequireRole from "./components/RequireRole";

import CatalogPage from "./pages/storefront/CatalogPage";
import ProductPage from "./pages/storefront/ProductPage";
import LoginPage from "./pages/storefront/LoginPage";
import RegisterPage from "./pages/storefront/RegisterPage";
import AdminOverviewPage from "./pages/admin/AdminOverviewPage";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage";

function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper">
      <StorefrontNav />
      {children}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<StorefrontLayout><CatalogPage /></StorefrontLayout>} />
          <Route path="/products/:uuid" element={<StorefrontLayout><ProductPage /></StorefrontLayout>} />
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
      </AuthProvider>
    </BrowserRouter>
  );
}
