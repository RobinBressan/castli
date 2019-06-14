import { FirewallStateValue, Fortress as FortressClass } from '@castli/core';
import { createTestProxy } from '@castli/test-utils';
import * as rtl from '@testing-library/react';
import * as React from 'react';

import { Firewall, FirewallState, Fortress, FortressProps } from '../';

function render(
    proxy: FortressProps['proxy'],
    guard: FortressProps['guard'],
    onReady: FortressProps['onReady'],
) {
    const format = (stateValue: FirewallStateValue) => `I am ${stateValue}`;
    const wrapper = rtl.render(
        <Fortress proxy={proxy} guard={guard} onReady={onReady}>
            <Firewall query={{ role: 'ADMIN' }}>
                <FirewallState.Idle>{format('idle')}</FirewallState.Idle>
                <FirewallState.Unauthenticated>
                    {format('unauthenticated')}
                </FirewallState.Unauthenticated>
                <FirewallState.Authorizing>{format('authorizing')}</FirewallState.Authorizing>
                <FirewallState.Provisioning>{format('provisioning')}</FirewallState.Provisioning>
                <FirewallState.Granted>{format('granted')}</FirewallState.Granted>
                <FirewallState.Denied>{format('denied')}</FirewallState.Denied>
            </Firewall>
        </Fortress>,
    );

    return {
        ...wrapper,
        getByStateValue: (stateValue: FirewallStateValue) => wrapper.getByText(format(stateValue)),
    };
}

describe('<Firewall />', () => {
    afterEach(rtl.cleanup);

    it('should correctly render when the fortress is idle', async () => {
        expect.assertions(6);

        const proxy = createTestProxy({
            challenge: {
                token: 'abc123',
            },
            provision: {
                permissions: ['write'],
                user: { name: 'Bob', role: 'ADMIN' },
            },
        });

        const guard = jest.fn().mockReturnValue(true);
        const onReady = jest.fn();

        const { getByStateValue } = render(proxy, guard, onReady);

        expect(getByStateValue('idle')).toBeInTheDocument();
        expect(() => getByStateValue('authorizing')).toThrowError();
        expect(() => getByStateValue('denied')).toThrowError();
        expect(() => getByStateValue('granted')).toThrowError();
        expect(() => getByStateValue('provisioning')).toThrowError();
        expect(() => getByStateValue('unauthenticated')).toThrowError();
    });

    it('should correctly render when the fortress transition to unauthenticated', async () => {
        expect.assertions(12);

        const proxy = createTestProxy({
            challenge: {
                token: 'abc123',
            },
            provision: {
                permissions: ['write'],
                user: { name: 'Bob', role: 'ADMIN' },
            },
        });

        const guard = jest.fn().mockReturnValue(true);
        const onReady = jest.fn();

        const { getByStateValue } = render(proxy, guard, onReady);

        expect(getByStateValue('idle')).toBeInTheDocument();
        expect(() => getByStateValue('authorizing')).toThrowError();
        expect(() => getByStateValue('denied')).toThrowError();
        expect(() => getByStateValue('granted')).toThrowError();
        expect(() => getByStateValue('provisioning')).toThrowError();
        expect(() => getByStateValue('unauthenticated')).toThrowError();

        const fortress = onReady.mock.calls[0][0] as FortressClass;
        rtl.act(() => {
            fortress.deauthenticate();
        });

        await rtl.wait(() => getByStateValue('unauthenticated'));

        expect(getByStateValue('unauthenticated')).toBeInTheDocument();
        expect(() => getByStateValue('authorizing')).toThrowError();
        expect(() => getByStateValue('denied')).toThrowError();
        expect(() => getByStateValue('granted')).toThrowError();
        expect(() => getByStateValue('provisioning')).toThrowError();
        expect(() => getByStateValue('idle')).toThrowError();
    });

    it('should start provisioning, transition to granted and then correctly render when the fortress transition to authenticated and guard returns true', async () => {
        expect.assertions(16);

        const proxy = createTestProxy({
            challenge: new Promise(resolve =>
                setTimeout(
                    () =>
                        resolve({
                            token: 'abc123',
                        }),
                    500,
                ),
            ),
            provision: new Promise(resolve =>
                setTimeout(
                    () =>
                        resolve({
                            permissions: ['write'],
                            user: { name: 'Bob', role: 'ADMIN' },
                        }),
                    500,
                ),
            ),
        });

        const guard = jest
            .fn()
            .mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(true), 100)));
        const onReady = jest.fn();

        const { getByStateValue } = render(proxy, guard, onReady);

        expect(getByStateValue('idle')).toBeInTheDocument();
        expect(() => getByStateValue('authorizing')).toThrowError();
        expect(() => getByStateValue('denied')).toThrowError();
        expect(() => getByStateValue('granted')).toThrowError();
        expect(() => getByStateValue('provisioning')).toThrowError();
        expect(() => getByStateValue('unauthenticated')).toThrowError();

        const fortress = onReady.mock.calls[0][0] as FortressClass;

        rtl.act(() => {
            fortress.challenge({ email: 'bob@localhost', password: 'password' });
        });

        await rtl.wait(() => getByStateValue('granted'));
        expect(getByStateValue('granted')).toBeInTheDocument();
        expect(() => getByStateValue('authorizing')).toThrowError();
        expect(() => getByStateValue('denied')).toThrowError();
        expect(() => getByStateValue('idle')).toThrowError();
        expect(() => getByStateValue('provisioning')).toThrowError();
        expect(() => getByStateValue('unauthenticated')).toThrowError();

        expect(proxy.provision).toHaveBeenCalledTimes(1);
        expect(proxy.provision).toHaveBeenCalledWith({ role: 'ADMIN' }, [
            {
                token: 'abc123',
            },
        ]);

        expect(guard).toHaveBeenCalledTimes(1);
        expect(guard).toHaveBeenCalledWith(
            { role: 'ADMIN' },
            { name: 'Bob', role: 'ADMIN' },
            ['write'],
            [
                {
                    token: 'abc123',
                },
            ],
        );
    });

    it('should start provisioning, transition to denied and then correctly render when the fortress transition to authenticated and guard returns false', async () => {
        expect.assertions(16);

        const proxy = createTestProxy({
            challenge: new Promise(resolve =>
                setTimeout(
                    () =>
                        resolve({
                            token: 'abc123',
                        }),
                    500,
                ),
            ),
            provision: new Promise(resolve =>
                setTimeout(
                    () =>
                        resolve({
                            permissions: ['write'],
                            user: { name: 'Bob', role: 'ADMIN' },
                        }),
                    500,
                ),
            ),
        });

        const guard = jest
            .fn()
            .mockImplementation(
                () => new Promise(resolve => setTimeout(() => resolve(false), 100)),
            );
        const onReady = jest.fn();

        const { getByStateValue } = render(proxy, guard, onReady);

        expect(getByStateValue('idle')).toBeInTheDocument();
        expect(() => getByStateValue('authorizing')).toThrowError();
        expect(() => getByStateValue('denied')).toThrowError();
        expect(() => getByStateValue('granted')).toThrowError();
        expect(() => getByStateValue('provisioning')).toThrowError();
        expect(() => getByStateValue('unauthenticated')).toThrowError();

        const fortress = onReady.mock.calls[0][0] as FortressClass;

        rtl.act(() => {
            fortress.challenge({ email: 'bob@localhost', password: 'password' });
        });

        await rtl.wait(() => getByStateValue('denied'));
        expect(getByStateValue('denied')).toBeInTheDocument();
        expect(() => getByStateValue('authorizing')).toThrowError();
        expect(() => getByStateValue('granted')).toThrowError();
        expect(() => getByStateValue('idle')).toThrowError();
        expect(() => getByStateValue('provisioning')).toThrowError();
        expect(() => getByStateValue('unauthenticated')).toThrowError();

        expect(proxy.provision).toHaveBeenCalledTimes(1);
        expect(proxy.provision).toHaveBeenCalledWith({ role: 'ADMIN' }, [
            {
                token: 'abc123',
            },
        ]);

        expect(guard).toHaveBeenCalledTimes(1);
        expect(guard).toHaveBeenCalledWith(
            { role: 'ADMIN' },
            { name: 'Bob', role: 'ADMIN' },
            ['write'],
            [
                {
                    token: 'abc123',
                },
            ],
        );
    });
});
