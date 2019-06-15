import { createTestProxy } from '@castli/test-utils';

import { BasicAuthStrategy } from '../../';
import { Fortress } from '../fortress';
import { createFortressEventSubscriber } from './subscribers';

interface BasicAuthQuery {
    email: string;
    password: string;
}
interface BasicAuthResponse {
    token: string;
}

describe('Fortress', () => {
    it('idle => unauthenticated', async () => {
        expect.assertions(3);

        const proxy = createTestProxy({
            token: 'abc123',
        });

        const strategy = new BasicAuthStrategy<BasicAuthQuery, BasicAuthResponse>(proxy);
        const fortress = new Fortress(strategy, () => ({ name: 'Bob' }));
        const subscriber = jest.fn();
        fortress.subscribe(subscriber);

        expect(fortress.state.value).toBe('idle');
        fortress.deauthenticate();
        await fortress.waitFor('unauthenticated');

        expect(fortress.state.value).toBe('unauthenticated');
        expect(subscriber.mock.calls).toMatchObject([
            [
                createFortressEventSubscriber({}, 'idle', {
                    type: 'xstate.init', // this is the init from xstate
                }),
            ],
            [
                createFortressEventSubscriber({}, 'unauthenticated', {
                    type: 'DEAUTHENTICATE',
                }),
            ],
        ]);
    });

    it('idle => challenging => authenticated', async () => {
        expect.assertions(3);

        const proxy = createTestProxy({
            token: 'abc123',
        });

        const strategy = new BasicAuthStrategy<BasicAuthQuery, BasicAuthResponse>(proxy);
        const fortress = new Fortress(strategy, () => ({ name: 'Bob' }));
        const subscriber = jest.fn();
        fortress.subscribe(subscriber);

        expect(fortress.state.value).toBe('idle');
        fortress.challenge({ email: 'bob@localhost', password: 'password' });
        await fortress.waitFor('authenticated');

        expect(fortress.state.value).toBe('authenticated');
        expect(subscriber.mock.calls).toMatchObject([
            [
                createFortressEventSubscriber({}, 'idle', {
                    type: 'xstate.init', // this is the init from xstate
                }),
            ],
            [
                createFortressEventSubscriber({}, 'challenging', {
                    query: { email: 'bob@localhost', password: 'password' },
                    type: 'CHALLENGE',
                }),
            ],
            [
                createFortressEventSubscriber(
                    {
                        token: 'abc123',
                    },
                    'authenticated',
                    {
                        type: 'AUTHENTICATE',
                    },
                ),
            ],
        ]);
    });

    it('idle => challenging => unauthenticated', async () => {
        expect.assertions(3);

        const proxy = createTestProxy(new Error('Invalid credentials'));

        const strategy = new BasicAuthStrategy<BasicAuthQuery, BasicAuthResponse>(proxy);
        const fortress = new Fortress(strategy, () => ({ name: 'Bob' }));
        const subscriber = jest.fn();
        fortress.subscribe(subscriber);

        expect(fortress.state.value).toBe('idle');
        fortress.challenge({ email: 'bob@localhost', password: 'password' });
        await fortress.waitFor('unauthenticated');

        expect(fortress.state.value).toBe('unauthenticated');
        expect(subscriber.mock.calls).toMatchObject([
            [
                createFortressEventSubscriber({}, 'idle', {
                    type: 'xstate.init', // this is the init from xstate
                }),
            ],
            [
                createFortressEventSubscriber({}, 'challenging', {
                    query: { email: 'bob@localhost', password: 'password' },
                    type: 'CHALLENGE',
                }),
            ],
            [
                createFortressEventSubscriber({}, 'unauthenticated', {
                    query: { error: new Error('Invalid credentials') },
                    type: 'DEAUTHENTICATE',
                }),
            ],
        ]);
    });
});
