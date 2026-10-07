import { Button } from "@primereact/ui/button";
import { Plus } from "@primeicons/react/plus";

interface PostsHeaderProps {
  onCreate: () => void;
}

export function PostsHeader({ onCreate }: PostsHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-5">
      <div>
        <p className="eyebrow">Content desk</p>
        <h1 className="mt-3 font-serif text-5xl font-normal tracking-[-0.05em] text-[var(--ink)] md:text-7xl">
          Publicaciones
        </h1>
        <p className="mt-3 max-w-xl text-[var(--muted)]">
          Revisa y organiza las historias que forman parte de tu biblioteca
          editorial.
        </p>
      </div>
      <Button onClick={onCreate}>
        Nueva publicación
        <Plus />
      </Button>
    </div>
  );
}
