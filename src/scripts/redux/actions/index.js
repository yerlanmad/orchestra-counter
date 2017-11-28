window.actions = function(){
    return {
        branch: function (){
            return {
                addBranches: function (branches) {
                    return {
                        type: "ADD_BRANCHES",
                        payload: branches
                    }
                },
                selectedBranch: function (selectedBranch) {
                    return {
                        type: "ADD_SELECTED_BRANCH",
                        payload: selectedBranch
                    }
                }
            } 
        }(),
        workstation: function (){
            return {
                addWorkstations: function (workstations) {
                    return {
                        type: "ADD_WORKSTATIONS",
                        payload: workstations
                    }
                },
                selectedWorkstation: function (selectedWorkstation) {
                    return {
                        type: "ADD_SELECTED_WORKSTATION",
                        payload: selectedWorkstation
                    }
                }
            } 
        }(),
        workprofile: function (){
            return {
                addWorkprofiles: function (workprofiles) {
                    return {
                        type: "ADD_WORKPROFILES",
                        payload: workprofiles
                    }
                },
                selectedWorkprofile: function (selectedWorkprofile) {
                    return {
                        type: "ADD_SELECTED_WORKPROFILE",
                        payload: selectedWorkprofile
                    }
                }
            } 
        }()
    }
}();