import { Store } from '@ngrx/store';
import { factory } from 'polpware-fe-data/src/generic-store/factory';
import {
    ICollectionItem,
    ICollectionState
} from 'polpware-fe-data/src/generic-store/collection-action-def';
import {
    CollectionAbstractStore
} from 'polpware-fe-data/src/generic-store/collection-abstract.store';


import {
    INgStoreListMediatorPublic,
    IListMediatorCtorOptions,
    NgStoreListMediator
} from './ngstore-abstract-list';

interface ITestData extends ICollectionItem {
    name: string;
}

class MyStore extends CollectionAbstractStore<ITestData> {
    private _store: Store<ICollectionState<ITestData>>;

    constructor() {
        super();
        const store = factory<ITestData>();
        const realStore = store.select('collection');
        this._store = realStore;
    }

    getState(): Store<ICollectionState<ITestData>> {
        return this._store;
    }
}

describe('ngstore list mediator ctor', () => {
    it('ctor', () => {
        const options: IListMediatorCtorOptions = {
            enableRefresh: true,
            enableInfinite: true
        };
        const m: INgStoreListMediatorPublic = new NgStoreListMediator(options);

        expect(m).toBeDefined();

        expect(m.setNgStore).toBeDefined();
        expect(m.getNgStore).toBeDefined();

    });
});


describe('ngstore list mediator store', () => {


    const mediator: INgStoreListMediatorPublic = new NgStoreListMediator({
        enableRefresh: true,
        enableInfinite: true
    });

    const mystore = new MyStore();

    mediator.setNgStore(mystore);

    mystore.add([{
        id: 1,
        name: 'test'
    }]);

    it('one item in store', (done) => {
        mediator.getNgStore().getState().subscribe(x => {
            done();
            expect(x.items.length).toBe(1);
        });
    });

});
