import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { AxiosError } from "axios";
import { api } from "../../services/api";
import type { Post, PostPayload, PostsResponse } from "./postTypes";

interface PostsState {
  items: Post[];
  total: number;
  status: "idle" | "loading" | "succeeded" | "failed";
  mutationStatus: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: PostsState = {
  items: [],
  total: 0,
  status: "idle",
  mutationStatus: "idle",
  error: null,
};

function getErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<{ message?: string }>;
  return axiosError.response?.data?.message ?? fallback;
}

export const fetchPosts = createAsyncThunk<
  PostsResponse,
  void,
  { rejectValue: string }
>("posts/fetchPosts", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<PostsResponse>("/posts?limit=0");
    return response.data;
  } catch (error) {
    return rejectWithValue(
      getErrorMessage(error, "No fue posible cargar las publicaciones."),
    );
  }
});

export const createPost = createAsyncThunk<
  Post,
  PostPayload,
  { rejectValue: string }
>("posts/createPost", async (payload, { rejectWithValue }) => {
  try {
    const response = await api.post<Post>("/posts/add", payload);
    return response.data;
  } catch (error) {
    return rejectWithValue(
      getErrorMessage(error, "No fue posible crear la publicación."),
    );
  }
});

export const updatePost = createAsyncThunk<
  Post,
  { id: number; payload: PostPayload },
  { rejectValue: string }
>("posts/updatePost", async ({ id, payload }, { rejectWithValue }) => {
  try {
    const response = await api.put<Post>(`/posts/${id}`, payload);
    return response.data;
  } catch (error) {
    return rejectWithValue(
      getErrorMessage(error, "No fue posible actualizar la publicación."),
    );
  }
});

export const deletePost = createAsyncThunk<
  Post,
  number,
  { rejectValue: string }
>("posts/deletePost", async (id, { rejectWithValue }) => {
  try {
    const response = await api.delete<Post>(`/posts/${id}`);
    return response.data;
  } catch (error) {
    return rejectWithValue(
      getErrorMessage(error, "No fue posible eliminar la publicación."),
    );
  }
});

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.posts;
        state.total = action.payload.total;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload ?? "No fue posible cargar las publicaciones.";
      })
      .addCase(createPost.pending, (state) => {
        state.mutationStatus = "loading";
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.mutationStatus = "succeeded";
        state.items.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.mutationStatus = "failed";
        state.error = action.payload ?? "No fue posible crear la publicación.";
      })
      .addCase(updatePost.pending, (state) => {
        state.mutationStatus = "loading";
        state.error = null;
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.mutationStatus = "succeeded";
        state.items = state.items.map((post) =>
          post.id === action.payload.id ? { ...post, ...action.payload } : post,
        );
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.mutationStatus = "failed";
        state.error =
          action.payload ?? "No fue posible actualizar la publicación.";
      })
      .addCase(deletePost.pending, (state) => {
        state.mutationStatus = "loading";
        state.error = null;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.mutationStatus = "succeeded";
        state.items = state.items.filter(
          (post) => post.id !== action.payload.id,
        );
        state.total = Math.max(0, state.total - 1);
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.mutationStatus = "failed";
        state.error =
          action.payload ?? "No fue posible eliminar la publicación.";
      });
  },
});

export default postsSlice.reducer;
