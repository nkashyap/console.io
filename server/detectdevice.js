/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 13/04/13
 * Time: 08:11
 * To change this template use File | Settings | File Templates.
 */

var DetectDevice = {
    get: function get(config) {
        var store = this.store(config),
            browser = this.searchString(store.browser),
            version = this.searchString(store.version) || this.searchVersion(store.version),
            platform = this.searchString(store.platform),
            manufacture = this.searchString(store.manufacture);

        return {
            browser: browser,
            version: version,
            manufacture: manufacture,
            platform: platform
        };
    },

    searchString: function searchString(data) {
        var i = 0, config;
        for (; config = data[i++];) {
            var searchString = config.userAgent || config.appVersion || config.vendor || config.platform || 'property';
            if (searchString !== 'property') {
                if (searchString.search(config.subString) !== -1) {
                    return config.identity;
                }
            }
            else if (config.property) {
                return config.identity;
            }
        }
    },

    searchVersion: function searchVersion(data) {
        var i = 0, config;
        for (; config = data[i++];) {
            if (config.versionSearch) {
                var versionString = config.appVersion || config.userAgent,
                    index = versionString.search(config.versionSearch);
                if (index > -1) {
                    var version = versionString.substring(index).replace(config.versionSearch, '').split(/[; ()]/);
                    version = version[0] || version[1];
                    return Number.isNaN(parseFloat(version)) ? version : parseFloat(version);
                }
            }
        }
    },

    store: function store(config) {
        return {
            platform: [
                {  userAgent: config.userAgent, subString: /\bSTB|Media|TechnikaTK500SDTR212\b/i, identity: "STB" },
                {  userAgent: config.userAgent, subString: /\bTV|NETTV|SmartTV|Technika22|DTV_[a-z0-9]+\b/i, identity: "TV" },
                {  userAgent: config.userAgent, subString: /\bAndroid.*Chrome\/[.0-9]* Mobile/i, identity: "Mobile" },
                {  userAgent: config.userAgent, subString: /\bAndroid.*Chrome\/[.0-9]* (?!Mobile)/i, identity: "Tablet" },
                {  userAgent: config.userAgent, subString: /\biPad\b/i, identity: "Tablet" },
                {  userAgent: config.userAgent, subString: /\biPhone\b/i, identity: "Mobile" },
                {  userAgent: config.userAgent, subString: /\biPod\b/i, identity: "Media" },
                {  userAgent: config.userAgent, subString: /\bPlaystation\b/i, identity: "Playstation" },

                {  platform: config.platform, subString: /\bWin|Mac|Linux/i, identity: "PC" }
            ],
            manufacture: [
                {  userAgent: config.userAgent, subString: /\bLGE\b/i, identity: "LG" },
                {  userAgent: config.userAgent, subString: /\bPhilips\b/i, identity: "Philips" },
                {  userAgent: config.userAgent, subString: /\bSamsung\b/i, identity: "Samsung" },
                {  userAgent: config.userAgent, subString: /\bToshiba\b/i, identity: "Toshiba" },
                {  userAgent: config.userAgent, subString: /\bTesco\b/i, identity: "Tesco" },
                {  userAgent: config.userAgent, subString: /\bPlaystation\b/i, identity: "Sony" },
                {  userAgent: config.userAgent, subString: /\bMSIE\b/i, identity: "Microsoft" },
                {  userAgent: config.userAgent, subString: /\bFirefox\b/i, identity: "Mozilla" },

                {  vendor: config.vendor, subString: /\bGoogle\b/i, identity: "Google" },
                {  vendor: config.vendor, subString: /\bApple\b/i, identity: "Apple" },

                {  property: config.opera, identity: "Opera" }
            ],
            browser: [
                {  userAgent: config.userAgent, subString: /\bNetCast\b/i, identity: "NetCast" },
                {  userAgent: config.userAgent, subString: /\bMaple\b/i, identity: "Maple" },
                {  userAgent: config.userAgent, subString: /\bNETTV\b/i, identity: "NetTV" },
                {  userAgent: config.userAgent, subString: /\bToshibaTP\b/i, identity: "ToshibaTP" },
                {  userAgent: config.userAgent, subString: /\bEspial Browser\b/i, identity: "Espial" },
                {  userAgent: config.userAgent, subString: /\bTechnika22|TechnikaTK500SDTR212\b/i, identity: "MStar" },
                {  userAgent: config.userAgent, subString: /\bOreganMediaBrowser\b/i, identity: "Oregan Media" },

                {  userAgent: config.userAgent, subString: /\bPlaystation\b/i, identity: "Playstation" },
                {  userAgent: config.userAgent, subString: /\bChrome\b/i, identity: "Chrome" },
                {  userAgent: config.userAgent, subString: /\bMSIE\b/i, identity: "IE" },
                {  userAgent: config.userAgent, subString: /\bFirefox\b/i, identity: "Firefox" },
                {  vendor: config.vendor, subString: /\bApple\b/i, identity: "Safari" },

                {  property: config.opera, identity: "Opera" },
                {  userAgent: config.userAgent, subString: /\bOpera\b/i, identity: "Opera" },
            ],
            version: [
                {  userAgent: config.userAgent, subString: /\b2010\b/i, identity: "2010" },
                {  userAgent: config.userAgent, subString: /\b2011|TL868|NETTV\/3.1\b/i, identity: "2011" },
                {  userAgent: config.userAgent, subString: /\b2012|RL953|NETTV\/3.0|NETTV\/3.2|NETTV\/4.0\b/i, identity: "2012" },
                {  userAgent: config.userAgent, subString: /\b2013\b/i, identity: "2013" },

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
    }
};

module.exports = DetectDevice;
