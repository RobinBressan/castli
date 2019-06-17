import { SchedulerLike } from 'rxjs';
import { Facade } from '../core/facade';
import { ObservableService } from '../core/observable-service';
import { FortressService } from '../fortress/service';

export abstract class Strategy<
    Query extends Record<string, any> = Record<string, any>,
    Response extends Record<string, any> = Record<string, any>
> {
    public facade: Facade<ObservableService>;

    protected service: ObservableService;
    private fortressService: FortressService<Response>;
    private serviceFactory: (scheduler: SchedulerLike) => ObservableService;

    constructor(serviceFactory: (scheduler: SchedulerLike) => ObservableService) {
        this.serviceFactory = serviceFactory;
    }

    public injectService(service: ObservableService) {
        this.facade = new Facade(service);
        this.service = service;
    }

    public boot(fortressService: FortressService<Response>) {
        this.fortressService = fortressService;
        this.service = this.serviceFactory(this.fortressService.scheduler);
        this.facade = new Facade(this.service);

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
