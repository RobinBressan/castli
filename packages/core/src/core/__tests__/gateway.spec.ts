import { Gateway } from '../gateway';

class TestGateway extends Gateway<any> {
    constructor(fakeService: any) {
        super(() => fakeService);
    }

    public getService() {
        return this.service;
    }
}

describe('Gateway', () => {
    it('should expose the service as a protected variable this.variable', () => {
        expect.assertions(1);

        const gateway = new TestGateway('fakeService');
        expect(gateway.getService()).toBe('fakeService');
    });
});
