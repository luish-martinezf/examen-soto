import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "@primereact/ui/button";
import { InputText } from "primereact/inputtext";
import {
  InputPassword,
  type InputPasswordMaskChangeEvent,
} from "primereact/inputpassword";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { login } from "./authSlice";
import type { LoginCredentials } from "./authTypes";
import { IconField } from "primereact/iconfield";
import { useState } from "react";
import { Eye, EyeSlash, Spinner } from "@primeicons/react";

export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [mask, setMask] = useState(true);
  const { status, error } = useAppSelector((state) => state.auth);
  const isLoading = status === "loading";
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>({
    defaultValues: { username: "", password: "" },
  });

  async function onSubmit(credentials: LoginCredentials) {
    const result = await dispatch(login(credentials));

    if (login.fulfilled.match(result)) {
      navigate("/posts", { replace: true });
    }
  }

  return (
    <main className="login-page">
      <section className="login-aside" aria-label="Editorial">
        <p className="aside-kicker">Un espacio para las ideas</p>
        <div>
          <h1>Escribe lo que merece ser leído.</h1>
          <p className="aside-copy">
            Organiza, revisa y publica tus historias desde un solo lugar.
          </p>
        </div>
        <p className="aside-footer">
          Una biblioteca viva para equipos curiosos.
        </p>
      </section>

      <section className="login-panel">
        <div className="login-form-wrap">
          <p className="eyebrow">Acceso de colaboradores</p>
          <h2>Bienvenido de vuelta</h2>
          <p className="form-intro">
            Ingresa tus datos para continuar al espacio editorial.
          </p>

          <form
            className="login-form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <div className="field-group">
              <label htmlFor="username">Usuario</label>
              <InputText
                id="username"
                autoComplete="username"
                invalid={Boolean(errors.username)}
                className="!w-full !rounded-md !border-slate-300 !bg-white !px-4 !py-3 !text-[var(--ink)] shadow-sm transition focus:!border-[var(--ink)] focus:!ring-2 focus:!ring-[rgba(23,63,69,0.12)]"
                {...register("username", { required: "Ingresa tu usuario." })}
              />
              {errors.username && (
                <small className="field-error">{errors.username.message}</small>
              )}
            </div>

            <div className="field-group">
              <label htmlFor="password">Contraseña</label>
              <IconField.Root className="relative">
                <InputPassword
                  id="password"
                  autoComplete="current-password"
                  mask={mask}
                  onMaskChange={(e: InputPasswordMaskChangeEvent) =>
                    setMask(e.value)
                  }
                  invalid={Boolean(errors.password)}
                  className="!w-full !rounded-md !border-slate-300 !bg-white !px-4 !py-3 !text-[var(--ink)] shadow-sm transition focus:!border-[var(--ink)] focus:!ring-2 focus:!ring-[rgba(23,63,69,0.12)]"
                  {...register("password", {
                    required: "Ingresa tu contraseña.",
                  })}
                  fluid
                />
                <IconField.Inset className="cursor-pointer absolute right-3 top-1/2 z-10 flex -translate-y-1/2 items-center">
                  {mask ? (
                    <Eye onClick={() => setMask(false)} />
                  ) : (
                    <EyeSlash onClick={() => setMask(true)} />
                  )}
                </IconField.Inset>
              </IconField.Root>
              {errors.password && (
                <small className="field-error">{errors.password.message}</small>
              )}
            </div>

            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="flex justify-center gap-2 !px-5 !py-3"
            >
              {isLoading ? "Validando..." : "Entrar al espacio"}
              {isLoading && <Spinner className="animate-spin" />}
            </Button>
          </form>

          <p className="login-hint">Demo: emilys / emilyspass</p>
        </div>
      </section>
    </main>
  );
}
