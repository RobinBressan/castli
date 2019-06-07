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

        firewall.complete();
    });
});
