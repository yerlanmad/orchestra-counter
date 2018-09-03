var init = new function () {

    var useAdvancedFailoverDetection = true;

    this.init = function () {
        qevents.init(false, typeof useAdvancedFailoverDetection !== 'undefined' && useAdvancedFailoverDetection ?
            servicePoint.cometDWSPollStatusHandler : "");
        //parse text areas and impose max length
        var txts = document.getElementsByTagName('TEXTAREA');
        for (var i = 0, l = txts.length; i < l; i++) {
            if (/^[0-9]+$/.test(txts[i].getAttribute("maxlength"))) {
                var func = function () {
                    var len = parseInt(this.getAttribute("maxlength"), 10);

                    if (this.value.length > len) {
                        this.value = this.value.substr(0, len);
                        return false;
                    }
                };
                txts[i].onkeyup = func;
                txts[i].onblur = func;
            }
        }

        sessvars.currentUser = spService.get('user');

        if (typeof sessvars.systemInformation == "undefined" || sessvars.systemInformation == "" || null == sessvars.systemInformation) {
            sessvars.systemInformation = spService.get('systemInformation');
        }
        jQuery.i18n.properties({
            name: 'workstationTerminalMessages',
            path: '/workstationterminal/bundle/',
            mode: 'map',
            language: sessvars.currentUser.locale == " " ? sessvars.systemInformation.defaultLanguage : sessvars.currentUser.locale,
            callback: function () {
                i18n.i18nPage();
            }
        });
        //check for RTL rendering
        try {
            if (sessvars.currentUser.direction == "rtl") {
                document.getElementsByTagName("html")[0].setAttribute("dir", "rtl");
            }
        } catch (e) {
            //nothing found; rtl prop not set
        }
        
        initDataTablesConfiguration()
        initSessvars();
        customer.init != undefined && typeof customer.init == "function" && customer.init();
        queueViewController.init();
        notesController.init();
        util.updateServicesExpectedTransactionTimes();
        servicePoint.init();
        initKeyboardEvents();
        if (moduleChatEnabled == true) {
            chat.init();
        }
    };

    var initDataTablesConfiguration = function () {
        // qm-sort ASCENDING
        jQuery.fn.dataTableExt.oSort['qm-sort-asc'] = function (a, b) {
            var multiplier = 0;
            var ax = [], bx = [];

            var a = multiplier ? (parseFloat(a) * multiplier).toString() : a.toString();
            var b = multiplier ? (parseFloat(b) * multiplier).toString() : b.toString();

            a.replace(/(\d+)|(\D+)/g, function (_, $1, $2) { ax.push([$1 || Infinity, $2 || ""]) });
            b.replace(/(\d+)|(\D+)/g, function (_, $1, $2) { bx.push([$1 || Infinity, $2 || ""]) });

            while (ax.length && bx.length) {
                var an = ax.shift();
                var bn = bx.shift();
                var nn = (an[0] - bn[0]) || an[1].localeCompare(bn[1]);
                if (nn) return nn;
            }

            return ax.length - bx.length;
        }

        // qm-sort DECENDING
        jQuery.fn.dataTableExt.oSort['qm-sort-desc'] = function (a, b) {
            var multiplier = 0;
            var ax = [], bx = [];

            var a = multiplier ? (parseFloat(a) * multiplier).toString() : a.toString();
            var b = multiplier ? (parseFloat(b) * multiplier).toString() : b.toString();

            a.replace(/(\d+)|(\D+)/g, function (_, $1, $2) { ax.push([$1 || Infinity, $2 || ""]) });
            b.replace(/(\d+)|(\D+)/g, function (_, $1, $2) { bx.push([$1 || Infinity, $2 || ""]) });

            while (ax.length && bx.length) {
                var an = ax.shift();
                var bn = bx.shift();
                var nn = (bn[0] - an[0]) || bn[1].localeCompare(an[1]);
                if (nn) return nn;
            }

            return bx.length - ax.length;
        };
    }

    var initSessvars = function () {
        sessvars.state = servicePoint.getState(spService.get("user/status"));
        sessvars.statusUpdated = new Date();
        if (typeof sessvars.state !== 'undefined' && sessvars.state != null &&
            typeof sessvars.state.branchId !== "undefined" && sessvars.state.branchId != null &&
            typeof sessvars.state.servicePointId !== "undefined" && sessvars.state.servicePointId != null &&
            typeof sessvars.state.workProfileId !== "undefined" && sessvars.state.workProfileId != null) {
            servicePoint.storeSettingsInSession(sessvars.state);
        } else {
            // something is not valid, everything is invalid. Scenario: New configuration has been published
            servicePoint.resetSettings();
        }
    }

    var initKeyboardEvents = function () {
        var $callNextBtn = $('#callNextBtn'),
            $walkInBtn   = $('#walkDirectBtn'),
            $endBtn      = $('#endVisitBtn');

        Mousetrap.unbind('alt+n');
        Mousetrap.unbind('alt+w');
        Mousetrap.unbind('alt+e');

        Mousetrap.bind('alt+n', function(e) {
            $callNextBtn.trigger('onclick');
            return false;
        });
        Mousetrap.bind('alt+w', function(e) {
            $walkInBtn.trigger('onclick');
            return false;
        });
        Mousetrap.bind('alt+e', function(e) {
            $endBtn.trigger('onclick');
            return false;
        });
    }
};