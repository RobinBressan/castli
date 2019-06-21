import { Fortress as FortressClass, FortressStateValue } from '@castli/core';
import { TestStrategy } from '@castli/test-utils';
import * as rtl from '@testing-library/react';
import * as React from 'react';
import { queueScheduler } from 'rxjs';

import { Fortress, FortressProps, Strategy } from '../..';

function render(guard: FortressProps['guard'], onReady: FortressProps['onReady']) {
    const format = (stateValue: FortressStateValue) => `I am ${stateValue}`;
    const strategy = new TestStrategy();

    const wrapper = rtl.render(
        <Fortress strategy={strategy} guard={guard} onReady={onReady} scheduler={queueScheduler}>
            <div>
                <Fortress.Idle>{format('idle')}</Fortress.Idle>
                <Fortress.Unauthenticated>{format('unauthenticated')}</Fortress.Unauthenticated>
                <Fortress.Challenging>{format('challenging')}</Fortress.Challenging>
                <Fortress.Authenticated>{format('authenticated')}</Fortress.Authenticated>
            </div>
            <div>
                <Strategy stateValue="committed">I am committed</Strategy>
                <Strategy stateValue="rollbacked">I am rollbacked</Strategy>
            </div>
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
            (fortress.strategy as TestStrategy).commit();
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

        const { getByStateValue } = render(guard, onReady);

        expect(onReady).toHaveBeenCalledTimes(1);

        const fortress = onReady.mock.calls[0][0] as FortressClass;
        rtl.act(() => {
            fortress.challenge({ email: 'bob@localhost', password: 'password' });
            (fortress.strategy as TestStrategy).rollback();
        });

        await rtl.wait(() => getByStateValue('unauthenticated'));

        expect(getByStateValue('unauthenticated')).toBeInTheDocument();
        expect(() => getByStateValue('idle')).toThrowError();
        expect(() => getByStateValue('challenging')).toThrowError();
        expect(() => getByStateValue('authenticated')).toThrowError();
    });

    describe('<Strategy />', () => {
        it('should correctly render when test strategy is committed', async () => {
            expect.assertions(3);

            const guard = jest.fn().mockReturnValue(true);
            const onReady = jest.fn();

            const { getByText } = render(guard, onReady);

            expect(onReady).toHaveBeenCalledTimes(1);

            const fortress = onReady.mock.calls[0][0] as FortressClass;
            rtl.act(() => {
                fortress.challenge({ email: 'bob@localhost', password: 'password' });
                (fortress.strategy as TestStrategy).commit();
            });

            await rtl.wait(() => getByText('I am committed'));

            expect(getByText('I am committed')).toBeInTheDocument();
            expect(() => getByText('I am rollbacked')).toThrowError();
        });

        it('should correctly render when test strategy is rollbacked', async () => {
            expect.assertions(3);

            const guard = jest.fn().mockReturnValue(true);
            const onReady = jest.fn();

            const { getByText } = render(guard, onReady);

            expect(onReady).toHaveBeenCalledTimes(1);

            const fortress = onReady.mock.calls[0][0] as FortressClass;
            rtl.act(() => {
                fortress.challenge({ email: 'bob@localhost', password: 'password' });
                (fortress.strategy as TestStrategy).rollback();
            });

            await rtl.wait(() => getByText('I am rollbacked'));

            expect(getByText('I am rollbacked')).toBeInTheDocument();
            expect(() => getByText('I am committed')).toThrowError();
        });
    });
});
