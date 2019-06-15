import { Proxy } from '@castli/core';
import { flatten } from 'lodash';

type Response = Record<string, any> | Error | (() => Response);

function compile(response?: Response) {
    if (!response) {
        return Promise.resolve();
    }

    if (response instanceof Error) {
        return Promise.reject(response);
    }

    return Promise.resolve(response);
}

function createMock(response: Response | Response[]) {
    let mock = jest.fn();
    flatten([response]).forEach(value => {
        mock = mock.mockImplementationOnce(async () => {
            const result = compile(await (typeof value === 'function' ? value() : value));
            return result;
        });
    });
    return mock;
}

export function createTestProxy(response: Response | Response[]): Proxy {
    return {
        request: createMock(response),
    };
}
