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

import WedgeLeft from '../assets/avatars/eyes/wedge left.png';
import WedgeRight from '../assets/avatars/eyes/wedge right.png';
import LazyLeft from '../assets/avatars/eyes/lazy left.png';
import LazyRight from '../assets/avatars/eyes/lazy right.png';
import CurlLeft from '../assets/avatars/eyes/curl left.png';
import CurlRight from '../assets/avatars/eyes/curl right.png';

const DEFAULT_EYE_OFFSET = { x: 70, y: 80 };


export const eyes = {
  bead:    { src: Bead,                     defaultOffset: DEFAULT_EYE_OFFSET },
  circle:  { src: Circle,                   defaultOffset: DEFAULT_EYE_OFFSET },
  cross:   { src: Cross,                    defaultOffset: DEFAULT_EYE_OFFSET },
  dash:    { src: Dash,                     defaultOffset: DEFAULT_EYE_OFFSET },
  diamond: { src: Diamond,                  defaultOffset: DEFAULT_EYE_OFFSET },
  glee:    { src: Glee,                     defaultOffset: DEFAULT_EYE_OFFSET },
  square:  { src: Square,                   defaultOffset: DEFAULT_EYE_OFFSET },
  wedge:   { src: [WedgeLeft, WedgeRight],  defaultOffset: DEFAULT_EYE_OFFSET },
  lazy:    { src: [LazyLeft,  LazyRight],   defaultOffset: DEFAULT_EYE_OFFSET },
  curl:    { src: [CurlLeft,  CurlRight],   defaultOffset: DEFAULT_EYE_OFFSET },
} satisfies Record<string, { src: string | [string, string]; defaultOffset: { x: number; y: number } }>;

export type EyeVariant = keyof typeof eyes;
export const eyeVariants = Object.keys(eyes) as EyeVariant[];
export type EyeImageEntry = HTMLImageElement | [HTMLImageElement, HTMLImageElement];

export const heads = [
    head1, head2, head3, head4, head5, head6, head7
];