export { FortressProps } from './Fortress';
export * from './useFortress';
export * from './Strategy';

import { Fortress as _Fortress } from './Fortress';
import * as StateValues from './StateValues';
export const Fortress = Object.assign(_Fortress, StateValues);
