import { fromEvent, Subscription } from 'rxjs';
import { debounceTime, buffer, map } from 'rxjs/operators';

import * as hInterface from '@polpware/fe-dependencies';

import { pushArray } from '@polpware/fe-utilities/dist';

import {
    IWritableListMediatorDev,
    IChangeSet,
    WritableListMediator,
    IWritableListMediatorCtorOptions
} from './writable-abstract-list';

const _ = hInterface.underscore;

export interface IRxjsPoweredDirContentMediatorDev extends IWritableListMediatorDev {
    _emitEventDelay: number;
    _globalSubr: Subscription;
}

interface IFullChangeSet extends IChangeSet {
    add: boolean;
    remove: boolean;
    merge: boolean;
}

function mergeArgs(data: any[]): IChangeSet {
    const finalSet: IFullChangeSet = {
        add: false,
        remove: false,
        merge: false,
        changes: {
            added: [],
            removed: [],
            merged: []
        }
    };
    data.forEach((elem: any[]) => {
        const changeSet: IChangeSet = elem[1];
        if (changeSet.changes.added && changeSet.changes.added.length > 0) {
            pushArray(finalSet.changes.added, changeSet.changes.added);
            finalSet.add = true;
        }
        if (changeSet.changes.removed && changeSet.changes.removed.length > 0) {
            pushArray(finalSet.changes.removed, changeSet.changes.removed);
            finalSet.remove = true;
        }
        if (changeSet.changes.merged && changeSet.changes.merged.length > 0) {
            pushArray(finalSet.changes.merged, changeSet.changes.merged);
            finalSet.merge = true;
        }
    });

    return finalSet;
}

export const RxjsPoweredWritableListMediator = WritableListMediator.extend({
    Properties: 'globalSubr, emitEventDelay',

    init: function(settings: IWritableListMediatorCtorOptions) {
        const self: IRxjsPoweredDirContentMediatorDev = this;
        self._super(settings);
        self._globalSubr = null;
        self._emitEventDelay = 1000;
    },

    /**
         * Starts to listen to the change on the global provider.
         * It is usually used internally on setting up this mediator.
         * @param {Object} globalProvider
         */
    startListeningGlobalProvider: function(globalProvider) {
        const self: IRxjsPoweredDirContentMediatorDev = this;
        self._globalProvider = globalProvider;

        const eventObserver = fromEvent(globalProvider, 'update');
        const ctrlObserver = eventObserver.pipe(debounceTime(self._emitEventDelay));

        self._globalSubr = eventObserver.pipe(
            buffer(ctrlObserver),
            map((col) => {
                const x = mergeArgs(col);
                return x;
            })
        ).subscribe(args => {
            self.onGlobalProviderUpdate.apply(self, [null, args]);
        });
    },

    /**
        * Stops listening to the change on the global provider.
        * It is usally used on the tearing down this mediator.
        */
    stopListeningGlobalProvider: function() {
        const self: IRxjsPoweredDirContentMediatorDev = this;
        const globalProvider = self._globalProvider;
        if (self._globalSubr) {
            self._globalSubr.unsubscribe();
            self._globalSubr = null;
        }
    }

});

