import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Download } from 'lucide-react';
import { cn } from '../../lib/utils';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  url: string;
  fileName: string;
  onClose?: () => void;
  className?: string;
}

export function PDFViewer({ url, fileName, onClose, className }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(0.8);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const changePage = (offset: number) => {
    setPageNumber((prevPageNumber) => {
      const newPageNumber = prevPageNumber + offset;
      return Math.min(Math.max(1, newPageNumber), numPages);
    });
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  const adjustZoom = (delta: number) => {
    setScale((prev) => Math.min(Math.max(0.3, prev + delta), 2.0));
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={cn('relative overflow-hidden rounded-lg border bg-white shadow-lg', className)}>
      <div className="flex items-center justify-between border-b bg-gray-50 px-4 py-3">
        <div className="flex items-center gap-4">
          <span className="max-w-[200px] truncate font-medium" title={fileName}>
            {fileName}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={previousPage}
              disabled={pageNumber <= 1}
              className="rounded-md p-1.5 hover:bg-gray-200 disabled:opacity-50"
              title="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[80px] text-center text-sm text-gray-600">
              Page {pageNumber} of {numPages}
            </span>
            <button
              onClick={nextPage}
              disabled={pageNumber >= numPages}
              className="rounded-md p-1.5 hover:bg-gray-200 disabled:opacity-50"
              title="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-md bg-white px-2 py-1 shadow-sm">
            <button
              onClick={() => adjustZoom(-0.1)}
              className="rounded p-1 hover:bg-gray-100"
              title="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="min-w-[48px] text-center text-sm text-gray-600">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => adjustZoom(0.1)}
              className="rounded p-1 hover:bg-gray-100"
              title="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={handleDownload}
            className="rounded-md p-1.5 hover:bg-gray-200"
            title="Download PDF"
          >
            <Download className="h-4 w-4" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="rounded-md p-1.5 hover:bg-gray-200"
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      <div className="flex max-h-[600px] justify-center overflow-auto bg-gray-100 p-4">
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex h-20 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
            </div>
          }
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            loading={null}
            className="shadow-xl"
          />
        </Document>
      </div>
    </div>
  );
}