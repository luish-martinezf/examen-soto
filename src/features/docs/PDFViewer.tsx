import {
  Suspense,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { useResizeObserver } from "@wojtekmaj/react-hooks";
import { ErrorBoundary } from "react-error-boundary";
import { Document, Page, pdfjs } from "react-pdf";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

import type { PDFDocumentProxy } from "pdfjs-dist";

import { PDFToolbar } from "./components/PDFToolbar";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const options = {
  cMapUrl: "/cmaps/",
  standardFontDataUrl: "/standard_fonts/",
  wasmUrl: "/wasm/",
};

const resizeObserverOptions = {};
const maxWidth = 800;

type PDFFile = string | File | null;

export default function PDFViewer() {
  const fileId = useId();

  const [file, setFile] = useState<PDFFile>("/sample.pdf");
  const [numPages, setNumPages] = useState<number>();
  const [renderedPages, setRenderedPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>();

  const documentContainerRef = useRef<HTMLDivElement | null>(null);

  const onResize = useCallback<ResizeObserverCallback>((entries) => {
    const [entry] = entries;

    if (entry) {
      setContainerWidth(entry.contentRect.width);
    }
  }, []);

  useResizeObserver(containerRef, resizeObserverOptions, onResize);

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const nextFile = event.target.files?.[0];

    if (nextFile) {
      setFile(nextFile);
      setNumPages(undefined);
      setCurrentPage(1);
      setRenderedPages(0);
    }
  }

  function onDocumentLoadSuccess({
    numPages: nextNumPages,
  }: PDFDocumentProxy): void {
    setNumPages(nextNumPages);
    setCurrentPage(1);
  }

  function scrollToPage(pageNumber: number) {
    const container = documentContainerRef.current;

    if (!container) {
      return;
    }

    const page = container.querySelector<HTMLElement>(
      `[data-page="${pageNumber}"]`,
    );

    page?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function goToPreviousPage() {
    const previousPage = Math.max(currentPage - 1, 1);

    scrollToPage(previousPage);
  }

  function goToNextPage() {
    if (!numPages) {
      return;
    }

    const nextPage = Math.min(currentPage + 1, numPages);

    scrollToPage(nextPage);
  }

  useEffect(() => {
    const container = documentContainerRef.current;

    if (!container || !numPages || renderedPages < numPages) {
      return;
    }

    const pages = container.querySelectorAll<HTMLElement>("[data-page]");

    console.log("All pages rendered:", pages.length);

    if (pages.length !== numPages) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visiblePages = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        const mostVisiblePage = visiblePages[0];

        if (!mostVisiblePage) {
          return;
        }

        const pageNumber = Number(
          mostVisiblePage.target.getAttribute("data-page"),
        );

        if (pageNumber) {
          setCurrentPage(pageNumber);
        }
      },
      {
        threshold: [0.25, 0.5, 0.75],
      },
    );

    pages.forEach((page) => {
      observer.observe(page);
    });

    return () => {
      observer.disconnect();
    };
  }, [numPages, renderedPages]);

  // useEffect(() => {
  //   if (numPages) {
  //     scrollToPage(currentPage);
  //   }
  // }, [numPages]);

  return (
    <div className="Example">
      <header className="sticky top-0 z-10">
        {numPages && (
          <PDFToolbar
            currentPage={currentPage}
            numPages={numPages}
            onPreviousPage={goToPreviousPage}
            onNextPage={goToNextPage}
          />
        )}
      </header>

      <div className="Example__container">
        <div className="Example__container__load">
          <label htmlFor={fileId}>Load from file:</label>{" "}
          <input
            id={fileId}
            onChange={onFileChange}
            type="file"
            accept="application/pdf"
          />
        </div>

        <div
          className="Example__container__document"
          ref={(element) => {
            setContainerRef(element);
            documentContainerRef.current = element;
          }}
        >
          <ErrorBoundary
            fallback={<p role="alert">Failed to load PDF.</p>}
            resetKeys={[file]}
          >
            <Suspense fallback={<p>Loading PDF…</p>}>
              <Document
                file={file}
                onLoadSuccess={onDocumentLoadSuccess}
                options={options}
              >
                {Array.from(new Array(numPages), (_el, index) => {
                  const pageNumber = index + 1;

                  return (
                    <div key={`page_${pageNumber}`} data-page={pageNumber}>
                      <Page
                        pageNumber={pageNumber}
                        onRenderSuccess={() => {
                          setRenderedPages((count) => count + 1);
                        }}
                        width={
                          containerWidth
                            ? Math.min(containerWidth, maxWidth)
                            : maxWidth
                        }
                      />
                    </div>
                  );
                })}
              </Document>
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
