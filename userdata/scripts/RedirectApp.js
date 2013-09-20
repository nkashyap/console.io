(function redirectApp() {
    //var id = prompt("Enter V2 app version to redirect");
    var id = '4dbda83f250857d1075453d70416f80252b97a92';
    if (id != null) {
        var origin = location.origin ? location.origin : location.protocol + '//' + location.hostname;
        location = origin + '/app/' + id;
    }
}())