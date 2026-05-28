import type { Asset, Plan } from './types'

/* ============================================================
   Sparkline generator — deterministic pseudo-random
   ============================================================ */
function sparkSeed(seed: number, len = 24, vol = 0.04, trend = 0.002): number[] {
  let v = 100
  let s = seed
  const out: number[] = []
  const rng = () => { s = (s * 9301 + 49297) % 233280; return s / 233280 }
  for (let i = 0; i < len; i++) {
    v = v * (1 + (rng() - 0.5) * 2 * vol + trend)
    out.push(v)
  }
  return out
}

/* ============================================================
   8 asset classes — educational/advisory only, no real tickers
   ============================================================ */
const assetBase = [
  {
    id: 'ETF'  as const, name: 'ETF chỉ số',
    sub: 'Quỹ ETF theo dõi rổ cổ phiếu lớn', mgr: 'Loại tài sản',
    cat: 'etf'     as const, risk: 'Trung bình' as const,
    ytd: 22.1, y3: 12.5, y5: 11.8,
    color: '#22C55E',
    tags: ['Đa dạng hóa', 'Phí thấp', 'Thanh khoản tốt'],
    note: 'Ví dụ trên thị trường: ETF theo dõi VN30, VN100, hoặc VNFIN-LEAD.',
  },
  {
    id: 'BLUE' as const, name: 'Cổ phiếu blue-chip',
    sub: 'Doanh nghiệp đầu ngành, lịch sử ổn định', mgr: 'Loại tài sản',
    cat: 'stock'   as const, risk: 'Trung bình' as const,
    ytd: 18.3, y3: 14.2, y5: 13.5,
    color: '#3B82F6',
    tags: ['Cổ tức đều', 'Đầu ngành'],
    note: 'Nhóm doanh nghiệp lớn, vốn hoá cao, lịch sử kinh doanh dài.',
  },
  {
    id: 'GROW' as const, name: 'Cổ phiếu tăng trưởng',
    sub: 'Mid-cap tiềm năng, biến động cao', mgr: 'Loại tài sản',
    cat: 'stock'   as const, risk: 'Cao'         as const,
    ytd: 34.7, y3: 18.4, y5: 16.2,
    color: '#F59E0B',
    tags: ['Tăng trưởng', 'Biến động'],
    note: 'Doanh nghiệp vừa, tốc độ tăng trưởng cao nhưng rủi ro hơn.',
  },
  {
    id: 'FUND' as const, name: 'Quỹ mở cổ phiếu',
    sub: 'Quỹ chủ động chọn lọc cổ phiếu', mgr: 'Loại tài sản',
    cat: 'fund'    as const, risk: 'Trung bình' as const,
    ytd: 19.5, y3: 13.0, y5: 12.4,
    color: '#EF4444',
    tags: ['Chuyên gia', 'Đa dạng'],
    note: 'Quỹ do công ty quản lý quỹ điều hành, phân bổ vào nhiều cổ phiếu.',
  },
  {
    id: 'BAL'  as const, name: 'Quỹ cân bằng',
    sub: 'Mix cổ phiếu + trái phiếu', mgr: 'Loại tài sản',
    cat: 'fund'    as const, risk: 'Thấp'        as const,
    ytd: 11.2, y3: 8.5, y5: 8.8,
    color: '#8B5CF6',
    tags: ['Cân bằng', 'Ít biến động'],
    note: 'Phân bổ tiêu biểu 50% cổ phiếu, 50% trái phiếu hoặc tương đương.',
  },
  {
    id: 'BOND' as const, name: 'Quỹ trái phiếu',
    sub: 'Trái phiếu chính phủ & doanh nghiệp', mgr: 'Loại tài sản',
    cat: 'fund'    as const, risk: 'Thấp'        as const,
    ytd: 7.3, y3: 6.8, y5: 7.0,
    color: '#0EA5E9',
    tags: ['An toàn', 'Thu nhập đều'],
    note: 'Phù hợp khi cần ổn định, ít rủi ro biến động giá.',
  },
  {
    id: 'GOLD' as const, name: 'Vàng',
    sub: 'Vàng vật chất hoặc ETF vàng', mgr: 'Loại tài sản',
    cat: 'gold'    as const, risk: 'Trung bình' as const,
    ytd: 16.4, y3: 11.8, y5: 9.2,
    color: '#FBBF24',
    tags: ['Phòng ngừa', 'Lạm phát'],
    note: 'Có thể là vàng SJC, hoặc các quỹ/ETF có tài sản cơ sở là vàng.',
  },
  {
    id: 'SAVE' as const, name: 'Tiết kiệm có kỳ hạn',
    sub: 'Gửi ngân hàng có kỳ hạn cố định', mgr: 'Loại tài sản',
    cat: 'savings' as const, risk: 'Thấp'        as const,
    ytd: 5.2, y3: 5.5, y5: 5.0,
    color: '#94A3B8',
    tags: ['An toàn nhất', 'Lãi cố định'],
    note: 'Lãi suất tuỳ kỳ hạn và ngân hàng. Tham khảo cho phần vốn an toàn.',
  },
]

export const assets: Asset[] = assetBase.map((a, i) => ({
  ...a,
  spark: sparkSeed(
    i * 13 + 7, 30,
    a.cat === 'stock' ? 0.06 : a.cat === 'savings' ? 0.005 : 0.025,
    (a.ytd / 100) * 0.015,
  ),
  day: ((a.id.charCodeAt(0) + (a.id.charCodeAt(1) || 0)) % 7 - 3) * 0.4,
}))

export const assetMap = Object.fromEntries(assets.map(a => [a.id, a])) as Record<Asset['id'], Asset>

/* ============================================================
   Sample plans — illustrative, no real money / fund linkage
   ============================================================ */
export const samplePlans: Plan[] = [
  {
    id: 'p1', name: 'Quỹ hưu trí 2050', emoji: '🌱',
    amount: 1_500_000, freq: 'month', freqDays: [1],
    allocation: [
      { id: 'ETF',  pct: 40 },
      { id: 'BAL',  pct: 35 },
      { id: 'BOND', pct: 25 },
    ],
    duration: null,
    startMonth: 14, totalInvested: 21_000_000, currentValue: 24_830_000,
  },
  {
    id: 'p2', name: 'Du học cho con', emoji: '🎓',
    amount: 500_000, freq: 'week', freqDays: [1],
    allocation: [
      { id: 'ETF',  pct: 60 },
      { id: 'FUND', pct: 40 },
    ],
    duration: 10,
    startMonth: 8, totalInvested: 17_000_000, currentValue: 18_920_000,
  },
]

export { sparkSeed }
