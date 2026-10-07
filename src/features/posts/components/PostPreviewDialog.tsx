import { Times } from "@primeicons/react";
import { Button } from "@primereact/ui/button";
import { Dialog } from "@primereact/ui/dialog";
import type { DialogRootChangeEvent } from "@primereact/ui/dialog";
import type { Post } from "../postTypes";

interface PostPreviewDialogProps {
  post: Post | null;
  onClose: () => void;
}

export function PostPreviewDialog({ post, onClose }: PostPreviewDialogProps) {
  return (
    <Dialog.Root
      open={Boolean(post)}
      onOpenChange={(event: DialogRootChangeEvent) => {
        if (!event.value) onClose();
      }}
      dismissable
    >
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Popup className="max-h-[85vh] w-full max-w-2xl overflow-y-auto">
            <Dialog.Header>
              <Dialog.Title>{post?.title}</Dialog.Title>
              <Dialog.HeaderActions>
                <Dialog.Close
                  as={Button}
                  iconOnly
                  variant="text"
                  rounded
                  severity="secondary"
                  aria-label="Cerrar vista previa"
                >
                  <Times />
                </Dialog.Close>
              </Dialog.HeaderActions>
            </Dialog.Header>
            <Dialog.Content>
              <p className="whitespace-pre-wrap leading-7">{post?.body}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {post?.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[var(--p-highlight-background)] px-3 py-1 text-xs text-[var(--p-highlight-color)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Dialog.Content>
          </Dialog.Popup>
        </Dialog.Positioner>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
