import { createTestProxy } from 'castli-test-tools';

import { Fortress } from '../../';
import { createFortressEventSubscriber } from './subscribers';

describe('Fortress', () => {
    it('idle => unauthenticated', async () => {
        expect.assertions(3);

        const proxy = createTestProxy({
            challenge: {
                token: 'abc123',
            },
        });

        const fortress = new Fortress(proxy, () => true);
        const subscriber = jest.fn();
        fortress.subscribe(subscriber);

        expect(fortress.state.value).toBe('idle');
        fortress.deauthenticate();
        await fortress.waitFor('unauthenticated');

        expect(fortress.state.value).toBe('unauthenticated');
        expect(subscriber.mock.calls).toMatchObject([
            [
                createFortressEventSubscriber([], 'idle', {
                    type: 'xstate.init', // this is the init from xstate
                }),
            ],
            [
                createFortressEventSubscriber([], 'unauthenticated', {
                    type: 'DEAUTHENTICATE',
                }),
            ],
        ]);
    });

    it('idle => challenging => authenticated', async () => {
        expect.assertions(3);

        const proxy = createTestProxy({
            challenge: {
                token: 'abc123',
            },
        });

        const fortress = new Fortress(proxy, () => true);
        const subscriber = jest.fn();
        fortress.subscribe(subscriber);

        expect(fortress.state.value).toBe('idle');
        fortress.challenge({ email: 'bob@localhost', password: 'password' });
        await fortress.waitFor('authenticated');

        expect(fortress.state.value).toBe('authenticated');
        expect(subscriber.mock.calls).toMatchObject([
            [
                createFortressEventSubscriber([], 'idle', {
                    type: 'xstate.init', // this is the init from xstate
                }),
            ],
            [
                createFortressEventSubscriber([], 'challenging', {
                    query: { email: 'bob@localhost', password: 'password' },
                    type: 'CHALLENGE',
                }),
            ],
            [
                createFortressEventSubscriber(
                    [
                        {
                            token: 'abc123',
                        },
                    ],
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

        const proxy = createTestProxy({
            challenge: new Error('Invalid credentials'),
        });

        const fortress = new Fortress(proxy, () => true);
        const subscriber = jest.fn();
        fortress.subscribe(subscriber);

        expect(fortress.state.value).toBe('idle');
        fortress.challenge({ email: 'bob@localhost', password: 'password' });
        await fortress.waitFor('unauthenticated');

        expect(fortress.state.value).toBe('unauthenticated');
        expect(subscriber.mock.calls).toMatchObject([
            [
                createFortressEventSubscriber([], 'idle', {
                    type: 'xstate.init', // this is the init from xstate
                }),
            ],
            [
                createFortressEventSubscriber([], 'challenging', {
                    query: { email: 'bob@localhost', password: 'password' },
                    type: 'CHALLENGE',
                }),
            ],
            [
                createFortressEventSubscriber([], 'unauthenticated', {
                    query: { error: new Error('Invalid credentials') },
                    type: 'DEAUTHENTICATE',
                }),
            ],
        ]);
    });

    it('idle => challenging => idle => challenging => authenticated', async () => {
        expect.assertions(6);

        const proxy = createTestProxy({
            challenge: [
                {
                    authCode: 'def456',
                },
                {
                    token: 'abc123',
                },
            ],
        });

        const fortress = new Fortress(proxy, () => true);
        const subscriber = jest.fn();
        fortress.subscribe(subscriber);

        expect(fortress.state.value).toBe('idle');
        fortress.challenge({ email: 'bob@localhost', password: 'password' });
        await fortress.waitFor('challenging');
        await fortress.waitFor('idle');

        expect(fortress.state.value).toBe('idle');
        expect(fortress.state.context).toEqual({
            challenges: [
                {
                    authCode: 'def456',
                },
            ],
        });
        fortress.challenge({ code: '123456' });
        await fortress.waitFor('authenticated');

        expect(fortress.state.value).toBe('authenticated');
        expect(fortress.state.context).toEqual({
            challenges: [
                {
                    authCode: 'def456',
                },
                {
                    token: 'abc123',
                },
            ],
        });
        expect(subscriber.mock.calls).toMatchObject([
            [
                createFortressEventSubscriber([], 'idle', {
                    type: 'xstate.init', // this is the init from xstate
                }),
            ],
            [
                createFortressEventSubscriber([], 'challenging', {
                    query: { email: 'bob@localhost', password: 'password' },
                    type: 'CHALLENGE',
                }),
            ],
            [
                createFortressEventSubscriber([{ authCode: 'def456' }], 'idle', {
                    type: 'RECHALLENGE',
                }),
            ],
            [
                createFortressEventSubscriber([{ authCode: 'def456' }], 'challenging', {
                    query: { code: '123456' },
                    type: 'CHALLENGE',
                }),
            ],
            [
                createFortressEventSubscriber(
                    [
                        { authCode: 'def456' },
                        {
                            token: 'abc123',
                        },
                    ],
                    'authenticated',
                    {
                        type: 'AUTHENTICATE',
                    },
                ),
            ],
        ]);
    });

    it('idle => challenging => idle => challenging => unauthenticated', async () => {
        expect.assertions(6);

        const proxy = createTestProxy({
            challenge: [
                {
                    authCode: 'def456',
                },
                new Error('Bad code'),
            ],
        });

        const fortress = new Fortress(proxy, () => true);
        const subscriber = jest.fn();
        fortress.subscribe(subscriber);

        expect(fortress.state.value).toBe('idle');
        fortress.challenge({ email: 'bob@localhost', password: 'password' });
        await fortress.waitFor('challenging');
        await fortress.waitFor('idle');

        expect(fortress.state.value).toBe('idle');
        expect(fortress.state.context).toEqual({
            challenges: [
                {
                    authCode: 'def456',
                },
            ],
        });
        fortress.challenge({ code: '123456' });
        await fortress.waitFor('unauthenticated');

        expect(fortress.state.value).toBe('unauthenticated');
        expect(fortress.state.context).toEqual({
            challenges: [
                {
                    authCode: 'def456',
                },
            ],
        });
        expect(subscriber.mock.calls).toMatchObject([
            [
                createFortressEventSubscriber([], 'idle', {
                    type: 'xstate.init', // this is the init from xstate
                }),
            ],
            [
                createFortressEventSubscriber([], 'challenging', {
                    query: { email: 'bob@localhost', password: 'password' },
                    type: 'CHALLENGE',
                }),
            ],
            [
                createFortressEventSubscriber([{ authCode: 'def456' }], 'idle', {
                    type: 'RECHALLENGE',
                }),
            ],
            [
                createFortressEventSubscriber([{ authCode: 'def456' }], 'challenging', {
                    query: { code: '123456' },
                    type: 'CHALLENGE',
                }),
            ],
            [
                createFortressEventSubscriber([{ authCode: 'def456' }], 'unauthenticated', {
                    query: { error: new Error('Bad code') },
                    type: 'DEAUTHENTICATE',
                }),
            ],
        ]);
    });
});
