var init = new function() {

    var useAdvancedFailoverDetection = true;

    this.init = function() {
        qevents.init(false, typeof useAdvancedFailoverDetection !== 'undefined' && useAdvancedFailoverDetection ?
            servicePoint.cometDWSPollStatusHandler : "");
        //parse text areas and impose max length
        var txts = document.getElementsByTagName('TEXTAREA');
        for(var i = 0, l = txts.length; i < l; i++) {
            if(/^[0-9]+$/.test(txts[i].getAttribute("maxlength"))) {
                var func = function() {
                    var len = parseInt(this.getAttribute("maxlength"), 10);

                    if(this.value.length > len) {
                        this.value = this.value.substr(0, len);
                        return false;
                    }
                };
                txts[i].onkeyup = func;
                txts[i].onblur = func;
            }
        }

        sessvars.currentUser = spService.get('user');

        if(typeof sessvars.systemInformation == "undefined" || sessvars.systemInformation== "" || null == sessvars.systemInformation) {
            sessvars.systemInformation = spService.get('systemInformation');
        }
        jQuery.i18n.properties({
            name:'workstationTerminalMessages',
            path:'/workstationterminal/bundle/',
            mode:'map',
		    language: sessvars.currentUser.locale == " " ? sessvars.systemInformation.defaultLanguage : sessvars.currentUser.locale,
            callback : function () {
                i18n.i18nPage();
            }
        });
        //check for RTL rendering
        try{
            if(sessvars.currentUser.direction == "rtl") {
                document.getElementsByTagName("html")[0].setAttribute("dir", "rtl");
            }
        } catch(e) {
            //nothing found; rtl prop not set
        }

        //make stuff draggable
        // $(".branchForm, .logoutForm, .customerForm, .confirmCounterHijackingForm, .confirmCustomer, .transferForm").draggable({
        //     containment: "window",
        //     handle: "h2",
        //     cancel: "a"
        // });
		// chrome hack to allow for proper dragging, QP-892
        // $('.branchForm, .logoutForm, .customerForm, .confirmCounterHijackingForm, .confirmCustomer, .transferForm').each(function(i){
		// 	var x = ($(window).width() - $(this).width()) / 2;
		// 	$(this).css({position:"absolute",top:100,left:x});
        // });

        initSessvars();
        customer.init();
        queueViewController.init();
        notesController.init();
        servicePoint.init();
		if (moduleChatEnabled == true) {
			chat.init();
		}
    };

    var initSessvars = function() {
        sessvars.state = servicePoint.getState(spService.get("user/status"));
        sessvars.statusUpdated = new Date();
        if(typeof sessvars.state !== 'undefined' && sessvars.state != null &&
            typeof sessvars.state.branchId !== "undefined" && sessvars.state.branchId != null &&
            typeof sessvars.state.servicePointId !== "undefined" && sessvars.state.servicePointId != null &&
            typeof sessvars.state.workProfileId !== "undefined" && sessvars.state.workProfileId != null) {
            servicePoint.storeSettingsInSession(sessvars.state);
        } else {
            // something is not valid, everything is invalid. Scenario: New configuration has been published
            servicePoint.resetSettings();
        }
    }
};