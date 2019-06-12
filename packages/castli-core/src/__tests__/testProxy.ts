import { flatten, get } from 'lodash';
import { Proxy } from '../../';

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

function createMock(
    response: Response | Response[],
    postHook?: (index: number, ...args: any[]) => void,
) {
    let mock = jest.fn();
    flatten([response]).forEach((value, index) => {
        mock = mock.mockImplementationOnce((...args) => {
            const result = compile(value);
            if (postHook) {
                postHook(index, ...args);
            }
            return result;
        });
    });
    return mock;
}

export function createTestProxy(
    responses: Partial<Record<'challenge' | 'provision', Response>>,
): Proxy {
    return {
        challenge: createMock(
            responses.challenge,
            (index, _, __, rechallenge) =>
                index < get(responses, 'challenge', []).length - 1 && rechallenge(),
        ),
        provision: createMock(responses.provision),
    };
}
