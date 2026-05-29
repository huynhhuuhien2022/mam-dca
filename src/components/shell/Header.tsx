"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { useAppStore } from "@/lib/store";
import { getAvatarPreset } from "@/lib/avatar-presets";
import { getSupabaseClient } from "@/lib/supabase";
import type { Screen } from "@/lib/types";
import { ArrowLeft, Bell, Pencil, Search } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

type SubpageHeaderConfig = { title: string; backTo: Screen; action?: "editPlan" };

const SUBPAGE_HEADER: Partial<Record<Screen, SubpageHeaderConfig>> = {
  profileEdit: { title: "Cập nhật hồ sơ", backTo: "profile" },
  planDetail: { title: "Chi tiết kế hoạch", backTo: "dashboard", action: "editPlan" },
  planHistory: { title: "Lịch sử kế hoạch", backTo: "planDetail" },
};

export default function Header() {
  const { auth, screen, planId, plans, prefill, dispatch } = useAppStore(
    useShallow((s) => ({
      auth: s.auth,
      screen: s.screen,
      planId: s.planId,
      plans: s.plans,
      prefill: s.prefill,
      dispatch: s.dispatch,
    })),
  );
  const [avatarId, setAvatarId] = useState("sprout");

  useEffect(() => {
    let active = true;
    if (!auth) {
      setAvatarId("sprout");
      return () => {
        active = false;
      };
    }

    (async () => {
      try {
        const supabase = getSupabaseClient();
        const { data } = await supabase.auth.getUser();
        if (!active) return;
        const meta = data.user?.user_metadata as { avatar_id?: string } | null;
        setAvatarId(meta?.avatar_id ?? "sprout");
      } catch {
        if (active) setAvatarId("sprout");
      }
    })();

    return () => {
      active = false;
    };
  }, [auth, screen]);

  const subpage: SubpageHeaderConfig | undefined =
    screen === "create"
      ? {
          title: prefill?.id ? "Chỉnh sửa kế hoạch" : "Tạo kế hoạch",
          backTo: prefill?.id ? "planDetail" : "dashboard",
        }
      : SUBPAGE_HEADER[screen];
  const activePlan = plans.find((plan) => plan.id === planId) ?? null;

  if (subpage) {
    return (
      <header className="flex items-center justify-between px-4 pt-9 pb-1.5 bg-white border-b border-gray-200">
        <button
          onClick={() => dispatch({ type: "go", screen: subpage.backTo, planId: prefill?.id ?? planId ?? undefined })}
          className="w-8 h-8 grid place-items-center text-ink-2"
          aria-label="Quay lại"
        >
          <ArrowLeft size={20} strokeWidth={2.6} aria-hidden />
        </button>
        <div className="text-[15px] font-black tracking-tight">
          {subpage.title}
        </div>
        {subpage.action === "editPlan" ? (
          <button
            type="button"
            onClick={() => {
              if (!activePlan) {
                dispatch({
                  type: "showToast",
                  toast: { message: "Không tìm thấy kế hoạch để chỉnh sửa", icon: "!" },
                });
                return;
              }

              dispatch({
                type: "go",
                screen: "create",
                planId: activePlan.id,
                prefill: activePlan,
              });
            }}
            className="w-8 h-8 grid place-items-center rounded-xl bg-grass-50 text-grass-700 active:scale-95 transition-transform"
            aria-label="Chỉnh sửa kế hoạch"
            title="Chỉnh sửa"
          >
            <Pencil size={17} strokeWidth={2.3} aria-hidden />
          </button>
        ) : (
          <span className="w-8" />
        )}
      </header>
    );
  }

  return (
    <>
      {/* Top bar */}
      <header className="flex items-center gap-2 px-4 pt-9 pb-1.5 bg-canvas">
        {/* Logo */}
        <div className="w-8 h-8 rounded-xl brand-gradient grid place-items-center shadow-cta flex-shrink-0">
          <svg width="18" height="18" viewBox="0 0 32 32" aria-hidden>
            <path
              d="M 16 28 L 16 14"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <ellipse
              cx="10"
              cy="12"
              rx="6"
              ry="4"
              fill="white"
              transform="rotate(-22 10 12)"
            />
            <ellipse
              cx="22"
              cy="12"
              rx="6"
              ry="4"
              fill="white"
              transform="rotate(22 22 12)"
            />
          </svg>
        </div>
        <span className="font-black text-[16px] tracking-tight text-grass-500">
          Mầm
        </span>

        <div className="ml-auto flex items-center gap-1.5">
          {/* Bell */}
          <button className="w-8 h-8 grid place-items-center relative active:scale-95 transition-transform">
            <Bell size={20} strokeWidth={2.4} aria-hidden />
            <span className="absolute top-1 right-1.5 w-2 h-2 rounded-full bg-warm ring-2 ring-canvas" />
          </button>

          {/* Auth button */}
          {auth ? (
            <button
              onClick={() => dispatch({ type: "go", screen: "profile" })}
              className="w-8 h-8 rounded-xl grid place-items-center text-[18px] active:scale-95 transition-transform shadow-sm"
              style={{ background: getAvatarPreset(avatarId).gradient }}
              aria-label="Mở hồ sơ"
            >
              {getAvatarPreset(avatarId).emoji}
            </button>
          ) : (
            <Button
              variant="magic"
              size="sm"
              onClick={() => dispatch({ type: "go", screen: "login" })}
              className="h-10 min-w-[96px] rounded-full px-5 text-[12.5px] tracking-tight ring-1 ring-white/35"
            >
              Đăng nhập
            </Button>
          )}
        </div>
      </header>

      {/* Search bar */}
      <div className="px-4 pb-3 bg-canvas">
        <div className="flex items-center gap-2 bg-white border border-line rounded-full px-3.5 py-2.5 focus-within:border-grass-500 focus-within:shadow-glow transition-shadow">
          <Search size={18} strokeWidth={2.4} className="text-ink-3" aria-hidden />
          <input
            placeholder="Tìm quỹ, ETF, cổ phiếu..."
            onFocus={() => dispatch({ type: "go", screen: "browse" })}
            className="flex-1 min-w-0 border-0 outline-none bg-transparent text-ink-1 font-semibold text-[14px] placeholder:text-ink-4"
          />
        </div>
      </div>
    </>
  );
}
