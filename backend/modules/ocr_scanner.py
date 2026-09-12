"""
BudgetBuddy AI - Receipt Scanner (OCR)
Owner: Member 5

TODO:
1. Install pytesseract + Pillow (or easyocr) and add to requirements.txt.
2. Implement extract_text() using your chosen OCR engine.
3. Improve the regex patterns in parse_fields() using real sample receipts.
"""

import re


def extract_text(image_file) -> str:
    """
    image_file: a file-like object (e.g. from Flask's request.files['receipt'])
    TODO (Member 5): run this through Tesseract/EasyOCR and return the raw text.

    Example with pytesseract:
        from PIL import Image
        import pytesseract
        img = Image.open(image_file)
        return pytesseract.image_to_string(img)
    """
    return ""  # placeholder


def parse_fields(raw_text: str) -> dict:
    """
    Extracts amount, vendor, and date from raw OCR text using simple patterns.
    TODO (Member 5): refine these regex patterns against real receipts.
    """
    amount_match = re.search(r"(?:total|amount due)[:\s]*\$?([\d,]+\.\d{2})", raw_text, re.IGNORECASE)
    date_match = re.search(r"(\d{2}[/-]\d{2}[/-]\d{2,4})", raw_text)

    return {
        "amount": float(amount_match.group(1).replace(",", "")) if amount_match else None,
        "vendor": None,  # TODO: extract vendor name, often the first line of the receipt
        "date": date_match.group(1) if date_match else None,
    }


def scan_receipt(image_file) -> dict:
    """
    Main entry point called from app.py's /scan-receipt route.
    """
    raw_text = extract_text(image_file)
    return parse_fields(raw_text)
