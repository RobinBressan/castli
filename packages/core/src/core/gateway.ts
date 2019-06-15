import { ObservableService } from './observable-service';

/**
 * A Gateway is called by the state machine. Its purpose is to trigger calls on the proxy and,
 * depending on the response, to trigger transition in the machine by using its service
 */
export abstract class Gateway<Service extends ObservableService> {
    protected deferredService: () => Service;

    constructor(deferredService: () => Service) {
        this.deferredService = deferredService;
    }

    protected get service() {
        return this.deferredService();
    }
}
