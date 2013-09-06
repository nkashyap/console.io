(function geoLocation() {

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function success(position) {
            console.log('success', position);

        }, function error(e) {
            console.exception(e);

        }, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        });
    } else {
        return "Geolocation is not supported by this browser.";
    }

}());