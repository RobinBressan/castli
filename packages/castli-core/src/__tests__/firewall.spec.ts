import { Fortress } from '../../';
import { createTestProxy } from './testProxy';
import { createFirewallEventSubscriber } from './tools';

describe('Firewall', () => {
    it('idle => unauthenticated', async () => {
        expect.assertions(8);

        const proxy = createTestProxy({
            challenge: {
                token: 'abc123',
            },
            provision: {
                permissions: [{ role: 'resource.write' }],
                user: { name: 'Bob' },
            },
        });

        const guard = jest.fn().mockReturnValue(true);
        const fortress = new Fortress(proxy, guard);
        const firewall = fortress.createFirewall({ role: 'ADMIN' });

        expect(fortress.state.value).toBe('idle');
        expect(firewall.state.value).toBe('idle');

        fortress.deauthenticate();

        const subscriber = jest.fn();
        firewall.subscribe(subscriber);

        await firewall.waitFor('unauthenticated');

        expect(subscriber).toHaveBeenCalledTimes(2);
        expect(subscriber.mock.calls).toMatchObject([
            [
                createFirewallEventSubscriber(null, null, 'idle', {
                    type: 'xstate.init',
                }),
            ],
            [
                createFirewallEventSubscriber(null, null, 'unauthenticated', {
                    type: 'DEAUTHENTICATE',
                }),
            ],
        ]);
        expect(firewall.state.value).toBe('unauthenticated');

        expect(guard).not.toHaveBeenCalled();
        expect(proxy.challenge).not.toHaveBeenCalled();
        expect(proxy.provision).not.toHaveBeenCalled();

        firewall.dispose();
    });

    it('idle => provisioning => authorizing => granted', async () => {
        expect.assertions(11);

        const proxy = createTestProxy({
            challenge: {
                token: 'abc123',
            },
            provision: {
                permissions: [{ role: 'resource.write' }],
                user: { name: 'Bob' },
            },
        });

        const guard = jest.fn().mockReturnValue(true);
        const fortress = new Fortress(proxy, guard);
        const firewall = fortress.createFirewall({ role: 'ADMIN' });

        expect(fortress.state.value).toBe('idle');
        expect(fortress.state.value).toBe('idle');

        fortress.challenge({ email: 'bob@localhost', password: 'password' });

        const subscriber = jest.fn();
        firewall.subscribe(subscriber);

        await firewall.waitFor('granted');

        expect(subscriber).toHaveBeenCalledTimes(5);
        expect(subscriber.mock.calls).toMatchObject([
            [
                createFirewallEventSubscriber(null, null, 'idle', {
                    type: 'xstate.init', // this is the init from xstate
                }),
            ],
            [
                createFirewallEventSubscriber(null, null, 'idle', {
                    type: 'RESET', // this is due to the challenging state in the authentication machine
                }),
            ],

            [
                createFirewallEventSubscriber(null, null, 'provisioning', {
                    type: 'PROVISION',
                }),
            ],
            [
                createFirewallEventSubscriber(
                    { name: 'Bob' },
                    [{ role: 'resource.write' }],
                    'authorizing',
                    {
                        type: 'AUTHORIZE',
                    },
                ),
            ],
            [
                createFirewallEventSubscriber(
                    { name: 'Bob' },
                    [{ role: 'resource.write' }],
                    'granted',
                    {
                        type: 'GRANT',
                    },
                ),
            ],
        ]);
        expect(firewall.state.value).toBe('granted');

        expect(guard).toHaveBeenCalledTimes(1);
        expect(guard).toHaveBeenCalledWith(
            { role: 'ADMIN' },
            { name: 'Bob' },
            [{ role: 'resource.write' }],
            [
                {
                    token: 'abc123',
                },
            ],
        );
        expect(proxy.challenge).toHaveBeenCalledTimes(1);
        expect(proxy.challenge).toHaveBeenCalledWith(
            {
                email: 'bob@localhost',
                password: 'password',
            },
            [],
            expect.any(Function),
        );
        expect(proxy.provision).toHaveBeenCalledTimes(1);
        expect(proxy.provision).toHaveBeenCalledWith({ role: 'ADMIN' }, [{ token: 'abc123' }]);

        firewall.dispose();
    });

    it('idle => provisioning => authorizing => denied', async () => {
        expect.assertions(10);

        const proxy = createTestProxy({
            challenge: {
                token: 'abc123',
            },
            provision: {
                permissions: [{ role: 'resource.write' }],
                user: { name: 'Bob' },
            },
        });

        const guard = jest.fn().mockRejectedValue(new Error('Denied'));
        const fortress = new Fortress(proxy, guard);
        const firewall = fortress.createFirewall({ role: 'ADMIN' });

        expect(fortress.state.value).toBe('idle');

        fortress.challenge({ email: 'bob@localhost', password: 'password' });

        const subscriber = jest.fn();
        firewall.subscribe(subscriber);

        await firewall.waitFor('denied');

        expect(subscriber).toHaveBeenCalledTimes(5);
        expect(subscriber.mock.calls).toMatchObject([
            [
                createFirewallEventSubscriber(null, null, 'idle', {
                    type: 'xstate.init', // this is the init from xstate
                }),
            ],
            [
                createFirewallEventSubscriber(null, null, 'idle', {
                    type: 'RESET', // this is due to the challenging state in the authentication machine
                }),
            ],

            [
                createFirewallEventSubscriber(null, null, 'provisioning', {
                    type: 'PROVISION',
                }),
            ],
            [
                createFirewallEventSubscriber(
                    { name: 'Bob' },
                    [{ role: 'resource.write' }],
                    'authorizing',
                    {
                        type: 'AUTHORIZE',
                    },
                ),
            ],
            [
                createFirewallEventSubscriber(
                    { name: 'Bob' },
                    [{ role: 'resource.write' }],
                    'denied',
                    {
                        type: 'DENY',
                    },
                ),
            ],
        ]);
        expect(firewall.state.value).toBe('denied');

        expect(guard).toHaveBeenCalledTimes(1);
        expect(guard).toHaveBeenCalledWith(
            { role: 'ADMIN' },
            { name: 'Bob' },
            [{ role: 'resource.write' }],
            [
                {
                    token: 'abc123',
                },
            ],
        );
        expect(proxy.challenge).toHaveBeenCalledTimes(1);
        expect(proxy.challenge).toHaveBeenCalledWith(
            {
                email: 'bob@localhost',
                password: 'password',
            },
            [],
            expect.any(Function),
        );
        expect(proxy.provision).toHaveBeenCalledTimes(1);
        expect(proxy.provision).toHaveBeenCalledWith({ role: 'ADMIN' }, [{ token: 'abc123' }]);

        firewall.dispose();
    });
});
