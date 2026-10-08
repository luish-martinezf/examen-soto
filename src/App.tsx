import "./App.css";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { AppShell } from "./components/layout/AppShell";
import { LoginPage } from "./features/auth/LoginPage";
import { PostFormPage } from "./features/posts/PostFormPage";
import { PostsPage } from "./features/posts/PostsPage";
import { fetchUserInfo, logout } from "./features/auth/authSlice";
import { useEffect } from "react";
import PDFViewer from "./features/docs/PDFViewer";

function ProtectedRoute() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const token = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    const validateSession = async () => {
      // If no token, redirect to login
      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      // If user already in state, session is valid - render outlet
      if (user) {
        return;
      }

      // Otherwise, fetch user info from /auth/me to validate token
      // This reuses the existing fetchUserInfo thunk logic
      const result = await dispatch(fetchUserInfo());

      // If fetchUserInfo was fulfilled, user is now in state
      if (result.type === fetchUserInfo.fulfilled.type) {
        return;
      }

      // If fetchUserInfo rejected, token is invalid - clear session
      localStorage.removeItem("examen-soto-token");
      dispatch(logout());
      navigate("/login?expired=true", { replace: true });
    };

    validateSession();
  }, [token, user, dispatch, navigate]);

  // If still no token or user, redirect to login
  if (!useAppSelector((state) => state.auth.token)) {
    return <Navigate to="/login" replace />;
  }

  // User validated - render protected content
  return <Outlet />;
}

function PublicRoute() {
  const token = useAppSelector((state) => state.auth.token);

  return token ? <Navigate to="/posts" replace /> : <Outlet />;
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
            <Route path="/posts" element={<PostsPage />} />
            <Route path="/posts/new" element={<PostFormPage />} />
            <Route path="/posts/:id/edit" element={<PostFormPage />} />
            <Route path="/" element={<Navigate to="/posts" replace />} />
          </Route>
        </Route>
        <Route path="/docs" element={<PDFViewer />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
