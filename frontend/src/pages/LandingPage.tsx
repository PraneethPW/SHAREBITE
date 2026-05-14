import type { FormEvent } from "react";
import { ArrowRight, Cpu, HandHeart, LineChart, PackagePlus, Zap } from "lucide-react";
import { Brand } from "../components/Brand";
import { LandingAiStack } from "../components/landing/LandingAiStack";
import { LandingPersonas } from "../components/landing/LandingPersonas";
import { LandingProof } from "../components/landing/LandingProof";
import { Marketing } from "../components/landing/Marketing";
import { ProductVisual } from "../components/ProductVisual";
import { Metric } from "../components/ui/Metric";
import { cn } from "../cn";
import type { Role } from "../types/foodshare";

export type LandingPageProps = {
  authMode: "login" | "register";
  role: Role;
  onSetRole: (r: Role) => void;
  authError: string;
  selectedDemo: { email: string; password: string; label: string };
  onGoToAuth: (mode: "login" | "register") => void;
  onSubmitAuth: (e: FormEvent<HTMLFormElement>) => void;
  onSwitchAuthMode: (mode: "login" | "register") => void;
};

export function LandingPage(p: LandingPageProps) {
  const { authMode, role, onSetRole, authError, selectedDemo, onGoToAuth, onSubmitAuth, onSwitchAuthMode } = p;

  return (
      <main className="min-h-screen overflow-x-clip bg-slate-950 text-slate-200">
        <nav className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-slate-950/80 px-4 py-3 backdrop-blur-xl sm:gap-4 sm:px-6 lg:px-8">
          <Brand />
          <div className="order-3 flex w-full max-w-full flex-nowrap items-center gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:order-none sm:ml-auto sm:w-auto sm:max-w-none sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden lg:gap-5">
            <a className="shrink-0 whitespace-nowrap text-sm font-semibold text-slate-400 transition hover:text-white" href="#personas">
              Donors & receivers
            </a>
            <a className="shrink-0 whitespace-nowrap text-sm font-semibold text-slate-400 transition hover:text-white" href="#ai-stack">
              Neural stack
            </a>
            <a className="shrink-0 whitespace-nowrap text-sm font-semibold text-slate-400 transition hover:text-white" href="#product">
              Platform
            </a>
            <a className="shrink-0 whitespace-nowrap text-sm font-semibold text-slate-400 transition hover:text-white" href="#proof">
              Proof
            </a>
            <button
              type="button"
              className="shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold text-white/90 transition hover:bg-white/10"
              onClick={() => onGoToAuth("login")}
            >
              Log in
            </button>
            <button
              type="button"
              className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-teal-600/30 transition hover:brightness-110"
              onClick={() => onGoToAuth("register")}
            >
              Start free <ArrowRight className="size-4" />
            </button>
          </div>
        </nav>

        <section className="relative border-b border-white/5 bg-[radial-gradient(ellipse_80%_50%_at_20%_-10%,rgba(139,92,246,0.35),transparent),radial-gradient(ellipse_60%_45%_at_85%_10%,rgba(59,130,246,0.22),transparent),linear-gradient(180deg,#020617_0%,#0f172a_55%,#020617_100%)]">
          <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-4 pb-16 pt-10 sm:gap-12 sm:px-6 sm:pb-20 sm:pt-14 lg:grid-cols-2 lg:gap-14 lg:px-8 lg:pb-24 lg:pt-16">
            <div className="max-w-xl lg:max-w-none">
              <div>
                <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/40 bg-violet-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-violet-200">
                  <Cpu className="size-4" /> Neural logistics for surplus food
                </p>
                <h1 className="text-balance text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
                  Coordinate rescue-grade food ops with an AI control plane.
                </h1>
                <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-slate-400 sm:text-lg">
                  FoodShare fuses donor inventory, receiver demand, and live dispatch into one startup-grade workspace—multi-signal freshness scoring, corridor demand radar, carbon-aware routing, and provable compliance narratives out of the box.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  <button
                    type="button"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 px-6 py-3.5 text-base font-bold text-white shadow-xl shadow-teal-600/25 transition hover:brightness-110"
                    onClick={() => onGoToAuth("login")}
                  >
                    Open live console <ArrowRight className="size-5" />
                  </button>
                  <button
                    type="button"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-6 py-3.5 text-base font-bold text-white backdrop-blur-sm transition hover:bg-white/10"
                    onClick={() => onGoToAuth("login")}
                  >
                    Run donor demo
                  </button>
                </div>
                <div className="mt-8 flex flex-wrap gap-2">
                  <span className="rounded-full border border-violet-400/45 bg-violet-500/15 px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-violet-100">
                    OpenRouter-ready models
                  </span>
                  {["Freshness graph 0–100", "Demand surge radar", "Batching & vehicle class", "Chain-of-custody hints"].map((t) => (
                    <span key={t} className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-slate-300">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="mt-10 grid gap-3 sm:grid-cols-3">
                  <Metric value="18.4k" label="meals routed" dark />
                  <Metric value="31 min" label="avg pickup ETA" dark />
                  <Metric value="42%" label="waste reduced" dark />
                </div>
              </div>
            </div>

            <div className="relative min-h-0">
              <ProductVisual />
              <div className="mt-4 flex flex-col gap-3 sm:absolute sm:inset-x-0 sm:bottom-4 sm:mt-0 sm:flex-row sm:justify-between sm:gap-4 sm:px-2">
                <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-slate-900/90 p-3.5 shadow-xl backdrop-blur-md sm:max-w-[240px]">
                  <Zap className="mt-0.5 size-[18px] shrink-0 text-teal-400" />
                  <div>
                    <strong className="block text-sm font-bold text-white">Neural ETA</strong>
                    <span className="text-xs font-medium text-slate-400">Traffic + thermal latency model</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-slate-900/90 p-3.5 shadow-xl backdrop-blur-md sm:max-w-[240px]">
                  <LineChart className="mt-0.5 size-[18px] shrink-0 text-sky-400" />
                  <div>
                    <strong className="block text-sm font-bold text-white">Demand signal</strong>
                    <span className="text-xs font-medium text-slate-400">Surging / steady / cooling</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <LandingPersonas />
        <LandingAiStack />
        <Marketing />
        <LandingProof />

        <section className="border-t border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 px-4 py-14 sm:px-6 sm:py-20 lg:px-8" id="auth">
          <form
            className="mx-auto grid w-full max-w-md gap-4 rounded-3xl border border-white/10 bg-white p-6 shadow-2xl shadow-black/40 sm:p-8"
            onSubmit={onSubmitAuth}
            key={`${authMode}-${role}`}
          >
            <p className="text-xs font-black uppercase tracking-wider text-brand-600">
              {authMode === "login" ? selectedDemo.label : "Create workspace"}
            </p>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              {authMode === "login" ? `Open ${role === "donor" ? "Donor" : "Receiver"} Dashboard` : "Join FoodShare"}
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                className={cn(
                  "grid min-h-[5.25rem] grid-cols-[auto_1fr] items-center gap-x-3 gap-y-0 rounded-2xl border-2 px-4 py-3 text-left transition",
                  role === "donor" ? "border-orange-400 bg-orange-50 ring-2 ring-orange-400/30" : "border-slate-200 bg-slate-50 hover:border-slate-300"
                )}
                onClick={() => onSetRole("donor")}
              >
                <PackagePlus className="size-[18px] text-orange-600" />
                <span className="font-bold text-slate-900">Donor</span>
                <small className="col-span-2 text-xs text-slate-600">List surplus food</small>
              </button>
              <button
                type="button"
                className={cn(
                  "grid min-h-[5.25rem] grid-cols-[auto_1fr] items-center gap-x-3 gap-y-0 rounded-2xl border-2 px-4 py-3 text-left transition",
                  role === "receiver" ? "border-blue-400 bg-blue-50 ring-2 ring-blue-400/30" : "border-slate-200 bg-slate-50 hover:border-slate-300"
                )}
                onClick={() => onSetRole("receiver")}
              >
                <HandHeart className="size-[18px] text-receiver-600" />
                <span className="font-bold text-slate-900">Receiver</span>
                <small className="col-span-2 text-xs text-slate-600">Claim available food</small>
              </button>
            </div>
            {authMode === "register" && (
              <input
                name="name"
                placeholder="Full name / organization"
                required
                minLength={2}
                maxLength={200}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
            )}
            <input
              name="email"
              type="email"
              placeholder="Email address"
              defaultValue={authMode === "login" ? selectedDemo.email : ""}
              required
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              defaultValue={authMode === "login" ? selectedDemo.password : ""}
              minLength={6}
              required
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
            {authMode === "register" && (
              <input
                name="location"
                placeholder="Primary location / neighborhood"
                required
                minLength={2}
                maxLength={200}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
            )}
            {authError && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{authError}</div>}
            <button
              type="submit"
              className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 py-3.5 text-base font-bold text-white shadow-lg shadow-teal-600/25 transition hover:brightness-110"
            >
              {authMode === "login" ? `Log in as ${role}` : `Create ${role} account`}
            </button>
            <button
              className="border-0 bg-transparent text-center text-sm font-bold text-brand-700 underline-offset-2 hover:underline"
              type="button"
              onClick={() => onSwitchAuthMode(authMode === "login" ? "register" : "login")}
            >
              {authMode === "login" ? "Need an account? Sign up" : "Already have an account? Log in"}
            </button>
          </form>
        </section>
      </main>
  );
}
