import { useMemo } from 'react'

interface IconProps { uid: string }

/* ── Gradient helper ── */
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

  bell: ({ uid }) => (<>
    <Grad uid={uid} light="#FB923C" dark="#9A3412" />
    <path d="M 32 6 Q 20 6 16 22 L 16 38 L 8 48 L 56 48 L 48 38 L 48 22 Q 44 6 32 6 Z" fill={`url(#${uid}-g)`} />
    <circle cx="32" cy="6" r="4" fill={`url(#${uid}-g)`} />
    <path d="M 26 52 Q 32 60 38 52" stroke={`url(#${uid}-g)`} strokeWidth="5" fill="none" strokeLinecap="round" />
    <ellipse cx="24" cy="20" rx="4" ry="6" fill="white" opacity="0.35" />
  </>),

  calc: ({ uid }) => (<>
    <Grad uid={uid} light="#A78BFA" dark="#6D28D9" />
    <rect x="10" y="6" width="44" height="52" rx="6" fill={`url(#${uid}-g)`} />
    <rect x="14" y="10" width="36" height="14" rx="3" fill="#1E1B4B" />
    <text x="46" y="22" textAnchor="end" fontSize="11" fontWeight="900" fill="#86EFAC" fontFamily="monospace">2.5M</text>
    <rect x="14" y="28" width="8" height="5" rx="1.5" fill="white" opacity="0.9" /><rect x="24" y="28" width="8" height="5" rx="1.5" fill="white" opacity="0.9" /><rect x="34" y="28" width="8" height="5" rx="1.5" fill="white" opacity="0.9" /><rect x="44" y="28" width="8" height="5" rx="1.5" fill="white" opacity="0.9" />
    <rect x="14" y="35" width="8" height="5" rx="1.5" fill="white" opacity="0.9" /><rect x="24" y="35" width="8" height="5" rx="1.5" fill="white" opacity="0.9" /><rect x="34" y="35" width="8" height="5" rx="1.5" fill="white" opacity="0.9" /><rect x="44" y="35" width="8" height="5" rx="1.5" fill="white" opacity="0.9" />
    <rect x="14" y="42" width="8" height="5" rx="1.5" fill="white" opacity="0.9" /><rect x="24" y="42" width="8" height="5" rx="1.5" fill="white" opacity="0.9" /><rect x="34" y="42" width="8" height="5" rx="1.5" fill="white" opacity="0.9" /><rect x="44" y="42" width="8" height="5" rx="1.5" fill="white" opacity="0.9" />
    <rect x="14" y="49" width="8" height="5" rx="1.5" fill="white" opacity="0.9" /><rect x="24" y="49" width="8" height="5" rx="1.5" fill="white" opacity="0.9" /><rect x="34" y="49" width="8" height="5" rx="1.5" fill="white" opacity="0.9" /><rect x="44" y="49" width="8" height="5" rx="1.5" fill="#22C55E" />
  </>),

  calendar: ({ uid }) => (<>
    <Grad uid={uid} light="#F472B6" dark="#9D174D" />
    <rect x="6" y="12" width="52" height="48" rx="5" fill={`url(#${uid}-g)`} />
    <rect x="6" y="12" width="52" height="14" rx="5" fill="#9D174D" />
    <rect x="6" y="20" width="52" height="6" fill="#9D174D" />
    <rect x="16" y="4" width="4" height="14" rx="2" fill="#9D174D" />
    <rect x="44" y="4" width="4" height="14" rx="2" fill="#9D174D" />
    <g fill="white">
      <circle cx="18" cy="36" r="2.5" />
      <circle cx="32" cy="36" r="2.5" />
      <circle cx="46" cy="36" r="2.5" />
      <circle cx="18" cy="48" r="2.5" />
    </g>
    <circle cx="32" cy="48" r="4" fill="#FACC15" />
  </>),

  chart: ({ uid }) => (<>
    <Grad uid={uid} light="#FB923C" dark="#C2410C" />
    <rect x="10" y="38" width="10" height="18" rx="2" fill={`url(#${uid}-g2)`} />
    <rect x="27" y="26" width="10" height="30" rx="2" fill={`url(#${uid}-g2)`} />
    <rect x="44" y="14" width="10" height="42" rx="2" fill={`url(#${uid}-g2)`} />
    <path d="M 8 22 L 22 12 L 32 18 L 56 4" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <circle cx="56" cy="4" r="4" fill="#22C55E" />
  </>),

  check: ({ uid }) => (<>
    <Grad uid={uid} light="#4ADE80" dark="#15803D" />
    <circle cx="32" cy="32" r="28" fill={`url(#${uid}-g)`} />
    <path d="M 18 32 L 28 42 L 46 22" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </>),

  coin: ({ uid }) => (<>
    <Grad uid={uid} light="#FACC15" dark="#A16207" />
    <ellipse cx="32" cy="36" rx="24" ry="22" fill="#A16207" />
    <ellipse cx="32" cy="32" rx="24" ry="22" fill={`url(#${uid}-g)`} />
    <ellipse cx="32" cy="32" rx="18" ry="16" fill="none" stroke="#A16207" strokeWidth="1.5" opacity="0.4" />
    <text x="32" y="40" textAnchor="middle" fontSize="22" fontWeight="900" fill="#78350F" fontFamily="Nunito, sans-serif">₫</text>
    <ellipse cx="22" cy="22" rx="6" ry="4" fill="white" opacity="0.45" />
  </>),

  compass: ({ uid }) => (<>
    <Grad uid={uid} light="#38BDF8" dark="#0369A1" />
    <circle cx="26" cy="26" r="16" fill="white" stroke={`url(#${uid}-g)`} strokeWidth="5" />
    <circle cx="26" cy="26" r="13" fill={`url(#${uid}-g)`} opacity="0.15" />
    <path d="M 26 18 L 28 24 L 34 26 L 28 28 L 26 34 L 24 28 L 18 26 L 24 24 Z" fill={`url(#${uid}-g)`} />
    <path d="M 18 22 Q 18 16 24 16" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7" />
    <rect x="38" y="38" width="20" height="8" rx="4" fill={`url(#${uid}-g)`} transform="rotate(45 38 38)" />
  </>),

  diamond: ({ uid }) => (<>
    <Grad uid={uid} light="#06B6D4" dark="#0E7490" />
    <path d="M 12 22 L 32 8 L 52 22 L 32 58 Z" fill={`url(#${uid}-g)`} />
    <path d="M 12 22 L 52 22" stroke="#0E7490" strokeWidth="2" />
    <path d="M 22 22 L 32 8 L 42 22 L 32 58" stroke="#0E7490" strokeWidth="1.5" fill="none" opacity="0.5" />
    <ellipse cx="22" cy="18" rx="4" ry="2" fill="white" opacity="0.5" />
  </>),

  fire: ({ uid }) => (<>
    <Grad uid={uid} light="#FB923C" dark="#DC2626" />
    <path d="M 32 4 Q 22 14 26 26 Q 18 22 14 32 Q 10 48 24 58 Q 32 62 40 58 Q 54 48 50 32 Q 46 24 38 28 Q 44 14 32 4 Z" fill={`url(#${uid}-g)`} />
    <path d="M 32 28 Q 24 36 28 48 Q 32 54 38 48 Q 42 36 32 28 Z" fill="#FEF08A" />
    <ellipse cx="33" cy="44" rx="2" ry="3" fill="white" />
  </>),

  forest: () => (<>
    <g shapeRendering="crispEdges">
      <circle cx="32" cy="32" r="28" fill="#DBEAFE" />
      <rect x="44" y="10" width="8" height="8" fill="#FBBF24" />
      <rect x="46" y="12" width="4" height="4" fill="#FEF08A" />
      <rect x="44" y="8" width="8" height="2" fill="#F59E0B" opacity="0.6" />
      <rect x="34" y="16" width="12" height="4" fill="#86EFAC" />
      <rect x="32" y="20" width="16" height="4" fill="#4ADE80" />
      <rect x="32" y="24" width="16" height="4" fill="#16A34A" />
      <rect x="38" y="28" width="4" height="14" fill="#A16207" />
      <rect x="10" y="28" width="12" height="4" fill="#86EFAC" />
      <rect x="8" y="32" width="16" height="4" fill="#4ADE80" />
      <rect x="14" y="36" width="4" height="8" fill="#A16207" />
      <rect x="22" y="20" width="12" height="4" fill="#86EFAC" />
      <rect x="20" y="24" width="16" height="4" fill="#4ADE80" />
      <rect x="20" y="28" width="16" height="4" fill="#16A34A" />
      <rect x="24" y="32" width="8" height="10" fill="#A16207" />
      <rect x="24" y="32" width="2" height="10" fill="#D6A77A" />
      <rect x="6" y="44" width="52" height="4" fill="#92400E" />
      <rect x="6" y="48" width="52" height="2" fill="#78350F" />
      <rect x="4" y="40" width="3" height="3" fill="#F472B6" />
      <rect x="50" y="40" width="3" height="3" fill="#FBBF24" />
      <rect x="26" y="42" width="2" height="2" fill="#EC4899" />
      <rect x="40" y="22" width="3" height="2" fill="#1D4ED8" />
      <rect x="42" y="21" width="2" height="3" fill="#2563EB" />
    </g>
  </>),

  gear: ({ uid }) => (<>
    <Grad uid={uid} light="#94A3B8" dark="#334155" />
    <path d="M 32 4 L 36 6 L 36 14 Q 39 15 41 17 L 47 13 L 51 17 L 47 23 Q 49 25 50 28 L 58 28 L 60 32 L 58 36 L 50 36 Q 49 39 47 41 L 51 47 L 47 51 L 41 47 Q 39 49 36 50 L 36 58 L 32 60 L 28 58 L 28 50 Q 25 49 23 47 L 17 51 L 13 47 L 17 41 Q 15 39 14 36 L 6 36 L 4 32 L 6 28 L 14 28 Q 15 25 17 23 L 13 17 L 17 13 L 23 17 Q 25 15 28 14 L 28 6 Z" fill={`url(#${uid}-g)`} />
    <circle cx="32" cy="32" r="10" fill="white" />
    <circle cx="32" cy="32" r="5" fill="#334155" />
  </>),

  growth: ({ uid }) => (<>
    <Grad uid={uid} light="#4ADE80" dark="#15803D" />
    <path d="M 8 52 L 24 32 L 36 40 L 56 12" stroke={`url(#${uid}-g)`} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M 44 12 L 56 12 L 56 24" stroke={`url(#${uid}-g)`} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
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

  home: ({ uid }) => (<>
    <Grad uid={uid} light="#4ADE80" dark="#15803D" />
    <path d="M 32 8 L 56 28 L 56 52 Q 56 56 52 56 L 40 56 L 40 40 Q 40 36 36 36 L 28 36 Q 24 36 24 40 L 24 56 L 12 56 Q 8 56 8 52 L 8 28 Z" fill={`url(#${uid}-g)`} stroke="#15803D" strokeWidth="2" strokeLinejoin="round" />
    <circle cx="22" cy="20" r="2" fill="white" opacity="0.4" />
  </>),

  person: ({ uid }) => (<>
    <Grad uid={uid} light="#60A5FA" dark="#1D4ED8" />
    <circle cx="32" cy="22" r="12" fill={`url(#${uid}-g)`} />
    <path d="M 8 58 Q 8 38 32 38 Q 56 38 56 58 Z" fill={`url(#${uid}-g)`} />
    <ellipse cx="28" cy="18" rx="3" ry="4" fill="white" opacity="0.4" />
  </>),

  plus: ({ uid }) => (<>
    <Grad uid={uid} light="#4ADE80" dark="#15803D" />
    <circle cx="32" cy="32" r="28" fill={`url(#${uid}-g)`} />
    <path d="M 32 18 L 32 46 M 18 32 L 46 32" stroke="white" strokeWidth="6" strokeLinecap="round" />
  </>),

  seedling: ({ uid }) => (<>
    <Grad uid={uid} light="#4ADE80" dark="#15803D" />
    <path d="M 32 56 L 32 32" stroke="#15803D" strokeWidth="5" strokeLinecap="round" />
    <ellipse cx="20" cy="30" rx="12" ry="7" fill={`url(#${uid}-g)`} transform="rotate(-25 20 30)" />
    <ellipse cx="44" cy="26" rx="13" ry="8" fill={`url(#${uid}-g)`} transform="rotate(25 44 26)" />
    <ellipse cx="16" cy="26" rx="4" ry="2" fill="white" opacity="0.5" transform="rotate(-25 16 26)" />
    <circle cx="32" cy="56" r="4" fill="#A16207" />
  </>),

  shield: ({ uid }) => (<>
    <Grad uid={uid} light="#FBBF24" dark="#92400E" />
    <path d="M 32 4 L 54 14 L 54 30 Q 54 50 32 60 Q 10 50 10 30 L 10 14 Z" fill={`url(#${uid}-g)`} />
    <path d="M 22 32 L 30 40 L 44 24" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </>),

  sparkle: ({ uid }) => (<>
    <Grad uid={uid} light="#FACC15" dark="#C084FC" />
    <path d="M 32 6 Q 34 22 38 26 Q 42 30 58 32 Q 42 34 38 38 Q 34 42 32 58 Q 30 42 26 38 Q 22 34 6 32 Q 22 30 26 26 Q 30 22 32 6 Z" fill={`url(#${uid}-g)`} />
    <path d="M 50 12 Q 51 17 52 18 Q 53 19 58 20 Q 53 21 52 22 Q 51 23 50 28 Q 49 23 48 22 Q 47 21 42 20 Q 47 19 48 18 Q 49 17 50 12 Z" fill="#C084FC" />
    <path d="M 14 44 Q 14.7 47 15.5 47.5 Q 16.3 48 19 48.5 Q 16.3 49 15.5 49.5 Q 14.7 50 14 53 Q 13.3 50 12.5 49.5 Q 11.7 49 9 48.5 Q 11.7 48 12.5 47.5 Q 13.3 47 14 44 Z" fill="#F472B6" />
    <circle cx="28" cy="26" r="3" fill="white" opacity="0.6" />
  </>),

  treeSeed: ({ uid }) => (<>
    <defs>
      <radialGradient id={`${uid}-seedBg`} cx="0.5" cy="0.4" r="0.6">
        <stop offset="0" stopColor="#FEF9C3" /><stop offset="1" stopColor="#FDE68A" />
      </radialGradient>
      <radialGradient id={`${uid}-seed`} cx="0.35" cy="0.3" r="0.8">
        <stop offset="0" stopColor="#FCD34D" /><stop offset="0.5" stopColor="#D97706" /><stop offset="1" stopColor="#78350F" />
      </radialGradient>
      <linearGradient id={`${uid}-soil`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#A16207" /><stop offset="1" stopColor="#5B2F0F" />
      </linearGradient>
    </defs>
    <circle cx="32" cy="32" r="28" fill={`url(#${uid}-seedBg)`} />
    <path d="M 12 44 Q 12 40 16 40 L 48 40 Q 52 40 52 44 L 52 52 Q 52 56 48 56 L 16 56 Q 12 56 12 52 Z" fill={`url(#${uid}-soil)`} />
    <ellipse cx="32" cy="40" rx="20" ry="3" fill="#5B2F0F" />
    <ellipse cx="32" cy="34" rx="8" ry="11" fill={`url(#${uid}-seed)`} />
    <ellipse cx="28" cy="30" rx="3" ry="4" fill="white" opacity="0.5" />
    <path d="M 32 24 Q 30 28 32 32 Q 34 28 32 24" fill="#FEF08A" />
    <circle cx="14" cy="18" r="2" fill="#FACC15" />
    <circle cx="48" cy="22" r="2" fill="#FBBF24" />
    <circle cx="50" cy="14" r="1.5" fill="#FEF08A" />
  </>),

  treeSprout: () => (<>
    <g shapeRendering="crispEdges">
      <circle cx="32" cy="32" r="28" fill="#DCFCE7" />
      <rect x="20" y="24" width="8" height="4" fill="#86EFAC" />
      <rect x="16" y="28" width="12" height="4" fill="#4ADE80" />
      <rect x="36" y="22" width="8" height="4" fill="#86EFAC" />
      <rect x="36" y="26" width="12" height="4" fill="#4ADE80" />
      <rect x="30" y="28" width="4" height="20" fill="#16A34A" />
      <rect x="14" y="48" width="36" height="4" fill="#92400E" />
      <rect x="14" y="14" width="3" height="3" fill="#FACC15" />
      <rect x="48" y="36" width="3" height="3" fill="#86EFAC" />
      <rect x="50" y="18" width="2" height="2" fill="#BBF7D0" />
    </g>
  </>),

  treeSapling: () => (<>
    <g shapeRendering="crispEdges">
      <circle cx="32" cy="32" r="28" fill="#D1FAE5" />
      <rect x="24" y="12" width="16" height="4" fill="#86EFAC" />
      <rect x="20" y="16" width="24" height="4" fill="#4ADE80" />
      <rect x="16" y="20" width="32" height="4" fill="#4ADE80" />
      <rect x="16" y="24" width="32" height="4" fill="#16A34A" />
      <rect x="20" y="28" width="24" height="4" fill="#16A34A" />
      <rect x="22" y="18" width="4" height="2" fill="#DCFCE7" />
      <rect x="28" y="32" width="8" height="16" fill="#A16207" />
      <rect x="28" y="32" width="2" height="16" fill="#D6A77A" />
      <rect x="34" y="32" width="2" height="16" fill="#78350F" />
      <rect x="14" y="48" width="36" height="4" fill="#92400E" />
      <rect x="46" y="42" width="3" height="3" fill="#F472B6" />
      <rect x="48" y="40" width="2" height="2" fill="#FBBF24" />
      <rect x="14" y="16" width="3" height="3" fill="#FBBF24" />
    </g>
  </>),

  treeFruit: () => (<>
    <g shapeRendering="crispEdges">
      <circle cx="32" cy="32" r="28" fill="#FED7AA" />
      <rect x="20" y="8" width="24" height="4" fill="#86EFAC" />
      <rect x="16" y="12" width="32" height="4" fill="#4ADE80" />
      <rect x="12" y="16" width="40" height="4" fill="#22C55E" />
      <rect x="12" y="20" width="40" height="4" fill="#22C55E" />
      <rect x="16" y="24" width="32" height="4" fill="#16A34A" />
      <rect x="20" y="28" width="24" height="4" fill="#15803D" />
      <rect x="18" y="14" width="4" height="4" fill="#DC2626" /><rect x="18" y="14" width="2" height="2" fill="#F87171" />
      <rect x="42" y="16" width="4" height="4" fill="#F59E0B" /><rect x="42" y="16" width="2" height="2" fill="#FCD34D" />
      <rect x="30" y="10" width="4" height="4" fill="#DC2626" /><rect x="30" y="10" width="2" height="2" fill="#F87171" />
      <rect x="36" y="22" width="4" height="4" fill="#F59E0B" /><rect x="36" y="22" width="2" height="2" fill="#FCD34D" />
      <rect x="22" y="22" width="4" height="4" fill="#DC2626" /><rect x="22" y="22" width="2" height="2" fill="#F87171" />
      <rect x="26" y="32" width="12" height="16" fill="#A16207" />
      <rect x="26" y="32" width="3" height="16" fill="#D6A77A" />
      <rect x="35" y="32" width="3" height="16" fill="#78350F" />
      <rect x="30" y="36" width="4" height="2" fill="#78350F" />
      <rect x="30" y="42" width="4" height="2" fill="#78350F" />
      <rect x="12" y="48" width="40" height="4" fill="#92400E" />
      <rect x="46" y="40" width="4" height="4" fill="#F59E0B" /><rect x="46" y="40" width="2" height="2" fill="#FCD34D" />
      <rect x="10" y="18" width="3" height="3" fill="#FBBF24" />
      <rect x="48" y="10" width="3" height="3" fill="#FEF08A" />
    </g>
  </>),

  treeMature: () => (<>
    <g shapeRendering="crispEdges">
      <circle cx="32" cy="32" r="28" fill="#BBF7D0" />
      <rect x="20" y="8" width="24" height="4" fill="#86EFAC" />
      <rect x="16" y="12" width="32" height="4" fill="#4ADE80" />
      <rect x="12" y="16" width="40" height="4" fill="#4ADE80" />
      <rect x="12" y="20" width="40" height="4" fill="#16A34A" />
      <rect x="16" y="24" width="32" height="4" fill="#16A34A" />
      <rect x="20" y="28" width="24" height="4" fill="#15803D" />
      <rect x="18" y="14" width="6" height="2" fill="#DCFCE7" />
      <rect x="40" y="12" width="4" height="2" fill="#DCFCE7" />
      <rect x="26" y="32" width="12" height="16" fill="#A16207" />
      <rect x="26" y="32" width="3" height="16" fill="#D6A77A" />
      <rect x="35" y="32" width="3" height="16" fill="#78350F" />
      <rect x="30" y="36" width="4" height="2" fill="#78350F" />
      <rect x="30" y="42" width="4" height="2" fill="#78350F" />
      <rect x="12" y="48" width="40" height="4" fill="#92400E" />
      <rect x="44" y="32" width="3" height="3" fill="#F472B6" />
      <rect x="47" y="34" width="3" height="3" fill="#C084FC" />
      <rect x="46" y="33" width="2" height="2" fill="#FBBF24" />
      <rect x="14" y="12" width="3" height="3" fill="#FACC15" />
    </g>
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

  wallet: ({ uid }) => (<>
    <Grad uid={uid} light="#34D399" dark="#047857" />
    <rect x="4" y="14" width="56" height="40" rx="5" fill={`url(#${uid}-g)`} />
    <rect x="32" y="26" width="32" height="16" rx="3" fill="#065F46" />
    <circle cx="44" cy="34" r="4" fill={`url(#${uid}-g)`} />
    <ellipse cx="14" cy="22" rx="6" ry="3" fill="white" opacity="0.35" />
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
