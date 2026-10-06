import "./App.css";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import { useAppSelector } from "./app/hooks";
import { AppShell } from "./components/AppShell";
import { LoginPage } from "./features/auth/LoginPage";

function ProtectedRoute() {
  const token = useAppSelector((state) => state.auth.token);

  return token ? <Outlet /> : <Navigate to="/login" replace />;
}

function PublicRoute() {
  const token = useAppSelector((state) => state.auth.token);

  return token ? <Navigate to="/posts" replace /> : <Outlet />;
}

function PostsPlaceholder() {
  return (
    <section className="page-placeholder">
      <p className="eyebrow">Workspace</p>
      <h1>Publicaciones</h1>
      <p>La biblioteca editorial estará lista en la siguiente fase.</p>
    </section>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/posts" element={<PostsPlaceholder />} />
            <Route path="/" element={<Navigate to="/posts" replace />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
