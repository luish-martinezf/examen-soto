import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchUsers } from "../users/usersSlice";
import type { Post } from "./postTypes";
import { deletePost, fetchPosts } from "./postsSlice";
import { DeletePostDialog } from "./components/DeletePostDialog";
import { PostPreviewDialog } from "./components/PostPreviewDialog";
import { PostsFilters } from "./PostsFilters";
import { PostsHeader } from "./PostsHeader";
import { PostsTable } from "./PostsTable";

interface Feedback {
  severity: "success" | "error";
  message: string;
}

export function PostsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { items, status, mutationStatus, error } = useAppSelector(
    (state) => state.posts,
  );
  const users = useAppSelector((state) => state.users.items);
  const [query, setQuery] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [viewPost, setViewPost] = useState<Post | null>(null);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    if (status === "idle") void dispatch(fetchPosts());
    if (users.length === 0) void dispatch(fetchUsers());
  }, [dispatch, status, users.length]);

  const routeFeedback = location.state as Feedback | null;
  const activeFeedback = feedback ?? routeFeedback;
  const userNames = useMemo(
    () =>
      new Map(
        users.map((user) => [user.id, `${user.firstName} ${user.lastName}`]),
      ),
    [users],
  );

  const allTags = useMemo(
    () => [...new Set(items.flatMap((post) => post.tags))].sort(),
    [items],
  );

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return items.filter((post) => {
      const matchesQuery =
        !normalizedQuery ||
        [post.title, post.body, ...post.tags]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesUser = !userFilter || String(post.userId) === userFilter;
      const matchesTags =
        tagFilter.length === 0 ||
        tagFilter.every((tag) => post.tags.includes(tag));
      return matchesQuery && matchesUser && matchesTags;
    });
  }, [items, query, tagFilter, userFilter]);

  function updateQuery(value: string) {
    setQuery(value);
  }

  function updateUserFilter(value: string) {
    setUserFilter(value);
  }

  function updateTagFilter(values: string[]) {
    setTagFilter(values);
  }

  function clearFeedback() {
    setFeedback(null);
    if (routeFeedback)
      navigate(location.pathname, { replace: true, state: null });
  }

  async function confirmDelete() {
    if (!postToDelete) return;

    const result = await dispatch(deletePost(postToDelete.id));
    setPostToDelete(null);

    if (deletePost.fulfilled.match(result)) {
      setFeedback({
        severity: "success",
        message: "Publicación eliminada correctamente.",
      });
    }
  }

  return (
    <section className="mx-auto max-w-7xl space-y-8">
      <PostsHeader onCreate={() => navigate("/posts/new")} />

      {activeFeedback && (
        <div
          className={`flex items-center justify-between border-l-4 px-4 py-3 text-sm ${activeFeedback.severity === "success" ? "border-emerald-600 bg-emerald-50 text-emerald-800" : "border-red-600 bg-red-50 text-red-800"}`}
          role="status"
        >
          <span>{activeFeedback.message}</span>
          <button
            type="button"
            className="ml-4"
            onClick={clearFeedback}
            aria-label="Cerrar mensaje"
          >
            ×
          </button>
        </div>
      )}
      {error && mutationStatus === "failed" && (
        <div
          className="border-l-4 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {error}
        </div>
      )}
      <PostsFilters
        query={query}
        userFilter={userFilter}
        tagFilter={tagFilter}
        users={users}
        allTags={allTags}
        onQueryChange={updateQuery}
        onUserChange={updateUserFilter}
        onTagsChange={updateTagFilter}
      />
      <PostsTable
        posts={filteredPosts}
        userNames={userNames}
        isLoading={status === "loading"}
        status={status}
        error={error}
        onView={setViewPost}
        onEdit={(post) => navigate(`/posts/${post.id}/edit`)}
        onDelete={setPostToDelete}
      />
      <PostPreviewDialog post={viewPost} onClose={() => setViewPost(null)} />
      <DeletePostDialog
        post={postToDelete}
        onClose={() => setPostToDelete(null)}
        onConfirm={() => void confirmDelete()}
      />
    </section>
  );
}
