import { Fortress } from '../fortress';
import { createTestProxy } from './testProxy';

describe('Fortress', () => {
    describe('createFirewall()', () => {
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

            const fortress = new Fortress(proxy);
            const firewall = fortress.createFirewall({ role: 'ADMIN' });

            expect(fortress.state.value).toBe('idle');
            expect(firewall.state.value).toBe('idle');

            fortress.deauthenticate();

            const subscriber = jest.fn();
            firewall.subscribe(subscriber);

            await firewall.waitFor('unauthenticated');

            expect(subscriber).toHaveBeenCalledTimes(1);
            expect(subscriber.mock.calls).toEqual([
                [{ permissions: null, stateValue: 'unauthenticated', user: null }],
            ]);
            expect(firewall.state.value).toBe('unauthenticated');

            expect(proxy.authorize).not.toHaveBeenCalled();
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

            const fortress = new Fortress(proxy);
            const firewall = fortress.createFirewall({ role: 'ADMIN' });

            expect(fortress.state.value).toBe('idle');
            expect(fortress.state.value).toBe('idle');

            fortress.challenge({ email: 'bob@localhost', password: 'password' });

            const subscriber = jest.fn();
            firewall.subscribe(subscriber);

            await firewall.waitFor('granted');

            expect(subscriber).toHaveBeenCalledTimes(4);
            expect(subscriber.mock.calls).toEqual([
                [{ permissions: null, stateValue: 'idle', user: null }],
                [{ permissions: null, stateValue: 'provisioning', user: null }],
                [
                    {
                        permissions: [{ role: 'resource.write' }],
                        stateValue: 'authorizing',
                        user: { name: 'Bob' },
                    },
                ],
                [
                    {
                        permissions: [{ role: 'resource.write' }],
                        stateValue: 'granted',
                        user: { name: 'Bob' },
                    },
                ],
            ]);
            expect(firewall.state.value).toBe('granted');

            expect(proxy.authorize).toHaveBeenCalledTimes(1);
            expect(proxy.authorize).toHaveBeenCalledWith(
                { role: 'ADMIN' },
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
            expect.assertions(11);

            const proxy = createTestProxy({
                authorize: new Error('Not Allowed'),
                challenge: {
                    token: 'abc123',
                },
                provision: {
                    permissions: [{ role: 'resource.write' }],
                    user: { name: 'Bob' },
                },
            });

            const fortress = new Fortress(proxy);
            const firewall = fortress.createFirewall({ role: 'ADMIN' });

            expect(fortress.state.value).toBe('idle');
            expect(firewall.state.value).toBe('idle');

            fortress.challenge({ email: 'bob@localhost', password: 'password' });

            const subscriber = jest.fn();
            firewall.subscribe(subscriber);

            await firewall.waitFor('denied');

            expect(subscriber).toHaveBeenCalledTimes(4);
            expect(subscriber.mock.calls).toEqual([
                [{ permissions: null, stateValue: 'idle', user: null }],
                [{ permissions: null, stateValue: 'provisioning', user: null }],
                [
                    {
                        permissions: [{ role: 'resource.write' }],
                        stateValue: 'authorizing',
                        user: { name: 'Bob' },
                    },
                ],
                [
                    {
                        permissions: [{ role: 'resource.write' }],
                        stateValue: 'denied',
                        user: { name: 'Bob' },
                    },
                ],
            ]);
            expect(firewall.state.value).toBe('denied');

            expect(proxy.authorize).toHaveBeenCalledTimes(1);
            expect(proxy.authorize).toHaveBeenCalledWith(
                { role: 'ADMIN' },
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
});
