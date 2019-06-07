import { fromEventPattern, Observable, Subject } from 'rxjs';
// import { delayWhen, first, takeWhile } from 'rxjs/operators';
import { shareReplay, takeWhile } from 'rxjs/operators';
import { EventObject, interpret, Interpreter, State, StateMachine, StateSchema } from 'xstate';

type StateSanitizer<TContext, TEvent extends EventObject> = (
    state: State<TContext, TEvent>,
) => Record<string, any>;

export class ObservableService<
    TContext = Record<string, any>,
    TStateSchema extends StateSchema = any,
    TEvent extends EventObject = any
> {
    public readonly state$: Observable<[State<TContext, TEvent>, TEvent]>;
    public readonly pipe: Observable<[State<TContext, TEvent>, TEvent]>['pipe'];
    public readonly subscribe: Observable<[State<TContext, TEvent>, TEvent]>['subscribe'];

    private service: Interpreter<TContext, TStateSchema, TEvent>;
    private event$ = new Subject<TEvent | TEvent['type']>();
    private stateSanitizer: StateSanitizer<TContext, TEvent>;

    constructor(
        machine: StateMachine<TContext, TStateSchema, TEvent>,
        stateSanitizer: StateSanitizer<TContext, TEvent> = state => ({
            context: state.context,
            value: state.value,
        }),
    ) {
        this.service = interpret(machine);
        this.state$ = fromEventPattern(
            handler => {
                this.service.onTransition(handler).start();
                return this.service;
            },
            (_, service) => service.stop(),
        ).pipe(shareReplay<[State<TContext, TEvent>, TEvent]>(1));

        this.stateSanitizer = stateSanitizer;

        this.pipe = this.state$.pipe.bind(this.state$);
        this.subscribe = this.state$.subscribe.bind(this.state$);

        this.event$.subscribe(event => this.service.send(event));
    }

    get state() {
        return this.stateSanitizer(this.service.state);
    }

    public send(event: TEvent | TEvent['type']) {
        this.event$.next(event);
    }

    public waitFor(stateValue: keyof TStateSchema['states']) {
        return this.state$
            .pipe(
                takeWhile(value => {
                    const [state] = value;
                    return state.value !== stateValue;
                }),
            )
            .toPromise();
    }
}
