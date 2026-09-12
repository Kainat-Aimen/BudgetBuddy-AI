"""
BudgetBuddy AI - Anomaly Detection
Owner: Member 3

TODO:
1. Tune the MULTIPLIER threshold based on real test data.
2. (Stretch) Consider category-specific thresholds instead of one global value.
"""

MULTIPLIER = 2.5  # flag transactions this many times above the historical average


def is_anomaly(amount: float, category: str, history: list) -> bool:
    """
    history: list of past transaction dicts in the same category,
             each with an 'amount' key.
    Returns True if `amount` is unusually high compared to history.
    """
    if not history:
        return False

    past_amounts = [t["amount"] for t in history if "amount" in t]
    if not past_amounts:
        return False

    average = sum(past_amounts) / len(past_amounts)
    return amount > average * MULTIPLIER
