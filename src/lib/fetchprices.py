import aiohttp # type: ignore
import asyncio
import logging
import json
import os

PRICES_URL = "https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json"
PRICE_FILE_PATH = os.path.join(os.path.dirname(__file__), "model_prices.json")

async def fetch_costs():
    async with aiohttp.ClientSession() as session:
        async with session.get(PRICES_URL) as response:
            if response.status == 200:
                return await response.json(content_type=None)
            else:
                raise Exception(f"Failed to fetch token costs, status code: {response.status}")

async def update_token_costs():
    try:
        token_costs = await fetch_costs()
        with open(PRICE_FILE_PATH, "w") as f:
            json.dump(token_costs, f)
    except Exception as e:
        logging.error(f"Failed to update token costs: {e}")
        raise

if __name__ == "__main__":
    try:
        asyncio.run(update_token_costs())
    except Exception as e:
        logging.error(f"Error: {e}")
