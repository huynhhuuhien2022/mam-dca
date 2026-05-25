import bell      from './images/bell.svg'
import calc      from './images/calc.svg'
import calendar  from './images/calendar.svg'
import chart     from './images/chart.svg'
import check     from './images/check.svg'
import coin      from './images/coin.svg'
import compass   from './images/compass.svg'
import diamond   from './images/diamond.svg'
import fire      from './images/fire.svg'
import forest    from './images/forest.svg'
import gear      from './images/gear.svg'
import growth    from './images/growth.svg'
import history   from './images/history.svg'
import home      from './images/home.svg'
import person    from './images/person.svg'
import plus      from './images/plus.svg'
import seedling  from './images/seedling.svg'
import shield    from './images/shield.svg'
import sparkle   from './images/sparkle.svg'
import treeFruit   from './images/treeFruit.svg'
import treeMature  from './images/treeMature.svg'
import treeSapling from './images/treeSapling.svg'
import treeSeed    from './images/treeSeed.svg'
import treeSprout  from './images/treeSprout.svg'
import trophy    from './images/trophy.svg'
import wallet    from './images/wallet.svg'

export const icons = {
  bell,
  calc,
  calendar,
  chart,
  check,
  coin,
  compass,
  diamond,
  fire,
  forest,
  gear,
  growth,
  history,
  home,
  person,
  plus,
  seedling,
  shield,
  sparkle,
  treeFruit,
  treeMature,
  treeSapling,
  treeSeed,
  treeSprout,
  trophy,
  wallet,
} as const

export type IconName = keyof typeof icons
