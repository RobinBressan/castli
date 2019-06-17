import { Fortress as FortressClass, FortressStateValue } from '@castli/core';
import { TestStrategy } from '@castli/test-utils';
import * as rtl from '@testing-library/react';
import * as React from 'react';

import { Fortress, FortressProps, FortressState } from '../..';

function render(
    guard: FortressProps['guard'],
    onReady: FortressProps['onReady'],
    strategyShouldResolve?: boolean,
) {
    const format = (stateValue: FortressStateValue) => `I am ${stateValue}`;
    const strategy = new TestStrategy(strategyShouldResolve);

    const wrapper = rtl.render(
        <Fortress strategy={strategy} guard={guard} onReady={onReady}>
            <FortressState.Idle>{format('idle')}</FortressState.Idle>
            <FortressState.Unauthenticated>
                {format('unauthenticated')}
            </FortressState.Unauthenticated>
            <FortressState.Challenging>{format('challenging')}</FortressState.Challenging>
            <FortressState.Authenticated>{format('authenticated')}</FortressState.Authenticated>
        </Fortress>,
    );

    return {
        ...wrapper,
        getByStateValue: (stateValue: FortressStateValue) => wrapper.getByText(format(stateValue)),
    };
}

describe('<Fortress />', () => {
    afterEach(rtl.cleanup);

    it('should correctly render when desauthenticate() is called', async () => {
        expect.assertions(9);

        const guard = jest.fn().mockReturnValue(true);
        const onReady = jest.fn();

        const { getByStateValue } = render(guard, onReady);

        expect(getByStateValue('idle')).toBeInTheDocument();
        expect(() => getByStateValue('unauthenticated')).toThrowError();
        expect(() => getByStateValue('authenticated')).toThrowError();
        expect(() => getByStateValue('challenging')).toThrowError();

        expect(onReady).toHaveBeenCalledTimes(1);

        const fortress = onReady.mock.calls[0][0] as FortressClass;
        rtl.act(() => {
            fortress.deauthenticate();
        });

        await rtl.wait(() => getByStateValue('unauthenticated'));

        expect(getByStateValue('unauthenticated')).toBeInTheDocument();
        expect(() => getByStateValue('idle')).toThrowError();
        expect(() => getByStateValue('authenticated')).toThrowError();
        expect(() => getByStateValue('challenging')).toThrowError();
    });

    it('should correctly render when challenging() is called and the operation succeeds', async () => {
        expect.assertions(9);

        const guard = jest.fn().mockReturnValue(true);
        const onReady = jest.fn();

        const { getByStateValue } = render(guard, onReady);

        expect(onReady).toHaveBeenCalledTimes(1);

        const fortress = onReady.mock.calls[0][0] as FortressClass;
        rtl.act(() => {
            fortress.challenge({ email: 'bob@localhost', password: 'password' });
        });

        await rtl.wait(() => getByStateValue('authenticated'));

        expect(getByStateValue('authenticated')).toBeInTheDocument();
        expect(() => getByStateValue('idle')).toThrowError();
        expect(() => getByStateValue('challenging')).toThrowError();
        expect(() => getByStateValue('unauthenticated')).toThrowError();

        rtl.act(() => {
            fortress.deauthenticate();
        });

        await rtl.wait(() => getByStateValue('unauthenticated'));

        expect(getByStateValue('unauthenticated')).toBeInTheDocument();
        expect(() => getByStateValue('idle')).toThrowError();
        expect(() => getByStateValue('authenticated')).toThrowError();
        expect(() => getByStateValue('challenging')).toThrowError();
    });

    it('should correctly render when challenging() is called and the operation fails', async () => {
        expect.assertions(5);

        const guard = jest.fn().mockReturnValue(true);
        const onReady = jest.fn();

        const { getByStateValue } = render(guard, onReady, false);

        expect(onReady).toHaveBeenCalledTimes(1);

        const fortress = onReady.mock.calls[0][0] as FortressClass;
        rtl.act(() => {
            fortress.challenge({ email: 'bob@localhost', password: 'password' });
        });

        await rtl.wait(() => getByStateValue('unauthenticated'));

        expect(getByStateValue('unauthenticated')).toBeInTheDocument();
        expect(() => getByStateValue('idle')).toThrowError();
        expect(() => getByStateValue('challenging')).toThrowError();
        expect(() => getByStateValue('authenticated')).toThrowError();
    });
});
