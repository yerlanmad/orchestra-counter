window.$Qmatic.vendor.reduxWatch = (function () {

    if(!!!window.objectPath){
        // This is handled here because we are currently not using a dependency management tool like require.
        throw new Error("Object Path is not loaded. This is a dependency.")
    }
    var getValue = objectPath.get

    function defaultCompare(a, b) {
        return a === b
    }

    return {
        watch: function (getState, objectPath, compare) {
            compare = compare || defaultCompare
            var currentValue = getValue(getState(), objectPath)
            return function w(fn) {
                return function () {
                    var newValue = getValue(getState(), objectPath)
                    if (!compare(currentValue, newValue)) {
                        var oldValue = currentValue
                        currentValue = newValue
                        fn(newValue, oldValue, objectPath)
                    }
                }
            }
        }
    }
})();