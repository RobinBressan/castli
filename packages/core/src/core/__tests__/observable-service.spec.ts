import { Machine } from 'xstate';
import { ObservableService } from '../observable-service';

class TestService extends ObservableService {
    constructor(machine) {
        super(machine);
    }
}

describe('ObservableService', () => {
    it('should trigger a transition on the machine when sendEvent() is called', async () => {
        expect.assertions(2);

        const machine = Machine({
            id: 'test',
            initial: 'idle',
            states: {
                foo: {},
                idle: {
                    on: {
                        FOO: 'foo',
                    },
                },
            },
        });

        const service = new TestService(machine);
        expect(service.state.value).toEqual('idle');

        service.sendEvent('FOO');
        await service.waitFor$('foo').toPromise();

        expect(service.state.value).toEqual('foo');
    });

    it('should reset the machine when restart() is called', async () => {
        expect.assertions(1);

        const machine = Machine({
            id: 'test',
            initial: 'idle',
            states: {
                foo: {},
                idle: {
                    on: {
                        FOO: 'foo',
                    },
                },
            },
        });

        const service = new TestService(machine);
        service.sendEvent('FOO');
        await service.waitFor$('foo').toPromise();
        service.restart();
        await service.waitFor$('idle').toPromise();

        expect(service.state.value).toEqual('idle');
    });
});
