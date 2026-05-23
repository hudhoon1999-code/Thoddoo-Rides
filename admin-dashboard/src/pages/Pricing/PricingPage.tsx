// admin-dashboard/src/pages/Pricing/PricingPage.tsx
// ============================================================
// PRICING PAGE — Admin-controlled fare management
// ============================================================

import { useState } from 'react';

interface PriceRule {
  vehicleType: string;
  label: string;
  emoji: string;
  baseFare: number;
  maxFare: number;
  commissionPercent: number;
  isActive: boolean;
}

const INITIAL_PRICING: PriceRule[] = [
  { vehicleType: 'buggy_6', label: 'Buggy (6-Seat)', emoji: '🚐', baseFare: 30, maxFare: 50, commissionPercent: 20, isActive: true },
  { vehicleType: 'buggy_12', label: 'Buggy (12-Seat)', emoji: '🚌', baseFare: 50, maxFare: 80, commissionPercent: 20, isActive: true },
  { vehicleType: 'motorcycle', label: 'Motorcycle', emoji: '🛵', baseFare: 20, maxFare: 30, commissionPercent: 20, isActive: true },
];

export function PricingPage() {
  const [pricing, setPricing] = useState<PriceRule[]>(INITIAL_PRICING);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // TODO: Save to Firestore
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateRule = (vehicleType: string, key: keyof PriceRule, value: number | boolean) => {
    setPricing(prev =>
      prev.map(r => r.vehicleType === vehicleType ? { ...r, [key]: value } : r)
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-ocean-900">Pricing Control 💰</h1>
          <p className="text-ocean-600 mt-1">Set fares and commission rates for all vehicle types</p>
        </div>
        <button
          onClick={handleSave}
          className={`px-6 py-3 rounded-xl font-semibold transition-all ${
            saved
              ? 'bg-green-600 text-white'
              : 'bg-teal-600 text-white hover:bg-teal-700'
          }`}
        >
          {saved ? '✓ Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Info banner */}
      <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-6 text-sm text-teal-800">
        💡 <strong>Island Pricing:</strong> Thoddoo uses flat-rate pricing (not per-km) due to the small island scale.
        All fares are in MVR. Changes apply immediately to new ride requests.
      </div>

      <div className="space-y-6">
        {pricing.map((rule) => (
          <div key={rule.vehicleType} className="bg-white rounded-2xl shadow-sm border border-teal-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">{rule.emoji}</span>
              <div>
                <h3 className="text-lg font-semibold text-ocean-900">{rule.label}</h3>
                <p className="text-sm text-ocean-500">Current fare: MVR {rule.baseFare}–{rule.maxFare}</p>
              </div>
              <div className="ml-auto">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div
                    onClick={() => updateRule(rule.vehicleType, 'isActive', !rule.isActive)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      rule.isActive ? 'bg-teal-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      rule.isActive ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </div>
                  <span className="text-sm font-medium text-ocean-700">
                    {rule.isActive ? 'Active' : 'Inactive'}
                  </span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <PriceInput
                label="Minimum Fare (MVR)"
                value={rule.baseFare}
                onChange={(v) => updateRule(rule.vehicleType, 'baseFare', v)}
              />
              <PriceInput
                label="Maximum Fare (MVR)"
                value={rule.maxFare}
                onChange={(v) => updateRule(rule.vehicleType, 'maxFare', v)}
              />
              <PriceInput
                label="Commission %"
                value={rule.commissionPercent}
                onChange={(v) => updateRule(rule.vehicleType, 'commissionPercent', v)}
                suffix="%"
              />
              <div className="bg-teal-50 rounded-xl p-4">
                <div className="text-xs font-medium text-ocean-500 mb-1 uppercase tracking-wide">Driver Keeps</div>
                <div className="text-2xl font-bold text-teal-600">
                  {Math.round(rule.baseFare * (1 - rule.commissionPercent / 100))}–
                  {Math.round(rule.maxFare * (1 - rule.commissionPercent / 100))} MVR
                </div>
                <div className="text-xs text-ocean-400 mt-1">per trip</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Future: Surge pricing */}
      <div className="mt-6 bg-gradient-to-br from-ocean-900 to-ocean-800 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">⚡</span>
          <h3 className="text-lg font-semibold">Event Surge Pricing</h3>
          <span className="ml-auto bg-white/10 text-white/70 text-xs px-2 py-1 rounded-full">Coming Soon</span>
        </div>
        <p className="text-white/60 text-sm">
          Automatically apply surge multipliers during high-demand events (DJ nights, pool parties).
          Configure event-specific pricing in the Events section.
        </p>
      </div>
    </div>
  );
}

function PriceInput({
  label, value, onChange, suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-ocean-500 mb-1 uppercase tracking-wide">
        {label}
      </label>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full px-4 py-3 bg-ocean-50 border border-teal-100 rounded-xl text-lg font-bold text-ocean-900 focus:outline-none focus:ring-2 focus:ring-teal-300"
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ocean-400 font-medium">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
