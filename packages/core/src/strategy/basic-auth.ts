import { Proxy } from '../core/types';
import { Strategy } from '../fortress';

export class BasicAuthStrategy<
    Query extends Record<string, any> = Record<string, any>,
    Response extends Record<string, any> = Record<string, any>
> extends Strategy<Query, Response> {
    private proxy: Proxy<Query, Response>;

    constructor(proxy: Proxy<Query, Response>) {
        super();
        this.proxy = proxy;
    }

    public async start(query?: Query) {
        try {
            const response = await this.proxy.request(query);
            this.authenticate(response);
        } catch (error) {
            this.deauthenticate({ error });
        }
    }
}
