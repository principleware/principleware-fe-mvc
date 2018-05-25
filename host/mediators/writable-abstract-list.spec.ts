import {
    IWritableListMediatorCtorOptions,
    WritableListMediator
} from './writable-abstract-list';

describe('writable list mediator', () => {
    it('ctor', () => {
        const options: IWritableListMediatorCtorOptions = {
            enableRefresh: true,
            enableInfinite: true
        };
        const m = new WritableListMediator(options);

        expect(m).toBeDefined();

    });
});
