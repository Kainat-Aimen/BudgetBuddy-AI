"""
BudgetBuddy AI - Spending Forecast
Owner: Member 6

TODO:
1. Group transactions by month + category before averaging.
2. (Stretch) Replace the moving average with a simple linear regression
   per category using numpy/scikit-learn for a slightly smarter trend line.
"""

from collections import defaultdict


def forecast_next_month(transactions: list) -> dict:
    """
    Returns a predicted spend per category based on historical averages.
    transactions: list of dicts, each with 'amount', 'category', 'date'.
    """
    totals_by_category = defaultdict(list)

    for t in transactions:
        totals_by_category[t.get("category", "Other")].append(t.get("amount", 0))

    prediction = {}
    for category, amounts in totals_by_category.items():
        if amounts:
            prediction[category] = round(sum(amounts) / len(amounts), 2)

    return prediction
