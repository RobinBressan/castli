import { Proxy } from '../types';

type Response = Record<string, any> | Error;

function compile(response?: Response) {
    if (!response) {
        return Promise.resolve();
    }

    if (response instanceof Error) {
        return Promise.reject(response);
    }

    return Promise.resolve(response);
}

export function createTestProxy(
    responses: Partial<Record<'challenge' | 'provision', Response>>,
): Proxy {
    return {
        challenge: jest.fn().mockImplementation(() => compile(responses.challenge)),
        provision: jest.fn().mockImplementation(() => compile(responses.provision)),
    };
}
