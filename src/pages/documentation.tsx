import React from 'react';
import { FileText, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import markdownContent from '../../docs/technical-documentation.md?raw';

export function Documentation() {
  const generatePDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Configure styling
    doc.setFont('helvetica');
    doc.setFontSize(20);
    doc.text('Betasys.ai PO Assistant', 20, 20);
    doc.text('Technical Documentation', 20, 30);

    // Add content
    doc.setFontSize(12);
    let y = 50;
    const maxWidth = 170;
    const lineHeight = 7;

    // Split content into sections
    const sections = markdownContent.split('\n## ');
    
    sections.forEach((section, index) => {
      if (index === 0) {
        // Handle first section (Overview)
        const lines = doc.splitTextToSize(section, maxWidth);
        lines.forEach(line => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          doc.text(line, 20, y);
          y += lineHeight;
        });
        return;
      }

      // Handle other sections
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      // Add section header
      doc.setFontSize(16);
      doc.text(section.split('\n')[0], 20, y);
      y += lineHeight * 1.5;

      // Add section content
      doc.setFontSize(12);
      const content = section.split('\n').slice(1).join('\n');
      const lines = doc.splitTextToSize(content, maxWidth);
      
      lines.forEach(line => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, 20, y);
        y += lineHeight;
      });

      y += lineHeight; // Add space between sections
    });

    // Add footer with page numbers
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Page ${i} of ${pageCount}`, 20, 290);
    }

    // Save the PDF
    doc.save('betasys-ai-technical-documentation.pdf');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-purple-600" />
            <h1 className="text-2xl font-bold">Technical Documentation</h1>
          </div>
          <button
            onClick={generatePDF}
            className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
          >
            <Download className="h-5 w-5" />
            Download PDF
          </button>
        </div>

        <div className="prose prose-lg max-w-none rounded-lg border bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:prose-invert">
          <div dangerouslySetInnerHTML={{ __html: markdownContent }} />
        </div>
      </div>
    </div>
  );
}