export type Challenge = Record<string, any>;

export interface Event<T extends string> {
    query?: Record<string, any>;
    type: T;
}

export type OptionalPromise<T> = T | Promise<T>;

export interface Proxy<Query = any, Response = any> {
    request(query: Query): OptionalPromise<Response>;
}
