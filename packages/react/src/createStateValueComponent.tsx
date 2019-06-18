import * as React from 'react';

type Renderer<Context> = (context: Context) => React.ReactNode;

export interface StateValueProps<Context> {
    children: Renderer<Context> | React.ReactNode;
}

interface ReactContext<StateValue, Context> {
    context: Context;
    stateValue: StateValue;
}

export function createStateValueComponent<
    StateValue,
    Context = Record<string, any>,
    RC extends ReactContext<StateValue, Context> = any
>(reactContext: React.Context<RC>, stateValue: StateValue) {
    const Component: React.SFC<StateValueProps<Context>> = ({ children }) => {
        const { context, stateValue: currentStateValue } = React.useContext(reactContext);
        return stateValue === currentStateValue ? (
            <>
                {typeof children === 'function'
                    ? (children as Renderer<Context>)(context)
                    : children}
            </>
        ) : null;
    };

    return Component;
}
