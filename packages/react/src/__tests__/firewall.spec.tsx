import { FirewallStateValue, Fortress as FortressClass } from '@castli/core';
import { TestStrategy } from '@castli/test-utils';
import * as rtl from '@testing-library/react';
import * as React from 'react';

import { queueScheduler } from 'rxjs';
import { Firewall, Fortress, FortressProps } from '../../';

function render(guard: FortressProps['guard'], onReady: FortressProps['onReady']) {
    const format = (stateValue: FirewallStateValue) => `I am ${stateValue}`;
    const strategy = new TestStrategy();
    const wrapper = rtl.render(
        <Fortress strategy={strategy} guard={guard} onReady={onReady} scheduler={queueScheduler}>
            <Firewall query={{ role: 'ADMIN' }}>
                <Firewall.Idle>{format('idle')}</Firewall.Idle>
                <Firewall.Unauthenticated>{format('unauthenticated')}</Firewall.Unauthenticated>
                <Firewall.Authorizing>{format('authorizing')}</Firewall.Authorizing>
                <Firewall.Granted>{format('granted')}</Firewall.Granted>
                <Firewall.Denied>{format('denied')}</Firewall.Denied>
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
        expect.assertions(5);

        const guard = jest.fn().mockReturnValue(true);
        const onReady = jest.fn();

        const { getByStateValue } = render(guard, onReady);

        expect(getByStateValue('idle')).toBeInTheDocument();
        expect(() => getByStateValue('authorizing')).toThrowError();
        expect(() => getByStateValue('denied')).toThrowError();
        expect(() => getByStateValue('granted')).toThrowError();
        expect(() => getByStateValue('unauthenticated')).toThrowError();
    });

    it('should correctly render when the fortress transition to unauthenticated', async () => {
        expect.assertions(10);

        const guard = jest.fn().mockReturnValue(true);
        const onReady = jest.fn();

        const { getByStateValue } = render(guard, onReady);

        expect(getByStateValue('idle')).toBeInTheDocument();
        expect(() => getByStateValue('authorizing')).toThrowError();
        expect(() => getByStateValue('denied')).toThrowError();
        expect(() => getByStateValue('granted')).toThrowError();
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
        expect(() => getByStateValue('idle')).toThrowError();
    });

    it('should transition to granted and then correctly render when the fortress transition to authenticated and guard returns true', async () => {
        expect.assertions(12);

        const guard = jest
            .fn()
            .mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(true), 100)));
        const onReady = jest.fn();

        const { getByStateValue } = render(guard, onReady);

        expect(getByStateValue('idle')).toBeInTheDocument();
        expect(() => getByStateValue('authorizing')).toThrowError();
        expect(() => getByStateValue('denied')).toThrowError();
        expect(() => getByStateValue('granted')).toThrowError();
        expect(() => getByStateValue('unauthenticated')).toThrowError();

        const fortress = onReady.mock.calls[0][0] as FortressClass;

        rtl.act(() => {
            fortress.challenge({ email: 'bob@localhost', password: 'password' });
            (fortress.strategy as TestStrategy).commit({
                email: 'bob2@localhost',
                password: 'password',
            });
        });

        await rtl.wait(() => getByStateValue('granted'));
        expect(getByStateValue('granted')).toBeInTheDocument();
        expect(() => getByStateValue('authorizing')).toThrowError();
        expect(() => getByStateValue('denied')).toThrowError();
        expect(() => getByStateValue('idle')).toThrowError();
        expect(() => getByStateValue('unauthenticated')).toThrowError();

        expect(guard).toHaveBeenCalledTimes(1);
        expect(guard).toHaveBeenCalledWith(
            { role: 'ADMIN' },
            { email: 'bob2@localhost', password: 'password' }, // this is the behavior of the test strategy
        );
    });

    it('should transition to denied and then correctly render when the fortress transition to authenticated and guard returns false', async () => {
        expect.assertions(12);

        const guard = jest
            .fn()
            .mockImplementation(
                () => new Promise((_, reject) => setTimeout(() => reject(new Error('Denied')), 10)),
            );
        const onReady = jest.fn();

        const { getByStateValue } = render(guard, onReady);

        expect(getByStateValue('idle')).toBeInTheDocument();
        expect(() => getByStateValue('authorizing')).toThrowError();
        expect(() => getByStateValue('denied')).toThrowError();
        expect(() => getByStateValue('granted')).toThrowError();
        expect(() => getByStateValue('unauthenticated')).toThrowError();

        const fortress = onReady.mock.calls[0][0] as FortressClass;

        rtl.act(() => {
            fortress.challenge({ email: 'bob@localhost', password: 'password' });
            (fortress.strategy as TestStrategy).commit({
                email: 'bob2@localhost',
                password: 'password',
            });
        });

        await rtl.wait(() => getByStateValue('denied'));
        expect(getByStateValue('denied')).toBeInTheDocument();
        expect(() => getByStateValue('authorizing')).toThrowError();
        expect(() => getByStateValue('granted')).toThrowError();
        expect(() => getByStateValue('idle')).toThrowError();
        expect(() => getByStateValue('unauthenticated')).toThrowError();

        expect(guard).toHaveBeenCalledTimes(1);
        expect(guard).toHaveBeenCalledWith(
            { role: 'ADMIN' },
            { email: 'bob2@localhost', password: 'password' }, // this is the behavior of the test strategy
        );
    });
});
