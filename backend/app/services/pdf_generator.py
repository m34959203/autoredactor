import os
import subprocess
from typing import List, Optional
from PyPDF2 import PdfReader, PdfWriter
from reportlab.lib.pagesizes import A4, letter
from reportlab.pdfgen import canvas
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from io import BytesIO


class PDFGenerator:
    """Service for generating and manipulating PDF files."""

    def __init__(self):
        # Register fonts for cyrillic support
        # Note: In production, you'd need to include actual font files
        pass

    def docx_to_pdf(self, docx_path: str, output_path: str) -> str:
        """
        Convert DOCX to PDF using LibreOffice (headless).

        Args:
            docx_path: Path to DOCX file
            output_path: Path for output PDF

        Returns:
            Path to generated PDF
        """
        try:
            # Using LibreOffice for conversion
            # Install with: apt-get install libreoffice
            output_dir = os.path.dirname(output_path)
            result = subprocess.run(
                [
                    'libreoffice',
                    '--headless',
                    '--convert-to', 'pdf',
                    '--outdir', output_dir,
                    docx_path
                ],
                capture_output=True,
                text=True,
                timeout=60
            )

            if result.returncode != 0:
                raise Exception(f"LibreOffice conversion failed: {result.stderr}")

            # LibreOffice creates PDF with same name as DOCX
            expected_pdf = docx_path.replace('.docx', '.pdf')
            if os.path.exists(expected_pdf) and expected_pdf != output_path:
                os.rename(expected_pdf, output_path)

            return output_path
        except Exception as e:
            raise Exception(f"Error converting DOCX to PDF: {str(e)}")

    def get_pdf_page_count(self, pdf_path: str) -> int:
        """
        Get number of pages in PDF.

        Args:
            pdf_path: Path to PDF file

        Returns:
            Number of pages
        """
        try:
            reader = PdfReader(pdf_path)
            return len(reader.pages)
        except Exception as e:
            raise Exception(f"Error reading PDF: {str(e)}")

    def add_blank_pages(self, count: int, output_path: str, page_size=A4):
        """
        Create PDF with blank pages.

        Args:
            count: Number of blank pages
            output_path: Path for output PDF
            page_size: Page size tuple
        """
        buffer = BytesIO()
        c = canvas.Canvas(buffer, pagesize=page_size)

        for _ in range(count):
            c.showPage()

        c.save()
        buffer.seek(0)

        with open(output_path, 'wb') as f:
            f.write(buffer.read())

    def merge_pdfs(self, pdf_paths: List[str], output_path: str) -> str:
        """
        Merge multiple PDFs into one.

        Args:
            pdf_paths: List of PDF file paths
            output_path: Path for merged PDF

        Returns:
            Path to merged PDF
        """
        try:
            writer = PdfWriter()

            for pdf_path in pdf_paths:
                if os.path.exists(pdf_path):
                    reader = PdfReader(pdf_path)
                    for page in reader.pages:
                        writer.add_page(page)

            with open(output_path, 'wb') as output_file:
                writer.write(output_file)

            return output_path
        except Exception as e:
            raise Exception(f"Error merging PDFs: {str(e)}")

    def add_page_numbers(self, pdf_path: str, output_path: str, start_page: int = 1):
        """
        Add page numbers to PDF.

        Args:
            pdf_path: Path to input PDF
            output_path: Path for output PDF
            start_page: Starting page number
        """
        try:
            reader = PdfReader(pdf_path)
            writer = PdfWriter()

            for i, page in enumerate(reader.pages):
                page_num = start_page + i

                # Create overlay with page number
                packet = BytesIO()
                can = canvas.Canvas(packet, pagesize=A4)
                can.drawString(A4[0] / 2, 1.5 * cm, str(page_num))
                can.save()

                packet.seek(0)
                overlay = PdfReader(packet)

                # Merge overlay with original page
                page.merge_page(overlay.pages[0])
                writer.add_page(page)

            with open(output_path, 'wb') as output_file:
                writer.write(output_file)

        except Exception as e:
            raise Exception(f"Error adding page numbers: {str(e)}")

    def create_toc_pdf(self, toc_entries: List[dict], output_path: str, page_size=A4):
        """
        Create table of contents PDF.

        Args:
            toc_entries: List of {'title': str, 'author': str, 'page': int}
            output_path: Path for output PDF
            page_size: Page size tuple
        """
        try:
            c = canvas.Canvas(output_path, pagesize=page_size)
            width, height = page_size

            # Title
            c.setFont("Helvetica-Bold", 16)
            c.drawString(2 * cm, height - 3 * cm, "СОДЕРЖАНИЕ")

            # Entries
            c.setFont("Helvetica", 10)
            y_position = height - 5 * cm

            for entry in toc_entries:
                if y_position < 3 * cm:
                    c.showPage()
                    y_position = height - 3 * cm

                # Author and title
                text = f"{entry['author']}. {entry['title']}"
                page_num = str(entry['page'])

                # Draw text
                c.drawString(2 * cm, y_position, text[:80])

                # Draw page number (right-aligned)
                c.drawRightString(width - 2 * cm, y_position, page_num)

                y_position -= 0.7 * cm

            c.save()
        except Exception as e:
            raise Exception(f"Error creating TOC: {str(e)}")
