window.reducers = function(){

    // Shared Default Variables
    var defaultListValue = []
    var defaultStringValue = ''
    var defaultBooleanValue = false
    var defaultObjectValue = {}

    return {
        branchListReducer: function (){
            // Local Default Variables. Emulate Default Varaibles in new ES6 Syntax.
            return function (state, type){

                // Set Default Value if user enter something fasely
                if(!!!state) {
                    state = defaultListValue
                }

                switch (action.type) {
	                case "ADD_BRANCHES":
		                return 
	                default:
		                return state
	            }
            } 
        }(),
        selectedBranchReducer: function (){
            return function (state, type){

                // Set Default Value if user enter something fasely
                if(!!!state) {
                    state = defaultObjectValue
                }

                switch (action.type) {
	                case "ADD_SELECTED_BRANCH":
		                return 
	                default:
		                return state
	            }
            } 
        }(),
        workstationListReducer: function (){
            // Local Default Variables. Emulate Default Varaibles in new ES6 Syntax.
            return function (state, type){

                // Set Default Value if user enter something fasely
                if(!!!state) {
                    state = defaultListValue
                }

                switch (action.type) {
	                case "ADD_WORKSTATIONS":
		                return 
	                default:
		                return state
	            }
            } 
        }(),
        selectedWorkstationReducer: function (){
            return function (state, type){

                // Set Default Value if user enter something fasely
                if(!!!state) {
                    state = defaultObjectValue
                }

                switch (action.type) {
	                case "ADD_SELECTED_WORKSTATION":
		                return 
	                default:
		                return state
	            }
            } 
        }(),
        workprofileListReducer: function (){
            // Local Default Variables. Emulate Default Varaibles in new ES6 Syntax.
            return function (state, type){

                // Set Default Value if user enter something fasely
                if(!!!state) {
                    state = defaultListValue
                }

                switch (action.type) {
	                case "ADD_WORKPROFILES":
		                return 
	                default:
		                return state
	            }
            } 
        }(),
        selectedWorkprofileReducer: function (){
            return function (state, type){

                // Set Default Value if user enter something fasely
                if(!!!state) {
                    state = defaultObjectValue
                }

                switch (action.type) {
	                case "ADD_SELECTED_WORKPROFILE":
		                return 
	                default:
		                return state
	            }
            } 
        }(),
    }
}();

