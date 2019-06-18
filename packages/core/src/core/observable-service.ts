import { cloneDeep } from 'lodash';
import {
    fromEventPattern,
    interval,
    Observable,
    queueScheduler,
    SchedulerLike,
    Subject,
} from 'rxjs';
import { delayWhen, filter, first, map, observeOn, shareReplay } from 'rxjs/operators';
import {
    EventObject,
    interpret,
    Interpreter,
    State,
    StateMachine,
    StateSchema as BaseStateSchema,
} from 'xstate';

/**
 * An ObservableService is an observable wrapper around a state machine service.
 * It handle the initialization of the service, and handle the dispatch of event in it.
 */
export abstract class ObservableService<
    Context extends Record<string, any> = Record<string, any>,
    Event extends EventObject = EventObject,
    StateSchema extends BaseStateSchema = any
> {
    public readonly scheduler: SchedulerLike;
    private state$: Observable<[State<Context, Event>, Event]>;

    private service: Interpreter<Context, StateSchema, Event>;
    private event$ = new Subject<Event | Event['type']>();

    constructor(
        machine: StateMachine<Context, StateSchema, Event>,
        scheduler: SchedulerLike = queueScheduler,
    ) {
        this.scheduler = scheduler;
        this.service = interpret(machine);

        this.start();
    }

    get state() {
        return this.service.state;
    }

    get pipe(): Observable<[State<Context, Event>, Event]>['pipe'] {
        return this.state$.pipe.bind(this.state$);
    }

    get subscribe(): Observable<[State<Context, Event>, Event]>['subscribe'] {
        return this.state$.subscribe.bind(this.state$);
    }

    public dispose() {
        this.service.stop();
        this.event$.complete();
    }

    public restart() {
        this.service.stop();
        this.start();
    }

    public sendEvent(event: Event | Event['type']) {
        this.event$.next(event);
    }

    public waitFor$(stateValue: keyof StateSchema['states']) {
        return this.state$.pipe(
            filter(value => {
                const [state] = value;
                return (state.value as keyof StateSchema['states']) === stateValue;
            }),
            first(),
        );
    }

    private start() {
        this.state$ = fromEventPattern(
            handler => {
                this.service.onTransition(handler).start();
                return this.service;
            },
            (_, service) => service.stop(),
        ).pipe(
            observeOn(this.scheduler),
            // we want to store the last emission, to ensure its new subscriber get notified with it
            // this way, late subscribers don't get out of sync
            shareReplay<[State<Context, Event>, Event]>(1),
            map(value => cloneDeep(value)),
        );

        // we poll the service to get a complete observable once initialized
        const serviceInitialized$ = interval(1, this.scheduler).pipe(
            filter(() => this.service.initialized),
            first(),
        );

        this.event$ = new Subject<Event | Event['type']>();

        // we don't link the event observable to the scheduler as it is just a queue to handle service initialization. Btw, the transition will be
        // performed within the scheduler
        this.event$.pipe(delayWhen(() => serviceInitialized$)).subscribe(event => {
            this.service.send(event);
        });
    }
}
