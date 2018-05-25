import * as ClassBuilder from 'polpware-tinymce-tailor/src/util/Class';


export const ListControllerCtor = ClassBuilder.extend({

    Defaults: {
        MediatorCtor: null
    },

    Properties: 'mediator,settings',

    /**
     * Constructor
     * @param {Object} settings
     */
    init: function(settings) {
        var self = this;
        // We expect the following properties

        self._settings = settings;
        self._isFirstTimeRendered = true;
        self._mediator = settings.mediator || null;
        self._mediatorFromCache = !!self._mediator;
    },

    initMediator: function() {
        var self,
            settings,
            mediator,
            MediatorCtor;
        self = this;
        if (self._mediator) {
            return self;
        }
        settings = self._settings;
        MediatorCtor = self.Defaults.MediatorCtor;
        mediator = new MediatorCtor(settings);
        // Setup mediator
        self.setupMediator(mediator);

        self._mediator = mediator;
        return self;
    },

    setupMediator: function(mediator) {
        mediator.setUp();
    },

    start: function() {
        var self,
            settings,
            mediator;

        self = this;
        settings = self._settings;
        mediator = self._mediator;

        // Set up destroy
        settings.$render.destroy(function() {
            mediator.stopService();
        });

        settings.$render.ready(function() {
            if (self._isFirstTimeRendered) {
                self._isFirstTimeRendered = false;
                mediator.startService(settings, self._mediatorFromCache);
            }
        });
    }
});

