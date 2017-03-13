/**
 * ReLoads the page.
 *
 * ReLoads the page after the desired
 * amount of milliseconds have passed.
 * 
 * @param root - the window object
 *
 * @param factory - function that defines our class
 *
 * @created 22/11/2016
 *
 * @updated 11/03/2017
 *
 * @since 1.0.1
 *
 * @author Scott Hardy <hardy613+ReLoader@gmail.com>
 */
;((root, factory) => {

    // @thanks: http://ifandelse.com/its-not-hard-making-your-library-support-amd-and-commonjs/
    if(typeof define === "function" && define.amd) {

        // Now we're wrapping the factory and assigning the return
        // value to the root (window) and returning it as well to
        // the AMD loader.
        define([], () => (root.ReLoader = factory()));

    } else if(typeof module === "object" && module.exports) {

        // I've not encountered a need for this yet, since I haven't
        // run into a scenario where plain modules depend on CommonJS
        // *and* I happen to be loading in a CJS browser environment
        // but I'm including it for the sake of being thorough
        module.exports = (root.ReLoader = factory());
    } else {

        root.ReLoader = factory();
    }

})(this, () => {

    /**
    * @options
    *  - pageReloadTime                 [ default: 300000 ] | The time (in milliseconds) to wait before reloading
    *  - reLoadEventList                [ default: [] ] | User defined events that cause a reload
    *  - focusedEventList               [ default: [] ] | User defined events that cause a timer reset
    *  - useDefaultReLoadEventList      [ default: true ] | Should we use the default list
    *  - useDefaultFocusedEventList     [ default: true ] | Should we use the default list
    *  - useInitializationCallback      [ default: false] | Use user defined callback on init
    *
    * @usage
    *  ` new ReLoader( {pageReloadTime: 3000}, event => console.info(event)); `
    */
    class ReLoader {
        /**
         * Sets default events for resetting the timer or reloading
         * Creates initialized event.
         *
         * @param options
         * @param focusedCallback - the user defined callback used before resetting thh timer
         * @since 1.0.1
         */
        constructor(options, focusedCallback) {

            /**
             * Used so our list is not overridden.
             *
             * Events listed stop the reload.
             *
             * @type {Array}
             * @since 1.0.1
             */
            const defaultFocusedEventList = ['onfocus', 'onmousemove', 'onmousedown', 'ontouchstart', 'onclick', 'onscroll', 'onkeypress'];

            /**
             * Used so our list is not overridden.
             *
             * Events listed cause a reload.
             *
             * @type {Array}
             * @since 1.0.1
             */
            const defaultReLoadEventList = ['onblur'];

            /**
             * @since 1.0.0
             */
            const defaultOptions = {
                // five minutes in milliseconds
                pageReloadTime: 300000,

                // user defined events
                focusedEventList: [],

                // user defined events
                reLoadEventList: [],

                // should we merge the default event list
                useDefaultFocusedEventList: true,

                // should we merge the default event list
                useDefaultReLoadEventList: true,

                // use the callback in the initialization
                useInitializationCallback: false,
            };

            if(typeof options !== "object") {
                options = {};
            }

            /**
             * Create our class options
             *
             * @since 1.0.0
             */
            this.options = Object.assign({}, defaultOptions, options);

            // make sure we are dealing with a number
            this.options.pageReloadTime = Math.abs(this.options.pageReloadTime);

            // set the default array so it is not overridden
            this.options.defaultFocusedEventList = defaultFocusedEventList;

            // set the default array so it is not overridden
            this.options.defaultReLoadEventList = defaultReLoadEventList;

            /**
             * @type {Window}
             * @since 1.0.0
             */
            this.window = window;

            /**
             * @type {HTMLDocument}
             * @since 1.0.0
             */
            this.document = document;

            /**
             * To be cleared on user action
             *
             * @type {undefined|number}
             * @since 1.0.0
             */
            this.timeOutListener = undefined;

            /**
             * To be called before the timer resets
             *
             * @type {function}
             * @since 1.0.1
             */
            this.focusedCallback = typeof focusedCallback === "function" ? focusedCallback : () => {};

            // add a listener for our event dispatched in init()
            this.document.addEventListener('initialized', (event) => this.userIsFocused(event));

            // create an custom init event
            this.initializeEvent = new CustomEvent("initialized", {
                detail: {
                    pluginName: "reLoader",

                    timestamp: Date.now()
                }
            });

            this.init();
        }

        /**
         * Adds events.
         *
         * Adds onblur event to reload the page and adds a default 5 minute timer
         * to reload the page unless the user is on the page. Dispatches Init event
         *
         * @return void
         * @since 1.0.0
         */
        init() {
            // plugin reload events
            if (this.options.useDefaultReLoadEventList) {
                this.options.defaultReLoadEventList.map((reloadEvent) => this.mapEvent(reloadEvent, 'pageReLoad'));
            }

            // plugin focused events
            if (this.options.useDefaultFocusedEventList) {
                this.options.defaultFocusedEventList.map((focusedEvent) => this.mapEvent(focusedEvent, 'userIsFocused'));
            }

            // user reload events
            this.options.reLoadEventList.map((userReloadEvent) => this.mapEvent(userReloadEvent, 'pageReLoad'));

            // user focused events
            this.options.focusedEventList.map((userFocusedEvent) => this.mapEvent(userFocusedEvent, 'userIsFocused'));

            // done
            this.document.dispatchEvent(this.initializeEvent);
        };

        /**
         * Checks if the event name is a property of the window
         * throws a warning if not, however it will still
         * try to bind the event.
         *
         * @param eventName
         * @param functionName
         * @return void
         * @since 1.0.1
         */
        mapEvent(eventName = '', functionName = 'userIsFocused') {

            if(eventName.length) {
                // check
                if (!this.window.hasOwnProperty(eventName)) {
                    this.reLoaderWarning(eventName)
                }

                // bind anyways... for now..
                this.window[eventName] = (event) => this[functionName](event);
            } else {
                this.reLoaderError('mapEvent::Error: The eventName must be set.')
            }
        };

        /**
         * Clears and sets the reload timer
         *
         * @param event
         * @return void
         * @since 1.0.0
         */
        userIsFocused(event = this.initializeEvent) {

            if (this.timeOutListener) {
                clearTimeout(this.timeOutListener);
            }

            // user callback
            if(event != this.initializeEvent || (event == this.initializeEvent && this.options.useInitializationCallback)) {
                this.focusedCallback(event);
            }

            // start timer
            this.timeOutListener = setTimeout(() => this.pageReLoad(), this.options.pageReloadTime);
        };

        /**
         * You guessed it; we reload the page.
         *
         * @return void
         * @since 1.0.0
         */
        pageReLoad() {

            this.window.location.reload();
        };

        /**
         * warn() of a missing window property in the console.
         *
         * @param event
         * @param message
         * @return void
         * @since 1.0.1
         *
         * @todo: investigate 'ontouchstart' in desktop chrome latest, its not a property
         */
        reLoaderWarning(event = this.initializeEvent.name, message = ' is not a property of the window object.') {

            console.warn(event + message);
        };

        /**
         * error() messages when needed
         *
         * @param message
         * @return void
         * @since 1.0.1
         */
        reLoaderError(message = 'reLoader.js: Error') {

            console.error(message);
        };

    }

    return ReLoader;
});