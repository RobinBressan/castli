import { fromEventPattern, Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { EventObject, interpret, Interpreter, State, StateMachine, StateSchema } from 'xstate';

export class ObservableService<
    TContext = Record<string, any>,
    TStateSchema extends StateSchema = any,
    TEvent extends EventObject = any
> {
    public readonly state$: Observable<State<TContext, TEvent>>;
    public readonly pipe: Observable<State<TContext, TEvent>>['pipe'];
    public readonly subscribe: Observable<State<TContext, TEvent>>['subscribe'];

    private service: Interpreter<TContext, TStateSchema, TEvent>;

    constructor(machine: StateMachine<TContext, TStateSchema, TEvent>) {
        this.service = interpret(machine);
        this.state$ = fromEventPattern(
            handler => {
                this.service
                    // Listen for state transitions
                    .onTransition(handler)
                    // Start the service
                    .start();

                return this.service;
            },
            (_, service) => service.stop(),
        ).pipe(shareReplay<State<TContext, TEvent>>(1));

        this.pipe = this.state$.pipe.bind(this.state$);
        this.subscribe = this.state$.subscribe.bind(this.state$);
    }

    public send(event: TEvent) {
        this.service.send(event);
    }
}
