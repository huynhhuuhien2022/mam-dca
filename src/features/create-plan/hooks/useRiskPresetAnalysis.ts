import type { Asset, Allocation } from '@/lib/types'

export type RiskPresetName = 'Người mới' | 'Năng động' | 'Bảo thủ'

interface PresetResult {
  title: string
  summary: string
  score: number
}

const RISK_SCORE: Record<Asset['risk'], number> = {
  'Thấp': 1,
  'Trung bình': 2,
  'Cao': 3,
}

const TARGET_SCORE: Record<RiskPresetName, number> = {
  'Người mới': 1.6,
  'Năng động': 2.4,
  'Bảo thủ': 1.3,
}

function allocationRiskScore(allocation: Allocation[], assets: Asset[]): number {
  if (!allocation.length) return 0
  const assetMap = Object.fromEntries(assets.map((a) => [a.id, a])) as Record<string, Asset>
  const totalPct = allocation.reduce((sum, a) => sum + a.pct, 0) || 1

  const weighted = allocation.reduce((sum, a) => {
    const risk = assetMap[a.id]?.risk ?? 'Trung bình'
    return sum + RISK_SCORE[risk] * a.pct
  }, 0)

  return weighted / totalPct
}

export function useRiskPresetAnalysis() {
  function analyzePreset(preset: RiskPresetName, allocation: Allocation[], assets: Asset[]): PresetResult {
    const current = allocationRiskScore(allocation, assets)
    const target = TARGET_SCORE[preset]
    const diff = current - target

    if (Math.abs(diff) <= 0.2) {
      return {
        title: `Hợp với khẩu vị ${preset.toLowerCase()}`,
        summary: `Danh mục hiện tại có độ rủi ro ${current.toFixed(2)} và đang khá sát mức mục tiêu ${target.toFixed(2)} của nhóm ${preset.toLowerCase()}.`,
        score: current,
      }
    }

    if (diff > 0) {
      return {
        title: `Danh mục đang rủi ro hơn kiểu ${preset.toLowerCase()}`,
        summary: `Điểm rủi ro hiện tại là ${current.toFixed(2)} (cao hơn mục tiêu ${target.toFixed(2)}). Nên giảm tỷ trọng tài sản rủi ro cao và tăng tài sản phòng thủ.`,
        score: current,
      }
    }

    return {
      title: `Danh mục đang an toàn hơn kiểu ${preset.toLowerCase()}`,
      summary: `Điểm rủi ro hiện tại là ${current.toFixed(2)} (thấp hơn mục tiêu ${target.toFixed(2)}). Có thể tăng nhẹ nhóm tăng trưởng nếu bạn muốn lợi nhuận kỳ vọng cao hơn.`,
      score: current,
    }
  }

  return { analyzePreset }
}
