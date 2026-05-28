export interface AvatarPreset {
  id: string
  label: string
  emoji: string
  gradient: string
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  { id: 'sprout', label: 'Mầm xanh', emoji: '🌱', gradient: 'linear-gradient(135deg,#86EFAC,#16A34A)' },
  { id: 'seed', label: 'Hạt giống', emoji: '🪴', gradient: 'linear-gradient(135deg,#BBF7D0,#15803D)' },
  { id: 'leaf', label: 'Lá non', emoji: '🍃', gradient: 'linear-gradient(135deg,#A7F3D0,#059669)' },
  { id: 'sun', label: 'Nắng sớm', emoji: '☀️', gradient: 'linear-gradient(135deg,#FEF08A,#EA580C)' },
  { id: 'star', label: 'Ngôi sao', emoji: '✨', gradient: 'linear-gradient(135deg,#BAE6FD,#2563EB)' },
  { id: 'rocket', label: 'Bứt phá', emoji: '🚀', gradient: 'linear-gradient(135deg,#FCA5A5,#DC2626)' },
  { id: 'turtle', label: 'Bền bỉ', emoji: '🐢', gradient: 'linear-gradient(135deg,#BEF264,#65A30D)' },
  { id: 'whale', label: 'Điềm tĩnh', emoji: '🐳', gradient: 'linear-gradient(135deg,#A5F3FC,#0891B2)' },
]

export function getAvatarPreset(id?: string | null): AvatarPreset {
  return AVATAR_PRESETS.find((avatar) => avatar.id === id) ?? AVATAR_PRESETS[0]
}
