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
        let m = new WritableListMediator(options);

        expect(m).toBeDefined();

    });
});
