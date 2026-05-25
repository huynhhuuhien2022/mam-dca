'use client'

import '@/styles/sapling.css'

interface SaplingProps {
  stage?: 0 | 1 | 2 | 3 | 4
  size?: number
  animated?: boolean
  withPot?: boolean
}

/* ── Shared gradients + leaf shape ── */
const SaplingDefs = () => (
  <defs>
    <linearGradient id="msPot" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stopColor="#F2E4D4" />
      <stop offset="32%"  stopColor="#E6D2BC" />
      <stop offset="72%"  stopColor="#C9A892" />
      <stop offset="100%" stopColor="#A88670" />
    </linearGradient>
    <linearGradient id="msPotShade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stopColor="#000" stopOpacity="0" />
      <stop offset="70%"  stopColor="#000" stopOpacity="0" />
      <stop offset="100%" stopColor="#3B2418" stopOpacity="0.32" />
    </linearGradient>
    <radialGradient id="msPotInner" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0%"   stopColor="#1A0F08" />
      <stop offset="65%"  stopColor="#2A1A10" />
      <stop offset="100%" stopColor="#3B2418" />
    </radialGradient>
    <radialGradient id="msSoil" cx="0.42" cy="0.32" r="0.7">
      <stop offset="0%"   stopColor="#5A3A26" />
      <stop offset="55%"  stopColor="#3A2418" />
      <stop offset="100%" stopColor="#1F140C" />
    </radialGradient>
    <radialGradient id="msFloor" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0%"   stopColor="#000" stopOpacity="0.55" />
      <stop offset="60%"  stopColor="#000" stopOpacity="0.18" />
      <stop offset="100%" stopColor="#000" stopOpacity="0" />
    </radialGradient>
    <linearGradient id="msSeed" x1="0.2" y1="0" x2="0.8" y2="1">
      <stop offset="0%"   stopColor="#D6B98A" />
      <stop offset="50%"  stopColor="#A07F52" />
      <stop offset="100%" stopColor="#5C4327" />
    </linearGradient>
    <linearGradient id="msLeafLight" x1="0.2" y1="0" x2="0.8" y2="1">
      <stop offset="0%"   stopColor="#A7F3D0" />
      <stop offset="55%"  stopColor="#34D399" />
      <stop offset="100%" stopColor="#10B981" />
    </linearGradient>
    <radialGradient id="msCanopy" cx="0.35" cy="0.30" r="0.85">
      <stop offset="0%"   stopColor="#6EE7B7" />
      <stop offset="35%"  stopColor="#34D399" />
      <stop offset="70%"  stopColor="#10B981" />
      <stop offset="100%" stopColor="#065F46" />
    </radialGradient>
    <radialGradient id="msCanopyShade" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0%"   stopColor="#064E3B" stopOpacity="0" />
      <stop offset="65%"  stopColor="#064E3B" stopOpacity="0" />
      <stop offset="100%" stopColor="#022C22" stopOpacity="0.55" />
    </radialGradient>
    <linearGradient id="msCanopyHi" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.45" />
      <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
    </linearGradient>
    <linearGradient id="msTrunk" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stopColor="#8C6A4A" />
      <stop offset="35%"  stopColor="#6E4F33" />
      <stop offset="65%"  stopColor="#5A3F26" />
      <stop offset="100%" stopColor="#3D2918" />
    </linearGradient>
    <radialGradient id="msFruit" cx="0.35" cy="0.30" r="0.75">
      <stop offset="0%"   stopColor="#FFFBEB" />
      <stop offset="25%"  stopColor="#FDE68A" />
      <stop offset="65%"  stopColor="#FBBF24" />
      <stop offset="100%" stopColor="#B45309" />
    </radialGradient>
    <radialGradient id="msFruitGlow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0%"   stopColor="#FEF3C7" stopOpacity="0.85" />
      <stop offset="45%"  stopColor="#FBBF24" stopOpacity="0.30" />
      <stop offset="100%" stopColor="#FBBF24" stopOpacity="0" />
    </radialGradient>
    <g id="msLeafSmallShape">
      <path d="M 0,-32 C 14,-28 19,-10 12,8 C 6,16 -6,16 -12,8 C -19,-10 -14,-28 0,-32 Z" fill="url(#msLeafLight)" />
      <path d="M 0,-28 C 1,-12 -1,0 -2,12" stroke="#047857" strokeWidth="1.2" fill="none" opacity="0.4" strokeLinecap="round" />
      <path d="M -7,-24 C -12,-16 -13,-4 -9,6" stroke="#D1FAE5" strokeWidth="1.4" fill="none" opacity="0.6" strokeLinecap="round" />
    </g>
  </defs>
)

const PotSoil = () => (
  <g>
    <ellipse cx="512" cy="905" rx="220" ry="20" fill="url(#msFloor)" />
    <path d="M 332,663 C 338,762 348,855 380,878 C 405,895 470,898 512,898 C 554,898 619,895 644,878 C 676,855 686,762 692,663 Z" fill="url(#msPot)" />
    <path d="M 332,663 C 338,762 348,855 380,878 C 405,895 470,898 512,898 C 554,898 619,895 644,878 C 676,855 686,762 692,663 Z" fill="url(#msPotShade)" />
    <path d="M 343,680 C 346,760 354,840 376,866" stroke="rgba(255,255,255,0.45)" strokeWidth="4" fill="none" strokeLinecap="round" />
    <ellipse cx="512" cy="663" rx="180" ry="22" fill="url(#msPotInner)" />
    <ellipse cx="512" cy="660" rx="180" ry="22" fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth="1.5" />
    <ellipse cx="512" cy="652" rx="172" ry="18" fill="url(#msSoil)" />
  </g>
)

const StageSeed = () => (
  <g>
    <ellipse cx="512" cy="648" rx="26" ry="18" fill="url(#msSeed)" transform="rotate(-12 512 648)" />
    <ellipse cx="503" cy="642" rx="8" ry="4" fill="#FFFFFF" opacity="0.4" transform="rotate(-12 512 648)" />
  </g>
)

const StageSprout = ({ animated }: { animated: boolean }) => (
  <g>
    <path d="M 512,645 C 510,610 510,580 512,560" stroke="#10B981" strokeWidth="6" fill="none" strokeLinecap="round" />
    <g transform="translate(486 555) rotate(-55) scale(0.55)">
      <g className={animated ? 'mam-leaf mam-leaf-l' : ''}>
        <use href="#msLeafSmallShape" />
      </g>
    </g>
    <g transform="translate(538 555) rotate(55) scale(0.55)">
      <g className={animated ? 'mam-leaf mam-leaf-r' : ''}>
        <use href="#msLeafSmallShape" />
      </g>
    </g>
  </g>
)

const AnimLeaf = ({ x, y, r, sc, cls }: { x: number; y: number; r: number; sc: number; cls: string }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${sc})`}>
    <g className={cls}>
      <use href="#msLeafSmallShape" />
    </g>
  </g>
)

const StageYoung = ({ animated }: { animated: boolean }) => (
  <g>
    <path d="M 512,645 C 508,580 514,500 510,430 C 508,400 512,380 512,360" stroke="#059669" strokeWidth="7" fill="none" strokeLinecap="round" />
    <AnimLeaf x={480} y={580} r={-65} sc={0.7}  cls={animated ? 'mam-leaf mam-leaf-l-slow' : ''} />
    <AnimLeaf x={544} y={540} r={ 60} sc={0.7}  cls={animated ? 'mam-leaf mam-leaf-r-slow' : ''} />
    <AnimLeaf x={478} y={480} r={-70} sc={0.75} cls={animated ? 'mam-leaf mam-leaf-l' : ''} />
    <AnimLeaf x={548} y={450} r={ 60} sc={0.75} cls={animated ? 'mam-leaf mam-leaf-r' : ''} />
    <AnimLeaf x={512} y={350} r={-10} sc={0.85} cls={animated ? 'mam-leaf mam-leaf-l-slow' : ''} />
  </g>
)

const Canopy = () => (
  <g>
    <ellipse cx="404" cy="400" rx="98"  ry="94"  fill="url(#msCanopy)" />
    <ellipse cx="620" cy="400" rx="100" ry="96"  fill="url(#msCanopy)" />
    <ellipse cx="512" cy="310" rx="118" ry="108" fill="url(#msCanopy)" />
    <ellipse cx="450" cy="470" rx="74"  ry="64"  fill="url(#msCanopy)" />
    <ellipse cx="572" cy="470" rx="74"  ry="64"  fill="url(#msCanopy)" />
    <ellipse cx="512" cy="430" rx="92"  ry="78"  fill="url(#msCanopy)" />
    <ellipse cx="512" cy="450" rx="170" ry="115" fill="url(#msCanopyShade)" />
    <ellipse cx="476" cy="270" rx="72"  ry="26"  fill="url(#msCanopyHi)" />
  </g>
)

const Trunk = () => (
  <path d="M 492,648 C 488,560 498,490 494,440 L 530,440 C 526,490 536,560 532,648 Z" fill="url(#msTrunk)" />
)

const StageMature = ({ animated }: { animated: boolean }) => (
  <g>
    <Trunk />
    <g className={animated ? 'mam-canopy' : ''}>
      <Canopy />
    </g>
  </g>
)

const Fruit = ({ cx, cy, r, glow, animated, delay }: {
  cx: number; cy: number; r: number; glow: number
  animated: boolean; delay: string
}) => (
  <g>
    <circle cx={cx} cy={cy} r={glow} fill="url(#msFruitGlow)"
      className={animated ? 'mam-fruit' : ''}
      style={animated ? { animationDelay: delay } : undefined} />
    <circle cx={cx} cy={cy} r={r} fill="url(#msFruit)" />
    <circle cx={cx - 4} cy={cy - 5} r={r * 0.27} fill="#FFFBEB" opacity="0.85" />
  </g>
)

const StageFruit = ({ animated }: { animated: boolean }) => (
  <g>
    <Trunk />
    <g className={animated ? 'mam-canopy' : ''}>
      <Canopy />
    </g>
    <Fruit cx={418} cy={420} r={22} glow={40} animated={animated} delay="0s"   />
    <Fruit cx={610} cy={370} r={22} glow={40} animated={animated} delay="0.4s" />
    <Fruit cx={540} cy={490} r={22} glow={38} animated={animated} delay="0.8s" />
    <Fruit cx={478} cy={350} r={18} glow={34} animated={animated} delay="1.2s" />
    <Fruit cx={572} cy={440} r={18} glow={34} animated={animated} delay="1.6s" />
  </g>
)

const WindLeaf = () => (
  <svg viewBox="-22 -36 44 52">
    <path d="M 0,-32 C 14,-28 19,-10 12,8 C 6,16 -6,16 -12,8 C -19,-10 -14,-28 0,-32 Z" fill="#34D399" opacity="0.9" />
    <path d="M 0,-28 C 1,-12 -1,0 -2,12" stroke="#047857" strokeWidth="1.2" fill="none" opacity="0.4" strokeLinecap="round" />
  </svg>
)

const WindOverlay = () => (
  <div className="mam-wind absolute inset-0 pointer-events-none overflow-visible" aria-hidden>
    <span className="mam-wind-leaf mam-wind-1 absolute" style={{ top: '26%', width: '14%', height: '14%', opacity: 0 }}><WindLeaf /></span>
    <span className="mam-wind-leaf mam-wind-2 absolute" style={{ top: '48%', width: '14%', height: '14%', opacity: 0 }}><WindLeaf /></span>
    <span className="mam-wind-leaf mam-wind-3 absolute" style={{ top: '16%', width: '14%', height: '14%', opacity: 0 }}><WindLeaf /></span>
    <svg className="mam-whoosh absolute" style={{ left: '-10%', top: '30%', width: '80%', height: '22%', opacity: 0 }} viewBox="0 0 200 60">
      <path d="M 0,30 Q 60,10 110,28 T 200,32" stroke="#A7F3D0" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.85" />
      <path d="M 10,42 Q 70,28 120,40 T 195,42" stroke="#86EFAC" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6" />
    </svg>
  </div>
)

export default function Sapling({ stage = 2, size = 140, animated = true, withPot = true }: SaplingProps) {
  const s = Math.max(0, Math.min(4, stage)) as 0 | 1 | 2 | 3 | 4
  const showWind = animated && size >= 96

  return (
    <div
      className={`inline-block relative ${animated ? 'mam-sap-anim' : ''}`}
      style={{ width: size, height: size, verticalAlign: 'top', transformOrigin: 'center bottom' }}
    >
      <svg viewBox="0 0 1024 1024" width={size} height={size} style={{ overflow: 'visible' }}>
        <SaplingDefs />
        {withPot && <PotSoil />}
        <g className={animated ? (s <= 1 ? 'mam-tree-sway' : 'mam-tree-sway-slow') : ''}>
          {s === 0 && <StageSeed />}
          {s === 1 && <StageSprout animated={animated} />}
          {s === 2 && <StageYoung  animated={animated} />}
          {s === 3 && <StageMature animated={animated} />}
          {s === 4 && <StageFruit  animated={animated} />}
        </g>
      </svg>
      {showWind && <WindOverlay />}
    </div>
  )
}
