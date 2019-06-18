import { FirewallStateValue } from '@castli/core';
import { createStateValueComponent } from '../createStateValueComponent';
import { context, FirewallReactContext } from './context';

const factory = (stateValue: FirewallStateValue) =>
    createStateValueComponent<FirewallStateValue, Record<string, any>, FirewallReactContext>(
        context,
        stateValue,
    );

export const Authorizing = factory('authorizing');
export const Denied = factory('denied');
export const Granted = factory('granted');
export const Idle = factory('idle');
export const Unauthenticated = factory('unauthenticated');
