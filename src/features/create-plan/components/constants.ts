import type { Asset } from '@/lib/types'

export const EMOJIS = ['🌱', '🎓', '🏠', '✈️', '🚗', '💍', '👶', '🎯', '💰', '🏖️', '📚', '💎']
export const AMOUNTS = [500_000, 1_000_000, 2_000_000, 5_000_000, 10_000_000]
export const YEARS = [1, 3, 5, 10, 15, 20]

export const PRESETS = [
  { name: 'Người mới', emoji: '🌱', items: [{ id: 'BAL' as Asset['id'], pct: 60 }, { id: 'ETF' as Asset['id'], pct: 40 }] },
  { name: 'Năng động', emoji: '🚀', items: [{ id: 'ETF' as Asset['id'], pct: 40 }, { id: 'GROW' as Asset['id'], pct: 40 }, { id: 'FUND' as Asset['id'], pct: 20 }] },
  { name: 'Bảo thủ', emoji: '🛡️', items: [{ id: 'BOND' as Asset['id'], pct: 60 }, { id: 'BAL' as Asset['id'], pct: 25 }, { id: 'GOLD' as Asset['id'], pct: 15 }] },
]

export const CAT_FILTERS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'etf', label: 'ETF' },
  { id: 'fund', label: 'Quỹ mở' },
  { id: 'stock', label: 'Cổ phiếu' },
  { id: 'gold', label: 'Vàng' },
  { id: 'savings', label: 'Tiết kiệm' },
]
