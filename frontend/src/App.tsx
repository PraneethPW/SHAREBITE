import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "./env";
import "./index.css";
import { DashboardPage } from "./pages/DashboardPage";
import { LandingPage } from "./pages/LandingPage";
import type { AiPlan, AnalyticsOverview, Claim, Donation, FeedFilter, Role, User } from "./types/foodshare";
import { demoCredentials } from "./types/foodshare";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState(localStorage.getItem("foodshare_token") || localStorage.getItem("sharebite_token") || "");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [role, setRole] = useState<Role>("donor");
  const [donations, setDonations] = useState<Donation[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [search, setSearch] = useState("");
  const [aiPlan, setAiPlan] = useState<AiPlan | null>(null);
  const [selectedDonationId, setSelectedDonationId] = useState("");
  const [selectedClaimId, setSelectedClaimId] = useState("");
  const [message, setMessage] = useState("");
  const [authError, setAuthError] = useState("");
  const [feedFilter, setFeedFilter] = useState<FeedFilter>("all");

  const authHeaders = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);
  const selectedDemo = demoCredentials[role];

  const refresh = useCallback(
    async (nextToken = token) => {
      if (!nextToken) return;
      const headers = { Authorization: `Bearer ${nextToken}` };
      const [me, list, stats, claimList] = await Promise.all([
        api.get("/me", { headers }),
        api.get("/donations", { headers }),
        api.get("/analytics/overview", { headers }),
        api.get("/claims", { headers })
      ]);
      setUser(me.data.user);
      setDonations(list.data.donations);
      setAnalytics(stats.data);
      setClaims(claimList.data.claims);
    },
    [token]
  );

  function logout() {
    localStorage.removeItem("foodshare_token");
    localStorage.removeItem("sharebite_token");
    setToken("");
    setUser(null);
  }

  useEffect(() => {
    const id = window.setTimeout(() => {
      void refresh().catch(() => logout());
    }, 0);
    return () => window.clearTimeout(id);
  }, [refresh]);

  function switchAuthMode(nextMode: "login" | "register", nextRole = role) {
    setAuthMode(nextMode);
    setRole(nextRole);
    setAuthError("");
  }

  function scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function goToAuth(mode: "login" | "register", nextRole = role) {
    switchAuthMode(mode, nextRole);
    setTimeout(() => scrollToSection("auth"), 0);
  }

  async function handleAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthError("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim().toLowerCase();
    const password = String(form.get("password") || "");
    const payload =
      authMode === "login"
        ? { email, password }
        : {
            name: String(form.get("name") || "").trim(),
            email,
            password,
            role,
            location: String(form.get("location") || "").trim()
          };

    try {
      const endpoint = authMode === "login" ? "/auth/login" : "/auth/register";
      const { data } = await api.post(endpoint, payload, {
        headers: { "Content-Type": "application/json" }
      });
      localStorage.setItem("foodshare_token", data.token);
      setToken(data.token);
      setUser(data.user);
      await refresh(data.token);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setAuthError(
          [error.response?.data?.message, error.response?.data?.hint].filter(Boolean).join(" ") ||
            (authMode === "login"
              ? "Could not sign in. Check email and password."
              : "Could not create the account. Fill every field (name and location need at least 2 characters).")
        );
        return;
      }
      setAuthError(authMode === "login" ? "Could not sign in." : "Could not create the account.");
    }
  }

  async function addDonation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const expiresAt = new Date(Date.now() + Number(form.get("hours")) * 60 * 60 * 1000).toISOString();
    await api.post(
      "/donations",
      {
        title: String(form.get("title")),
        category: String(form.get("category")),
        quantity: Number(form.get("quantity")),
        location: String(form.get("location")),
        pickupWindow: String(form.get("pickupWindow")),
        expiresAt,
        notes: String(form.get("notes"))
      },
      { headers: authHeaders }
    );
    event.currentTarget.reset();
    setMessage("Listing published. FoodShare AI is ready to route the pickup.");
    await refresh();
  }

  async function claimFood(id: string) {
    try {
      setSelectedDonationId(id);
      const { data } = await api.post(`/donations/${id}/claim`, {}, { headers: authHeaders });
      setAiPlan(data.aiPlan);
      setMessage(`Claim accepted. AI dispatch generated ${data.aiPlan.etaMinutes} min ETA and INR ${data.aiPlan.estimatedCostInr} pickup cost.`);
      await refresh();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setMessage(error.response?.data?.message || "Could not claim this listing. Please refresh and try again.");
        return;
      }
      setMessage("Could not claim this listing. Please refresh and try again.");
    }
  }

  async function estimate(target?: Donation | Claim) {
    const sample = target || donations.find((item) => item.id === selectedDonationId) || donations[0] || claims[0];
    if ("donation_id" in (sample || {})) {
      setSelectedClaimId((sample as Claim).id);
    } else if (sample?.id) {
      setSelectedDonationId(sample.id);
      setSelectedClaimId("");
    }
    const { data } = await api.post(
      "/ai/estimate",
      {
        origin: sample?.location || "Kukatpally, Hyderabad",
        destination: user?.role === "receiver" ? user!.location : "Nearest receiver hub, Hyderabad",
        food: sample?.title || "Packed meals",
        quantity: sample?.quantity || 30,
        pickupWindow: sample?.pickup_window || "Today evening"
      },
      { headers: authHeaders }
    );
    setAiPlan(data.plan);
  }

  const filtered = donations.filter((item) => `${item.title} ${item.location} ${item.category}`.toLowerCase().includes(search.toLowerCase()));
  const myListings = useMemo(
    () => (user ? donations.filter((d) => d.donor_name === user.name && d.status !== "expired") : []),
    [donations, user]
  );
  const receiverFeed = useMemo(() => {
    const match = (re: RegExp) => filtered.filter((item) => re.test(`${item.title} ${item.category}`.toLowerCase()));
    if (feedFilter === "cooked") return match(/biryani|rice|meal|cooked|curry|paneer|chicken|thali/);
    if (feedFilter === "bakery") return match(/bread|cake|bakery|pastry|bun|croissant/);
    if (feedFilter === "produce") return match(/fruit|veg|produce|salad|greens/);
    return filtered;
  }, [filtered, feedFilter]);
  const donorLiveSkus = useMemo(() => myListings.filter((d) => d.status === "available").length, [myListings]);
  const donorMealsOnShelf = useMemo(() => myListings.filter((d) => d.status === "available").reduce((a, d) => a + d.quantity, 0), [myListings]);
  const donorUrgentSkus = useMemo(
    () =>
      myListings.filter((d) => {
        // eslint-disable-next-line react-hooks/purity -- relative expiry needs current clock
        const h = (new Date(d.expires_at).getTime() - Date.now()) / 3600000;
        return h > 0 && h < 6;
      }).length,
    [myListings]
  );
  const trend = analytics?.monthlyTrend || [];
  const selectedClaim = claims.find((claim) => claim.id === selectedClaimId) || claims[0];
  const selectedDonation = donations.find((item) => item.id === selectedDonationId) || donations[0];
  const activeAiPlan = selectedClaimId ? selectedClaim?.ai_plan || aiPlan : aiPlan || selectedClaim?.ai_plan;
  const activeContextTitle = selectedClaim?.title || selectedDonation?.title || "No listing selected";
  const activeOrigin = selectedClaim?.location || selectedDonation?.location || "Pickup origin pending";
  const activeDestination = user?.role === "receiver" ? user.location : selectedClaim?.receiver_location || "Receiver hub pending";
  const availableMeals = filtered.reduce((total, item) => total + item.quantity, 0);
  const claimedMeals = claims.reduce((total, item) => total + item.quantity, 0);
  const forecastData =
    user?.role === "donor"
    ? [
        { area: "NGOs", claims: Math.max(18, claims.length * 6 + 18) },
        { area: "Hostels", claims: Math.max(24, availableMeals || 24) },
        { area: "Shelters", claims: Math.max(15, Math.round((analytics?.meals_shared || 42) * 0.35)) },
        { area: "Volunteers", claims: Math.max(12, myListings.length * 9 + 12) }
      ]
    : [
        { area: "North", claims: Math.max(8, claims.length * 5 + 12) },
        { area: "Central", claims: Math.max(14, claimedMeals || 18) },
        { area: "West", claims: Math.max(10, Math.round(availableMeals * 0.45) || 10) },
        { area: "East", claims: Math.max(9, Math.round(availableMeals * 0.32) || 9) }
      ];

  if (!user) {
    return (
      <LandingPage
        authMode={authMode}
        role={role}
        onSetRole={setRole}
        authError={authError}
        selectedDemo={selectedDemo}
        onGoToAuth={goToAuth}
        onSubmitAuth={handleAuth}
        onSwitchAuthMode={switchAuthMode}
      />
    );
  }

  return (
    <DashboardPage
      user={user}
      message={message}
      onLogout={logout}
      onScrollTo={scrollToSection}
      donorLiveSkus={donorLiveSkus}
      donorMealsOnShelf={donorMealsOnShelf}
      donorUrgentSkus={donorUrgentSkus}
      receiverFeed={receiverFeed}
      claimedMeals={claimedMeals}
      analytics={analytics}
      claims={claims}
      myListings={myListings}
      selectedDonationId={selectedDonationId}
      setSelectedDonationId={setSelectedDonationId}
      onAddDonation={addDonation}
      search={search}
      setSearch={setSearch}
      feedFilter={feedFilter}
      setFeedFilter={setFeedFilter}
      onEstimate={estimate}
      onClaimFood={claimFood}
      selectedClaimId={selectedClaimId}
      setSelectedClaimId={setSelectedClaimId}
      activeAiPlan={activeAiPlan}
      activeContextTitle={activeContextTitle}
      activeOrigin={activeOrigin}
      activeDestination={activeDestination}
      trend={trend}
      forecastData={forecastData}
      availableMeals={availableMeals}
    />
  );
}
