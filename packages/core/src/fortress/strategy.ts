import { FortressService } from '../fortress/service';

export abstract class Strategy<
    Query extends Record<string, any> = Record<string, any>,
    Response extends Record<string, any> = Record<string, any>
> {
    private fortressService: FortressService<Response>;

    public injectFortressService(fortressService: FortressService<Response>) {
        this.fortressService = fortressService;

        return this;
    }

    public abstract begin(query: Query);

    protected get scheduler() {
        return this.fortressService.scheduler;
    }

    protected commit(query: Response) {
        this.fortressService.sendEvent({ type: 'AUTHENTICATE', query });
    }

    protected rollback(query: Record<string, any>) {
        this.fortressService.sendEvent({ type: 'DEAUTHENTICATE', query });
    }
}
