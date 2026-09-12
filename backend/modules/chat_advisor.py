"""
BudgetBuddy AI - Chat Advisor
Owner: Member 4

TODO:
1. Add your LLM API key (use an environment variable, never hardcode it).
2. Fill in the actual API call below (Anthropic/OpenAI SDK).
3. Refine PROMPT_TEMPLATE with better formatting/instructions after testing.
"""

import os

PROMPT_TEMPLATE = """You are a helpful personal finance coach.
Here is the user's recent transaction data: {data}

The user asks: "{question}"

Give clear, specific, actionable advice based on their actual numbers.
Keep the answer short and conversational.
"""


def get_advice(question: str, transactions: list) -> str:
    """
    Builds a prompt from the user's real transaction data and calls the LLM API.
    Returns the advisor's text response.
    """
    prompt = PROMPT_TEMPLATE.format(data=transactions, question=question)

    # TODO (Member 4): replace this stub with an actual API call, e.g.:
    #
    # from anthropic import Anthropic
    # client = Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    # response = client.messages.create(
    #     model="claude-sonnet-4-6",
    #     max_tokens=300,
    #     messages=[{"role": "user", "content": prompt}]
    # )
    # return response.content[0].text

    return "TODO: connect this to the LLM API. (See comments in this file.)"
