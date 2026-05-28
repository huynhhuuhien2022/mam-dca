"use client";

import Button from "@/components/ui/Button";
import { useAppStore } from "@/lib/store";
import type { Screen } from "@/lib/types";
import { useShallow } from "zustand/react/shallow";

const SUBPAGE_HEADER: Partial<
  Record<Screen, { title: string; backTo: Screen; action?: "editPlan" }>
> = {
  profileEdit: { title: "Cập nhật hồ sơ", backTo: "profile" },
  planDetail: { title: "Chi tiết kế hoạch", backTo: "dashboard", action: "editPlan" },
  planHistory: { title: "Lịch sử kế hoạch", backTo: "planDetail" },
};

export default function Header() {
  const { auth, screen, dispatch } = useAppStore(
    useShallow((s) => ({
      auth: s.auth,
      screen: s.screen,
      dispatch: s.dispatch,
    })),
  );

  const subpage = SUBPAGE_HEADER[screen];
  if (subpage) {
    return (
      <header className="flex items-center justify-between px-4 pt-12 pb-3 bg-white border-b border-gray-200">
        <button
          onClick={() => dispatch({ type: "go", screen: subpage.backTo })}
          className="w-9 h-9 grid place-items-center text-[20px] font-black text-ink-2"
          aria-label="Quay lại"
        >
          ←
        </button>
        <div className="text-[16px] font-black tracking-tight">
          {subpage.title}
        </div>
        {subpage.action === "editPlan" ? (
          <button
            type="button"
            onClick={() =>
              dispatch({
                type: "showToast",
                toast: {
                  message: "Chỉnh sửa kế hoạch sẽ làm ở bước tiếp theo",
                  icon: "✎",
                },
              })
            }
            className="w-9 h-9 grid place-items-center rounded-xl bg-grass-50 text-grass-700 active:scale-95 transition-transform"
            aria-label="Chỉnh sửa kế hoạch"
            title="Chỉnh sửa"
          >
            <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path d="M4 14.5V16H5.5L14.2 7.3L12.7 5.8L4 14.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M11.8 4.9L13 3.7C13.6 3.1 14.5 3.1 15.1 3.7L16.3 4.9C16.9 5.5 16.9 6.4 16.3 7L15.1 8.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        ) : (
          <span className="w-9" />
        )}
      </header>
    );
  }

  return (
    <>
      {/* Top bar */}
      <header className="flex items-center gap-2 px-4 pt-12 pb-2 bg-canvas">
        {/* Logo */}
        <div className="w-9 h-9 rounded-xl brand-gradient grid place-items-center shadow-cta flex-shrink-0">
          <svg width="20" height="20" viewBox="0 0 32 32" aria-hidden>
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
        <span className="font-black text-[18px] tracking-tight text-grass-500">
          Mầm
        </span>

        <div className="ml-auto flex items-center gap-1.5">
          {/* Bell */}
          <button className="w-9 h-9 grid place-items-center relative active:scale-95 transition-transform">
            <span className="text-[22px]">🔔</span>
            <span className="absolute top-1 right-1.5 w-2 h-2 rounded-full bg-warm ring-2 ring-canvas" />
          </button>

          {/* Auth button */}
          {auth ? (
            <button
              onClick={() => dispatch({ type: "go", screen: "profile" })}
              className="w-9 h-9 rounded-xl brand-soft text-grass-900 grid place-items-center font-black text-[13px] active:scale-95 transition-transform"
            >
              MN
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
          <span className="text-base">🔍</span>
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
