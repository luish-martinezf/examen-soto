import {
  useEffect,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@primereact/ui/button";
import { Chip } from "@primereact/ui/chip";
import { InputText } from "@primereact/ui/inputtext";
import { InputTags } from "@primereact/ui/inputtags";
import type { InputTagsRootValueChangeEvent } from "@primereact/ui/inputtags";
import { Label } from "@primereact/ui/label";
import { Textarea } from "@primereact/ui/textarea";
import { Select } from "@primereact/ui/select";
import type { SelectValueChangeEvent } from "@primereact/ui/select";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { createPost, fetchPosts, updatePost } from "./postsSlice";
import { fetchUsers } from "../users/usersSlice";
import { ChevronDown, Times } from "@primeicons/react";

interface PostFormValues {
  title: string;
  body: string;
  userId: number | null;
}

export function PostFormPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const postId = id ? Number(id) : null;
  const post = useAppSelector((state) =>
    state.posts.items.find((item) => item.id === postId),
  );
  const postsStatus = useAppSelector((state) => state.posts.status);
  const mutationStatus = useAppSelector((state) => state.posts.mutationStatus);
  const users = useAppSelector((state) => state.users.items);
  const [tagOverrides, setTagOverrides] = useState<string[] | null>(null);
  const [tagInput, setTagInput] = useState("");
  const tags = tagOverrides ?? post?.tags ?? [];
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<PostFormValues>({
    defaultValues: { title: "", body: "", userId: null },
  });

  useEffect(() => {
    if (
      postsStatus === "idle" ||
      (postId && !post && postsStatus !== "loading")
    )
      void dispatch(fetchPosts());
    if (users.length === 0) void dispatch(fetchUsers());
  }, [dispatch, post, postId, postsStatus, users.length]);

  useEffect(() => {
    if (post) {
      reset({ title: post.title, body: post.body, userId: post.userId });
    }
  }, [post, reset]);

  function addTag() {
    const value = tagInput.trim().toLowerCase();
    if (value && !tags.includes(value)) setTagOverrides([...tags, value]);
    setTagInput("");
  }

  async function onSubmit(values: PostFormValues) {
    if (values.userId === null) return;

    const payload = {
      title: values.title,
      body: values.body,
      userId: values.userId,
      tags,
    };
    const result =
      postId && post
        ? await dispatch(updatePost({ id: postId, payload }))
        : await dispatch(createPost(payload));

    if ((postId ? updatePost.fulfilled : createPost.fulfilled).match(result)) {
      navigate("/posts", {
        replace: true,
        state: {
          severity: "success",
          message: postId
            ? "Publicación actualizada correctamente."
            : "Publicación creada correctamente.",
        },
      });
    }
  }

  const isSaving = mutationStatus === "loading";
  const isWaitingForPost = Boolean(
    postId && !post && postsStatus === "loading",
  );

  if (isWaitingForPost)
    return (
      <div className="py-20 text-center text-[var(--muted)]">
        Cargando publicación…
      </div>
    );

  return (
    <section className="mx-auto max-w-3xl">
      <button
        type="button"
        className="mb-8 text-sm text-[var(--muted)] underline"
        onClick={() => navigate("/posts")}
      >
        ← Volver a publicaciones
      </button>
      <p className="eyebrow">{postId ? "Edición" : "Nueva entrada"}</p>
      <h1 className="mt-3 font-serif text-5xl font-normal tracking-[-0.05em] text-[var(--ink)]">
        {postId ? "Editar publicación" : "Crear publicación"}
      </h1>
      <p className="mt-3 text-[var(--muted)]">
        Completa los datos básicos para mantener la biblioteca clara y útil.
      </p>

      <form
        className="mt-10 space-y-6"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <InputText
            id="title"
            variant="outlined"
            fluid
            invalid={Boolean(errors.title)}
            {...register("title", { required: "Ingresa un título." })}
          />
          {errors.title && (
            <small className="text-xs text-red-700">
              {errors.title.message}
            </small>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="body">Contenido</Label>
          <Textarea
            id="body"
            rows={8}
            variant="outlined"
            fluid
            invalid={Boolean(errors.body)}
            {...register("body", { required: "Ingresa el contenido." })}
          />
          {errors.body && (
            <small className="text-xs text-red-700">
              {errors.body.message}
            </small>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="userId">Usuario</Label>
          <Controller
            control={control}
            name="userId"
            rules={{ required: "Selecciona un usuario." }}
            render={({ field }) => (
              <Select.Root
                value={field.value == null ? "" : String(field.value)}
                options={users.map((user) => ({
                  label: `${user.firstName} ${user.lastName}`,
                  value: String(user.id),
                }))}
                optionLabel="label"
                optionValue="value"
                onValueChange={(event: SelectValueChangeEvent) => {
                  const value = event.value;
                  field.onChange(
                    value === null || value === "" ? null : Number(value),
                  );
                }}
                // variant="outlined"
                fluid
              >
                <Select.Trigger id="userId" type="button">
                  <Select.Value placeholder="Selecciona un usuario" />
                  <Select.Indicator>
                    <ChevronDown />
                  </Select.Indicator>
                </Select.Trigger>
                <Select.Portal>
                  <Select.Positioner>
                    <Select.Popup>
                      <Select.List />
                    </Select.Popup>
                  </Select.Positioner>
                </Select.Portal>
              </Select.Root>
            )}
          />
          {errors.userId && (
            <small className="text-xs text-red-700">
              {errors.userId.message}
            </small>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="tagInput">Tags</Label>
          <InputTags.Root
            value={tags}
            variant="outlined"
            fluid
            onValueChange={(event: InputTagsRootValueChangeEvent) =>
              setTagOverrides(event.value ?? [])
            }
          >
            <InputTags.Items>
              {({ item, remove, itemProps }) => (
                <Chip.Root {...itemProps} onRemove={remove}>
                  <Chip.Label>{item}</Chip.Label>
                  <Chip.Remove aria-label={`Eliminar tag ${item}`}>
                    <Times />
                  </Chip.Remove>
                </Chip.Root>
              )}
            </InputTags.Items>
            <InputTags.Control>
              {({ controlProps }) => (
                <input
                  {...controlProps}
                  id="tagInput"
                  value={tagInput}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setTagInput(event.target.value)
                  }
                  onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Escribe un tag y presiona Enter"
                  className="min-w-40 flex-1"
                />
              )}
            </InputTags.Control>
          </InputTags.Root>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="text"
            severity="secondary"
            onClick={() => navigate("/posts")}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving
              ? "Guardando…"
              : postId
                ? "Guardar cambios"
                : "Crear publicación"}
          </Button>
        </div>
      </form>
    </section>
  );
}
