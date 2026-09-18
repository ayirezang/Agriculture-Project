# Skill: Outreach Draft

Write a clear, professional outreach message for a ranked buyer.

# When to use

After buyer search/ranking picks the best match, and the farmer wants
to contact that buyer.

# Steps

1. Read `memory/listings.json` for the produce details: crop, quantity,
   unit, minPrice, town/region.
2. Read `memory/buyers.json` for the chosen buyer: name, pricePerKg,
   quantity wanted.
3. Draft a short message (4-6 lines max) that includes:
   Greeting with the buyer's name
   What the farmer has: crop, quantity, unit
   Where and when it can be picked up (listing location)
   The price you're offering (must be >= minPrice) — or ask the buyer
   to confirm theirs if it's already above the floor
   Prices are in Ghana Cedis (GH₵). Never write USD.
   A clear next step (confirm quantity, pickup, or a call time)
4. Keep the tone respectful and plain. One ask, one price, one next step.
5. Show the draft to the farmer for approval. You DO NOT send it yourself.

# Output format

Return the draft message and a 1-line summary of the deal it proposes.
Never invent details not in memory (no fake quantities, dates, or prices).

# Guardrail

Draft-only. Real sending happens through a separate send skill the
farmer approves. If the buyer's offer is below the floor, do NOT draft
an acceptance — flag it and let negotiation handle it.
