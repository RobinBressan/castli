import { AuthenticationService } from '../authentication/service';
import { Firewall } from '../firewall';
import { createTestProxy } from './testProxy';

describe('Firewall', () => {
    it('should init on idle state and then transition to unauthenticated', async () => {
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

        const authenticationService = new AuthenticationService(proxy);
        const firewall = new Firewall(proxy, authenticationService, { role: 'ADMIN' });

        expect(authenticationService.state.value).toBe('idle');
        expect(firewall.service.state.value).toBe('idle');

        authenticationService.deauthenticate();

        const subscriber = jest.fn();
        firewall.subscribe(subscriber);

        await firewall.waitFor('unauthenticated');

        expect(subscriber).toHaveBeenCalledTimes(1);
        expect(subscriber.mock.calls).toEqual([
            [{ permissions: null, stateValue: 'unauthenticated', user: null }],
        ]);
        expect(firewall.service.state.value).toBe('unauthenticated');

        expect(proxy.authorize).not.toHaveBeenCalled();
        expect(proxy.challenge).not.toHaveBeenCalled();
        expect(proxy.provision).not.toHaveBeenCalled();

        firewall.dispose();
    });

    it('should wait for authentication service to be authenticated and then start provisioning', async () => {
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

        const authenticationService = new AuthenticationService(proxy);
        const firewall = new Firewall(proxy, authenticationService, { role: 'ADMIN' });

        expect(authenticationService.state.value).toBe('idle');
        expect(firewall.service.state.value).toBe('idle');

        authenticationService.challenge({ email: 'bob@localhost', password: 'password' });

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
        expect(firewall.service.state.value).toBe('granted');

        expect(proxy.authorize).toHaveBeenCalledTimes(1);
        expect(proxy.authorize).toHaveBeenCalledWith(
            { role: 'ADMIN' },
            [{ role: 'resource.write' }],
            {
                token: 'abc123',
            },
        );
        expect(proxy.challenge).toHaveBeenCalledTimes(1);
        expect(proxy.challenge).toHaveBeenCalledWith({
            email: 'bob@localhost',
            password: 'password',
        });
        expect(proxy.provision).toHaveBeenCalledTimes(1);
        expect(proxy.provision).toHaveBeenCalledWith({ role: 'ADMIN' }, { token: 'abc123' });

        firewall.dispose();
    });

    it('should wait for authentication service to be authenticated and deny access if authorize fails', async () => {
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

        const authenticationService = new AuthenticationService(proxy);
        const firewall = new Firewall(proxy, authenticationService, { role: 'ADMIN' });

        expect(authenticationService.state.value).toBe('idle');
        expect(firewall.service.state.value).toBe('idle');

        authenticationService.challenge({ email: 'bob@localhost', password: 'password' });

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
        expect(firewall.service.state.value).toBe('denied');

        expect(proxy.authorize).toHaveBeenCalledTimes(1);
        expect(proxy.authorize).toHaveBeenCalledWith(
            { role: 'ADMIN' },
            [{ role: 'resource.write' }],
            {
                token: 'abc123',
            },
        );
        expect(proxy.challenge).toHaveBeenCalledTimes(1);
        expect(proxy.challenge).toHaveBeenCalledWith({
            email: 'bob@localhost',
            password: 'password',
        });
        expect(proxy.provision).toHaveBeenCalledTimes(1);
        expect(proxy.provision).toHaveBeenCalledWith({ role: 'ADMIN' }, { token: 'abc123' });

        firewall.dispose();
    });
});
