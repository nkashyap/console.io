/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 13/04/13
 * Time: 08:11
 * To change this template use File | Settings | File Templates.
 */

var DetectDevice = {
    get: function get(config) {
        var store = this.store(config);
        this.name = this.searchString(store.dataBrowser);
        this.version = this.searchVersion(config.userAgent) || this.searchVersion(config.appVersion);
        this.os = this.searchString(store.dataOS);

        return {
            name: this.name,
            version: this.version,
            os: this.os
        };
    },

    searchString: function searchString(data) {
        var i = 0,
            config;

        for (; config = data[i++];) {
            this.versionSearchString = config.versionSearch || config.identity;

            if (config.string) {
                if (config.string.indexOf(config.subString) !== -1) {
                    return config.identity;
                }
            }
            else if (config.prop) {
                return config.identity;
            }
        }
    },

    searchVersion: function searchVersion(dataString) {
        var index = dataString.indexOf(this.versionSearchString);
        if (index === -1) {
            return;
        }
        return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
    },

    store: function store(config) {
        return {
            dataBrowser: [
                {
                    string: config.userAgent,
                    subString: "LG Browser",
                    versionSearch: "Browser",
                    identity: "LG"
                },
                {
                    string: config.userAgent,
                    subString: "Maple",
                    identity: "Maple"
                },
                {
                    string: config.userAgent,
                    subString: "Philips",
                    versionSearch: "Version/",
                    identity: "Philips"
                },
                {
                    string: config.userAgent,
                    subString: "ToshibaTP",
                    versionSearch: "ToshibaTP/",
                    identity: "ToshibaTP"
                },
                {
                    string: config.userAgent,
                    subString: "Mstar",
                    identity: "Technika"
                },
                {
                    string: config.userAgent,
                    subString: "Technika Media Streamer",
                    identity: "Technika"
                },
                {
                    string: config.userAgent,
                    subString: "Chrome",
                    identity: "Chrome"
                },
                {
                    string: config.userAgent,
                    subString: "OmniWeb",
                    versionSearch: "OmniWeb/",
                    identity: "OmniWeb"
                },
                {
                    string: config.vendor,
                    subString: "Apple",
                    identity: "Safari",
                    versionSearch: "Version"
                },
                {
                    prop: config.opera,
                    identity: "Opera",
                    versionSearch: "Version"
                },
                {
                    string: config.vendor,
                    subString: "iCab",
                    identity: "iCab"
                },
                {
                    string: config.vendor,
                    subString: "KDE",
                    identity: "Konqueror"
                },
                {
                    string: config.userAgent,
                    subString: "Firefox",
                    identity: "Firefox"
                },
                {
                    string: config.vendor,
                    subString: "Camino",
                    identity: "Camino"
                },
                {
                    // for newer Netscapes (6+)
                    string: config.userAgent,
                    subString: "Netscape",
                    identity: "Netscape"
                },
                {
                    string: config.userAgent,
                    subString: "MSIE",
                    identity: "Explorer",
                    versionSearch: "MSIE"
                },
                {
                    string: config.userAgent,
                    subString: "Gecko",
                    identity: "Mozilla",
                    versionSearch: "rv"
                },
                {
                    // for older Netscapes (4-)
                    string: config.userAgent,
                    subString: "Mozilla",
                    identity: "Netscape",
                    versionSearch: "Mozilla"
                }
            ],
            dataOS: [
                {
                    string: config.userAgent,
                    subString: "NetCast.TV-2011",
                    identity: "NetCast.TV-2011"
                },
                {
                    string: config.userAgent,
                    subString: "NetCast.Media-2011",
                    identity: "NetCast.STB-2011"
                },
                {
                    string: config.userAgent,
                    subString: "NetCast.TV-2012",
                    identity: "NetCast.TV-2012"
                },
                {
                    string: config.userAgent,
                    subString: "NetCast.Media-2012",
                    identity: "NetCast.STB-2012"
                },
                {
                    string: config.userAgent,
                    subString: "NETTV/3.1",
                    identity: "NETTV/3.1-2011"
                },
                {
                    string: config.userAgent,
                    subString: "NETTV/3.0",
                    identity: "NETTV/3.0-2012"
                },
                {
                    string: config.userAgent,
                    subString: "NETTV/3.2",
                    identity: "NETTV/3.2-2012"
                },
                {
                    string: config.userAgent,
                    subString: "NETTV/4.0",
                    identity: "NETTV/4.0-2012"
                },
                {
                    string: config.userAgent,
                    subString: "SmartTV+2013",
                    identity: "Samsung-2013"
                },
                {
                    string: config.userAgent,
                    subString: "SmartTV",
                    identity: "Samsung-2012"
                },
                {
                    string: config.userAgent,
                    subString: "DTV_TL868",
                    identity: "Toshiba-2011"
                },
                {
                    string: config.userAgent,
                    subString: "DTV_RL953",
                    identity: "Toshiba-2012"
                },
                {
                    string: config.userAgent,
                    subString: "Technika22",
                    identity: "Mstar"
                },
                {
                    string: config.userAgent,
                    subString: "Technika Media Streamer",
                    identity: "Avtrex"
                },
                {
                    string: config.platform,
                    subString: "Win",
                    identity: "Windows"
                },
                {
                    string: config.platform,
                    subString: "Mac",
                    identity: "Mac"
                },
                {
                    string: config.userAgent,
                    subString: "iPhone",
                    identity: "iPhone/iPod"
                },
                {
                    string: config.platform,
                    subString: "Linux",
                    identity: "Linux"
                }
            ]
        };
    }
};

module.exports = DetectDevice;
