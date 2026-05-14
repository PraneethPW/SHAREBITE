import { lazy, Suspense } from "react";

const ProductVisualInner = lazy(() => import("./three/ProductVisualInner"));

const fallback = (
  <div className="absolute inset-0 grid place-items-center bg-slate-900/50">
    <div className="rounded-xl border border-white/10 bg-slate-900/85 px-4 py-3 text-sm font-medium text-slate-300 shadow-lg">
      Loading 3D preview…
    </div>
  </div>
);

export function ProductVisual() {
  return (
    <div className="relative h-[min(52vw,380px)] min-h-[240px] w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 shadow-[0_24px_80px_rgba(2,6,23,0.55)] ring-1 ring-white/5 sm:min-h-[300px] sm:h-[min(48vh,440px)]">
      <Suspense fallback={fallback}>
        <ProductVisualInner />
      </Suspense>
    </div>
  );
}
