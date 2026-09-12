# backend/modules/anomaly_detection.py

def is_anomaly(amount: float, category: str, history: list) -> bool:
    """
    Check whether a transaction amount is unusually high
    compared with the user's historical spending in the same category.
    """

    # Get previous transactions from the same category
    category_history = [
        transaction["amount"]
        for transaction in history
        if transaction["category"].lower() == category.lower()
    ]

    # Not enough history to determine an anomaly
    if not category_history:
        return False

    # Calculate historical average
    average = sum(category_history) / len(category_history)

    # Flag transactions significantly above the average
    return amount > average * 2

