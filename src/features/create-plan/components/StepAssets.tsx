"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import DonutAllocation from "@/components/charts/DonutAllocation";
import AssetLogo from "@/components/ui/AssetLogo";
import RiskBadge from "@/components/ui/RiskBadge";
import Chip from "@/components/ui/Chip";
import { cn, fmtPct, fmtVNDfull, shade } from "@/lib/utils";
import type { Allocation, Asset } from "@/lib/types";
import { CAT_FILTERS, PRESETS } from "./constants";
import type { PlanDraft } from "./types";
import {
  useRiskPresetAnalysis,
  type RiskPresetName,
} from "../hooks/useRiskPresetAnalysis";

export default function StepAssets({
  plan,
  setPlan,
  assets,
}: {
  plan: PlanDraft;
  setPlan: (p: PlanDraft) => void;
  assets: Asset[];
}) {
  const [mounted, setMounted] = useState(false);
  const [catFilter, setCatFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showAssetPicker, setShowAssetPicker] = useState(false);
  const [recentAddedId, setRecentAddedId] = useState<string | null>(null);
  const [amountDrafts, setAmountDrafts] = useState<Record<string, string>>({});
  const [riskInsight, setRiskInsight] = useState<{
    preset: string;
    title: string;
    summary: string;
    score: number;
  } | null>(null);
  const [showInsightTip, setShowInsightTip] = useState(false);
  const { analyzePreset } = useRiskPresetAnalysis();
  const selectedIds = new Set(plan.allocation.map((a) => a.id));
  const totalPct = plan.allocation.reduce((s, a) => s + a.pct, 0);
  const isFull = Math.abs(totalPct - 100) < 0.01;
  const available = assets.filter((a) => {
    const matchesCat = catFilter === "all" || a.cat === catFilter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q || a.id.toLowerCase().includes(q) || a.name.toLowerCase().includes(q);
    return !selectedIds.has(a.id) && matchesCat && matchesSearch;
  });
  const assetMap = Object.fromEntries(assets.map((a) => [a.id, a])) as Record<
    string,
    Asset
  >;
  const fmtAllocPct = (pct: number) => pct.toFixed(1).replace(/\.0$/, "");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!showAssetPicker) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowAssetPicker(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showAssetPicker]);

  useEffect(() => {
    if (!mounted) return;
    const prev = document.body.style.overflow;
    if (showAssetPicker) document.body.style.overflow = "hidden";
    else document.body.style.overflow = prev || "";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showAssetPicker, mounted]);

  useEffect(() => {
    if (!recentAddedId) return;
    const t = window.setTimeout(() => setRecentAddedId(null), 4500);
    return () => window.clearTimeout(t);
  }, [recentAddedId]);

  function rebalance(alloc: Allocation[]): Allocation[] {
    if (!alloc.length) return alloc;
    const even = Math.floor(100 / alloc.length);
    const rem = 100 - even * (alloc.length - 1);
    return alloc.map((a, i) => ({ ...a, pct: i === 0 ? rem : even }));
  }

  function toggle(asset: Asset) {
    if (selectedIds.has(asset.id)) {
      const next = plan.allocation.filter((a) => a.id !== asset.id);
      setPlan({ ...plan, allocation: next.length ? rebalance(next) : next });
    } else {
      setPlan({
        ...plan,
        allocation: rebalance([...plan.allocation, { id: asset.id, pct: 0 }]),
      });
      setRecentAddedId(asset.id);
      setShowAssetPicker(false);
      setSearch("");
    }
  }

  function setPct(id: string, pct: number) {
    setPlan({
      ...plan,
      allocation: plan.allocation.map((a) => (a.id === id ? { ...a, pct } : a)),
    });
  }

  function setAmount(id: string, amount: number) {
    const safeAmount = Math.max(0, amount);
    const pct =
      plan.amount > 0 ? Math.round((safeAmount / plan.amount) * 1000) / 10 : 0;
    setPct(id, Math.max(0, Math.min(100, pct)));
  }

  function runPresetAnalysis(presetName: string) {
    if (!plan.allocation.length) return;
    const result = analyzePreset(
      presetName as RiskPresetName,
      plan.allocation,
      assets,
    );
    setRiskInsight({ preset: presetName, ...result });
    setShowInsightTip(false);
  }

  return (
    <div className="fade-up flex flex-col gap-3">
      <div className="px-1">
        <div className="text-[10px] font-extrabold text-ink-3 tracking-[0.14em] uppercase">
          Bước 2 · Tài sản
        </div>
        <div className="text-[24px] font-black tracking-tight leading-tight mt-1">
          Phân bổ vốn DCA
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="p-4 pb-3">
          <div className="flex items-center justify-between mb-1">
            <div className="text-[10px] font-extrabold text-ink-3 tracking-[0.14em] uppercase">
              Phân bổ
            </div>
            {plan.allocation.length > 0 && (
              <span
                className={cn(
                  "text-[11px] font-extrabold px-2.5 py-0.5 rounded-full mono-num",
                  isFull
                    ? "bg-grass-50 text-grass-800"
                    : totalPct > 0
                      ? "bg-amber-50 text-amber-700"
                      : "bg-canvas text-ink-3",
                )}
              >
                {fmtAllocPct(totalPct)}%
              </span>
            )}
          </div>
          {plan.allocation.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-5 text-center">
              <div className="w-14 h-14 rounded-2xl bg-canvas grid place-items-center text-2xl mb-2">
                🌿
              </div>
              <div className="text-[13px] font-extrabold text-ink-2">
                Chưa có tài sản
              </div>
              <div className="text-[11px] text-ink-4 mt-0.5">
                Thêm mã trước, sau đó dùng combo nhanh để phân tích khẩu vị rủi
                ro
              </div>
              <button
                onClick={() => setShowAssetPicker(true)}
                className="mt-3 h-10 px-4 rounded-xl bg-grass-600 text-white text-[12px] font-extrabold active:scale-95"
              >
                + Thêm mã sản phẩm
              </button>
            </div>
          ) : (
            <div className="flex justify-center my-2">
              <DonutAllocation
                items={plan.allocation.map((a) => ({
                  pct: a.pct,
                  color: assetMap[a.id]?.color ?? "#ccc",
                }))}
                size={140}
                stroke={18}
              />
            </div>
          )}
          {plan.allocation.length > 0 && (
            <button
              onClick={() => setShowAssetPicker(true)}
              className="mt-2 w-full h-10 rounded-xl border border-dashed border-grass-300 bg-grass-50 text-grass-700 text-[12px] font-extrabold active:scale-[0.99]"
            >
              + Thêm mã sản phẩm
            </button>
          )}
        </div>

        {plan.allocation.length > 0 && (
          <div className="px-4 pb-3 border-t border-gray-50 pt-3">
            <div className="text-[10px] font-extrabold text-ink-3 tracking-[0.14em] uppercase mb-2">
              Combo nhanh
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {PRESETS.map((r) => (
                <button
                  key={r.name}
                  onClick={() => runPresetAnalysis(r.name)}
                  className="min-h-[74px] rounded-xl py-3 px-2 text-center transition-all bg-canvas active:scale-95 active:bg-grass-50"
                >
                  <div className="text-xl leading-none">{r.emoji}</div>
                  <div className="font-extrabold text-[11px] text-ink-1 mt-1">
                    {r.name}
                  </div>
                </button>
              ))}
            </div>
            {riskInsight && (
              <div className="mt-2.5 p-3 rounded-xl bg-grass-50 border border-grass-100">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-extrabold text-grass-700 tracking-[0.12em] uppercase">
                    Phân tích · {riskInsight.preset}
                  </div>
                  <div className="relative group">
                    <button
                      type="button"
                      onClick={() => setShowInsightTip((v) => !v)}
                      className="w-6 h-6 rounded-full bg-white shadow-sm grid place-items-center"
                      aria-label="Xem chi tiết phân tích"
                    >
                      <span className="w-[18px] h-[18px] rounded-full bg-grass-600 text-white text-[11px] font-black grid place-items-center leading-none">
                        i
                      </span>
                    </button>
                    <div
                      className={cn(
                        "absolute right-0 top-7 z-10 w-64 rounded-lg bg-ink-1 text-white p-2.5 shadow-lg text-left",
                        "opacity-0 pointer-events-none transition-opacity duration-150 group-hover:opacity-100 group-hover:pointer-events-auto",
                        showInsightTip && "opacity-100 pointer-events-auto",
                      )}
                    >
                      <div className="text-[11px] font-extrabold">
                        {riskInsight.title}
                      </div>
                      <div className="text-[10px] mt-1 leading-relaxed text-white/90">
                        {riskInsight.summary}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-[11px] text-ink-3 mt-1.5">
                  Điểm rủi ro hiện tại:{" "}
                  <span className="font-black">
                    {riskInsight.score.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {plan.allocation.length > 0 && (
          <div className="border-t border-gray-50 px-4 py-3.5">
            <div className="flex items-center justify-between mb-2.5">
              <div className="text-[10px] font-extrabold text-ink-3 tracking-[0.14em] uppercase">
                Đã chọn · {plan.allocation.length}
              </div>
              {!isFull && (
                <span className="text-[10px] text-amber-600 font-extrabold">
                  {100 - totalPct > 0
                    ? `thiếu ${fmtAllocPct(100 - totalPct)}%`
                    : `dư ${fmtAllocPct(totalPct - 100)}%`}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-3">
              {plan.allocation.map((a) => {
                const asset = assetMap[a.id];
                if (!asset) return null;

                return (
                  <div key={a.id}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-3 h-3 rounded-sm flex-shrink-0"
                          style={{ background: asset.color }}
                        />
                        <span className="font-extrabold text-[13px] flex-shrink-0">
                          {asset.id}
                        </span>
                        {recentAddedId === a.id && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-grass-600 text-white text-[10px] font-extrabold flex-shrink-0">
                            Mới thêm
                          </span>
                        )}
                        <span className="text-[11px] text-ink-3 truncate">
                          · {asset.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span
                          className="mono-num font-black text-[14px]"
                          style={{ color: shade(asset.color, -15) }}
                        >
                          {fmtAllocPct(a.pct)}%
                        </span>
                        <button
                          onClick={() => toggle(asset)}
                          className="w-8 h-8 rounded-full grid place-items-center text-ink-4 active:text-red-500 text-lg leading-none hover:bg-red-50"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="0.1"
                      value={a.pct}
                      onChange={(e) => {
                        setAmountDrafts((prev) => {
                          const next = { ...prev };
                          delete next[a.id];
                          return next;
                        });
                        setPct(a.id, parseFloat(e.target.value));
                      }}
                      className="w-full"
                      style={{ accentColor: asset.color }}
                    />
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[11px] text-ink-3 font-bold">
                        Số tiền/kỳ
                      </span>
                      <input
                        inputMode="numeric"
                        value={
                          amountDrafts[a.id] ??
                          Math.round(
                            (plan.amount * a.pct) / 100,
                          ).toLocaleString("vi-VN")
                        }
                        onChange={(e) => {
                          const rawDigits = e.target.value.replace(/\D/g, "");
                          const parsed = parseInt(rawDigits || "0", 10);
                          setAmountDrafts((prev) => ({
                            ...prev,
                            [a.id]: rawDigits
                              ? parsed.toLocaleString("vi-VN")
                              : "",
                          }));
                          setAmount(a.id, parsed || 0);
                        }}
                        onBlur={() => {
                          setAmountDrafts((prev) => {
                            const next = { ...prev };
                            delete next[a.id];
                            return next;
                          });
                        }}
                        className="flex-1 h-9 rounded-lg border border-gray-200 px-2.5 mono-num text-[12px] font-bold focus:outline-none focus:ring-2 focus:ring-grass-200"
                        placeholder={fmtVNDfull(0)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {mounted &&
        showAssetPicker &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] bg-black/35 backdrop-blur-lg grid place-items-center p-3"
            onClick={() => setShowAssetPicker(false)}
          >
            <div
              className="w-[min(92vw,420px)] bg-white rounded-2xl shadow-xl p-4 max-h-[82vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-[14px] font-black">Thêm mã sản phẩm</div>
                <button
                  onClick={() => setShowAssetPicker(false)}
                  className="w-8 h-8 rounded-full grid place-items-center text-ink-4 hover:bg-gray-100"
                >
                  ×
                </button>
              </div>

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo mã hoặc tên..."
                className="h-10 rounded-xl border border-gray-200 px-3 text-[12px] font-semibold focus:outline-none focus:ring-2 focus:ring-grass-200"
              />

              <div
                className="flex gap-1.5 overflow-x-auto pb-2 mt-2"
                style={{ scrollbarWidth: "none" }}
              >
                {CAT_FILTERS.map((c) => (
                  <Chip
                    key={c.id}
                    active={catFilter === c.id}
                    onClick={() => setCatFilter(c.id)}
                    className="flex-shrink-0 text-[11px]"
                  >
                    {c.label}
                  </Chip>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto mt-1 flex flex-col gap-1.5 pr-0.5">
                {available.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => toggle(a)}
                    className="min-h-[56px] bg-white rounded-xl px-3 py-2.5 flex items-center gap-3 active:scale-[0.98] active:bg-grass-50 transition-all border border-gray-100"
                  >
                    <AssetLogo asset={a} size={32} />
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="font-extrabold text-[13px]">
                          {a.id}
                        </span>
                        <span className="text-[10px] text-ink-3 truncate">
                          {a.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <RiskBadge risk={a.risk} />
                        <span
                          className={cn(
                            "text-[10px] font-extrabold",
                            a.ytd >= 0 ? "text-grass-600" : "text-red-500",
                          )}
                        >
                          YTD {fmtPct(a.ytd)}
                        </span>
                      </div>
                    </div>
                    <span className="text-grass-500 text-2xl font-black leading-none flex-shrink-0 w-7 text-center">
                      +
                    </span>
                  </button>
                ))}
                {available.length === 0 && (
                  <div className="py-8 text-center text-[12px] text-ink-4 font-semibold">
                    Không có mã phù hợp với bộ lọc hiện tại.
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
