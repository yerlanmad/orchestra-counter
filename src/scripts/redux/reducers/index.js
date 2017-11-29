window.$Qmatic.redux.reducers = (function(){

    // Shared Default Variables
    var defaultListValue = []
    var defaultStringValue = ''
    var defaultBooleanValue = false
    var defaultObjectValue = {}

    if(!!!window.Redux)
        throw new Error("Redux Library Not Loaded!!!")

    return Redux.combineReducers({
        branchList: function (){
            // Local Default Variables. Emulate Default Varaibles in new ES6 Syntax.
            return function (state, action){

                // Set Default Value if user enter something fasely
                if(!!!state) {
                    state = defaultListValue
                }

                switch (action.type) {
	                case "ADD_BRANCHES":
		                return action.payload
	                default:
		                return state
	            }
            } 
        }(),
        selectedBranch: function (){
            return function (state, action){

                // Set Default Value if user enter something fasely
                if(!!!state) {
                    state = defaultObjectValue
                }

                switch (action.type) {
	                case "ADD_SELECTED_BRANCH":
		                return action.payload
	                default:
		                return state
	            }
            } 
        }(),
        workstationList: function (){
            // Local Default Variables. Emulate Default Varaibles in new ES6 Syntax.
            return function (state, action){

                // Set Default Value if user enter something fasely
                if(!!!state) {
                    state = defaultListValue
                }

                switch (action.type) {
	                case "ADD_WORKSTATIONS":
		                return action.payload
	                default:
		                return state
	            }
            } 
        }(),
        selectedWorkstation: function (){
            return function (state, action){

                // Set Default Value if user enter something fasely
                if(!!!state) {
                    state = defaultObjectValue
                }

                switch (action.type) {
	                case "ADD_SELECTED_WORKSTATION":
		                return action.payload
	                default:
		                return state
	            }
            } 
        }(),
        workprofileList: function (){
            // Local Default Variables. Emulate Default Varaibles in new ES6 Syntax.
            return function (state, action){

                // Set Default Value if user enter something fasely
                if(!!!state) {
                    state = defaultListValue
                }

                switch (action.type) {
	                case "ADD_WORKPROFILES":
		                return action.payload
	                default:
		                return state
	            }
            } 
        }(),
        selectedWorkprofile: function (){
            return function (state, action){

                // Set Default Value if user enter something fasely
                if(!!!state) {
                    state = defaultObjectValue
                }

                switch (action.type) {
	                case "ADD_SELECTED_WORKPROFILE":
		                return action.payload
	                default:
		                return state
	            }
            } 
        }(),
    })
})();

