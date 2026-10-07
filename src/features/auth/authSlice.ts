import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { AxiosError } from "axios";
import { api, TOKEN_STORAGE_KEY } from "../../services/api";
import type { AuthUser, LoginCredentials, LoginResponse } from "./authTypes";

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: AuthState = {
  token: localStorage.getItem(TOKEN_STORAGE_KEY),
  user: null,
  status: "idle",
  error: null,
};

function getErrorMessage(error: unknown) {
  const axiosError = error as AxiosError<{ message?: string }>;
  return axiosError.response?.data?.message ?? "No fue posible iniciar sesión.";
}

export const login = createAsyncThunk<
  LoginResponse,
  LoginCredentials,
  { rejectValue: string }
>("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const response = await api.post<LoginResponse>("/auth/login", {
      ...credentials,
      expiresInMins: 15,
    });

    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchUserInfo = createAsyncThunk<
  AuthUser,
  void,
  { rejectValue: string }
>("auth/fetchUserInfo", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<AuthUser>("/auth/me");
    return response.data;
  } catch (error) {
    return rejectWithValue(
      (error as AxiosError<{ message?: string }>).response?.data?.message ?? "No fue posible obtener la información del usuario."
    );
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      state.status = "idle";
      state.error = null;
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem('examen-soto-user-name');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        const token = action.payload.accessToken ?? action.payload.token;

        if (!token) {
          state.status = "failed";
          state.error = "La respuesta de autenticación no contiene un token.";
          return;
        }

        state.status = "succeeded";
        state.token = token;
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "No fue posible iniciar sesión.";
      })
      .addCase(fetchUserInfo.fulfilled, (state, action) => {
        state.user = action.payload;
        if (action.payload && action.payload.firstName) {
          localStorage.setItem('examen-soto-user-name', `${action.payload.firstName} ${action.payload.lastName || ''}`.trim());
        }
      })
      .addCase(fetchUserInfo.rejected, (state, action) => {
        state.error = action.payload ?? "No fue posible obtener la información del usuario.";
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;