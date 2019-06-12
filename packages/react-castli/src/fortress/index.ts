export { FortressProps } from './Fortress';
export * from './useFortress';

import { Fortress as _Fortress } from './Fortress';
import * as StateValues from './StateValues';

export const Fortress = Object.assign(StateValues, _Fortress);
