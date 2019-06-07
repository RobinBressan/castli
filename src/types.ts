export type Challenge = Record<string, any>;
export type Permission = Record<string, any>;
export type User = Record<string, any>;

export interface Event<T extends string> {
    query?: Record<string, any>;
    type: T;
}

export interface Proxy {
    challenge(query: Record<string, any>): Promise<Challenge>;
    provision(
        query: Record<string, any>,
        challenge: Challenge,
    ): Promise<{ permissions: Permission[]; user: User }>;
    authorize(
        query: Record<string, any>,
        permission: Permission[],
        challenge: Challenge,
    ): Promise<void>;
}
