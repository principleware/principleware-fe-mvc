import {
    ICollectionItem
} from 'principleware-fe-data/src/generic-store/collection-action-def';

import {
    ICollectionStore
} from 'principleware-fe-data/src/generic-store/collection-store.interface';

import {
    ListMediator,
    IListMediatorCtorOptions,
    IListMediatorPublic,
    IListMediatorDev
} from './abstract-list';

export { IListMediatorCtorOptions } from './abstract-list';

export interface INgStoreListMediatorPublic extends IListMediatorPublic {
    setNgStore<T extends ICollectionItem>(store: ICollectionStore<T>): void;
    getNgStore<T extends ICollectionItem>(): ICollectionStore<T>;
}

export interface INgStoreListMediatorDev extends IListMediatorDev {
    _ngStore: ICollectionStore<any>;
    _super(value?: any): any;
}

export const NgStoreListMediator = ListMediator.extend({

    init: function(settings: IListMediatorDev) {
        const self: INgStoreListMediatorDev = this;
        self._super(settings);
        self._ngStore = null;
    },

    setNgStore: function <T extends ICollectionItem>(store: ICollectionStore<T>): void {
        const self: INgStoreListMediatorDev = this;
        self._ngStore = store;
    },

    getNgStore: function <T extends ICollectionItem>(): ICollectionStore<T> {
        const self: INgStoreListMediatorDev = this;
        return self._ngStore;
    },

    safelyReadDataProvider: function(): any[] {
        const self: INgStoreListMediatorDev = this;
        const models = self._super();
        // Safely push these models into view level data provider
        self._ngStore.add(models);
        // Then return
        return models;
    }
});
