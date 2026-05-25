'use client'

import { useAppStore } from '@/lib/store'
import { useShallow } from 'zustand/react/shallow'
import ImgIcon from '@/components/icons/ImgIcon'
import type { Screen } from '@/lib/types'
import type { IconName } from '@/assets'

interface TabItem {
  id: Screen
  label?: string
  icon: IconName
  fab?: boolean
}

const TAB_ITEMS: TabItem[] = [
  { id: 'dashboard', icon: 'home',    label: 'Tổng quan' },
  { id: 'browse',    icon: 'compass', label: 'Khám phá' },
  { id: 'create',    icon: 'plus',    fab: true },
  { id: 'history',   icon: 'history', label: 'Lịch sử' },
  { id: 'settings',  icon: 'gear',    label: 'Cài đặt' },
]

const SCREEN_TO_TAB: Partial<Record<Screen, Screen>> = {
  dashboard: 'dashboard',
  browse:    'browse',
  detail:    'browse',
  create:    'create',
  calc:      'create',
  history:   'history',
  settings:  'settings',
}

export default function BottomNav() {
  const { screen, dispatch } = useAppStore(useShallow(s => ({ screen: s.screen, dispatch: s.dispatch })))
  const activeTab = SCREEN_TO_TAB[screen]

  return (
    <nav className="flex justify-around items-end px-2 pt-2 pb-4 bg-white/95 backdrop-blur-lg border-t border-line">
      {TAB_ITEMS.map(tab => tab.fab ? (
        <button
          key={tab.id}
          onClick={() => dispatch({ type: 'go', screen: 'create' })}
          className="-mt-7 w-14 h-14 rounded-[22px] brand-gradient grid place-items-center shadow-cta active:scale-95 transition-transform"
          aria-label="Tạo kế hoạch"
        >
          <ImgIcon name="plus" size={28} />
        </button>
      ) : (
        <button
          key={tab.id}
          onClick={() => dispatch({ type: 'go', screen: tab.id })}
          className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-xl transition-colors ${
            activeTab === tab.id ? 'text-grass-500' : 'text-ink-4'
          }`}
        >
          <ImgIcon
            name={tab.icon}
            size={24}
            className={`transition-opacity ${activeTab === tab.id ? 'opacity-100' : 'opacity-40'}`}
          />
          <span className="text-[10px] font-bold">{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}
