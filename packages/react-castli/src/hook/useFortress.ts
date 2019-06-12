import { useContext, useEffect, useState } from 'react';

import { AuthenticationContext, AuthenticationStateValues } from 'castli-core';
import { context as reactContext } from '../context';

export function useFortress() {
    const { fortress } = useContext(reactContext);
    const [value, setValue] = useState<AuthenticationStateValues>('idle');
    const [context, setContext] = useState<AuthenticationContext>({
        challenges: [],
    });

    useEffect(() => {
        const subscription = fortress.subscribe(e => {
            const [state] = e;
            setValue(state.value as AuthenticationStateValues);
            setContext(state.context);
        });

        return () => subscription.unsubscribe();
    }, [fortress]);
    return { context, value, fortress };
}
