import * as dependencies from 'principleware-fe-dependencies';

import { IViewInstance } from './interfaces';

const _ = dependencies.underscore;
const noop = _.noop;

export const noopViewInstance: IViewInstance = {
    $data: {
        init: noop,
        setRefreshCallback: noop,
        setInfiniteCallback: noop,
        clean: noop,
        asyncPush: noop,
        syncPush: noop,
        asyncPop: noop,
        syncPop: noop,
        asyncPrepend: noop,
        syncPrepend: noop,
        asyncRefresh: noop,
        syncRefresh: noop,
        hasMoreData: noop,
        getItems: noop,
        setupSearch: noop,
        updateSearchCriteria: noop,
        getAncestor: noop
    },
    $loader: {
        show: noop,
        hide: noop
    },
    $refresher: {
        show: noop,
        hide: noop
    },
    $moreLoader: {
        show: noop,
        hide: noop
    },
    $router: {
        go: noop
    },
    $render: {
        ready: noop,
        destroy: noop,
        asyncDigest: noop
    },
    $navBar: {
        /**
         * Get current state
         * @returns {}
         */
        getState: noop,
        /**
         * Set state
         * @param {Boolean} s
         */
        setState: noop
    },
    $modal: {
        setData: noop,
        getData: noop,
        build: noop
    },
    $popover: {
        setData: noop,
        getData: noop,
        build: noop,
        onHidden: noop
    },
    $popup: {
        setData: noop,
        getData: noop,
        build: noop,
        confirm: noop,
        prompt: noop,
        alert: noop
    },
    $progressBar: {
        create: noop,
        reset: noop,
        createInfinite: noop,
        onProgress: noop,
        destroy: noop,
        destroyInfinite: noop,
        showAbort: noop
    },
    $alertify: noop,
    $history: {
        goBack: noop
    }
};
