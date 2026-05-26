"use client";

import Sparkline from "@/components/charts/Sparkline";
import Sapling from "@/components/sapling/Sapling";
import Icon3D from "@/components/icons/Icon3D";
import ImgIcon from "@/components/icons/ImgIcon";
import { fmtVNDfull, fmtVND, fmtPct, STAGE_LABELS } from "@/lib/utils";
import { useCountUp } from "@/hooks/useCountUp";
import { motion } from "framer-motion";
import type { AppAction } from "@/lib/types";

interface HeroLayoutAProps {
  totalValue: number;
  profit: number;
  profitPct: number;
  stage: 0 | 1 | 2 | 3 | 4;
  chartData: number[];
  dispatch: (action: AppAction) => void;
}

export function HeroLayoutA({
  totalValue,
  profit,
  profitPct,
  stage,
  chartData,
  dispatch,
}: HeroLayoutAProps) {
  const animValue = useCountUp(totalValue, 1000);
  const animProfit = useCountUp(Math.abs(profit), 1000, 120);
  return (
    <motion.section
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: "easeOut" }}
      className="hero-gradient text-white rounded-3xl p-3.5 relative overflow-hidden h-[248px] flex flex-col"
    >
      {/* Top specular */}
      <div
        className="absolute top-0 left-8 right-16 h-px opacity-40 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)",
        }}
      />

      <div className="relative flex-1 flex flex-col">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-[0.14em] font-extrabold text-grass-300">
              Tổng giá trị danh mục
            </div>
            <div className="mono-num text-[22px] font-black tracking-tight mt-1 leading-none">
              {fmtVNDfull(animValue)}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              <span
                className="inline-flex items-center gap-1 bg-white/[0.12] border border-white/[0.15] px-2 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap"
                style={{ color: profit >= 0 ? "#86EFAC" : "#FCA5A5" }}
              >
                {profit >= 0 ? "↑" : "↓"} {fmtVND(animProfit)} ·{" "}
                {fmtPct(profitPct)}
              </span>
            </div>
          </div>

          <div className="flex-shrink-0 -mt-2 -mr-1 text-center">
            <div
              className="rounded-2xl px-1.5 py-1"
              style={{
                background: "rgba(255,255,255,0.06)",
                backdropFilter: "blur(4px)",
              }}
            >
              <Sapling stage={stage} size={78} />
            </div>
            <div className="text-[9px] font-extrabold text-grass-300 tracking-[0.12em] uppercase mt-1">
              {STAGE_LABELS[stage]}
            </div>
          </div>
        </div>

        {/* Sparkline */}
        <div className="-mx-1 mt-2 -mb-0.5">
          <Sparkline
            data={chartData}
            color="#86EFAC"
            width={600}
            height={40}
            fill
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => dispatch({ type: "go", screen: "create" })}
            className="flex-1 min-w-0 h-12 rounded-full !bg-white text-[#166534] font-extrabold shadow-soft active:scale-[0.98] transition-transform inline-flex items-center justify-center gap-2.5 px-4"
          >
            <span className="w-7 h-7 rounded-full bg-[#2DB565] text-white text-[22px] leading-none inline-flex items-center justify-center">
              +
            </span>
            <span className="!text-[#166534] text-[14px] leading-none tracking-tight truncate">
              Tạo kế hoạch
            </span>
          </button>
          <button
            onClick={() => dispatch({ type: "go", screen: "browse" })}
            aria-label="Khám phá"
            className="h-12 min-w-[82px] rounded-full bg-[#86EFAC]/24 hover:bg-[#86EFAC]/30 active:scale-[0.98] transition-all inline-flex items-center justify-center"
          >
            <ImgIcon name="sparkle" size={20} />
          </button>
        </div>
      </div>
    </motion.section>
  );
}

export function HeroLayoutB({
  totalValue,
  profit,
  profitPct,
  stage,
  chartData,
  dispatch,
}: HeroLayoutAProps) {
  const animValue = useCountUp(totalValue, 1000);
  return (
    <div className="grid grid-cols-[1.5fr_1fr] gap-2">
      <div className="hero-gradient text-white rounded-2xl p-4 relative overflow-hidden">
        <div
          className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full opacity-20 pointer-events-none"
          style={{
            background: "radial-gradient(circle, #FACC15 0%, transparent 70%)",
          }}
        />
        <div className="relative">
          <div className="text-[10px] uppercase tracking-[0.14em] font-extrabold text-grass-300">
            Tổng danh mục
          </div>
          <div className="mono-num text-[22px] font-black tracking-tight mt-1 leading-none">
            {fmtVNDfull(animValue)}
          </div>
          <div className="mt-2">
            <span
              className="inline-flex items-center gap-1 bg-white/[0.12] border border-white/[0.15] px-2 py-0.5 rounded-full text-[11px] font-bold"
              style={{ color: profit >= 0 ? "#86EFAC" : "#FCA5A5" }}
            >
              {profit >= 0 ? "↑" : "↓"} {fmtPct(profitPct)}
            </span>
          </div>
          <div className="mt-2 -mx-1 -mb-1">
            <Sparkline
              data={chartData}
              color="#86EFAC"
              width={300}
              height={48}
              fill
            />
          </div>
        </div>
      </div>

      <div
        className="rounded-2xl p-3 flex flex-col items-center justify-center text-center"
        style={{ background: "linear-gradient(180deg, #F0FDF4, #DCFCE7)" }}
      >
        <Sapling stage={stage} size={64} />
        <div className="text-[9px] font-extrabold text-grass-700 tracking-[0.12em] uppercase mt-1">
          {STAGE_LABELS[stage]}
        </div>
      </div>
    </div>
  );
}
