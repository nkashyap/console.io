/**
 * ConsoleIO server use module defined in this file
 * to detect connected device type based of information provided by the client
 *
 * @public
 * @static
 * @name detectDevice
 *
 * @author Nisheeth Kashyap <nisheeth.k.kashyap@gmail.com>
 */
var detectDevice = {

    /**
     * Detect device browser and return simple object
     *
     * @public
     * @method get
     * @param {object} config device browser configuration e.g userAgent string, platform, appName, etc
     * @return {object} object with browser name, version, manufacture and platform
     */
    get: function get(config) {
        var store = this.getStore(config),
            browser = this.getIdentity(store.browser),
            version = this.getIdentity(store.version) || this.getVersion(store.version),
            platform = this.getIdentity(store.platform),
            manufacture = this.getIdentity(store.manufacture);

        return {
            browser: browser,
            version: version,
            manufacture: manufacture,
            platform: platform
        };
    },

    /**
     * Iterate over store and match the regex with the device
     * config parameters and return the identity
     *
     * @private
     * @method getIdentity
     * @param {Array} store data store to search for
     * @return {String} identity of the matched regex
     */
    getIdentity: function getIdentity(store) {
        var identity;

        // go through each item in the store and return identity when matched
        store.every(function (config) {
            var searchString = config.userAgent || config.appVersion || config.vendor || config.platform || 'property';

            if (searchString !== 'property') {
                if (searchString.search(config.search) !== -1) {
                    identity = config.identity;
                    return false;
                }
            } else if (config.property) {
                identity = config.identity;
                return false;
            }

            return true;
        });

        return identity;
    },

    /**
     * Iterate over store and match the regex with the device
     * config parameters and return the version
     *
     * @private
     * @method getVersion
     * @param {Array} store data store to search for
     * @return {String} identity of the matched regex
     */
    getVersion: function getVersion(store) {
        var version;

        // go through each item in the store and return version when matched
        store.every(function (config) {
            if (config.versionSearch) {
                var versionString = config.appVersion || config.userAgent,
                    index = versionString.search(config.versionSearch),
                    versionNumber;

                if (index > -1) {
                    // split version string by index first and
                    // then split version by ;, space,()
                    versionNumber = versionString.substring(index).replace(config.versionSearch, '').split(/[; ()]/);

                    // sometime first item is empty space, if empty then get next item from array
                    versionNumber = versionNumber[0] || versionNumber[1];

                    // convert it into float value if possible otherwise return string
                    version = Number.isNaN(parseFloat(versionNumber)) ? versionNumber : parseFloat(versionNumber);
                    return false;
                }
            }

            return true;
        });

        return version;
    },

    /**
     * Data store function apply device configuration to the store and return updated store
     *
     * @private
     * @method getStore
     * @param {Object} config device browser configuration e.g userAgent string, platform, appName, etc
     * @return {Object} data store object with device detection regex
     */
    getStore: function getStore(config) {

        // Maple browser
        config.userAgent = config.userAgent.replace(/%20/img, " ");
        config.appVersion = config.appVersion.replace(/%20/img, " ");
        config.platform = config.platform.replace(/%20/img, " ");

        /**
         * data store object
         * @typedef {Object} dataStore
         * @property {Object} platform - Regex to detect device platform.
         * @property {Object} manufacture - Regex to detect device manufacture
         * @property {Object} browser - Regex to detect device browser
         * @property {Object} version - Regex to detect device browser version
         */
        var dataStore = {

            /** platform data store array **/
            platform: [
                {  userAgent: config.userAgent, search: /\bSTB|Media|TechnikaTK500SDTR212\b/i, identity: "STB" },
                {  userAgent: config.userAgent, search: /\bTV|NETTV|SmartHub|SmartTV|Technika22|Maple|DTV_[a-z0-9]+\b/i, identity: "TV" },
                {  userAgent: config.userAgent, search: /\bAndroid.*Chrome\/[.0-9]* Mobile/i, identity: "Mobile" },
                {  userAgent: config.userAgent, search: /\bAndroid.*Chrome\/[.0-9]* (?!Mobile)/i, identity: "Tablet" },
                {  userAgent: config.userAgent, search: /\biPad\b/i, identity: "Tablet" },
                {  userAgent: config.userAgent, search: /\biPhone\b/i, identity: "Mobile" },
                {  userAgent: config.userAgent, search: /\biPod\b/i, identity: "Media" },
                {  userAgent: config.userAgent, search: /\bPlaystation\b/i, identity: "Console" },

                {  platform: config.platform, search: /\bWin|Mac|Linux/i, identity: "PC" }
            ],

            /** manufacture data store array **/
            manufacture: [
                {  userAgent: config.userAgent, search: /\bLGE\b/i, identity: "LG" },
                {  userAgent: config.userAgent, search: /\bPhilips\b/i, identity: "Philips" },
                {  userAgent: config.userAgent, search: /\bSmartHub|Samsung|Maple\b/i, identity: "Samsung" },
                {  userAgent: config.userAgent, search: /\bToshiba\b/i, identity: "Toshiba" },
                {  userAgent: config.userAgent, search: /\bTesco\b/i, identity: "Tesco" },
                {  userAgent: config.userAgent, search: /\bPlaystation\b/i, identity: "Sony" },
                {  userAgent: config.userAgent, search: /\bMSIE\b/i, identity: "Microsoft" },
                {  userAgent: config.userAgent, search: /\bFirefox\b/i, identity: "Mozilla" },

                {  vendor: config.vendor, search: /\bGoogle\b/i, identity: "Google" },
                {  vendor: config.vendor, search: /\bApple\b/i, identity: "Apple" },

                {  property: config.opera, identity: "Opera Software" }
            ],

            /** browser data store array **/
            browser: [
                {  userAgent: config.userAgent, search: /\bNetCast\b/i, identity: "NetCast" },
                {  userAgent: config.userAgent, search: /\bMaple/i, identity: "Maple" },
                {  userAgent: config.userAgent, search: /\bNETTV\b/i, identity: "NetTV" },
                {  userAgent: config.userAgent, search: /\bToshibaTP\b/i, identity: "ToshibaTP" },
                {  userAgent: config.userAgent, search: /\bEspial Browser\b/i, identity: "Espial" },
                {  userAgent: config.userAgent, search: /\bTechnika22|TechnikaTK500SDTR212\b/i, identity: "MStar" },
                {  userAgent: config.userAgent, search: /\bOreganMediaBrowser\b/i, identity: "Oregan Media" },

                {  userAgent: config.userAgent, search: /\bPlaystation\b/i, identity: "Playstation" },
                {  userAgent: config.userAgent, search: /\bChrome\b/i, identity: "Chrome" },
                {  userAgent: config.userAgent, search: /\bMSIE\b/i, identity: "IE" },
                {  userAgent: config.userAgent, search: /\bFirefox\b/i, identity: "Firefox" },
                {  vendor: config.vendor, search: /\bApple\b/i, identity: "Safari" },

                {  property: config.opera, identity: "Opera" },
                {  userAgent: config.userAgent, search: /\bOpera\b/i, identity: "Opera" }
            ],

            /** version data store array **/
            version: [
                {  userAgent: config.userAgent, search: /2010/i, identity: "2010" },
                {  userAgent: config.userAgent, search: /2011|TL868|NETTV\/3.1/i, identity: "2011" },
                {  userAgent: config.userAgent, search: /2012|RL953|NETTV\/3.0|NETTV\/3.2|NETTV\/4.0/i, identity: "2012" },
                {  userAgent: config.userAgent, search: /2013/i, identity: "2013" },

                {  userAgent: config.userAgent, versionSearch: /\bTesco-Technika22-|Tesco-TechnikaTK500SDTR/i },
                {  userAgent: config.userAgent, versionSearch: /\bEspial Browser\/\b/i },
                {  userAgent: config.userAgent, versionSearch: /\bChrome\/\b/i },
                {  userAgent: config.userAgent, versionSearch: /\bVersion\/\b/i },
                {  userAgent: config.userAgent, versionSearch: /\bPlaystation\b/i },
                {  userAgent: config.userAgent, versionSearch: /\bMSIE\b/i },
                {  userAgent: config.userAgent, versionSearch: /\bFirefox\/\b/i },
                {  userAgent: config.userAgent, versionSearch: /\bOpera\/\b/i }
            ]
        };

        return dataStore;
    }
};

/**
 * Export detectDevice as module
 * @module detectDevice
 */
module.exports = detectDevice;
