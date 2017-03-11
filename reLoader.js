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
;(function (root, factory) {

    if(typeof define === "function" && define.amd) {
        // Now we're wrapping the factory and assigning the return
        // value to the root (window) and returning it as well to
        // the AMD loader.
        define([], function(){
            return (root.ReLoader = factory());
        });
    } else if(typeof module === "object" && module.exports) {
        // I've not encountered a need for this yet, since I haven't
        // run into a scenario where plain modules depend on CommonJS
        // *and* I happen to be loading in a CJS browser environment
        // but I'm including it for the sake of being thorough
        module.exports = (root.ReLoader = factory());
    } else {
        root.ReLoader = factory();
    }

}(this, () => {

    /**
    * @options
    *  - pageReloadTime                [ default: 300000 ] | The time (in milliseconds) to wait before reloading
    *  - reLoadEventList               [ default: [] ] | User defined events that cause a reload
    *  - focusedEventList              [ default: [] ] | User defined events that cause a timer reset
    *  - useDefaultReLoadEventList     [ default: true ] | Should we use the default list
    *  - useDefaultFocusedEventList    [ default: true ] | Should we use the default list
    *
    * @usage
    *  ` new ReLoader(); `
    */
    class ReLoader {
        /**
         *
         * @param options
         * @param focusedCallback
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
                useDefaultReLoadEventList: true
            };

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
         * to reload teh page unless the user is on the page.
         *
         * @since 1.0.0
         */
        init() {
            this.document.dispatchEvent(this.initializeEvent);

            // plugin events
            if (this.options.useDefaultReLoadEventList) {

                this.options.defaultReLoadEventList.map((reloadEvent) => this.mapEvent(reloadEvent, 'pageReLoad'));
            }

            // plugin events
            if (this.options.useDefaultFocusedEventList) {

                this.options.defaultFocusedEventList.map((focusedEvent) => this.mapEvent(focusedEvent, 'userIsFocused'));
            }

            // user events
            this.options.reLoadEventList.map((userReloadEvent) => this.mapEvent(userReloadEvent, 'pageReLoad'));

            // user events
            this.options.focusedEventList.map((userFocusedEvent) => this.mapEvent(userFocusedEvent, 'userIsFocused'));
        };

        /**
         *
         * @param eventName
         * @param functionName
         * @since 1.0.1
         */
        mapEvent(eventName, functionName = 'userIsFocused') {

            if (this.window.hasOwnProperty(eventName)) {

                this.window[eventName] = (event) => this[functionName](event);

            } else {

                this.reLoaderWarning(eventName)
            }
        };

        /**
         * Clears and sets the reload timer
         *
         * @param event
         * @since 1.0.0
         */
        userIsFocused(event = false) {

            if (this.timeOutListener) {

                clearTimeout(this.timeOutListener);
            }

            // make a callback if an even is present
            if (event) {

                this.focusedCallback(event);
            }

            this.timeOutListener = setTimeout(() => this.pageReLoad(), this.options.pageReloadTime);
        };

        /**
         * You guessed it; we reload the page.
         *
         * @since 1.0.0
         */
        pageReLoad() {

            this.window.location.reload();
        };

        /**
         * @param event
         * @param message
         */
        reLoaderWarning(event = this.initializeEvent.name, message = ' is not a property of the window object.') {
            console.warn(event + message);
        };

    }

    return ReLoader;
}));