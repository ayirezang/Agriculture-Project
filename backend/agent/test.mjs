import { runAgent } from "./agentService.mjs";
const listing = {
  crop: "Maize",
  quantity: 10,
  unit: "bags",
  minPrice: 3.3,
  location: { town: "Koforidua", region: "Eastern Region" },
};
const buyers = [
  {
    id: 1,
    name: "Eastern Grains Ltd.",
    crop: "Maize",
    pricePerKg: 3.55,
    quantity: 12,
    town: "Koforidua",
    verified: true,
  },
  {
    id: 2,
    name: "Golden Harvest Foods",
    crop: "Maize",
    pricePerKg: 3.48,
    quantity: 30,
    town: "Accra",
    verified: true,
  },
  {
    id: 3,
    name: "Nana K. Trading",
    crop: "Maize",
    pricePerKg: 3.2,
    quantity: 8,
    town: "Nkawkaw",
    verified: true,
  },
];
const result = await runAgent(listing, buyers);
console.log(JSON.stringify(result, null, 2));
