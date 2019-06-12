import * as React from 'react';

export type HookResolver<StateValues, Context, OwnProps> = (
    ownProps?: OwnProps,
) => () => { context: Context; value: StateValues };

export interface ProviderProps<StateValues, Context> {
    children: React.ReactNode;
    onStateChange(value: StateValues, context: Context): void;
}

export function createProvider<Context, StateValues, OwnProps = any>(
    reactContext: React.Context<Context>,
    formatter: (value: StateValues) => string,
    hookResolver: HookResolver<StateValues, Context, OwnProps>,
) {
    const Provider: React.SFC<ProviderProps<StateValues, Context> & OwnProps> = ({
        children,
        onStateChange,
        ...ownProps
    }) => {
        const useHook = hookResolver(ownProps as any);
        const { context, value } = useHook();

        React.useEffect(() => {
            onStateChange(value, context);
        }, [value]);

        return (
            <reactContext.Provider value={context}>
                {React.Children.toArray(children).filter(
                    child => (child as any).type.displayName === formatter(value),
                )}
            </reactContext.Provider>
        );
    };

    return Provider;
}
