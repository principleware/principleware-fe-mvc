/**
 * @fileOverview
 * This module implements a list mediator that may quickly
 * get updated on any operation in this list.
 * E.g., add, remove, update
 */


import * as dependencies from 'principleware-fe-dependencies';
import { AbstractListCtor } from './abstract-list';

const _ = dependencies.underscore;
const backbone = dependencies.backbone;

export const WritableAbstractListCtor = AbstractListCtor.extend({

    Properties: 'viewLevelData',

    init: function(settings) {
        var self = this,
            CollectionCtor = backbone.Collection.extend();
        self._super(settings);
        self._viewLevelData = new CollectionCtor();
        self._viewProviderListeners = {};
        self._globalProvider = settings.globalProvider || null;
        self._globalProviderListeners = {};
        self._filterFlags = settings.filterFlags || { added: true, removed: true, updated: true };
    },

    /**
     * A filter on the global data provider.
     * @returns {Boolean} 
     */
    globalProviderFilter: function(evtCtx, changeSet, rest) {
        /*jslint unparam:true */
        var self = this;
        if (self._filterFlags.added &&
            changeSet.changes.added &&
            changeSet.changes.added.length > 0) {
            return changeSet;
        }
        if (self._filterFlags.removed &&
            changeSet.changes.removed &&
            changeSet.changes.removed.length > 0) {
            return changeSet;
        }
        if (self._filterFlags.updated &&
            changeSet.changes.merged &&
            changeSet.changes.merged.length > 0) {
            return changeSet;
        }
        return null;
    },

    /**
     * An internal method for listening to any change on the
     * global provider. Listening to the sole update event is
     * sufficient and efficent.
     * @param {Object} args
     */
    onGlobalProviderUpdate: function() {
        /*jslint unparam:true */
        var self = this, candidate,
            args = arguments,
            changeSet;
        // If we are loading data, the data we are receiving is
        // the result of the current loading behavior.
        // We do not need to do anything. Instead, the loading behavior
        // is responsible for rending data. 
        if (self._isLoadingData) {
            return;
        }
        // Shortcircuit
        changeSet = self.globalProviderFilter.apply(self, args);
        if (!changeSet) {
            return;
        }
        // The interface of changeSet is determined by the above filter
        // method. However, the below view provider listener must be careful.
        // Changes
        if (changeSet.add) {
            candidate = _.filter(changeSet.changes.added, function(thisItem) {
                return !_.some(self._viewLevelData.models, function(thatItem) {
                    return thisItem.id === thatItem.id;
                });
            });
            if (candidate.length > 0) {
                self._viewLevelData.add(candidate);
            }
        }
        if (changeSet.remove) {
            self._viewLevelData.remove(changeSet.changes.removed);
        }
        if (changeSet.merge) {
            // Keep propagating
            self._viewLevelData.trigger('update', changeSet.changes);
        }
    },

    /**
     * An internal method for listening to the change on the view
     * data provider. Usually, such kind of listening shall be stopped
     * when there is no view binding to the current midiator list. 
     * @param {Object} args
     */
    onViewProviderUpdate: function(evtCtx, changeSet, rest) {
        /*jslint unparam:true */
        var self = this,
            $data = self._viewInstance.$data,
            newData;
        // Note that the interface of changeSet varies from
        // events to events in Backbone. We have to be very careful.
        if (changeSet.changes.added && changeSet.changes.added.length > 0) {
            // Check if we have data or not 
            newData = self.generateItemsInternal(changeSet.changes.added);
            self.onUpdateView({
                add: true,
                source: 'event',
                data: newData
            });
            $data.asyncPrepend(newData);
        }
        if (changeSet.changes.removed && changeSet.changes.removed.length > 0) {
            newData = self.generateItemsInternal(changeSet.changes.removed);
            self.onUpdateView({
                remove: true,
                source: 'event',
                data: newData
            });
            $data.asyncPop(newData);
        }
        if (changeSet.changes.merged && changeSet.changes.merged.length > 0) {
            newData = self.generateItemsInternal(changeSet.changes.merged);
            self.onUpdateView({
                merge: true,
                source: 'event',
                data: newData
            });
            $data.asyncRefresh(newData);
        }
    },

    /**
     * Override.
     * So that we can clean up the view data. 
     */
    loadInitData: function() {
        var self = this;
        self._viewLevelData.reset();
        return self._super();
    },


    /**
     * Starts to listen to the change on the global provider.
     * It is usually used internally on setting up this mediator.
     * @param {Object} globalProvider
     */
    startListeningGlobalProvider: function(globalProvider) {
        var self = this, onUpdate;
        onUpdate = function() {
            var args = arguments;
            // We have to schedule such update so that some other operations can
            // been completed first. E.g., getForeignModel should be set up.
            _.defer(function() {
                self.onGlobalProviderUpdate.apply(self, args);
            });
        };
        self._globalProviderListeners = {
            update: onUpdate
        };
        self._globalProvider = globalProvider;
        globalProvider.on('update', onUpdate);
    },

    /**
     * Stops listening to the change on the global provider.
     * It is usally used on the tearing down this mediator.
     */
    stopListeningGlobalProvider: function() {
        var self = this,
            key,
            listeners = self._globalProviderListeners,
            globalProvider = self._globalProvider;
        for (key in listeners) {
            if (listeners.hasOwnProperty(key)) {
                globalProvider.off(key, listeners[key]);
            }
        }
    },

    /**
     * Start to listen to the change on the view data provider.
     * This method is invoked on binding a view to this mediator.
     */
    startListeningViewProvider: function() {
        var self = this, onUpdate;
        onUpdate = function(evtCtx, changeSet, rest) {
            self.onViewProviderUpdate(evtCtx, changeSet, rest);
        };
        self._viewProviderListeners = {
            update: onUpdate
        };
        self._viewLevelData.on('update', onUpdate);
    },

    /**
     * Stops listening to the change on the view data provider.
     * This method is invoked on unbinding a view to this mediator. 
     */
    stopListeningViewProvider: function() {
        var self = this,
            key,
            listeners = self._viewProviderListeners;
        for (key in listeners) {
            if (listeners.hasOwnProperty(key)) {
                self._viewLevelData.off(key, listeners[key]);
            }
        }
    },

    /**
     * Override.
     * Compared its base counterpart, this method performs additional
     * checking on generating data for the view module, so that no repeated
     * items may be generated.
     * Simply because, the data in the view level data is distinct.
     * @returns {Array}
     */
    safelyReadDataProvider: function() {
        var self = this, models;
        models = self._super();
        models = _.filter(models, function(elem) {
            return !_.some(self._viewLevelData.models, function(item) {
                return item.id === elem.id;
            });
        });
        // Safely push these models into view level data provider
        self._viewLevelData.add(models, { silent: true });
        // Then return
        return models;
    },

    /**
     * Override.
     * This method uses the data from the view level data, instead of the
     * the current remote data provider, to generate the list of data
     * to be rendered. 
     */
    renderData: function(async) {
        var self, $data, newData;
        self = this;
        $data = self._viewInstance.$data;
        $data.clean();
        $data.hasMoreData(self._dataProvider.hasNextPage());
        newData = self.generateItemsInternal(self._viewLevelData.models);
        if (async === true) {
            $data.asyncPush(newData);
        } else {
            $data.syncPush(newData);
        }
    },

    /**
     * Override
     * @param {} options
     */
    setUp: function(options) {
        var self = this;
        self._super(options);
        if (self._globalProvider) {
            self.startListeningGlobalProvider(self._globalProvider);
        }
    },

    /**
     * Override
     */
    tearDown: function() {
        var self = this;
        // Call super
        self._super();
        // Tear off what we introduce in this class
        self._viewLevelData.off('all');
        self._viewLevelData.reset();
        // Stop listening to the global
        if (self._globalProvider) {
            self.stopListeningGlobalProvider();
        }
    },

    /**
     * Override
     */
    attachView: function(viewInstance) {
        var self = this;
        self._super(viewInstance);
        // Start to listen to changes on the view data provider.
        self.startListeningViewProvider();
    },

    /**
     * Override
     */
    detachView: function() {
        var self = this;
        self._super();
        self.stopListeningViewProvider();
    }
});