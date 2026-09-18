const BASE = "http://localhost:5000";

async function api(method, path, body, token) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok && res.status !== 200) {
    throw new Error(`${method} ${path} -> ${res.status}: ${data.message || JSON.stringify(data)}`);
  }
  return data;
}

const user = (role, n) => ({
  name: `${role} ${n}`,
  email: `${role}${n}@test.com`,
  phone: `+000${n}${n}${n}${role === "farmer" ? "1" : "2"}`,
  password: "password123",
  role,
  location: { town: "Koforidua", region: "Eastern Region" },
});

const makeUserAndLogin = async (role, n) => {
  const u = user(role, n);
  let data = await api("POST", "/api/auth/register", u).catch(() =>
    api("POST", "/api/auth/login", { email: u.email, password: u.password })
  );
  if (!data.token) data = await api("POST", "/api/auth/login", { email: u.email, password: u.password });
  return { ...data.user, token: data.token };
};

console.log("1. Creating test users...");
const farmer = await makeUserAndLogin("farmer", 1);
const buyer = await makeUserAndLogin("buyer", 1);
console.log("   farmer id:", farmer.id, "| buyer id:", buyer.id);

console.log("2. Creating buyer request (maize, max GH¢3.50)...");
const req = await api("POST", "/api/buyer-requests", {
  crop: "maize",
  quantity: 10,
  unit: "bags",
  maxPrice: 3.5,
  location: { town: "Koforidua", region: "Eastern Region" },
}, buyer.token);
console.log("   request id:", req.request._id);

console.log("3. Creating farmer listing (maize, min GH¢3.30)...");
const listing = await api("POST", "/api/listings", {
  crop: "maize",
  quantity: 10,
  unit: "bags",
  minPrice: 3.3,
  location: { town: "Koforidua", region: "Eastern Region" },
}, farmer.token);
console.log("   listing id:", listing.listing._id);

console.log("4. Running the AI agent (this takes ~30-60s)...");
const agent = await api("POST", `/api/agent/run/${listing.listing._id}`, null, farmer.token);

console.log("\n=== AGENT RESULT ===");
console.log(JSON.stringify(agent, null, 2));