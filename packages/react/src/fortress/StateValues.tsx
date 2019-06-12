import { FortressStateValue } from '@castli/core';
import { createStateValueComponent } from '../createStateValueComponent';
import { context, FortressReactContext } from './context';

const factory = (stateValue: FortressStateValue) =>
    createStateValueComponent<FortressStateValue, FortressReactContext>(context, stateValue);

export const Authenticated = factory('authenticated');
export const Challenging = factory('challenging');
export const Idle = factory('idle');
export const Unauthenticated = factory('unauthenticated');
