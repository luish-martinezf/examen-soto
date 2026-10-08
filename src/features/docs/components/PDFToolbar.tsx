import { ChevronLeft, ChevronRight } from "@primeicons/react";
import { Button } from "@primereact/ui/button";
import { Toolbar } from "@primereact/ui/toolbar";

interface PDFToolbarProps {
  currentPage: number;
  numPages: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

export function PDFToolbar({
  currentPage,
  numPages,
  onPreviousPage,
  onNextPage,
}: PDFToolbarProps) {
  return (
    <Toolbar.Root>
      <Toolbar.Start>
        <h1>React PDF Viewer</h1>
      </Toolbar.Start>

      <Toolbar.Center className="gap-2">
        <Button
          rounded
          iconOnly
          aria-label="Previous page"
          tooltip="Previous page"
          disabled={currentPage <= 1}
          onClick={onPreviousPage}
        >
          <ChevronLeft />
        </Button>

        <span>
          {currentPage} / {numPages}
        </span>

        <Button
          rounded
          iconOnly
          aria-label="Next page"
          tooltip="Next page"
          disabled={currentPage >= numPages}
          onClick={onNextPage}
        >
          <ChevronRight />
        </Button>
      </Toolbar.Center>

      <Toolbar.End />
    </Toolbar.Root>
  );
}
