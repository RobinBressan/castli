import { capitalize } from 'lodash';

export function createFormatter<StateValue>(prefix: string) {
    return (value: StateValue) => `${prefix}.${capitalize(value)}`;
}
