import { cloneDeep } from 'lodash';
import {
    fromEventPattern,
    interval,
    Observable,
    queueScheduler,
    SchedulerLike,
    Subject,
} from 'rxjs';
import { delayWhen, filter, first, map, observeOn, shareReplay, takeWhile } from 'rxjs/operators';
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
    public readonly state$: Observable<[State<Context, Event>, Event]>;
    public readonly pipe: Observable<[State<Context, Event>, Event]>['pipe'];
    public readonly subscribe: Observable<[State<Context, Event>, Event]>['subscribe'];

    private service: Interpreter<Context, StateSchema, Event>;
    private event$ = new Subject<Event | Event['type']>();

    constructor(
        machine: StateMachine<Context, StateSchema, Event>,
        scheduler: SchedulerLike = queueScheduler,
    ) {
        this.service = interpret(machine, { execute: false });

        this.state$ = fromEventPattern(
            handler => {
                this.service.onTransition(handler).start();
                return this.service;
            },
            (_, service) => service.stop(),
        ).pipe(
            observeOn(scheduler),
            // we want to store the last emission, to ensure its new subscriber get notified with it
            // this way, late subscribers don't get out of sync
            shareReplay<[State<Context, Event>, Event]>(1),
            map(value => cloneDeep(value)),
        );

        this.pipe = this.state$.pipe.bind(this.state$);
        this.subscribe = this.state$.subscribe.bind(this.state$);

        // we poll the service to get a complete observable once initialized
        const serviceInitialized$ = interval(1, scheduler).pipe(
            filter(() => this.service.initialized),
            first(),
        );

        this.service.onTransition(state => {
            scheduler.schedule(() => this.service.execute(state));
        });

        this.event$
            .pipe(
                observeOn(scheduler),
                delayWhen(() => serviceInitialized$),
            )
            .subscribe(event => {
                this.service.send(event);
            });
    }

    get state() {
        return this.service.state;
    }

    public sendEvent(event: Event | Event['type']) {
        this.event$.next(event);
    }

    public waitFor(stateValue: keyof StateSchema['states']) {
        return this.state$
            .pipe(
                takeWhile(value => {
                    const [state] = value;
                    return (state.value as any) !== stateValue;
                }),
            )
            .toPromise();
    }
}
