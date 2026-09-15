# Skill: Price Negotiation

Hold offers at or above the farmer's minimum price.

# When to use

After outreach, when a buyer replies with an offer or counter-offer, or
whenever a price is on the table.

# Hard rules

The listing's minPrice (from `memory/listings.json`) is a hard floor.
Never propose, accept, or suggest a figure below it. No exceptions.
Never lower the floor without the farmer's explicit approval.
Stay inside the quantity and unit stated in the listing. If a buyer
asks in a different unit, convert transparently and confirm.

## Steps

1. Read the active deal from `memory/negotiations.json`.
2. Compare the buyer's offer to the floor:
   offer >= minPrice: acceptable. Aim to close near the offer or
   negotiate upward, never down.
   offer < minPrice: reject politely, restate the floor, and give the
   buyer room to meet it. No weakness talk, no silence pressure.
3. Keep replies short, warm, and factual: state the price and the reason
   (quality, quantity, distance).
4. After every agreed price, update the deal in negotiations.json and
   record it in `memory/facts.json`.

# Output format

Return: the buyer's offer, whether it passed the floor, your recommended
reply, and the target figure. Never invent an offer that isn't in memory.

# Guardrail

The farmer's floor is law. If you feel pressured to break it, stop and
ask the farmer first.
