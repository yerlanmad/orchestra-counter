// Monitor Redux Store State
window.$Qmatic.utils = (function () {
    return {
        log: (function () {
            return {
                info: function (val) {
                    console.info(typeof val === 'object' ? JSON.stringify(val) : val)
                },
                warn: function (val) {
                    console.warn(typeof val === 'object' ? JSON.stringify(val) : val)
                },
                error: function (val) {
                    console.error(typeof val === 'object' ? JSON.stringify(val) : val)
                },
                debug: function (val) {
                    console.debug(typeof val === 'object' ? JSON.stringify(val) : val)
                }
            }
        })(),
        containsObject: function (obj, list) {
            if (!!list) {
                var i;
                for (i = 0; i < list.length; i++) {
                    if (list[i] === obj) {
                        return true;
                    }
                }
            }

            return false;
        }
    }
})();
