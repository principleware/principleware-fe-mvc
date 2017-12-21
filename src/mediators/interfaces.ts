export interface IViewInstance {
    $data: {
        init: any,
        setRefreshCallback: any,
        setInfiniteCallback: any,
        clean: any,
        asyncPush: any,
        syncPush: any,
        asyncPop: any,
        syncPop: any,
        asyncPrepend: any,
        syncPrepend: any,
        asyncRefresh: any,
        syncRefresh: any,
        hasMoreData: any,
        getItems: any,
        setupSearch: any,
        updateSearchCriteria: any,
        getAncestor: any
    },
    $loader: {
        show: any,
        hide: any
    },
    $refresher: {
        show: any,
        hide: any
    },
    $moreLoader: {
        show: any,
        hide: any
    },
    $router: {
        go: any
    },
    $render: {
        ready: any,
        destroy: any,
        asyncDigest: any
    },
    $navBar: {
        /**
         * Get current state
         * @returns {} 
         */
        getState: any,
        /**
         * Set state
         * @param {Boolean} s
         */
        setState: any
    },
    $modal: {
        setData: any,
        getData: any,
        build: any
    },
    $popover: {
        setData: any,
        getData: any,
        build: any,
        onHidden: any
    },
    $popup: {
        setData: any,
        getData: any,
        build: any,
        confirm: any,
        prompt: any,
        alert: any
    },
    $progressBar: {
        create: any,
        reset: any,
        createInfinite: any,
        onProgress: any,
        destroy: any,
        destroyInfinite: any,
        showAbort: any
    },
    $alertify: any,
    $history: {
        goBack: any
    }
}
