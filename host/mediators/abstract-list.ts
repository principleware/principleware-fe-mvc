/**
 * @fileOverview
 * An mediator (named after the mediator pattern)
 * which coordinates views and controllers.
 * We support the following use cases:
 * 1. A page is first time loaded and then rendered
 * 2. A page is refreshed by pulling down
 * 3. A page is rendered with more data
 * 4. A page is updated after some state has changed
 *
 * Note that this is an sbtract class; you cannot create an instance of it.
 */

import * as dependencies from 'principleware-fe-dependencies';

import * as ClassBuilder from 'principleware-tinymce-tailor/src/util/Class';
import { lift as liftIntoPromise } from 'principleware-fe-utilities/src/promise/monadic-operations';
import { tojQueryDeferred } from 'principleware-fe-data/src/net/inter-op';

import { IViewInstance } from './interfaces';
import { noopViewInstance } from './noop-view-instance';

const _ = dependencies.underscore;

export interface IListMediatorCtorOptions {
    dataProvider?: any;
    dataParams?: any;
    deepCopy?: boolean;
    useModel?: boolean;
    enableRefresh: boolean;
    enableInfinite: boolean;
}

export interface IListMediatorPublic {

    dataProvider(value?: any): any;
    dataParams(value?: any): any;

    viewInsance(value?: IViewInstance): IViewInstance;

    startService(viewInsance: IViewInstance, fromCache?: boolean): void;
    stopService(): void;

    loadInitData(): PromiseLike<any>;
    refresh(isProgramatic?: boolean): PromiseLike<any>;
    loadMore(): PromiseLike<any>;

    renderData(async?: boolean): void;
}

export interface IListMediatorDev extends IListMediatorPublic {
    _settings: IListMediatorCtorOptions;
    _viewInstance: IViewInstance;
    _dataProvider: any;
    _dataParams: any;
    _deepCopy: boolean;
    _useModel: boolean;
    _enableRefresh: boolean;
    _enableInfinite: boolean;

    _stateContext: any;

    _isInit: boolean;
    _isLoadingData: boolean;

    safelyReadDataProvider(): any[];
    generateItemsInternal(collection: any): any[];

    onUpdateView(evt: any): any;
    generateItems(async?: boolean): void;

    _defaultStartService(): void;

    attachView(viewInstance): void;
    detachView(): void;

    startServiceImpl(): void;
}

export const ListMediator = ClassBuilder.extend({

    Properties: 'dataProvider,dataParams,deepCopy,useModel,enableRefresh,enableInfinite,onUpdateView,viewInstance',

    init: function(settings: IListMediatorCtorOptions) {
        const self: IListMediatorDev = this;
        self._settings = settings;
        self._viewInstance = noopViewInstance;
        self._dataProvider = settings.dataProvider || null;
        self._dataParams = settings.dataParams || {};
        self._deepCopy = settings.deepCopy || false;
        self._useModel = settings.useModel || false;
        self._enableRefresh = settings.enableRefresh || false;
        self._enableInfinite = settings.enableInfinite || false;

        self._stateContext = {};
        self._isInit = true;
        self._isLoadingData = false;
    },

    generateItemsInternal: function(collection): any[] {
        const self: IListMediatorDev = this;
        const newData = [];
        if (self._useModel) {
            collection.forEach(function(item) {
                newData.push(item);
            });
        } else if (self._deepCopy) {
            collection.forEach(function(item) {
                newData.push(_.extend({}, item.attributes));
            });
        } else {
            collection.forEach(function(item) {
                newData.push(item.attributes);
            });
        }
        return newData;
    },


    /**
     * Computes the set of models in the current data provider.
     * Note that we support all kinds of data providers, backbone
     * or something similar backbone.
     * Moreover, this method may be overriden. 
     * @returns {Array} 
     */
    safelyReadDataProvider: function(): any[] {
        const self: IListMediatorDev = this;
        let models: any;
        if (self._dataProvider.models) {
            models = self._dataProvider.models;
        } else {
            models = [];
            self._dataProvider.forEach(function(oneItem) {
                models.push(oneItem);
            });
        }
        return models;
    },

    /**
     * Generates the items for the view
     * Note that we only perform the checking in this method;
     * it is Not necessary to peform this kind of checking in other overriden generateItems.
     * @param {Boolean} async
     * @returns {} 
     */
    generateItems: function(async): void {
        const self: IListMediatorDev = this;
        const $data = self._viewInstance.$data;
        const models = self.safelyReadDataProvider();
        const newData = self.generateItemsInternal(models);
        // newData is ready
        if (async === true) {
            self.onUpdateView({
                add: true,
                source: 'remote',
                data: newData
            });
            $data.asyncPush(newData);
        } else {
            self.onUpdateView({
                add: true,
                source: 'cache',
                data: newData
            });
            $data.syncPush(newData);
        }
    },

    /**
     * Load the first page of data from the server,
     * without any loading indicator;
     * This method is used internally.
     * @function loadInitData
     * @returns {Promise} 
     */
    loadInitData: function(): PromiseLike<any> {
        const self: IListMediatorDev = this;

        const dataProvider = self._dataProvider;
        // We must reset data beforehand
        dataProvider.reset();
        // There are side effects if a parameter is passed in get*page
        // Therefore, we need to clone a new copy of this parameter
        self._isLoadingData = true;

        const dataParams = self._dataParams;
        let promise = dataProvider.getFirstPage({ data: _.extend({}, dataParams) });
        promise = tojQueryDeferred(promise);
        promise.always(function() {
            self._isInit = false;
            self._isLoadingData = false;
        });

        return promise.then(function() {
            const $data = self._viewInstance.$data;
            $data.clean();
            $data.hasMoreData(dataProvider.hasNextPage());
            self.generateItems(true /*aync*/);
            // To ensure that isLoadingData happends very late. 
        });
    },

    /**
     * Render data without any loading operations. By default, this is invoked
     * in the context of non-async mode. 
     * @param {Boolean} async
     * @function renderData
     */
    renderData: function(async?: boolean): void {
        const self: IListMediatorDev = this;
        const $data = self._viewInstance.$data;
        $data.clean();
        $data.hasMoreData(self._dataProvider.hasNextPage());
        self.generateItems(async === true);
    },

    /**
     * Reloads data as the result of pulling down operation.
     * It assumes that the user has pulled down the page, thus resetting the refreshing
     * indicator at the end.
     * @param isProgramatic {Boolean} Indicates if this invocation
     * is due to an internal call, without user interaction.
     * @function refresh
     */
    refresh: function(isProgramatic?: boolean): PromiseLike<any> {
        const self: IListMediatorDev = this;
        const $data = self._viewInstance.$data;
        const $refresher = self._viewInstance.$refresher;
        $data.hasMoreData(true);
        // Refresh loader
        $refresher.show(isProgramatic);
        const prms = self.loadInitData();
        const anotherP = tojQueryDeferred(prms);
        return anotherP.always(function() {
            $refresher.hide(isProgramatic);
        });
    },

    /**
     * Loads more data as the result of scrolling down.
     * It assumes that the user has scroll down enough, thus resetting the loading more
     * indicator at the end.
     * @function loadMore
     */
    loadMore: function(): PromiseLike<any> {

        const self: IListMediatorDev = this;
        const dataProvider = self._dataProvider;
        const dataParams = self._dataParams;
        const $data = self._viewInstance.$data;
        const $moreLoader = self._viewInstance.$moreLoader;

        // loadMore may be issued before init
        if (self._isInit) {
            $moreLoader.hide();
            return liftIntoPromise(true, null);
        }

        if (self._isLoadingData) {
            // We do not disable infinite scroll complete ...
            // because we want to prevent from two time loadMore
            // and one disable finally is sufficient to remove inifinite scroll indicator.
            return liftIntoPromise(true, null);
        }

        if (!dataProvider.hasNextPage()) {
            $data.hasMoreData(false);
            $moreLoader.hide();
            return liftIntoPromise(true, null);
        }

        $moreLoader.show();

        // We must clone a copy dataParams, as there are side
        // effects in this parameter
        self._isLoadingData = true;
        const prms = dataProvider.getNextPage({ data: _.extend({}, dataParams) }).then(function() {
            $data.hasMoreData(dataProvider.hasNextPage());
            self.generateItems(true /* async */);
            // To ensure that isLoading happends very later, we have to put isLoading in two functions.
            self._isLoadingData = false;
        }, function() {
            self._isLoadingData = false;
        });
        const anotherP = tojQueryDeferred(prms);

        return anotherP.always(function() {
            $moreLoader.hide();
        });
    },

    /**
     * Check if the context for the data provider has changed, for
     * the purpose of deciding if we need to reload data.
     * @function stateChanged
     * @returns {Boolean}
     */
    stateChanged: function() {
        const stateContext = this._stateContext;
        if (stateContext.enableSearch === true) {
            return stateContext.searchModel.isConfirmed() && stateContext.searchModel.hashCode() !== stateContext.searchCriteria.hashCode;
        }
        return true;
    },

    /**
     * Updates state and reload data, with loading indicator if set
     * @function updateStateAndReload
     */
    updateStateAndReload: function() {
        const self = this;
        const stateContext = self._stateContext;
        const $data = self._viewInstance.$data;
        const $loader = self._viewInstance.$loader;
        if (stateContext.enableSearch === true) {
            stateContext.searchCriteria = stateContext.searchModel.generateFilter();
            self.dataParams(stateContext.searchCriteria.filter);
            $data.updateSearchCriteria(stateContext.searchCriteria);
        }
        $loader.show();
        const prms = self.loadInitData();
        const anotherP = tojQueryDeferred(prms);

        anotherP.always(function() {
            $loader.hide();
        });
    },

    /**
     * Sets up context and hooks up data with view.
     * This method is only invoked once and should be one of the steps following constructor.
     * In other words, it is part of a constructor. 
     * @param {Object} options
     */
    setUp: function(options) {
        const self = this;

        options = options || {};

        if (options.enableSearch) {
            self._stateContext.enableSearch = true;
            // We expect the following properties
            // chai.expect(options).to.have.property('searchSettings');
            // chai.expect(options.searchSettings).to.have.property('searchModel');
            // chai.expect(options.searchSettings).to.have.property('searchModelGuid');
            // chai.expect(options.searchSettings).to.have.property('searchURL');
            // Create our state context
            // Keep the search settings into the state context,
            // because these settings are used later for deciding if we
            // need to recompute data parameters or not
            const searchSettings = options.searchSettings;
            self._stateContext.searchURL = searchSettings.searchURL;
            self._stateContext.searchModelGuid = searchSettings.searchModelGuid;
            self._stateContext.searchModel = searchSettings.searchModel;
            self._stateContext.searchCriteria = searchSettings.searchModel.generateFilter();
            self.dataParams(self._stateContext.searchCriteria.filter);
        }
    },

    /**
     * A destructor. 
     */
    tearDown: function() {
        const self: IListMediatorDev = this;
        if (self._dataProvider && self._dataProvider.off) {
            // Discard all listening
            self._dataProvider.off('all');
            // Discard all data
            self._dataProvider.reset();
        }
    },

    /**
     * Start to bind a view to this mediator.
     */
    attachView: function(viewInstance): void {
        const self: IListMediatorDev = this;
        self._viewInstance = viewInstance;

        const $data = self._viewInstance.$data;
        if (self._enableRefresh) {
            $data.setRefreshCallback(function() {
                self.refresh();
            });
        }
        if (self._enableInfinite) {
            $data.setInfiniteCallback(function() {
                self.loadMore();
            });
        }
        if (self._stateContext.enableSearch) {
            $data.setupSearch(self._stateContext.searchCriteria, function() {
                self._viewInstance.$router.go(self._stateContext.searchURL, {
                    dataId: self._stateContext.searchModelGuid
                });
            });
        }

        $data.init();
    },

    detachView: function(): void {
        const self: IListMediatorDev = this;
        self._viewInstance = noopViewInstance;
    },

    _defaultStartService: function(): void {
        const self: IListMediatorDev = this;
        const $loader = self._viewInstance.$loader;
        $loader.show();
        const promise = self.loadInitData();
        const anotherP = tojQueryDeferred(promise);
        anotherP.always(function() {
            $loader.hide();
        });
    },

    /**
     * This method needs to be overrided. 
     */
    startServiceImpl: function(): void {
        const self: IListMediatorDev = this;
        self._defaultStartService();
    },

    startService: function(viewInsance: IViewInstance, fromCache?: boolean): void {
        const self: IListMediatorDev = this;
        self.attachView(viewInsance);
        if (fromCache === true) {
            self.renderData();
        } else {
            self.startServiceImpl();
        }
    },

    stopService: function(): void {
        const self = this;
        self.detachView();
    }

});







