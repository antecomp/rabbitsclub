import head1 from '../assets/avatars/bases/1.png';
import head2 from '../assets/avatars/bases/2.png';
import head3 from '../assets/avatars/bases/3.png';
import head4 from '../assets/avatars/bases/4.png';
import head5 from '../assets/avatars/bases/5.png';
import head6 from '../assets/avatars/bases/6.png';
import head7 from '../assets/avatars/bases/7.png';

import Bead from '../assets/avatars/eyes/bead.png';
import Circle from '../assets/avatars/eyes/circle.png';
import Cross from '../assets/avatars/eyes/cross.png';
import Dash from '../assets/avatars/eyes/dash.png';
import Diamond from '../assets/avatars/eyes/diamond.png';
import Glee from '../assets/avatars/eyes/glee.png';
import Square from '../assets/avatars/eyes/square.png';
import Gleam from '@/assets/avatars/eyes/gleam.png';
import Shock from '@/assets/avatars/eyes/shockalt.png';

import WedgeLeft from '../assets/avatars/eyes/wedge left.png';
import WedgeRight from '../assets/avatars/eyes/wedge right.png';
import LazyLeft from '../assets/avatars/eyes/lazy left.png';
import LazyRight from '../assets/avatars/eyes/lazy right.png';
import CurlLeft from '../assets/avatars/eyes/curl left.png';
import CurlRight from '../assets/avatars/eyes/curl right.png';
import ClenchLeft from '@/assets/avatars/eyes/clench left.png';
import ClenchRight from '@/assets/avatars/eyes/clench right.png';
import Bow from '../assets/avatars/accessories/bow.png';
import Glasses from '../assets/avatars/accessories/glasses.png';
import Sunglasses from '../assets/avatars/accessories/sunglasses.png';
import TopHat from '../assets/avatars/accessories/tophat.png';

const DEFAULT_EYE_OFFSET = { x: 80, y: 100 };


export const eyes = {
  bead:    { src: Bead,                     defaultOffset: DEFAULT_EYE_OFFSET },
  circle:  { src: Circle,                   defaultOffset: DEFAULT_EYE_OFFSET },
  cross:   { src: Cross,                    defaultOffset: DEFAULT_EYE_OFFSET },
  dash:    { src: Dash,                     defaultOffset: DEFAULT_EYE_OFFSET },
  diamond: { src: Diamond,                  defaultOffset: DEFAULT_EYE_OFFSET },
  glee:    { src: Glee,                     defaultOffset: DEFAULT_EYE_OFFSET },
  square:  { src: Square,                   defaultOffset: DEFAULT_EYE_OFFSET },
  gleam:   { src: Gleam,                    defaultOffset: DEFAULT_EYE_OFFSET },
  shock:   {src: Shock,                     defaultOffset: DEFAULT_EYE_OFFSET },
  wedge:   { src: [WedgeLeft, WedgeRight],  defaultOffset: DEFAULT_EYE_OFFSET },
  lazy:    { src: [LazyLeft,  LazyRight],   defaultOffset: DEFAULT_EYE_OFFSET },
  curl:    { src: [CurlLeft,  CurlRight],   defaultOffset: DEFAULT_EYE_OFFSET },
  clench:  { src: [ClenchLeft, ClenchRight], defaultOffset: DEFAULT_EYE_OFFSET },
} satisfies Record<string, { src: string | [string, string]; defaultOffset: { x: number; y: number } }>;

export const accessories = {
  bow: { src: Bow },
  glasses: { src: Glasses },
  sunglasses: { src: Sunglasses },
  tophat: { src: TopHat },
} satisfies Record<string, { src: string }>;

export type EyeVariant = keyof typeof eyes;
export type AccessoryVariant = keyof typeof accessories;
export type EyeImageEntry = HTMLImageElement | [HTMLImageElement, HTMLImageElement];

export const eyeVariants = Object.keys(eyes) as EyeVariant[];
export const accessoryVariants = Object.keys(accessories) as AccessoryVariant[];

/**
 * Narrows arbitrary strings to supported eye asset keys.
 */
export function isEyeVariant(variant: string): variant is EyeVariant {
  return variant in eyes;
}

/**
 * Narrows arbitrary strings to supported accessory asset keys.
 */
export function isAccessoryVariant(variant: string): variant is AccessoryVariant {
  return variant in accessories;
}

export const heads = [
    head1, head2, head3, head4, head5, head6, head7
];

/**
 * Coerces persisted or user-provided head indexes into the available asset range.
 */
export function clampedHeadVariant(variant: number) {
  if(variant < 0) {
    return 0;
  }
  if(variant >= heads.length) {
    return heads.length - 1;
  }
  return variant;
}
