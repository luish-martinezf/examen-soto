import { Button } from "@primereact/ui/button";
import {
  DataTable,
  type DataTablePaginationInstance,
} from "@primereact/ui/datatable";
import { Paginator } from "@primereact/ui/paginator";
import type {
  PaginatorPagesInstance,
  PaginatorRootChangeEvent,
} from "@primereact/ui/paginator";
import type { Post } from "./postTypes";
import {
  AngleDoubleLeft,
  AngleDoubleRight,
  AngleLeft,
  AngleRight,
  EllipsisH,
  Eye,
  Pencil,
  Trash,
} from "@primeicons/react";

interface PostsTableProps {
  posts: Post[];
  userNames: Map<number, string>;
  isLoading: boolean;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  onView: (post: Post) => void;
  onEdit: (post: Post) => void;
  onDelete: (post: Post) => void;
}

export function PostsTable({
  posts,
  userNames,
  isLoading,
  status,
  error,
  onView,
  onEdit,
  onDelete,
}: PostsTableProps) {
  return (
    <>
      {isLoading ? (
        <div className="px-5 py-16 text-center text-[var(--muted)]">
          Cargando publicaciones…
        </div>
      ) : status === "failed" ? (
        <div className="px-5 py-16 text-center text-red-700">
          {error ?? "No fue posible cargar las publicaciones."}
        </div>
      ) : posts.length === 0 ? (
        <div className="px-5 py-16 text-center text-[var(--muted)]">
          No hay publicaciones que coincidan con tu búsqueda.
        </div>
      ) : (
        <div className="w-full">
          <DataTable.Root
            data={posts}
            dataKey="id"
            loading={isLoading}
            stripedRows
            showGridlines
            defaultRows={10}
            paginator
            scrollable
          >
            <DataTable.TableContainer>
              <DataTable.Table>
                <DataTable.THead>
                  <DataTable.THeadRow>
                    <DataTable.THeadCell>ID</DataTable.THeadCell>
                    <DataTable.THeadCell>Título</DataTable.THeadCell>
                    <DataTable.THeadCell>Usuario</DataTable.THeadCell>
                    <DataTable.THeadCell>Tags</DataTable.THeadCell>
                    <DataTable.THeadCell>Reacciones</DataTable.THeadCell>
                    <DataTable.THeadCell className="text-right">
                      Acciones
                    </DataTable.THeadCell>
                  </DataTable.THeadRow>
                </DataTable.THead>
                <DataTable.TBody<Post>>
                  {({ item, index }) => (
                    <DataTable.Row index={index}>
                      <DataTable.Cell>#{item.id}</DataTable.Cell>
                      <DataTable.Cell className="truncate">
                        {item.title}
                      </DataTable.Cell>
                      <DataTable.Cell>
                        {userNames.get(item.userId) ?? `Usuario ${item.userId}`}
                      </DataTable.Cell>
                      <DataTable.Cell>
                        <div className="flex flex-wrap gap-1">
                          {item.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-[var(--p-highlight-background)] px-2 py-1 text-xs text-[var(--p-highlight-color)]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </DataTable.Cell>
                      <DataTable.Cell>
                        ♥ {item.reactions?.likes || 0} ·{" "}
                        {item.reactions?.dislikes || 0} dislikes
                      </DataTable.Cell>
                      <DataTable.Cell>
                        <div className="flex justify-end gap-1">
                          <Button
                            rounded
                            aria-label={`Ver ${item.title}`}
                            onClick={() => onView(item)}
                          >
                            <Eye />
                          </Button>
                          <Button
                            rounded
                            aria-label={`Editar ${item.title}`}
                            onClick={() => onEdit(item)}
                          >
                            <Pencil />
                          </Button>
                          <Button
                            rounded
                            severity="danger"
                            aria-label={`Eliminar ${item.title}`}
                            onClick={() => onDelete(item)}
                          >
                            <Trash />
                          </Button>
                        </div>
                      </DataTable.Cell>
                    </DataTable.Row>
                  )}
                </DataTable.TBody>
              </DataTable.Table>
            </DataTable.TableContainer>
            <DataTable.Pagination>
              {({
                page,
                rows,
                totalRecords,
                onPageChange,
              }: DataTablePaginationInstance) => (
                <Paginator.Root
                  className="py-3 border-t border-surface-200 dark:border-surface-700"
                  page={page + 1}
                  total={totalRecords}
                  itemsPerPage={rows}
                  siblings={2}
                  edges={2}
                  onPageChange={(e: PaginatorRootChangeEvent) => {
                    if (e.originalEvent) {
                      onPageChange(e.originalEvent, e.value - 1);
                    }
                  }}
                >
                  <div className="flex justify-between">
                    <Paginator.Content>
                      <Paginator.First>
                        <AngleDoubleLeft />
                      </Paginator.First>
                      <Paginator.Prev>
                        <AngleLeft />
                      </Paginator.Prev>
                      <Paginator.Pages>
                        {({ paginator }: PaginatorPagesInstance) =>
                          paginator?.pages.map((p, index) =>
                            p.type === "page" ? (
                              <Paginator.Page key={index} value={p.value} />
                            ) : (
                              <Paginator.Ellipsis key={index}>
                                <EllipsisH />
                              </Paginator.Ellipsis>
                            ),
                          )
                        }
                      </Paginator.Pages>
                      <Paginator.Next>
                        <AngleRight />
                      </Paginator.Next>
                      <Paginator.Last>
                        <AngleDoubleRight />
                      </Paginator.Last>
                    </Paginator.Content>
                    <div className="text-xs font-mono">
                      {totalRecords} resultados
                    </div>
                  </div>
                </Paginator.Root>
              )}
            </DataTable.Pagination>
          </DataTable.Root>
        </div>
      )}
    </>
  );
}
