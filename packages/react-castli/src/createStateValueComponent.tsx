import * as React from 'react';

export interface StateValueProps {
    children: React.ReactNode;
}

interface Context<StateValue> {
    stateValue: StateValue;
}

export function createStateValueComponent<StateValue, C extends Context<StateValue> = any>(
    context: React.Context<C>,
    stateValue: StateValue,
) {
    const Component: React.SFC<StateValueProps> = ({ children }) => {
        const { stateValue: currentStateValue } = React.useContext(context);

        return stateValue === currentStateValue ? <>{children}</> : null;
    };

    return Component;
}
