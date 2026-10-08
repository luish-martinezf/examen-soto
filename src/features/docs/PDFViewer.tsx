import { Suspense, useCallback, useEffect, useRef, useState } from "react";
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
  const [file] = useState<PDFFile>("/sample.pdf");
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

  function onDocumentLoadSuccess({
    numPages: nextNumPages,
  }: PDFDocumentProxy): void {
    setNumPages(nextNumPages);
    setCurrentPage(1);
  }

  // Navigation functionality

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

  // Zoom functionality
  const [zoom, setZoom] = useState<number>(1);

  const zoomIn = () => {
    setZoom((value) => Math.min(value + 0.1, 2));
  };

  const zoomOut = () => {
    setZoom((value) => Math.max(value - 0.1, 0.5));
  };

  return (
    <div className="Example">
      <header className="sticky top-0 z-10">
        {numPages && (
          <PDFToolbar
            currentPage={currentPage}
            numPages={numPages}
            onPreviousPage={goToPreviousPage}
            onNextPage={goToNextPage}
            zoom={zoom}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
          />
        )}
      </header>

      <div className="Example__container flex justify-center pt-2">
        <div
          className="Example__container__document w-full max-w-full"
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
                  const pageWidth = containerWidth
                    ? Math.min(containerWidth, maxWidth)
                    : maxWidth;

                  return (
                    <div
                      key={`page_${pageNumber}`}
                      data-page={pageNumber}
                      className="scroll-mt-16 pb-3"
                    >
                      <Page
                        className="flex justify-center bg-transparent"
                        pageNumber={pageNumber}
                        onRenderSuccess={() => {
                          setRenderedPages((count) => count + 1);
                        }}
                        width={pageWidth}
                        scale={zoom}
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
