# Skill: Buyer Search

Find and rank real buyers for the farmer's produce.

# When to use

Whenever the farmer wants to sell a listing, or asks "who can I sell to?".

# Steps

1. Read `memory/listings.json` to get the current listing: crop, quantity,
   unit, minPrice, town/region.
2. Read `memory/buyers.json` to get candidate buyers and their offers.
   Each buyer entry must contain: id, name, crop, pricePerKg, quantity
   wanted, town/region, verified.
3. Keep only buyers where ALL of these hold:
   crop matches the listing (or is a clear substitute — ask if unsure)
   pricePerKg >= the listing's minPrice (hard floor, never below)
   quantity wanted is within reason of what the farmer has
4. Score each remaining buyer 0-100:
   40 pts price: pricePerKg above minPrice earns up to 40 (higher = more)
   25 pts distance: closer town/region earns more
   20 pts quantity fit: buyer wants roughly what the farmer has
   15 pts verified status: verified = full marks
5. Sort by score, highest first. Output the top 3 as ranked matches.

# Output format

For each match, report: buyer name, pricePerKg, distance, fitScore,
and one line saying why it ranked there. Never invent a buyer or offer
that is not in memory. If buyers.json is empty or has no offers above
minPrice, say so plainly and suggest re-advertising or lowering the
floor (never lower it yourself without the farmer's ok).

# Guardrail

Fit scores must be computed from real memory data, not guessed.
Save it. Next: skills/price-negotiation/SKILL.md — say when.
