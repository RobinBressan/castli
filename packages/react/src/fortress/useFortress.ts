import { useContext } from 'react';

import { context } from './context';

export function useFortress() {
    return useContext(context);
}
