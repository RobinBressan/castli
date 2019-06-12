import { cloneDeep } from 'lodash';

import { FortressContext, FortressEvent } from './machine';
import { FortressService } from './service';

import { Gateway } from '../core/gateway';

export class FortressGateway extends Gateway<FortressService> {
    public async challenge(context: FortressContext, event: FortressEvent) {
        // depending on the proxy auth flow, we might need to perform several challenge requests
        // to achieve this, we provide to the proxy a lambda which will tamper with the next event to be dispachted in the service
        let nextEvent: FortressEvent['type'] = 'AUTHENTICATE';
        const rechallenge = () => (nextEvent = 'RECHALLENGE');

        try {
            const response = await this.proxy.challenge(
                event.query,
                cloneDeep(context.challenges),
                rechallenge,
            );
            context.challenges.push(response);
            this.service.sendEvent(nextEvent);
        } catch (error) {
            this.service.deauthenticate({ error });
        }
    }
}
