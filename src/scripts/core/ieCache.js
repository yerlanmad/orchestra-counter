
var spServiceCache = (function ($) {
    var cache = {};

    var sanitizeResource = function (resource) {
        var resArray = resource && resource.match(/^(.*)\?/);
        return resArray && resArray.length > 1 ? resArray[1] : resource;
    }
    
    return {
        isCached: function (resource) {
            // return sanitizeResource(resource) in cache; Caching is disabled at the moment
            return false;
        },

        getData: function (resource) {
            return cache[sanitizeResource(resource)];
        },

        putData: function (resource, data) {
            if (resource != undefined && resource != "") {
                cache[sanitizeResource(resource)] = data;
            }
        },

        getCache: function () {
            return cache;
        },

        clearCache: function () {
             cache = {};
        }
    };
})(jQuery);