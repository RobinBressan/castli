export { FirewallProps } from './Firewall';
export * from './useFirewall';

import { Firewall as _Firewall } from './Firewall';
import * as StateValues from './StateValues';

export const Firewall = Object.assign(StateValues, _Firewall);
