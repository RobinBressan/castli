import { Facade } from '@castli/core';

import { BasicAuthService } from './service';

// this facade is the most generic one, but basic auth should be a boiler plate for more advanced strategy
export class BasicAuth<Query extends Record<string, any>> extends Facade<BasicAuthService<Query>> {}
