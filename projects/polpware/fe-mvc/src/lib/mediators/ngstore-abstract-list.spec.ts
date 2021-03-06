import { Store } from '@ngrx/store';

import {
    factory,
    ICollectionItem,
    ICollectionState,
    CollectionAbstractStore,
    GenericState
} from '@polpware/fe-data';

import {
    INgStoreListMediatorPublic,
    IListMediatorCtorOptions,
    NgStoreListMediator
} from './ngstore-abstract-list';

import { Observable } from 'rxjs';

interface ITestData extends ICollectionItem {
    name: string;
}

class MyStore extends CollectionAbstractStore<ITestData> {
    private _store: Store<GenericState<ITestData>>;

    constructor() {
        super();
        const store = factory<ITestData>();
        this._store = store;
    }

    getStore(): Store<GenericState<ITestData>> {
        return this._store;
    }

    getState(): Observable<ICollectionState<ITestData>> {
        return this._store.select('collection');
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
