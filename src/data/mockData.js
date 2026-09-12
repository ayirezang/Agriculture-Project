export const buyerListings = [
  { id: 1, buyer: "Eastern Grains Ltd.", initials: "EG", crop: "Maize", quantity: 12, unit: "tonnes", offer: 3.55, location: "Koforidua", distance: "18 km", status: "High match", verified: true, color: "bg-emerald-100 text-emerald-700" },
  { id: 2, buyer: "Golden Harvest Foods", initials: "GH", crop: "Maize", quantity: 30, unit: "tonnes", offer: 3.48, location: "Accra", distance: "78 km", status: "Good match", verified: true, color: "bg-amber-100 text-amber-700" },
  { id: 3, buyer: "Nana K. Trading", initials: "NK", crop: "Maize", quantity: 8, unit: "tonnes", offer: 3.40, location: "Nkawkaw", distance: "62 km", status: "Good match", verified: true, color: "bg-blue-100 text-blue-700" },
  { id: 4, buyer: "Volta Agro Processors", initials: "VA", crop: "Cassava", quantity: 50, unit: "tonnes", offer: 2.10, location: "Ho", distance: "112 km", status: "Open", verified: true, color: "bg-violet-100 text-violet-700" },
  { id: 5, buyer: "Adom Fresh Produce", initials: "AF", crop: "Plantain", quantity: 20, unit: "tonnes", offer: 4.20, location: "Tema", distance: "92 km", status: "Open", verified: true, color: "bg-orange-100 text-orange-700" },
];

export const transactions = [
  { crop: "Maize", quantity: "8 bags", buyer: "Eastern Grains Ltd.", price: "GH₵ 3.55/kg", total: "GH₵ 1,136", status: "Completed", date: "Today" },
  { crop: "Cassava", quantity: "1.2 tonnes", buyer: "Volta Agro Processors", price: "GH₵ 2.10/kg", total: "GH₵ 2,520", status: "In progress", date: "Yesterday" },
  { crop: "Plantain", quantity: "16 crates", buyer: "Adom Fresh Produce", price: "GH₵ 4.20/kg", total: "GH₵ 1,680", status: "Completed", date: "Sep 08" },
];

export const agentMessages = [
  { role: "agent", text: "Hi Kwame 👋 I’m ready to find the best buyer for your produce. Tell me what you have, how much, and where it is." },
  { role: "user", text: "I have 10 bags of maize to sell in Koforidua. I don't want less than GH₵3.30/kg." },
  { role: "agent", text: "Got it. I’ll search registered buyers for maize around Koforidua, compare their offers against your GH₵3.30/kg minimum, and prioritize the best net value." },
];
