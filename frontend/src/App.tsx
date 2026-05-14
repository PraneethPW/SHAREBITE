import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, PerspectiveCamera, Text } from "@react-three/drei";
import axios from "axios";
import {
  Activity,
  ArrowRight,
  Banknote,
  BarChart3,
  Brain,
  Building2,
  CheckCircle2,
  Clock3,
  Compass,
  Cpu,
  Flame,
  Gauge,
  GitBranch,
  HandHeart,
  Layers,
  Leaf,
  LineChart,
  LogOut,
  Map,
  MapPin,
  Navigation,
  PackageCheck,
  PackagePlus,
  Radar,
  Radio,
  Search,
  ShieldCheck,
  Sparkles,
  Tag,
  ThermometerSun,
  Truck,
  UserRound,
  Utensils,
  Zap
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Group } from "three";
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "./env";
import "./index.css";
const demoCredentials: Record<Role, { email: string; password: string; label: string }> = {
  donor: { email: "donor@sharebite.dev", password: "password123", label: "Donor login" },
  receiver: { email: "receiver@sharebite.dev", password: "password123", label: "Receiver login" }
};

type Role = "donor" | "receiver";
type User = { id: string; name: string; email: string; role: Role; location: string };
type Donation = {
  id: string;
  title: string;
  category: string;
  quantity: number;
  location: string;
  pickup_window: string;
  expires_at: string;
  status: string;
  donor_name: string;
};
type AiPlan = {
  etaMinutes: number;
  distanceKm: number;
  estimatedCostInr: number;
  spoilageRisk: string;
  bestRoute: string;
  pickupAdvice: string;
  confidence: number;
  source?: "openrouter" | "local-estimator";
  generatedAt?: string;
  freshnessScore?: number;
  demandSignal?: string;
  carbonKgSaved?: number;
  recommendedVehicle?: string;
  weatherRiskNote?: string;
  batchingSuggestion?: string;
  complianceNotes?: string;
  neuralSummary?: string;
};
type Claim = {
  id: string;
  status: "pending" | "approved" | "completed";
  ai_plan: AiPlan;
  created_at: string;
  donation_id: string;
  title: string;
  category: string;
  quantity: number;
  location: string;
  pickup_window: string;
  expires_at: string;
  donation_status: string;
  donor_name: string;
  receiver_name: string;
  receiver_location: string;
};

function hoursUntil(iso: string) {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "—";
  const ms = t - Date.now();
  if (ms <= 0) return "Expired";
  if (ms < 3600000) return `${Math.max(1, Math.round(ms / 60000))}m`;
  return `${Math.round(ms / 3600000)}h`;
}

function handoffReadiness(id: string, qty: number) {
  const seed = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return Math.min(98, 68 + (seed % 22) - Math.min(15, Math.floor(qty / 20)));
}

function FoodShareScene() {
  const vehicle = useRef<Group>(null);
  const route = useRef<Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (vehicle.current) {
      vehicle.current.position.x = Math.sin(t * 0.7) * 0.85;
      vehicle.current.position.z = Math.cos(t * 0.7) * 0.18;
      vehicle.current.rotation.y = Math.sin(t * 0.7) * 0.2;
    }
    if (route.current) route.current.rotation.y = Math.sin(t * 0.35) * 0.06;
  });

  const buildings = [
    [-2.4, -0.95, -0.7, 0.52, 1.3, 0.52, "#314159"],
    [-1.55, -0.72, -1.05, 0.44, 0.86, 0.44, "#42526a"],
    [1.55, -0.82, -0.95, 0.5, 1.08, 0.5, "#2a394f"],
    [2.35, -0.66, -0.35, 0.42, 0.78, 0.42, "#506178"],
    [-2.15, -0.82, 1.0, 0.48, 1.02, 0.48, "#24364c"],
    [2.05, -0.78, 0.92, 0.54, 0.94, 0.54, "#3d4d64"]
  ] as const;

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 3.3, 5.4]} fov={42} />
      <ambientLight intensity={0.95} />
      <directionalLight position={[4, 6, 4]} intensity={2.2} />
      <spotLight position={[-3, 5, 2]} angle={0.45} penumbra={0.5} intensity={2.4} color="#7dd3fc" />

      <mesh rotation-x={-Math.PI / 2} position={[0, -1.25, 0]}>
        <planeGeometry args={[6.3, 4.2]} />
        <meshStandardMaterial color="#162233" roughness={0.72} metalness={0.08} />
      </mesh>

      <group ref={route}>
        <mesh rotation-x={-Math.PI / 2} position={[0, -1.215, 0]}>
          <boxGeometry args={[4.8, 0.1, 0.08]} />
          <meshStandardMaterial color="#5eead4" emissive="#0f766e" emissiveIntensity={0.7} />
        </mesh>
        <mesh rotation-x={-Math.PI / 2} rotation-z={0.72} position={[1.1, -1.205, 0.42]}>
          <boxGeometry args={[1.7, 0.1, 0.08]} />
          <meshStandardMaterial color="#fbbf24" emissive="#92400e" emissiveIntensity={0.55} />
        </mesh>
        <mesh rotation-x={-Math.PI / 2} rotation-z={-0.6} position={[-1.3, -1.205, -0.36]}>
          <boxGeometry args={[1.55, 0.1, 0.08]} />
          <meshStandardMaterial color="#60a5fa" emissive="#1d4ed8" emissiveIntensity={0.48} />
        </mesh>
      </group>

      {buildings.map(([x, y, z, w, h, d, color]) => (
        <mesh key={`${x}-${z}`} position={[x, y + h / 2, z]}>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color={color} roughness={0.42} metalness={0.25} />
        </mesh>
      ))}

      <Float speed={1.7} floatIntensity={0.25} rotationIntensity={0.15}>
        <group position={[-2.25, 0.65, -0.15]}>
          <mesh>
            <cylinderGeometry args={[0.22, 0.22, 0.08, 32]} />
            <meshStandardMaterial color="#f97316" emissive="#9a3412" emissiveIntensity={0.35} />
          </mesh>
          <mesh position={[0, -0.33, 0]}>
            <coneGeometry args={[0.18, 0.62, 32]} />
            <meshStandardMaterial color="#f97316" />
          </mesh>
          <Text position={[0, 0.38, 0]} fontSize={0.16} color="#fff7ed" anchorX="center">DONOR</Text>
        </group>
      </Float>

      <Float speed={1.5} floatIntensity={0.22} rotationIntensity={0.12}>
        <group position={[2.25, 0.65, 0.15]}>
          <mesh>
            <cylinderGeometry args={[0.22, 0.22, 0.08, 32]} />
            <meshStandardMaterial color="#22c55e" emissive="#166534" emissiveIntensity={0.4} />
          </mesh>
          <mesh position={[0, -0.33, 0]}>
            <coneGeometry args={[0.18, 0.62, 32]} />
            <meshStandardMaterial color="#22c55e" />
          </mesh>
          <Text position={[0, 0.38, 0]} fontSize={0.16} color="#ecfdf5" anchorX="center">RECEIVER</Text>
        </group>
      </Float>

      <group ref={vehicle} position={[0, -0.64, 0.03]}>
        <mesh position={[0, 0.18, 0]}>
          <boxGeometry args={[0.95, 0.36, 0.5]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.36} metalness={0.15} />
        </mesh>
        <mesh position={[0.35, 0.42, 0]}>
          <boxGeometry args={[0.34, 0.26, 0.46]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.22} metalness={0.18} />
        </mesh>
        <mesh position={[-0.28, 0.46, 0]}>
          <boxGeometry args={[0.38, 0.24, 0.36]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.32} />
        </mesh>
        {[-0.32, 0.34].map((x) => (
          <group key={x}>
            <mesh position={[x, -0.03, 0.28]} rotation-x={Math.PI / 2}>
              <cylinderGeometry args={[0.09, 0.09, 0.08, 24]} />
              <meshStandardMaterial color="#0f172a" />
            </mesh>
            <mesh position={[x, -0.03, -0.28]} rotation-x={Math.PI / 2}>
              <cylinderGeometry args={[0.09, 0.09, 0.08, 24]} />
              <meshStandardMaterial color="#0f172a" />
            </mesh>
          </group>
        ))}
      </group>

      <Float speed={2.1} floatIntensity={0.35}>
        <group position={[0, 1.72, 0]}>
          <mesh>
            <boxGeometry args={[2.65, 0.72, 0.08]} />
            <meshStandardMaterial color="#0f172a" roughness={0.28} metalness={0.45} />
          </mesh>
          <Text position={[-0.92, 0.1, 0.06]} fontSize={0.15} color="#cbd5e1" anchorX="left">NEURAL DISPATCH</Text>
          <Text position={[-0.92, -0.16, 0.06]} fontSize={0.24} color="#ffffff" anchorX="left">24 min | INR 186</Text>
          <Text position={[0.77, -0.18, 0.06]} fontSize={0.18} color="#a78bfa" anchorX="left">92 FRESH</Text>
        </group>
      </Float>
      <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.35} />
    </>
  );
}

function ProductVisual() {
  return (
    <div className="product-visual">
      <Canvas>
        <FoodShareScene />
      </Canvas>
    </div>
  );
}

function Brand() {
  return (
    <div className="brand">
      <span className="brand-mark">
        <HandHeart size={23} />
      </span>
      <span>FoodShare</span>
    </div>
  );
}

function LandingPersonas() {
  return (
    <section className="lp-persona-section" id="personas">
      <div className="section-heading">
        <p className="eyebrow"><Radio size={16} /> Donor vs receiver</p>
        <h2>One platform—two mission-critical consoles.</h2>
        <p>
          Donors protect inventory and brand trust. Receivers protect communities and timing. FoodShare routes intelligence differently for each
          role while keeping a single source of truth for every claim.
        </p>
      </div>
      <div className="lp-persona-grid">
        <article className="lp-persona-card lp-persona-donor">
          <div className="lp-persona-tag">
            <PackagePlus size={16} /> Donor control room
          </div>
          <h3>Publish, protect, prove.</h3>
          <p className="lp-persona-lead">
            Built for commissaries, cloud kitchens, grocers, and CSR teams who need audit-friendly surplus workflows—not ad hoc chats.
          </p>
          <ul className="lp-feature-list">
            <li>
              <CheckCircle2 size={18} />
              <span>Neural readiness scores every listing for spoilage, staffing, and corridor friction before receivers commit.</span>
            </li>
            <li>
              <CheckCircle2 size={18} />
              <span>Demand radar surfaces which neighborhoods are surging so you can stage portions where they will clear fastest.</span>
            </li>
            <li>
              <CheckCircle2 size={18} />
              <span>Carbon + compliance narratives auto-generated for ESG decks, donors, and regulators—grounded in live route math.</span>
            </li>
            <li>
              <CheckCircle2 size={18} />
              <span>Batching engine tells you when to isolate high-risk trays versus when to merge compatible stops safely.</span>
            </li>
          </ul>
          <p className="lp-persona-foot">Donor theme · Ember + forest accent · Operations-first IA</p>
        </article>

        <article className="lp-persona-card lp-persona-receiver">
          <div className="lp-persona-tag">
            <HandHeart size={16} /> Receiver mission desk
          </div>
          <h3>Discover, dispatch, deliver.</h3>
          <p className="lp-persona-lead">
            Built for NGOs, shelters, student hubs, and hyperlocal volunteers who need predictable pickups without burning out field teams.
          </p>
          <ul className="lp-feature-list">
            <li>
              <CheckCircle2 size={18} />
              <span>Preview AI plans with INR cost, ETA, vehicle class, and weather-risk notes before you accept a handoff.</span>
            </li>
            <li>
              <CheckCircle2 size={18} />
              <span>Freshness graph (0–100) translates model confidence into a single executive-friendly signal for your ops lead.</span>
            </li>
            <li>
              <CheckCircle2 size={18} />
              <span>Claim board becomes a live mission timeline—route string, risk tier, and model source stamped per order.</span>
            </li>
            <li>
              <CheckCircle2 size={18} />
              <span>Pickup capacity chart breaks down claim pressure by geography so you rebalance volunteers before bottlenecks hit.</span>
            </li>
          </ul>
          <p className="lp-persona-foot">Receiver theme · Electric blue + aqua accent · Field-first IA</p>
        </article>
      </div>
    </section>
  );
}

function LandingAiStack() {
  const tiles = [
    {
      title: "Multi-signal freshness graph",
      copy: "Fuses food class, quantity, pickup window, travel time, and humidity heuristics into a 0–100 freshness score with guardrails.",
      icon: <ThermometerSun size={22} />
    },
    {
      title: "Corridor demand radar",
      copy: "Classifies micro-demand as surging, steady, or cooling so donors stage the right SKUs and receivers prioritize scarce lanes.",
      icon: <Activity size={22} />
    },
    {
      title: "Neural routing + cost engine",
      copy: "LLM-augmented JSON plans merge with deterministic fallbacks so you always ship an ETA, INR band, and human-readable route story.",
      icon: <GitBranch size={22} />
    },
    {
      title: "Carbon-aware dispatch",
      copy: "Every plan carries estimated CO₂ avoided from rescued meals plus distance-aware logistics overhead for sustainability reporting.",
      icon: <Leaf size={22} />
    },
    {
      title: "Vehicle & batching classifiers",
      copy: "Recommends refrigerated van, insulated EV, or scout bike paths and states when multi-stop batching is safe vs isolated runs.",
      icon: <Truck size={22} />
    },
    {
      title: "Compliance copilot",
      copy: "Chain-of-custody, allergen logging, and intake QR hints ride along with each AI plan so field teams stay inspection ready.",
      icon: <ShieldCheck size={22} />
    }
  ] as const;

  return (
    <section className="lp-ai-section" id="ai-stack">
      <div className="section-heading">
        <p className="eyebrow"><Brain size={16} /> Extreme AI layer</p>
        <h2>Models that understand food—not generic delivery.</h2>
        <p>
          FoodShare couples OpenRouter-ready LLMs with deterministic safety rails. You get startup polish, operator-grade transparency, and a
          fallback estimator that never leaves volunteers blind.
        </p>
      </div>
      <div className="lp-ai-orbit">
        <span>Structured JSON contracts</span>
        <span>12s model timeout</span>
        <span>Freshness + demand fusion</span>
        <span>Weather + humidity cues</span>
        <span>Live JWT-scoped APIs</span>
      </div>
      <div className="lp-ai-grid">
        {tiles.map((tile) => (
          <article className="lp-ai-tile" key={tile.title}>
            <div className="lp-ai-tile-icon">{tile.icon}</div>
            <h4>{tile.title}</h4>
            <p>{tile.copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function LandingProof() {
  const testimonials = [
    ["FoodShare reads like a Series A logistics product—our donors finally trust the ops story.", "Aaranya Foods"],
    ["Freshness scoring plus INR pickup bands let us brief volunteers in one screen.", "Seva Kitchen"],
    ["We split donor and receiver workflows cleanly; compliance notes alone saved hours weekly.", "Community Relief Hub"]
  ] as const;

  return (
    <section className="lp-proof-section" id="proof">
      <div className="section-heading">
        <p className="eyebrow"><Sparkles size={16} /> Proof & momentum</p>
        <h2>Trusted by teams who treat food rescue like infrastructure.</h2>
      </div>
      <div className="lp-proof-grid">
        <div>
          <div className="proof-strip">
            <Metric value="11,820" label="meals delivered" />
            <Metric value="6.7 t" label="CO₂ avoided" />
            <Metric value="94%" label="handoff success" />
            <Metric value="3.8×" label="faster matching" />
          </div>
        </div>
        <div className="testimonials">
          {testimonials.map(([quote, name]) => (
            <blockquote key={name}>
              <p>{quote}</p>
              <cite>{name}</cite>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState(localStorage.getItem("foodshare_token") || localStorage.getItem("sharebite_token") || "");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [role, setRole] = useState<Role>("donor");
  const [donations, setDonations] = useState<Donation[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [aiPlan, setAiPlan] = useState<AiPlan | null>(null);
  const [selectedDonationId, setSelectedDonationId] = useState("");
  const [selectedClaimId, setSelectedClaimId] = useState("");
  const [message, setMessage] = useState("");
  const [authError, setAuthError] = useState("");
  const [feedFilter, setFeedFilter] = useState<"all" | "cooked" | "bakery" | "produce">("all");

  const authHeaders = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);
  const selectedDemo = demoCredentials[role];

  async function refresh(nextToken = token) {
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
  }

  function logout() {
    localStorage.removeItem("foodshare_token");
    localStorage.removeItem("sharebite_token");
    setToken("");
    setUser(null);
  }

  useEffect(() => {
    refresh().catch(() => logout());
  }, []);

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
        destination: user?.role === "receiver" ? user.location : "Nearest receiver hub, Hyderabad",
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
  const forecastData = user?.role === "donor"
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
      <main className="lp-page">
        <nav className="topbar">
          <Brand />
          <div className="nav-actions">
            <a href="#personas">Donors & receivers</a>
            <a href="#ai-stack">Neural stack</a>
            <a href="#product">Platform</a>
            <a href="#proof">Proof</a>
            <button className="ghost" onClick={() => goToAuth("login")}>Log in</button>
            <button className="solid" onClick={() => goToAuth("register")}>Start free <ArrowRight size={18} /></button>
          </div>
        </nav>

        <section className="hero-section">
          <div className="lp-hero-grid">
            <div className="lp-hero-copy">
              <div className="hero-copy">
                <p className="eyebrow"><Cpu size={16} /> Neural logistics for surplus food</p>
                <h1>Coordinate rescue-grade food ops with an AI control plane.</h1>
                <p className="hero-text">
                  FoodShare fuses donor inventory, receiver demand, and live dispatch into one startup-grade workspace—multi-signal
                  freshness scoring, corridor demand radar, carbon-aware routing, and provable compliance narratives out of the box.
                </p>
                <div className="hero-actions">
                  <button className="solid large" onClick={() => goToAuth("login")}>Open live console <ArrowRight size={20} /></button>
                  <button className="outline large" onClick={() => goToAuth("login")}>Run donor demo</button>
                </div>
                <div className="lp-hero-badges">
                  <span className="lp-chip ai">OpenRouter-ready models</span>
                  <span className="lp-chip">Freshness graph 0–100</span>
                  <span className="lp-chip">Demand surge radar</span>
                  <span className="lp-chip">Batching & vehicle class</span>
                  <span className="lp-chip">Chain-of-custody hints</span>
                </div>
                <div className="hero-metrics">
                  <Metric value="18.4k" label="meals routed" />
                  <Metric value="31 min" label="avg pickup ETA" />
                  <Metric value="42%" label="waste reduced" />
                </div>
              </div>
            </div>

            <div className="hero-product-stack">
              <ProductVisual />
              <div className="floating-card eta-card">
                <Zap size={18} />
                <div>
                  <strong>Neural ETA</strong>
                  <span>Traffic + thermal latency model</span>
                </div>
              </div>
              <div className="floating-card price-card">
                <LineChart size={18} />
                <div>
                  <strong>Demand signal</strong>
                  <span>Surging / steady / cooling</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <LandingPersonas />
        <LandingAiStack />
        <Marketing />
        <LandingProof />

        <section className="auth-band" id="auth">
          <form className="auth-card" onSubmit={handleAuth} key={`${authMode}-${role}`}>
            <p className="form-kicker">{authMode === "login" ? selectedDemo.label : "Create workspace"}</p>
            <h2>{authMode === "login" ? `Open ${role === "donor" ? "Donor" : "Receiver"} Dashboard` : "Join FoodShare"}</h2>
            <div className="auth-role-grid">
              <button type="button" className={role === "donor" ? "active" : ""} onClick={() => setRole("donor")}>
                <PackagePlus size={18} />
                <span>Donor</span>
                <small>List surplus food</small>
              </button>
              <button type="button" className={role === "receiver" ? "active" : ""} onClick={() => setRole("receiver")}>
                <HandHeart size={18} />
                <span>Receiver</span>
                <small>Claim available food</small>
              </button>
            </div>
            {authMode === "register" && (
              <input name="name" placeholder="Full name / organization" required minLength={2} maxLength={200} />
            )}
            <input name="email" type="email" placeholder="Email address" defaultValue={authMode === "login" ? selectedDemo.email : ""} required />
            <input name="password" type="password" placeholder="Password" defaultValue={authMode === "login" ? selectedDemo.password : ""} minLength={6} required />
            {authMode === "register" && (
              <input name="location" placeholder="Primary location / neighborhood" required minLength={2} maxLength={200} />
            )}
            {authError && <div className="auth-error">{authError}</div>}
            <button className="solid full">{authMode === "login" ? `Log in as ${role}` : `Create ${role} account`}</button>
            <button className="link" type="button" onClick={() => switchAuthMode(authMode === "login" ? "register" : "login")}>
              {authMode === "login" ? "Need an account? Sign up" : "Already have an account? Log in"}
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className={`dashboard-shell ${user.role}-theme`}>
      <aside className="sidebar dash-sidebar">
        <Brand />
        <nav>
          <button className="side-active" onClick={() => scrollToSection("overview")}><BarChart3 size={18} /> Overview</button>
          <button onClick={() => scrollToSection("workspace")}>{user.role === "donor" ? <PackagePlus size={18} /> : <Utensils size={18} />} {user.role === "donor" ? "Donations" : "Food Feed"}</button>
          <button onClick={() => scrollToSection("route-ai")}><Map size={18} /> Route AI</button>
          <button onClick={() => scrollToSection("activity")}>{user.role === "donor" ? <Building2 size={18} /> : <PackageCheck size={18} />} {user.role === "donor" ? "Demand" : "My Claims"}</button>
        </nav>
        <div className="side-note">
          <Sparkles size={18} />
          <strong>{user.role === "donor" ? "Supply command" : "Mission control"}</strong>
          <p>{user.role === "donor" ? "Publish with thermal + corridor context. AI scores every SKU before receivers commit." : "Triage listings by window, category, and AI readiness—then lock claims with one tap."}</p>
        </div>
        <div className="sidebar-meta">
          <span><Gauge size={14} /> {user.role === "donor" ? "Ops tier" : "Field tier"}</span>
          <strong>{user.role === "donor" ? "Enterprise donor" : "Verified receiver"}</strong>
          <small>Neural dispatch v2 · JWT session</small>
        </div>
      </aside>

      <section className="dashboard-main dash-main">
        <header className="dashboard-top dash-hero">
          <div className="dash-hero-main">
            <p className="eyebrow"><Radar size={16} /> {user.role === "donor" ? "Donor supply desk" : "Receiver pickup desk"}</p>
            <h1>{user.role === "donor" ? "Surplus command center" : "Rescue marketplace"}</h1>
            <p>{user.role === "donor" ? `${user.name} — orchestrate listings, spoilage windows, and corridor demand from one glass surface.` : `${user.name} — prioritize high-velocity SKUs, preview neural ETAs, and lock compliant pickups.`}</p>
            <ul className="dash-hero-pills">
              {user.role === "donor" ? (
                <>
                  <li><CheckCircle2 size={15} /> Multi-signal freshness scoring</li>
                  <li><CheckCircle2 size={15} /> Demand surge + batching hints</li>
                  <li><CheckCircle2 size={15} /> Audit-ready compliance strings</li>
                </>
              ) : (
                <>
                  <li><CheckCircle2 size={15} /> Category + window triage filters</li>
                  <li><CheckCircle2 size={15} /> INR + vehicle class previews</li>
                  <li><CheckCircle2 size={15} /> Live claim timeline with AI route</li>
                </>
              )}
            </ul>
          </div>
          <div className="top-actions">
            <span className="user-pill"><UserRound size={17} /> {user.role}</span>
            <button className="outline" onClick={logout}><LogOut size={17} /> Logout</button>
          </div>
        </header>

        {message && <div className="toast">{message}</div>}

        {user.role === "donor" ? (
          <section className="dash-spotlight dash-spotlight--donor" aria-label="Donor snapshot">
            <article className="spot-card">
              <span className="spot-kicker"><PackagePlus size={15} /> Live SKUs</span>
              <strong>{donorLiveSkus}</strong>
              <p>Listings currently discoverable by receivers.</p>
            </article>
            <article className="spot-card">
              <span className="spot-kicker"><Utensils size={15} /> Meals on shelf</span>
              <strong>{donorMealsOnShelf.toLocaleString()}</strong>
              <p>Total portions you have in market right now.</p>
            </article>
            <article className="spot-card spot-card--alert">
              <span className="spot-kicker"><Flame size={15} /> Urgent windows</span>
              <strong>{donorUrgentSkus}</strong>
              <p>SKUs under six hours to expiry—refresh AI soon.</p>
            </article>
          </section>
        ) : (
          <section className="dash-spotlight dash-spotlight--receiver" aria-label="Receiver snapshot">
            <article className="spot-card">
              <span className="spot-kicker"><Search size={15} /> Feed matches</span>
              <strong>{receiverFeed.length}</strong>
              <p>Listings after search + category lens.</p>
            </article>
            <article className="spot-card">
              <span className="spot-kicker"><PackageCheck size={15} /> Reserved meals</span>
              <strong>{claimedMeals.toLocaleString()}</strong>
              <p>Across accepted claims in your workspace.</p>
            </article>
            <article className="spot-card">
              <span className="spot-kicker"><MapPin size={15} /> Coverage</span>
              <strong>{user.location.split(",")[0] || "Hub"}</strong>
              <p>Primary intake geography for routing models.</p>
            </article>
          </section>
        )}

        <section className={`numbers-grid kpi-deck kpi-deck--${user.role}`} id="overview">
          <Stat icon={user.role === "donor" ? <PackagePlus /> : <Utensils />} label={user.role === "receiver" ? "Meals available now" : "Meals listed by donors"} value={(user.role === "receiver" ? availableMeals : analytics?.meals_shared || 0).toLocaleString()} accent="green" />
          <Stat icon={user.role === "donor" ? <Building2 /> : <Truck />} label={user.role === "receiver" ? "My accepted claims" : "Receiver claims"} value={user.role === "receiver" ? claims.filter((claim) => claim.status !== "completed").length : analytics?.active_claims || 0} accent="blue" />
          <Stat icon={user.role === "donor" ? <Leaf /> : <PackageCheck />} label={user.role === "receiver" ? "Meals reserved" : "CO2 avoided"} value={user.role === "receiver" ? claimedMeals : `${analytics?.co2SavedKg || 0} kg`} accent="green" />
          <Stat icon={<Clock3 />} label={user.role === "receiver" ? "Next pickup ETA" : "Readiness ETA"} value={activeAiPlan ? `${activeAiPlan.etaMinutes} min` : "Select item"} accent="amber" />
        </section>

        <section className="ops-grid" id="workspace">
          <div className={`panel primary-panel primary-panel--${user.role}`}>
            <div className="panel-title">
              <div>
                <p className="section-kicker">{user.role === "donor" ? "Inventory studio" : "Live rescue feed"}</p>
                <h2>{user.role === "donor" ? "Compose listings · monitor shelf health" : "Triage, preview AI, claim in seconds"}</h2>
              </div>
            </div>

            {user.role === "donor" ? (
              <div className="donor-workspace">
                <div className="glass-panel donor-compose">
                  <div className="composer-head">
                    <p className="section-kicker">New listing</p>
                    <h3>Launch a corridor-ready SKU</h3>
                    <p className="composer-lead">Precise pickup windows and notes flow straight into neural dispatch, spoilage scoring, and compliance strings.</p>
                  </div>
                  <form className="donation-form donation-form--pro" onSubmit={addDonation}>
                    <input className="input-pro" name="title" placeholder="Food title" defaultValue="Fresh biryani meal boxes" required />
                    <input className="input-pro" name="category" placeholder="Category" defaultValue="Cooked meals" required />
                    <input className="input-pro" name="quantity" type="number" placeholder="Meal count" defaultValue="30" required />
                    <input className="input-pro" name="location" placeholder="Pickup location" defaultValue={user.location} required />
                    <input className="input-pro" name="pickupWindow" placeholder="Pickup window" defaultValue="Today 7:00 PM - 9:00 PM" required />
                    <input className="input-pro" name="hours" type="number" placeholder="Expires in hours" defaultValue="6" required />
                    <textarea className="input-pro" name="notes" placeholder="Packing, allergy, temperature, handoff instructions" />
                    <button className="solid full"><PackagePlus size={18} /> Publish to marketplace</button>
                  </form>
                </div>
                <aside className="donor-shelf">
                  <div className="shelf-head">
                    <div>
                      <p className="section-kicker">Your shelf</p>
                      <h3>Neural queue</h3>
                    </div>
                    <span className="shelf-count">{myListings.length} SKUs</span>
                  </div>
                  {myListings.length === 0 ? (
                    <div className="shelf-empty">No authored listings yet. Publish on the left — each SKU gets AI readiness + map previews.</div>
                  ) : (
                    <div className="shelf-list">
                      {myListings.map((item) => (
                        <div key={item.id} className={`shelf-card ${selectedDonationId === item.id ? "active" : ""}`}>
                          <div className="shelf-card-top">
                            <span className={`shelf-badge shelf-badge--${item.status === "available" ? "live" : "muted"}`}>{item.status}</span>
                            <span className="shelf-eta">
                              <Clock3 size={14} /> {hoursUntil(item.expires_at)}
                            </span>
                          </div>
                          <strong>{item.title}</strong>
                          <p className="shelf-meta">{item.quantity} meals · {item.category}</p>
                          <p className="shelf-loc"><MapPin size={14} /> {item.location}</p>
                          <div className="shelf-actions">
                            <button type="button" className="outline" onClick={() => estimate(item)}>
                              <Brain size={16} /> Run AI
                            </button>
                            <button type="button" className="ghost-mini" onClick={() => { setSelectedDonationId(item.id); scrollToSection("route-ai"); }}>
                              Map
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </aside>
              </div>
            ) : (
              <>
                <div className="feed-toolbar">
                  <div className="feed-filters" role="tablist" aria-label="Category lens">
                    {(["all", "cooked", "bakery", "produce"] as const).map((f) => (
                      <button key={f} type="button" className={feedFilter === f ? "feed-chip active" : "feed-chip"} onClick={() => setFeedFilter(f)}>
                        {f === "all" ? "All" : f[0].toUpperCase() + f.slice(1)}
                      </button>
                    ))}
                  </div>
                  <div className="search feed-search">
                    <Search size={18} />
                    <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search food, donor, area" />
                  </div>
                </div>
                <div className="cards-grid cards-grid--receiver">
                  {receiverFeed.map((item) => {
                    const urgent = hoursUntil(item.expires_at);
                    const readiness = handoffReadiness(item.id, item.quantity);
                    const msLeft = new Date(item.expires_at).getTime() - Date.now();
                    const isHot = msLeft > 0 && msLeft < 2.5 * 3600000;
                    return (
                      <article className="food-card food-card--epic" key={item.id}>
                        <div className="food-card-glow" aria-hidden />
                        <div className="card-head">
                          <span className="food-cat-pill"><Tag size={13} /> {item.category}</span>
                          <span className="status-dot">{item.status}</span>
                        </div>
                        <div className="food-card-metric-row">
                          <strong>{item.quantity} meals</strong>
                          <span className="readiness-pill"><Gauge size={14} /> {readiness}% ready</span>
                        </div>
                        <h3>{item.title}</h3>
                        <div className={`urgency-bar ${isHot ? "urgency-bar--hot" : ""}`}>
                          <span><Flame size={14} /> {urgent} to expiry</span>
                        </div>
                        <p><Building2 size={16} /> {item.donor_name}</p>
                        <p><MapPin size={16} /> {item.location}</p>
                        <p><Clock3 size={16} /> {item.pickup_window}</p>
                        <div className="food-card-actions">
                          <button className="outline full" onClick={() => estimate(item)}>Preview AI</button>
                          <button className="solid full" onClick={() => claimFood(item.id)}>Claim</button>
                        </div>
                      </article>
                    );
                  })}
                  {!receiverFeed.length && (
                    <div className="empty-state">No listings for this lens. Try another category or clear search.</div>
                  )}
                </div>
                <ClaimBoard claims={claims} selectedClaimId={selectedClaimId} onSelectClaim={(claim) => setSelectedClaimId(claim.id)} />
              </>
            )}
          </div>

          <aside className="panel ai-panel">
            <div className="panel-title compact-title">
              <div>
                <p className="section-kicker">{user.role === "donor" ? "Donor AI readiness" : "Receiver AI dispatch"}</p>
                <h2>{user.role === "donor" ? "Can this be picked up?" : "Can I reach this pickup?"}</h2>
              </div>
              <button className="icon-button" onClick={() => estimate()} title="Run AI estimate"><Brain size={20} /></button>
            </div>
            <div className="ai-context">
              <span>Analyzing</span>
              <strong>{activeContextTitle}</strong>
              <small>{activeOrigin} to {activeDestination}</small>
            </div>
            <div className="ai-score">
              <strong>{activeAiPlan ? `${Math.round(activeAiPlan.confidence * 100)}%` : "Waiting"}</strong>
              <span>{activeAiPlan?.source === "openrouter" ? "OpenRouter AI confidence" : activeAiPlan ? "local estimator confidence" : "dispatch confidence"}</span>
            </div>
            <div className="ai-metrics">
              <AiMetric icon={<Clock3 />} label="ETA" value={activeAiPlan ? `${activeAiPlan.etaMinutes} min` : "Run estimate"} />
              <AiMetric icon={<Navigation />} label="Distance" value={activeAiPlan ? `${activeAiPlan.distanceKm} km` : "Pending"} />
              <AiMetric icon={<Banknote />} label="Cost" value={activeAiPlan ? `INR ${activeAiPlan.estimatedCostInr}` : "Pending"} />
              <AiMetric icon={<ShieldCheck />} label="Risk" value={activeAiPlan?.spoilageRisk || "Pending"} />
            </div>
            {activeAiPlan && (
              <>
                <div className="ai-extra-grid">
                  <div>
                    <p>Freshness</p>
                    <strong>{activeAiPlan.freshnessScore != null ? `${Math.round(activeAiPlan.freshnessScore)}/100` : "—"}</strong>
                  </div>
                  <div>
                    <p>Demand</p>
                    <strong>{activeAiPlan.demandSignal ? activeAiPlan.demandSignal : "—"}</strong>
                  </div>
                  <div>
                    <p>CO₂ est.</p>
                    <strong>{activeAiPlan.carbonKgSaved != null ? `${activeAiPlan.carbonKgSaved} kg` : "—"}</strong>
                  </div>
                  <div>
                    <p>Vehicle</p>
                    <strong className="ai-vehicle-line">{activeAiPlan.recommendedVehicle || "—"}</strong>
                  </div>
                </div>
                {activeAiPlan.neuralSummary && (
                  <div className="ai-neural-block">
                    <strong>Neural summary</strong>
                    {activeAiPlan.neuralSummary}
                  </div>
                )}
                {(activeAiPlan.weatherRiskNote || activeAiPlan.batchingSuggestion) && (
                  <div className="ai-neural-block">
                    <strong>Field brief</strong>
                    {[activeAiPlan.weatherRiskNote, activeAiPlan.batchingSuggestion].filter(Boolean).join(" ")}
                  </div>
                )}
                {activeAiPlan.complianceNotes && <p className="ai-compliance">{activeAiPlan.complianceNotes}</p>}
              </>
            )}
            <p className="ai-advice">{activeAiPlan?.pickupAdvice || "Claim a listing or run an estimate to receive route, price, timing, and food-safety guidance for the next handoff."}</p>
            {activeAiPlan?.generatedAt && <p className="ai-source">Generated {new Date(activeAiPlan.generatedAt).toLocaleTimeString()} via {activeAiPlan.source === "openrouter" ? "OpenRouter" : "local estimator"}</p>}
          </aside>
        </section>

        <section className="map-grid" id="route-ai">
          <div className="panel route-map-panel">
            <div className="panel-title">
              <div>
                <p className="section-kicker">{user.role === "donor" ? "Receiver reach map" : "Pickup mission map"}</p>
                <h2>{user.role === "donor" ? "Where your listing can be collected" : "Route from donor to your hub"}</h2>
              </div>
              <button className="outline" onClick={() => estimate()}><Compass size={17} /> Estimate route</button>
            </div>
            <div className="map-surface">
              <div className="map-road road-a" />
              <div className="map-road road-b" />
              <div className="map-road road-c" />
              <div className="map-path" />
              <span className="map-pin donor-map-pin"><Utensils size={16} /> {user.role === "donor" ? "Your pickup" : "Donor"}</span>
              <span className="map-pin receiver-map-pin"><HandHeart size={16} /> {user.role === "donor" ? "Receiver hub" : "Your hub"}</span>
              <span className="map-chip route-chip"><Navigation size={16} /> {activeAiPlan?.bestRoute || "Select a listing to generate a route"}</span>
              <span className="map-chip cost-chip"><Banknote size={16} /> {activeAiPlan ? `INR ${activeAiPlan.estimatedCostInr}` : "AI cost pending"}</span>
            </div>
          </div>

          <div className="panel">
            <div className="panel-title">
              <div>
                <p className="section-kicker">{user.role === "donor" ? "Donor impact" : "Receiver impact"}</p>
                <h2>{user.role === "donor" ? "Meals protected from waste" : "Meals secured for distribution"}</h2>
              </div>
            </div>
            <div className="chart">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend}>
                  <defs>
                    <linearGradient id="foodshareMeals" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip />
                  <Area dataKey="meals" stroke="#0f766e" fill="url(#foodshareMeals)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="lower-grid" id="activity">
          <div className="panel">
            <div className="panel-title">
              <div>
                <p className="section-kicker">{user.role === "donor" ? "Donation activity" : "Accepted pickups"}</p>
                <h2>{user.role === "donor" ? "Active donation pipeline" : "Your receiver claim board"}</h2>
              </div>
            </div>
            <div className="activity-list">
              {user.role === "donor" ? (
                myListings.length ? (
                  myListings.slice(0, 5).map((item) => (
                    <button className="activity" key={item.id} onClick={() => estimate(item)}>
                      <span><PackageCheck size={17} /></span>
                      <div>
                        <strong>{item.title}</strong>
                        <p>{item.quantity} meals at {item.location}</p>
                      </div>
                      <em>{item.status}</em>
                    </button>
                  ))
                ) : (
                  <div className="empty-state">Pipeline is quiet. Publish a SKU to populate this lane.</div>
                )
              ) : (
                claims.slice(0, 5).map((claim) => (
                  <button className="activity" key={claim.id} onClick={() => setSelectedClaimId(claim.id)}>
                    <span><CheckCircle2 size={17} /></span>
                    <div>
                      <strong>{claim.title}</strong>
                      <p>{claim.ai_plan.etaMinutes} min ETA | INR {claim.ai_plan.estimatedCostInr}</p>
                    </div>
                    <em>{claim.status}</em>
                  </button>
                ))
              )}
              {user.role === "receiver" && !claims.length && <div className="empty-state">No accepted pickup yet. Claim a listing from the marketplace above.</div>}
            </div>
          </div>

          <div className="panel">
            <div className="panel-title">
              <div>
                <p className="section-kicker">{user.role === "donor" ? "Receiver demand" : "Pickup capacity"}</p>
                <h2>{user.role === "donor" ? "Who can receive your surplus" : "Claim capacity by area"}</h2>
              </div>
            </div>
            <div className="chart compact-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={forecastData}>
                  <XAxis dataKey="area" axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip />
                  <Bar dataKey="claims" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

function ClaimBoard({
  claims,
  selectedClaimId,
  onSelectClaim
}: {
  claims: Claim[];
  selectedClaimId: string;
  onSelectClaim: (claim: Claim) => void;
}) {
  if (!claims.length) {
    return (
      <section className="claim-board empty-claims">
        <div>
          <p className="section-kicker">My claims</p>
          <h3>No accepted claims yet</h3>
          <span>Claim a listing above and FoodShare will create a live order with AI route, ETA, cost, and pickup guidance.</span>
        </div>
      </section>
    );
  }

  return (
    <section className="claim-board">
      <div className="claim-board-head">
        <div>
          <p className="section-kicker">My claims</p>
          <h3>Accepted food orders</h3>
        </div>
        <span>{claims.length} active</span>
      </div>
      <div className="claim-list">
        {claims.map((claim) => {
          const plan = claim.ai_plan;
          return (
            <article className={selectedClaimId === claim.id ? "claim-card active" : "claim-card"} key={claim.id} onClick={() => onSelectClaim(claim)}>
              <div className="claim-card-top">
                <span className="accepted-badge"><CheckCircle2 size={16} /> Claim accepted</span>
                <small>#{claim.id.slice(0, 8).toUpperCase()}</small>
              </div>
              <div className="claim-main">
                <div>
                  <h4>{claim.title}</h4>
                  <p><Building2 size={15} /> {claim.donor_name}</p>
                  <p><MapPin size={15} /> Pickup: {claim.location}</p>
                </div>
                <div className="claim-ai-mini">
                  <strong>{plan.etaMinutes} min</strong>
                  <span>INR {plan.estimatedCostInr}</span>
                  {typeof plan.freshnessScore === "number" && <span>{Math.round(plan.freshnessScore)}/100 fresh</span>}
                  <em>{plan.spoilageRisk} risk</em>
                  <small>{plan.source === "openrouter" ? "OpenRouter" : "Estimator"}</small>
                </div>
              </div>
              <div className="claim-steps">
                <span className="done">Accepted</span>
                <span className="done">AI route ready</span>
                <span>Pickup pending</span>
                <span>Delivery proof</span>
              </div>
              <p className="claim-route"><Navigation size={15} /> {plan.bestRoute}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function Stat({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: React.ReactNode; accent: "green" | "blue" | "amber" }) {
  return (
    <div className={`stat-card ${accent}`}>
      <span>{icon}</span>
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}

function AiMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <span>{icon}</span>
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}

function Marketing() {
  const capabilities = [
    ["Neural route planner", "ETA, distance, INR cost, and human-readable corridor stories before a claim locks.", Navigation],
    ["Freshness + demand fusion", "Spoilage tier, 0–100 freshness score, and surging/steady/cooling demand for every SKU.", ThermometerSun],
    ["Impact + compliance studio", "CO₂ avoided, monthly meal curves, and auto compliance narration for audits.", BarChart3]
  ] as const;

  return (
    <section className="marketing" id="product">
      <div className="section-heading">
        <p className="eyebrow"><Layers size={16} /> Platform surface</p>
        <h2>Everything to match, move, and measure surplus food—without duct tape.</h2>
      </div>
      <div className="capabilities">
        {capabilities.map(([title, copy, Icon]) => (
          <article className="capability" key={title}>
            <span><Icon size={25} /></span>
            <h3>{title}</h3>
            <p>{copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default App;
