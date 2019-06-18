import { Facade } from '../core/facade';
import { ObservableService } from '../core/observable-service';

export abstract class Strategy<
    Query extends Record<string, any> = Record<string, any>,
    Response extends Record<string, any> = Record<string, any>
> extends Facade<ObservableService> {
    public abstract begin(
        query: Query,
        commit: (query: Response) => void,
        rollback: (query: Record<string, any>) => void,
    );
}
