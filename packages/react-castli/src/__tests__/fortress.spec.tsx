import * as rtl from '@testing-library/react';
import { Fortress as FortressClass } from 'castli-core';
import { createTestProxy } from 'castli-test-tools';
import * as React from 'react';

import { Fortress, FortressState } from '../';

describe('<Fortress />', () => {
    it('should work', async () => {
        expect.assertions(5);

        const proxy = createTestProxy({
            challenge: {
                token: 'abc123',
            },
        });

        const guard = jest.fn().mockReturnValue(true);
        const onReady = jest.fn();

        const { getByText } = rtl.render(
            <Fortress proxy={proxy} guard={guard} onReady={onReady}>
                <FortressState.Idle>I am Idle</FortressState.Idle>
                <FortressState.Unauthenticated>I am Unauthenticated</FortressState.Unauthenticated>
            </Fortress>,
        );

        expect(getByText('I am Idle')).toBeInTheDocument();
        expect(() => getByText('I am Unauthenticated')).toThrowError(
            'Unable to find an element with the text: I am Unauthenticated',
        );
        expect(onReady).toHaveBeenCalledTimes(1);

        const fortress = onReady.mock.calls[0][0] as FortressClass;
        rtl.act(() => {
            fortress.deauthenticate();
        });

        await rtl.wait(() => getByText('I am Unauthenticated'));

        expect(getByText('I am Unauthenticated')).toBeInTheDocument();
        expect(() => getByText('I am Idle')).toThrowError(
            'Unable to find an element with the text: I am Idle',
        );
    });
});
