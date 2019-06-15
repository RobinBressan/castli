import { FortressService } from '../fortress/service';

export abstract class Strategy<
    Query extends Record<string, any> = Record<string, any>,
    Response extends Record<string, any> = Record<string, any>
> {
    private fortressService: FortressService<Response>;

    public injectFortressService(fortressService: FortressService<Response>) {
        if (this.fortressService) {
            throw new Error('Fortress service can be injected only once');
        }
        this.fortressService = fortressService;
    }

    public abstract start(query: Query);

    protected authenticate(query: Response) {
        this.fortressService.authenticate(query);
    }

    protected deauthenticate(query: Record<string, any>) {
        this.fortressService.deauthenticate(query);
    }
}
