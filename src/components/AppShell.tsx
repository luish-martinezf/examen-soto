import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { logout } from "../features/auth/authSlice";

export function AppShell() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  function handleLogout() {
    dispatch(logout());
    navigate("/login", { replace: true });
  }

  return (
    <>
      <header className="topbar">
        <NavLink className="brand" to="/posts" aria-label="Editorial, inicio">
          <span className="brand-mark">E</span>
          <span>Editorial</span>
        </NavLink>
        <div className="topbar-actions">
          <span className="user-greeting">{user?.firstName ?? "Editor"}</span>
          <Button
            icon="pi pi-sign-out"
            onClick={handleLogout}
            aria-label="Cerrar sesión"
          >
            Cerrar sesión
          </Button>
        </div>
      </header>
      <main className="app-content">
        <Outlet />
      </main>
    </>
  );
}
