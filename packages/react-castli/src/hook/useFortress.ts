import { useContext } from 'react';

import { context } from '../context';

export function useFortress() {
    const { fortress } = useContext(context);
    return fortress;
}
