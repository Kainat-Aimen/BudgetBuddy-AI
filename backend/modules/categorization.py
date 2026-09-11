"""
BudgetBuddy AI - Auto-Categorization
Owner: Member 3

TODO:
1. Expand KEYWORD_MAP with more real-world merchant names.
2. (Stretch) Replace/augment with a trained TF-IDF + Logistic Regression
   classifier for descriptions the dictionary doesn't cover.
"""

KEYWORD_MAP = {
    "careem": "Transport",
    "uber": "Transport",
    "foodpanda": "Food",
    "kfc": "Food",
    "mcdonalds": "Food",
    "k-electric": "Bills",
    "ptcl": "Bills",
    "jazz": "Bills",
    "daraz": "Shopping",
    "grocery": "Groceries",
    "imtiaz": "Groceries",
}


def categorize(description: str) -> str:
    """
    Returns a category string for a given transaction description.
    Falls back to 'Other' if nothing matches.
    """
    if not description:
        return "Other"

    text = description.lower()
    for keyword, category in KEYWORD_MAP.items():
        if keyword in text:
            return category

    return "Other"
