import * as React from 'react';

export interface StateValueConsumerProps<Context> {
    children: (context: Context) => React.ReactNode | React.ReactNode;
}

export function createStateValueConsumer<Context>(
    reactContext: React.Context<Context>,
    displayName: string,
) {
    const StateValue: React.SFC<StateValueConsumerProps<Context>> = ({ children }) => {
        const context = React.useContext(reactContext);
        return <>{typeof children === 'function' ? children(context) : children}</>;
    };
    StateValue.displayName = displayName;

    return StateValue;
}
