import { OptionalPromise } from '@castli/core';

export interface Proxy<Query = any, Response = any> {
    request(query: Query): OptionalPromise<Response>;
}
