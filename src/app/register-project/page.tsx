"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useProjects } from "~/app/_context/ProjectContext";
import { useAuth } from "~/app/_context/AuthContext";

export default function Register() {
  const { createOrder } = useProjects();
  const { user } = useAuth();
  const router = useRouter();
  
  const [projectName, setProjectName] = useState("");
  const [priceOffer, setPriceOffer] = useState("1,500 €");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    const slug = encodeURIComponent(projectName.trim().replace(/\s+/g, "-"));
    const email = user?.email || "unknown@connect-now.io";
    createOrder(slug, projectName.trim(), "10,0 kWp", email, priceOffer);
    
    // Redirect cleanly to the newly created project workspace
    router.push(`/orders/${slug}`);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col justify-between">
      {/* Main Container */}
      <main className="flex flex-grow items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
          {/* Header Block */}
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Initialize Connection Request
            </h1>
            <p className="text-sm text-slate-500">
              Create a sandbox reference ID to start filling out the VDE Data
              Set 3.0 grid application forms.
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label
                htmlFor="project_name"
                className="text-xs font-semibold tracking-wider text-slate-500 uppercase"
              >
                Project Identifier / Reference ID
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-sm text-slate-400 select-none">#</span>
                </div>
                <input
                  type="text"
                  name="project_name"
                  id="project_name"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g., PV-Solar-2026"
                  className="w-full rounded-lg border border-slate-300 bg-white py-3 pr-3 pl-8 font-mono text-sm font-bold transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                />
              </div>
              <p className="text-[11px] leading-tight text-slate-400">
                Spaces and special characters will be automatically safety
                encoded into a valid browser route slug string.
              </p>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="price_offer"
                className="text-xs font-semibold tracking-wider text-slate-500 uppercase"
              >
                Electrician Budget / Price Offer (€)
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-sm text-slate-400 select-none">€</span>
                </div>
                <input
                  type="text"
                  name="price_offer"
                  id="price_offer"
                  required
                  value={priceOffer}
                  onChange={(e) => setPriceOffer(e.target.value)}
                  placeholder="e.g., 1,200 €"
                  className="w-full rounded-lg border border-slate-300 bg-white py-3 pr-3 pl-8 font-mono text-sm font-bold transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                />
              </div>
              <p className="text-[11px] leading-tight text-slate-400">
                Specify the maximum price you are offering to pay for the electrician's technical commissioning.
              </p>
            </div>

            {/* Information Callout Box */}
            <div className="space-y-2 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
              <div className="flex items-center space-x-2 text-xs font-bold text-blue-800">
                <span>ℹ️</span>
                <span>Mock Sandboxing Environment</span>
              </div>
              <p className="text-xs leading-relaxed text-blue-900/80">
                Since database tracking is configured in transient memory,
                registering a new identifier instantly provisions a unique URL
                link routing directly into the rendering parser context.
              </p>
            </div>

            {/* Primary CTA Submission Button */}
            <button
              type="submit"
              className="block w-full transform cursor-pointer rounded-lg bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white shadow transition-all hover:-translate-y-0.5 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500/50 focus:outline-none active:translate-y-0"
            >
              Generate Project Blueprint →
            </button>
          </form>
        </div>
      </main>

      {/* Basic Footer Element */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        connect-now sandbox engine • Data Set 3.0 Compliance Layer
      </footer>
    </div>
  );
}
