export type Challenge = Record<string, any>;
export type Permission = Record<string, any>;
export type User = Record<string, any>;

export interface Event<T extends string> {
    query?: Record<string, any>;
    type: T;
}

type OptionalPromise<T> = T | Promise<T>;

export interface Proxy {
    challenge(
        query: Record<string, any>,
        previousChallenges: Challenge[],
        rechallenge: () => void,
    ): OptionalPromise<Challenge>;
    provision(
        query: Record<string, any>,
        challenges: Challenge[],
    ): OptionalPromise<{ permissions: Permission[]; user: User }>;
    authorize(
        query: Record<string, any>,
        permission: Permission[],
        challenges: Challenge[],
    ): OptionalPromise<void>;
}
