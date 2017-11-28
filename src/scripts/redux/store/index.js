window.store = {
    init: function(){
        if(!!!window.Redux){
            throw new Error("Redux Library Not Loaded!!!")
        } else {
            // Loaded in /reducers/index.js
            Redux.combineReducers(window.reducers)
        }
    }
};

