import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { AxiosError } from 'axios'
import { api } from '../../services/api'
import type { User, UsersResponse } from './userTypes'

interface UsersState {
  items: User[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: UsersState = {
  items: [],
  status: 'idle',
  error: null,
}

function getErrorMessage(error: unknown) {
  const axiosError = error as AxiosError<{ message?: string }>
  return axiosError.response?.data?.message ?? 'No fue posible cargar los usuarios.'
}

export const fetchUsers = createAsyncThunk<User[], void, { rejectValue: string }>(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<UsersResponse>('/users?limit=100')
      return response.data.users
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  },
)

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? 'No fue posible cargar los usuarios.'
      })
  },
})

export default usersSlice.reducer
