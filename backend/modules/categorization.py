CATEGORY_KEYWORDS = {
    "Transport": [
        "careem",
        "uber",
        "bykea",
        "indrive",
        "fuel",
        "petrol",
        "parking",
        "bus",
        "train",
    ],
    "Food": [
        "foodpanda",
        "restaurant",
        "burger",
        "pizza",
        "kfc",
        "mcdonald",
        "food",
        "cafe",
        "coffee",
    ],
    "Shopping": [
        "daraz",
        "amazon",
        "clothes",
        "shoes",
        "shopping",
        "mall",
    ],
    "Bills": [
        "electricity",
        "gas",
        "water",
        "internet",
        "bill",
        "k-electric",
        "ptcl",
    ],
    "Entertainment": [
        "netflix",
        "spotify",
        "youtube",
        "movie",
        "cinema",
        "game",
    ],
    "Healthcare": [
        "hospital",
        "doctor",
        "pharmacy",
        "medicine",
        "clinic",
    ],
}
def categorize(description: str) -> str:
    """
    Predict the category of a transaction based on its description.
    """

    description = description.lower()

    for category, keywords in CATEGORY_KEYWORDS.items():
        for keyword in keywords:
            if keyword in description:
                return category

    return "Other"
