import {
    IListMediatorCtorOptions,
    ListMediator
} from './abstract-list';


describe('list mediator', () => {
    it('ctor', () => {
        const options: IListMediatorCtorOptions = {
            enableRefresh: true,
            enableInfinite: true
        };
        const m = new ListMediator(options);

        expect(m).toBeDefined();

    });
});

