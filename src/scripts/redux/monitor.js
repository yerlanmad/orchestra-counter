window.$Qmatic.redux.monitor = (function () {
    return {
        startListening: function () {
            if (!!!window.Redux || !!!window.$Qmatic.redux.reducers ||
                !!!window.$Qmatic.redux.actions ||
                !!!window.$Qmatic.redux.store) {
                throw new Error("Redux is not properly Initialized!!!")
            } else {
                $Qmatic.utils.log.debug("Starting to Monitor Redux State...")

                if(!!!window.$Qmatic.vendor.reduxWatch){
                    throw new Error("Redux watch is not Loaded!!!")
                }

                // var w = window.$Qmatic.vendor.reduxWatch.watch(window.$Qmatic.redux.store.getState, 'selectedBranchReducer')
                // window.$Qmatic.redux.store.subscribe(w(function (newVal, oldVal, objectPath) {
                //     console.log("CHANGED")
                //     window.$Qmatic.utils.log.info('%s changed from %s to %s', objectPath, oldVal, newVal)
                // }));
                window.$Qmatic.redux.store.subscribe(function () {
                    console.log(window.$Qmatic.redux.store.getState())
                });
            }
        }
    }
})();

window.$Qmatic.redux.monitor.startListening()