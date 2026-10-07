import { type ChangeEvent, useRef } from "react";
import {
  Chip,
  ChipLabel,
  ChipRemove,
  type ChipRootRemoveEvent,
} from "@primereact/ui/chip";
import { InputText } from "@primereact/ui/inputtext";
import { Select } from "@primereact/ui/select";
import { Toolbar } from "@primereact/ui/toolbar";
import type { User } from "../users/userTypes";
import { Search, Times } from "@primeicons/react";
import type {
  SelectRootInstance,
  SelectValueChangeEvent,
} from "@primereact/ui/select";
import { IconField } from "@primereact/ui/iconfield";
import { ChevronDown } from "@primeicons/react/chevron-down";

interface PostsFiltersProps {
  query: string;
  userFilter: string;
  tagFilter: string[];
  users: User[];
  allTags: string[];
  onQueryChange: (value: string) => void;
  onUserChange: (value: string) => void;
  onTagsChange: (values: string[]) => void;
}

export function PostsFilters({
  query,
  userFilter,
  tagFilter,
  users,
  allTags,
  onQueryChange,
  onUserChange,
  onTagsChange,
}: PostsFiltersProps) {
  // const [tagsSelected, setTagsSelected] = useState("");
  const selectRef = useRef<SelectRootInstance>(null);

  const removeTag = (e: ChipRootRemoveEvent, tag: string) => {
    e.originalEvent.stopPropagation();
    const currentIndex = tagFilter.indexOf(tag);
    const next = tagFilter.filter((c) => c !== tag);

    onTagsChange(next);

    requestAnimationFrame(() => {
      if (currentIndex > 0) {
        const selectElement = selectRef.current?.elementRef?.current;
        const removeButtons = selectElement?.querySelectorAll<HTMLElement>(
          '[data-scope="chip"][data-part="remove"]',
        );
        removeButtons?.[currentIndex - 1]?.focus();
      } else {
        selectRef.current?.focus();
      }
    });
  };

  return (
    <>
      <Toolbar.Root className="">
        <Toolbar.Start className="contents">
          <IconField.Root>
            <InputText
              value={query}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                onQueryChange(event.target.value)
              }
              placeholder="Buscar por título, contenido o tag"
              aria-label="Buscar publicaciones"
              fluid
            />
            <IconField.Inset>
              <Search />
            </IconField.Inset>
          </IconField.Root>
        </Toolbar.Start>

        <Toolbar.End>
          <Select.Root
            value={userFilter}
            options={[
              { label: "Todos los usuarios", value: "" },
              ...users.map((user) => ({
                label: `${user.firstName} ${user.lastName}`,
                value: String(user.id),
              })),
            ]}
            optionLabel="label"
            optionValue="value"
            onValueChange={(event: SelectValueChangeEvent) =>
              onUserChange(String(event.value ?? ""))
            }
            variant="outlined"
            fluid
            aria-label="Filtrar por usuario"
          >
            <Select.Trigger>
              <Select.Value placeholder="Todos los usuarios" />
              <Select.Indicator>
                <ChevronDown />
              </Select.Indicator>
            </Select.Trigger>
            <Select.Portal>
              <Select.Positioner>
                <Select.Popup className="z-50 w-[min(20rem,calc(100vw-2rem))]">
                  <Select.Filter placeholder="Buscar usuario..." />
                  <Select.List />
                  <Select.Empty className="px-3 py-2 text-sm text-[var(--muted)]">
                    No se encontraron usuarios.
                  </Select.Empty>
                </Select.Popup>
              </Select.Positioner>
            </Select.Portal>
          </Select.Root>
        </Toolbar.End>

        <Select.Root
          ref={selectRef}
          value={tagFilter}
          onValueChange={(e: SelectValueChangeEvent) =>
            onTagsChange(Array.isArray(e.value) ? e.value.map(String) : [])
          }
          options={allTags.map((tag) => ({ label: tag, value: tag }))}
          optionLabel="label"
          optionValue="value"
          multiple
          variant="outlined"
          fluid
        >
          <Select.Trigger>
            <Select.Value placeholder="Selecciona Tags">
              {tagFilter.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {tagFilter.map((tag) => {
                    const tags = allTags.find((t) => t === tag);
                    return tags ? (
                      <Chip.Root
                        key={tag}
                        className="py-0"
                        onRemove={(e: ChipRootRemoveEvent) => removeTag(e, tag)}
                      >
                        <ChipLabel className="text-xs">
                          {tag.split(" ")[0]}
                        </ChipLabel>
                        <ChipRemove>
                          <Times />
                        </ChipRemove>
                      </Chip.Root>
                    ) : null;
                  })}
                </div>
              ) : null}
            </Select.Value>
            <Select.Clear>
              <Times />
            </Select.Clear>
            <Select.Indicator>
              <ChevronDown />
            </Select.Indicator>
          </Select.Trigger>
          <Select.Portal>
            <Select.Positioner>
              <Select.Popup>
                <Select.Arrow />

                <Select.List>
                  {allTags.map((tag, index) => (
                    <Select.Option
                      key={tag}
                      uKey={tag}
                      index={index}
                      className="gap-2"
                    >
                      <span>{tag}</span>
                    </Select.Option>
                  ))}
                </Select.List>
              </Select.Popup>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>
      </Toolbar.Root>
    </>
  );
}
