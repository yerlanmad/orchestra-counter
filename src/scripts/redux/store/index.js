window.$Qmatic.redux.store = (function (){ 
        if(!!!window.Redux){
            throw new Error("Redux Library Not Loaded!!!")
        } else {
            return Redux.createStore(window.$Qmatic.redux.reducers, {})
        }
})();

