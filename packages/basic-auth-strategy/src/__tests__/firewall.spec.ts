import { Fortress } from '@castli/core';
import { createFirewallEventSubscriber, createTestProxy } from '@castli/test-utils';

import { BasicAuthStrategy } from '../../';

interface BasicAuthQuery {
    email: string;
    password: string;
}
interface BasicAuthResponse {
    token: string;
}

describe('Firewall', () => {
    it('idle => unauthenticated', async () => {
        expect.assertions(7);

        const proxy = createTestProxy({
            token: 'abc123',
        });

        const guard = jest.fn().mockReturnValue({ name: 'Bob' });
        const strategy = new BasicAuthStrategy<BasicAuthQuery, BasicAuthResponse>(proxy);
        const fortress = new Fortress(strategy, guard);
        const firewall = fortress.createFirewall({ role: 'ADMIN' });
        expect(fortress.state.value).toBe('idle');
        expect(firewall.state.value).toBe('idle');

        fortress.deauthenticate();

        const subscriber = jest.fn();
        firewall.subscribe(subscriber);

        await firewall.waitFor$('unauthenticated').toPromise();

        expect(subscriber).toHaveBeenCalledTimes(2);
        expect(subscriber.mock.calls).toMatchObject([
            [
                createFirewallEventSubscriber({}, 'idle', {
                    type: 'xstate.init',
                }),
            ],
            [
                createFirewallEventSubscriber({}, 'unauthenticated', {
                    type: 'DEAUTHENTICATE',
                }),
            ],
        ]);
        expect(firewall.state.value).toBe('unauthenticated');

        expect(guard).not.toHaveBeenCalled();
        expect(proxy.request).not.toHaveBeenCalled();

        firewall.dispose();
    });

    it('idle => authorizing => granted', async () => {
        expect.assertions(10);

        const proxy = createTestProxy({
            token: 'abc123',
        });

        const guard = jest.fn().mockReturnValue({ name: 'Bob' });

        const strategy = new BasicAuthStrategy(proxy);
        const fortress = new Fortress(strategy, guard);
        const firewall = fortress.createFirewall({ role: 'ADMIN' });

        expect(fortress.state.value).toBe('idle');
        expect(fortress.state.value).toBe('idle');

        fortress.challenge({ email: 'bob@localhost', password: 'password' });

        const subscriber = jest.fn();
        firewall.subscribe(subscriber);

        await firewall.waitFor$('granted').toPromise();

        expect(subscriber).toHaveBeenCalledTimes(4);
        expect(subscriber.mock.calls).toMatchObject([
            [
                createFirewallEventSubscriber({}, 'idle', {
                    type: 'xstate.init', // this is the init from xstate
                }),
            ],
            [
                createFirewallEventSubscriber({}, 'idle', {
                    type: 'RESET', // this is due to the challenging state in the authentication machine
                }),
            ],
            [
                createFirewallEventSubscriber({}, 'authorizing', {
                    type: 'AUTHORIZE',
                }),
            ],
            [
                createFirewallEventSubscriber({ name: 'Bob' }, 'granted', {
                    type: 'GRANT',
                }),
            ],
        ]);
        expect(firewall.state.value).toBe('granted');
        expect(firewall.state.context).toEqual({ name: 'Bob' });

        expect(guard).toHaveBeenCalledTimes(1);
        expect(guard).toHaveBeenCalledWith(
            { role: 'ADMIN' },
            {
                token: 'abc123',
            },
        );
        expect(proxy.request).toHaveBeenCalledTimes(1);
        expect(proxy.request).toHaveBeenCalledWith({
            email: 'bob@localhost',
            password: 'password',
        });

        firewall.dispose();
    });

    it('idle => authorizing => denied', async () => {
        expect.assertions(10);

        const proxy = createTestProxy({
            token: 'abc123',
        });

        const guard = jest.fn().mockImplementation(() => Promise.reject(new Error('Denied')));

        const strategy = new BasicAuthStrategy(proxy);
        const fortress = new Fortress(strategy, guard);
        const firewall = fortress.createFirewall({ role: 'ADMIN' });

        expect(fortress.state.value).toBe('idle');
        expect(fortress.state.value).toBe('idle');

        fortress.challenge({ email: 'bob@localhost', password: 'password' });

        const subscriber = jest.fn();
        firewall.subscribe(subscriber);

        await firewall.waitFor$('denied').toPromise();

        expect(subscriber).toHaveBeenCalledTimes(4);
        expect(subscriber.mock.calls).toMatchObject([
            [
                createFirewallEventSubscriber({}, 'idle', {
                    type: 'xstate.init', // this is the init from xstate
                }),
            ],
            [
                createFirewallEventSubscriber({}, 'idle', {
                    type: 'RESET', // this is due to the challenging state in the authentication machine
                }),
            ],
            [
                createFirewallEventSubscriber({}, 'authorizing', {
                    type: 'AUTHORIZE',
                }),
            ],
            [
                createFirewallEventSubscriber({ error: new Error('Denied') }, 'denied', {
                    type: 'DENY',
                }),
            ],
        ]);
        expect(firewall.state.value).toBe('denied');
        expect(firewall.state.context).toEqual({ error: new Error('Denied') });

        expect(guard).toHaveBeenCalledTimes(1);
        expect(guard).toHaveBeenCalledWith(
            { role: 'ADMIN' },
            {
                token: 'abc123',
            },
        );
        expect(proxy.request).toHaveBeenCalledTimes(1);
        expect(proxy.request).toHaveBeenCalledWith({
            email: 'bob@localhost',
            password: 'password',
        });

        firewall.dispose();
    });
});
