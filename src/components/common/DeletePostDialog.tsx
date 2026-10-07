import { Button } from "@primereact/ui/button";
import { Dialog } from "@primereact/ui/dialog";
import type { DialogRootChangeEvent } from "@primereact/ui/dialog";
import type { Post } from "../../features/posts/postTypes";

interface DeletePostDialogProps {
  post: Post | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeletePostDialog({
  post,
  onClose,
  onConfirm,
}: DeletePostDialogProps) {
  return (
    <Dialog.Root
      open={Boolean(post)}
      onOpenChange={(event: DialogRootChangeEvent) => {
        if (!event.value) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Popup className="w-full max-w-md">
            <Dialog.Header>
              <Dialog.Title>Eliminar publicación</Dialog.Title>
            </Dialog.Header>
            <Dialog.Content>
              <p className="leading-6">
                ¿Eliminar “{post?.title}”? Esta acción no se puede deshacer.
              </p>
            </Dialog.Content>
            <Dialog.Footer>
              <Dialog.Close as={Button} severity="secondary">
                Cancelar
              </Dialog.Close>
              <Button severity="danger" onClick={onConfirm}>
                Eliminar
              </Button>
            </Dialog.Footer>
          </Dialog.Popup>
        </Dialog.Positioner>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
