import { useMemo } from 'react'

interface IconProps { uid: string }

const Grad = ({ uid, light, dark }: { uid: string; light: string; dark: string }) => (
  <defs>
    <linearGradient id={`${uid}-g`} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor={light} />
      <stop offset="1" stopColor={dark} />
    </linearGradient>
    <linearGradient id={`${uid}-g2`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={light} />
      <stop offset="1" stopColor={dark} />
    </linearGradient>
  </defs>
)

const ICONS: Record<string, (props: IconProps) => React.ReactElement> = {
  home: ({ uid }) => (<>
    <Grad uid={uid} light="#4ADE80" dark="#15803D" />
    <path d="M 32 8 L 56 28 L 56 52 Q 56 56 52 56 L 40 56 L 40 40 Q 40 36 36 36 L 28 36 Q 24 36 24 40 L 24 56 L 12 56 Q 8 56 8 52 L 8 28 Z" fill={`url(#${uid}-g)`} stroke="#15803D" strokeWidth="2" strokeLinejoin="round" />
    <circle cx="22" cy="20" r="2" fill="white" opacity="0.4" />
  </>),

  compass: ({ uid }) => (<>
    <Grad uid={uid} light="#38BDF8" dark="#0369A1" />
    <circle cx="26" cy="26" r="16" fill="white" stroke={`url(#${uid}-g)`} strokeWidth="5" />
    <circle cx="26" cy="26" r="13" fill={`url(#${uid}-g)`} opacity="0.15" />
    <path d="M 26 18 L 28 24 L 34 26 L 28 28 L 26 34 L 24 28 L 18 26 L 24 24 Z" fill={`url(#${uid}-g)`} />
    <path d="M 18 22 Q 18 16 24 16" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7" />
    <rect x="38" y="38" width="20" height="8" rx="4" fill={`url(#${uid}-g)`} transform="rotate(45 38 38)" />
  </>),

  history: ({ uid }) => (<>
    <Grad uid={uid} light="#F472B6" dark="#9D174D" />
    <circle cx="32" cy="32" r="26" fill={`url(#${uid}-g)`} />
    <circle cx="32" cy="32" r="20" fill="white" />
    <path d="M 32 18 L 32 32 L 42 38" stroke="#9D174D" strokeWidth="4" strokeLinecap="round" fill="none" />
    <circle cx="32" cy="32" r="3" fill="#9D174D" />
    <circle cx="32" cy="14" r="1.5" fill="#9D174D" />
    <circle cx="50" cy="32" r="1.5" fill="#9D174D" />
    <circle cx="32" cy="50" r="1.5" fill="#9D174D" />
    <circle cx="14" cy="32" r="1.5" fill="#9D174D" />
  </>),

  gear: ({ uid }) => (<>
    <Grad uid={uid} light="#94A3B8" dark="#334155" />
    <path d="M 32 4 L 36 6 L 36 14 Q 39 15 41 17 L 47 13 L 51 17 L 47 23 Q 49 25 50 28 L 58 28 L 60 32 L 58 36 L 50 36 Q 49 39 47 41 L 51 47 L 47 51 L 41 47 Q 39 49 36 50 L 36 58 L 32 60 L 28 58 L 28 50 Q 25 49 23 47 L 17 51 L 13 47 L 17 41 Q 15 39 14 36 L 6 36 L 4 32 L 6 28 L 14 28 Q 15 25 17 23 L 13 17 L 17 13 L 23 17 Q 25 15 28 14 L 28 6 Z" fill={`url(#${uid}-g)`} />
    <circle cx="32" cy="32" r="10" fill="white" />
    <circle cx="32" cy="32" r="5" fill="#334155" />
  </>),

  fire: ({ uid }) => (<>
    <Grad uid={uid} light="#FB923C" dark="#DC2626" />
    <path d="M 32 4 Q 22 14 26 26 Q 18 22 14 32 Q 10 48 24 58 Q 32 62 40 58 Q 54 48 50 32 Q 46 24 38 28 Q 44 14 32 4 Z" fill={`url(#${uid}-g)`} />
    <path d="M 32 28 Q 24 36 28 48 Q 32 54 38 48 Q 42 36 32 28 Z" fill="#FEF08A" />
    <ellipse cx="33" cy="44" rx="2" ry="3" fill="white" />
  </>),

  coin: ({ uid }) => (<>
    <Grad uid={uid} light="#FACC15" dark="#A16207" />
    <ellipse cx="32" cy="36" rx="24" ry="22" fill="#A16207" />
    <ellipse cx="32" cy="32" rx="24" ry="22" fill={`url(#${uid}-g)`} />
    <ellipse cx="32" cy="32" rx="18" ry="16" fill="none" stroke="#A16207" strokeWidth="1.5" opacity="0.4" />
    <text x="32" y="40" textAnchor="middle" fontSize="22" fontWeight="900" fill="#78350F" fontFamily="Nunito, sans-serif">₫</text>
    <ellipse cx="22" cy="22" rx="6" ry="4" fill="white" opacity="0.45" />
  </>),

  trophy: ({ uid }) => (<>
    <Grad uid={uid} light="#FACC15" dark="#A16207" />
    <path d="M 14 12 L 50 12 L 50 26 Q 50 40 32 42 Q 14 40 14 26 Z" fill={`url(#${uid}-g)`} />
    <path d="M 28 42 L 36 42 L 36 50 L 28 50 Z" fill="#A16207" />
    <rect x="20" y="50" width="24" height="6" rx="2" fill={`url(#${uid}-g)`} />
    <path d="M 8 16 Q 4 16 4 22 Q 4 30 14 32" stroke={`url(#${uid}-g)`} strokeWidth="4" fill="none" strokeLinecap="round" />
    <path d="M 56 16 Q 60 16 60 22 Q 60 30 50 32" stroke={`url(#${uid}-g)`} strokeWidth="4" fill="none" strokeLinecap="round" />
    <text x="32" y="32" textAnchor="middle" fontSize="14" fontWeight="900" fill="#78350F" fontFamily="Nunito, sans-serif">★</text>
  </>),

  sparkle: ({ uid }) => (<>
    <Grad uid={uid} light="#FACC15" dark="#C084FC" />
    <path d="M 32 6 Q 34 22 38 26 Q 42 30 58 32 Q 42 34 38 38 Q 34 42 32 58 Q 30 42 26 38 Q 22 34 6 32 Q 22 30 26 26 Q 30 22 32 6 Z" fill={`url(#${uid}-g)`} />
    <path d="M 50 12 Q 51 17 52 18 Q 53 19 58 20 Q 53 21 52 22 Q 51 23 50 28 Q 49 23 48 22 Q 47 21 42 20 Q 47 19 48 18 Q 49 17 50 12 Z" fill="#C084FC" />
    <circle cx="28" cy="26" r="3" fill="white" opacity="0.6" />
  </>),

  bell: ({ uid }) => (<>
    <Grad uid={uid} light="#FB923C" dark="#9A3412" />
    <path d="M 32 6 Q 20 6 16 22 L 16 38 L 8 48 L 56 48 L 48 38 L 48 22 Q 44 6 32 6 Z" fill={`url(#${uid}-g)`} />
    <circle cx="32" cy="6" r="4" fill={`url(#${uid}-g)`} />
    <path d="M 26 52 Q 32 60 38 52" stroke={`url(#${uid}-g)`} strokeWidth="5" fill="none" strokeLinecap="round" />
    <ellipse cx="24" cy="20" rx="4" ry="6" fill="white" opacity="0.35" />
  </>),

  growth: ({ uid }) => (<>
    <Grad uid={uid} light="#4ADE80" dark="#15803D" />
    <path d="M 8 52 L 24 32 L 36 40 L 56 12" stroke={`url(#${uid}-g)`} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M 44 12 L 56 12 L 56 24" stroke={`url(#${uid}-g)`} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </>),

  plus: ({ uid }) => (<>
    <Grad uid={uid} light="#4ADE80" dark="#15803D" />
    <circle cx="32" cy="32" r="28" fill={`url(#${uid}-g)`} />
    <path d="M 32 18 L 32 46 M 18 32 L 46 32" stroke="white" strokeWidth="6" strokeLinecap="round" />
  </>),

  check: ({ uid }) => (<>
    <Grad uid={uid} light="#4ADE80" dark="#15803D" />
    <circle cx="32" cy="32" r="28" fill={`url(#${uid}-g)`} />
    <path d="M 18 32 L 28 42 L 46 22" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </>),

  wallet: ({ uid }) => (<>
    <Grad uid={uid} light="#34D399" dark="#047857" />
    <rect x="4" y="14" width="56" height="40" rx="5" fill={`url(#${uid}-g)`} />
    <rect x="32" y="26" width="32" height="16" rx="3" fill="#065F46" />
    <circle cx="44" cy="34" r="4" fill={`url(#${uid}-g)`} />
    <ellipse cx="14" cy="22" rx="6" ry="3" fill="white" opacity="0.35" />
  </>),

  seedling: ({ uid }) => (<>
    <Grad uid={uid} light="#4ADE80" dark="#15803D" />
    <path d="M 32 56 L 32 32" stroke="#15803D" strokeWidth="5" strokeLinecap="round" />
    <ellipse cx="20" cy="30" rx="12" ry="7" fill={`url(#${uid}-g)`} transform="rotate(-25 20 30)" />
    <ellipse cx="44" cy="26" rx="13" ry="8" fill={`url(#${uid}-g)`} transform="rotate(25 44 26)" />
    <ellipse cx="16" cy="26" rx="4" ry="2" fill="white" opacity="0.5" transform="rotate(-25 16 26)" />
    <circle cx="32" cy="56" r="4" fill="#A16207" />
  </>),

  chart: ({ uid }) => (<>
    <Grad uid={uid} light="#FB923C" dark="#C2410C" />
    <rect x="10" y="38" width="10" height="18" rx="2" fill={`url(#${uid}-g2)`} />
    <rect x="27" y="26" width="10" height="30" rx="2" fill={`url(#${uid}-g2)`} />
    <rect x="44" y="14" width="10" height="42" rx="2" fill={`url(#${uid}-g2)`} />
    <path d="M 8 22 L 22 12 L 32 18 L 56 4" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <circle cx="56" cy="4" r="4" fill="#22C55E" />
  </>),

  person: ({ uid }) => (<>
    <Grad uid={uid} light="#60A5FA" dark="#1D4ED8" />
    <circle cx="32" cy="22" r="12" fill={`url(#${uid}-g)`} />
    <path d="M 8 58 Q 8 38 32 38 Q 56 38 56 58 Z" fill={`url(#${uid}-g)`} />
    <ellipse cx="28" cy="18" rx="3" ry="4" fill="white" opacity="0.4" />
  </>),

  diamond: ({ uid }) => (<>
    <Grad uid={uid} light="#06B6D4" dark="#0E7490" />
    <path d="M 12 22 L 32 8 L 52 22 L 32 58 Z" fill={`url(#${uid}-g)`} />
    <path d="M 12 22 L 52 22" stroke="#0E7490" strokeWidth="2" />
    <ellipse cx="22" cy="18" rx="4" ry="2" fill="white" opacity="0.5" />
  </>),

  shield: ({ uid }) => (<>
    <Grad uid={uid} light="#FBBF24" dark="#92400E" />
    <path d="M 32 4 L 54 14 L 54 30 Q 54 50 32 60 Q 10 50 10 30 L 10 14 Z" fill={`url(#${uid}-g)`} />
    <path d="M 22 32 L 30 40 L 44 24" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </>),
}

interface Icon3DProps {
  name: string
  size?: number
  className?: string
}

export default function Icon3D({ name, size = 32, className }: Icon3DProps) {
  const uid = useMemo(() => 'i' + Math.random().toString(36).slice(2, 7), [])
  const Comp = ICONS[name] ?? ICONS.coin

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      style={{ display: 'block', overflow: 'visible', flexShrink: 0 }}
      aria-hidden
    >
      <Comp uid={uid} />
    </svg>
  )
}
