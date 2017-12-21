/**
 * www.datatables.net contains documentation and source code of the data table model used in
 * e.g. the walk direct table
 */
var util = new function() {

    var hideErrorTime;
    var hideMessageTime;

    this.disableOnChange = function(select) {
        //Temporarily remove selection box event listeners to avoid firing the onchange event...
        if(select.removeEventListener) {
            //...in nice browsers...
            select.removeEventListener('onchange', select.onchange, false);
        }
        else if(select.detachEvent) {
            //...in crappy browsers
            select.detachEvent('onchange', select.onchange);
        }
        else {
            select.onchange = "";
        }
    };

    this.enableOnChange = function(select) {
        //Enable selection box firing of the onchange event...
        if(select.addEventListener) {
            //...in nice browsers...
            select.addEventListener('onchange', select.onchange, false);
        }
        else if(select.attachEvent) {
            //...in crappy browsers
            select.attachEvent('onchange', select.onchange);
        }
        else {
            select.onchange = "";
        }
    };

    this.clearSelect = function(select) {
        select.find('option[value != "-1"]').remove();
    };

    /**
     *
     * @param select the jquery select object
     * @param value the value to set
     */
    this.setSelect = function(select, value) {
        select.prop('selectedIndex', $("#" + select.prop('id') + " option[value=" + value + "]").index());
//        for(i = 0; i < select.length; i++) {
//            if(select.options[i].value == value) {
//                select.selectedIndex = select.options[i].index;
//                break;
//            }
//        }
        select.trigger("chosen:updated");
    };

    /**
     * Initializes jQuery.dataTables on a plain HTML table element
     * tableId: the HTML id
     * url: populate the table with data from this RESTful resource identifier, e.g. "/rest/workstation/branches/" + sessvars.branchId + "/services"
     * rowCallback: called when a row is clicked
     * columns: defines visibility and searchability for the table columns
     * filter: boolean to enable a search field in the table
     * headerCallback: modifies the table header. Called each time the table is drawn
     * popup: if the table should be placed in a popup, the scroll height is bigger
     */
    this.buildTable = function(tableId, url, rowCallback, columns, filter, headerCallback, popup) {
        var table;
        table = $('#' + tableId).dataTable( {
            "bDestroy": true,
            "sScrollX": "100%",
            "sScrollY": (popup ? "300px" : "158px"),
            "oLanguage": {
                "sEmptyTable": "",
                "sInfo": "",
                "sInfoEmpty": "",
                "sZeroRecords": "",
                // "sSearch": jQuery.i18n.prop('info.search')
                "sSearch": "",
                "sSearchPlaceholder": config.placeholder ? config.placeholder : ""
            },
            "bFilter": filter,
            "fnRowCallback": rowCallback,
            "fnHeaderCallback": headerCallback,
            "bLengthChange": false,
            "bPaginate": false,
            "aoColumns": columns,
            "bProcessing": true,
            "sAjaxSource": url,
            "fnServerData": function(sSource, aoData, fnCallback) {
                $.getJSON(sSource, aoData, function(json) {
                    fnCallback({"iTotalRecords":json.length,"iTotalDisplayRecords":json.length, "aaData":json});
                });
            }
        });
        return table;
    };

    /**
     * Initializes jQuery.dataTables on a plain HTML table element
     * @param config
     * tableId: the HTML id
     * url: populate the table with data from this RESTful resource identifier, e.g. "/rest/workstation/branches/" + sessvars.branchId + "/services"
     * rowCallback: called when a row is clicked
     * columns: defines visibility and searchability for the table columns
     * filter: boolean to enable a search field in the table
     * headerCallback: modifies the table header. Called each time the table is drawn
     */
    this.buildTableJson = function(config) {
    	// QP-1285, IE caches things way too aggressively
    	if (typeof lowfiie !== 'undefined' && lowfiie) {
	    	if (config.url.indexOf('?') == -1) {
	    		config.url = config.url + '?breakcache=' + Math.random();
	    	} else {
	    		config.url = config.url + '&breakcache=' + Math.random();
	    	}
	    }
        var table;
//        table = $('#' + config.tableId).dataTable( {
		var tableConfig = {
            "bDestroy": true,
            "sScrollX": "100%",
            "sScrollY": (config.scrollYHeight ? config.scrollYHeight : "158px"),
            "oLanguage": {
                "sEmptyTable": typeof config.emptyTableLabel !== 'undefined' ? translate.msg(config.emptyTableLabel): "",
                "sInfo": "",
                "sInfoEmpty": "",
                "sZeroRecords": "",
                // "sSearch": jQuery.i18n.prop('info.search')
                "sSearch": "",
                "sSearchPlaceholder": config.placeholder ? config.placeholder : ""
            },
            "bFilter": config.filter,
            "fnRowCallback": config.rowCallback,
            "fnHeaderCallback": config.headerCallback,
            "bLengthChange": false,
            "bPaginate": false,
            "aoColumns": config.columns,
            "bProcessing": true,
            "aaSorting": [],
            "sAjaxSource": config.url,
            "fnServerData": function(sSource, aoData, fnCallback) {
                $.getJSON(sSource, aoData, function(json) {
                    if(typeof config.filterData !== 'undefined' ){
                        json = config.filterData(json);
                    }
                    if(typeof config.initFn !== 'undefined') {
                        config.initFn(json);
                    }
                    fnCallback({"iTotalRecords":json.length,"iTotalDisplayRecords":json.length, "aaData":json});
                });
            }
 //       });
         };
        if(typeof config.infoFiltered !== 'undefined') {
        	tableConfig.oLanguage.sInfoFiltered = translate.msg(config.infoFiltered, ["_MAX_"]);
        }
        if(typeof config.tableSelector !== 'undefined') {
            table = $(config.tableSelector).dataTable(tableConfig);
        } else {
            table = $('#' + config.tableId).dataTable(tableConfig);
        }
        $(window).bind('resize', function () {
            table.fnAdjustColumnSizing();
        } );
        return table;
    };

    /**
     *
     * @param tableId
     * @param url
     * @param rowCallback
     * @param columns
     * @param filter
     * @param headerCallback
     * @param popup
     */
    this.buildSubtable = function(table, data, rowCallback, subtableId, columns) {
        var subtable = $('<table class="subTable" cellpadding="0" cellspacing="0"><tbody></tbody></table>');
        $.each(data, function(i, item) {
            if(typeof item[columns.id] !== 'undefined') {
                subtable.find('tbody')
                    .append($('<tr>').prop('id', item[columns.id]).click(function() {
                    rowCallback(item[columns.id]);
                })
                        .append($('<td>')
                            .append($('<span>' + item[columns.name] + '</span>')
                            )
                        )
                    )
            }
        });
        return subtable;
    };

    this.clearTable = function(table) {
        if(typeof table != "undefined") {
            if(table != null) {
                if(table.fnClearTable instanceof Function) {
                    table.fnClearTable();
                }
            }
        }
    };

    this.buttonHover = function(button) {
        if(button.className != button.id+"_dim")
            button.className = button.id+"_over";
    };

    this.buttonOut = function(button) {
        if(button.className != button.id+"_dim")
            button.className = button.id;
    };

    this.formatIntoHHMMSS = function(secsIn) {
        if(secsIn == -1) {
            return "";
        }
        var hours = parseInt(secsIn / 3600);
        var remainder = secsIn % 3600;
        var minutes = parseInt(remainder / 60);
        var seconds = remainder % 60;
        var formatted =  (hours < 10 ? "0" : "") + hours
                + ":" + (minutes < 10 ? "0" : "") + minutes
                + ":" + (seconds< 10 ? "0" : "") + seconds;
        return formatted;
    };

    this.formatIntoHHMM = function(secsIn) {
        if(secsIn == -1) {
            return "";
        }
        var hours = parseInt(secsIn / 3600);
        var remainder = secsIn % 3600;
        var minutes = parseInt(remainder / 60);
        var formatted =  (hours < 10 ? "0" : "") + hours
                + ":" + (minutes < 10 ? "0" : "") + minutes;
        return formatted;
    };

    this.formatIntoMM = function(secsIn) {
        if(secsIn == -1) {
            return "";
        }
        var formatted;

        if(secsIn == 0) {
            formatted = "0 min";
        } else {
            var minutes = parseInt(secsIn / 60);
            formatted = minutes < 1 ? "< 1 min" : minutes + " min";
        }
        
        return formatted;
    };
	
	this.formatDateIntoHHMMSS = function(timeAsDateObject) {
        if(timeAsDateObject == null) {
            return "";
        }
        var hours = timeAsDateObject.getHours();        
        var minutes = timeAsDateObject.getMinutes();
		var seconds = timeAsDateObject.getSeconds();		
        var formatted =  (hours < 10 ? "0" : "") + hours
                + ":" + (minutes < 10 ? "0" : "") + minutes
				+ ":" + (seconds < 10 ? "0" : "") + seconds;
        return formatted;
    };

    this.validateProfile = function(profileSel) {
        if (profileSel.val() == -1) {
            util.showError(jQuery.i18n.prop("error.no.profile"));
            return false;
        }
        return true;
    };

    this.populateSettingsSelect = function(items, select) {
        util.populateSelect(items, select);
        if(items.length <= 1) {
            select.prop('selectedIndex', 1);
        }
    };

    /**
     *
     * @param items
     * @param select
     */
    this.populateSelect = function(items, select, metaDataProp) {
        $.each(items, function(key, value) {
            select
                .append($('<option>', { value : typeof metaDataProp !== 'undefined' ? value[metaDataProp] : value.id})
                .text(value.name));
        });
    };

    this.showMessage = function(text, isError) {
        // Build toast
        var toast = $('<div class="qm-toast"><div class="qm-toast__layout"><span class="qm-toast__message"></span></div></div>');

        if(isError) {
            toast.addClass("qm-toast--danger");
        } else {
            toast.addClass("qm-toast--success");
        }

        // Do not show more than 3 messages
        var $messageContainer = $('#message');
        if ($messageContainer.children().length > 2) {
            $messageContainer.children().last().remove();
        }

        $messageContainer.css('left', 0);
        $messageContainer.css("top", (parseInt($("#header").height())) + "px");

        var removeFunction = function() {
            toast.fadeOut(400, function() {
                toast.remove();
                if($messageContainer.children().length == 0) {
                    $messageContainer.css("visibility", "hidden");
                    $messageContainer.css("top", 0);
                }
            });
        };

        // Hide after 5s
        hideMessageTime = setTimeout(removeFunction, 5000);

        // set id to one bigger than last
        var messageId = "message_" + hideMessageTime;
        toast.prop('id', messageId);
        // Append text
        toast.find('.qm-toast__message').text(text);
        // Append close button
        toast.find('.qm-toast__layout').append('<button class="qm-action-btn qm-action-btn--only-icon qm-toast__close-btn" onClick="util.removeMe(' + messageId + ', ' + hideMessageTime + ');"><i class="qm-action-btn__icon icon-close" aria-hidden="true"></i><span class="sr-only">' + jQuery.i18n.prop('application.sr.close') + '</span></button>');
        $messageContainer.css("visibility", "visible");

        // Prepend and fadeIn
        toast.prependTo($messageContainer);
        toast.fadeIn();
    };

    this.removeMe = function(toBeRemovedId, hideMessageTime) {
        window.clearTimeout(hideMessageTime);
        var $elem = $(toBeRemovedId);

        $elem.fadeOut(400, function() {
            $elem.remove();
            if($("#message").children().length == 0) {
                $("#message").css("visibility", "hidden");
                $("#message").css("top", 0);
            }
        });
    };

    this.compareTimeInPool = function (a, b) {
        return b.waitingTime - a.waitingTime;
    };

    this.poolResizeHandler = function (pool) {
        var poolList        = pool.find('.qm-pool__list'),
            poolToggle      = pool.find('.qm-pool__toggle-btn');

        $(window).on('resize', _.debounce(function() {
            util.determineIfToggleNeeded(pool, poolList, poolToggle);
        }, 300));
    };

    this.determineIfToggleNeeded = function ($pool, $poolList, $poolToggle) {
        var isPoolView = $('.qm-main').hasClass('qm-main--no-queues');
        if(!isPoolView) {
            if($poolList.height() > 50) {
                $poolToggle.fadeIn();
            } else {
                $poolToggle.hide();
            }
        } else {
            $poolToggle.hide();
        }
    };

    /**
     * @param errorMessage the name of a property in
     * graphicalDisplayMessages.properties
     */
    this.showError = function(errorMessage) {
        util.showMessage(errorMessage, true);
    };

    /**
     * Not used yet
     * @param errorMessage
     * @param paramArray
     */
    this.showCometDError = function(errorMessage, paramArray) {

        var toast = $('<div class="qm-toast qm-toast--danger"><div class="qm-toast__layout"><span class="qm-toast__message"></span></div></div>');
        
        if(typeof paramArray === 'undefined' || !paramArray) {
            toast.find('.qm-toast__message').text(translate.msg(errorMessage));
            //var errorDiv = $('<div/>').text(translate.msg(errorMessage));
        } else {
            toast.find('.qm-toast__message').text(translate.msg(errorMessage, paramArray));
            //var errorDiv = $('<div/>').text(translate.msg(errorMessage, paramArray));
        }

        var $messageContainer = $('#error');

        if ($messageContainer.children().length > 2) {
            $messageContainer.children().last().remove();
        }

        $messageContainer.css('left', 0);
        $messageContainer.css("top", (parseInt($("#header").height())) + "px");

        var removeFunction = function() {
            toast.fadeOut(400, function() {
                toast.remove();
                if($messageContainer.children().length == 0) {
                    $messageContainer.css("visibility", "hidden");
                    $messageContainer.css("top", 0);
                }
            });
        };
        
        // Hide after 15s
        hideErrorTime = setTimeout(removeFunction, 15000);

        // Set id
        var messageId = "cometdErrorMessage_" + hideErrorTime;
        toast.prop('id', messageId);

        // Add close button
        toast.find('.qm-toast__layout').append('<button class="qm-action-btn qm-action-btn--only-icon qm-toast__close-btn" onClick="util.removeMe(' + messageId + ', ' + hideErrorTime + ');"><i class="qm-action-btn__icon icon-close" aria-hidden="true"></i><span class="sr-only">' + jQuery.i18n.prop('application.sr.close') + '</span></button>');
        $messageContainer.css("visibility", "visible");

        toast.prependTo($messageContainer);
        toast.fadeIn();
    };

    /**
     * Turns a Unit ID such as "GBG:WDP:1" into "GBG/WDP/1"
     */
    this.asChannelStr = function(str) {
        return str.replace(new RegExp(':', 'g'),'/');
    };

    this.asChannelStrWithUserName = function(unitId, userName) {
        return this.asChannelStr(unitId) + "/" + userName;
    }

    this.showPermanentError = function(text) {
        setError(text);
    };

    var setError = function(text) {
        var toast = $('<div class="qm-toast qm-toast--danger"><div class="qm-toast__layout"><span class="qm-toast__message"></span></div></div>');
        toast.prop('id', 'text');
       
        toast.find('.qm-toast__message').text(text);

        var $messageContainer = $('#error');

        if ($messageContainer.children().length > 2) {
            $messageContainer.children().last().remove();
        }

        $messageContainer.css('left', 0);
        $messageContainer.css("top", (parseInt($("#header").height())) + "px");

        $messageContainer.css("visibility", "visible");

        toast.prependTo($messageContainer);
        toast.fadeIn();
    };

    this.hideError = function() {
        $("#text").remove();
        $("#error").css("visibility", "hidden");
    };

    this.showModal = function(divId) {
        window.onscroll = function () {
            $("#" + divId).css("top", document.body.scrollTop);
        };
        $("#" + divId).css("display", "block");
        $("#" + divId).css("top", document.body.scrollTop);
    };

    this.hideModal = function(divId) {
        $("#" + divId).hide();
    };

    this.zeroPad = function(num,count) {
        var numZeropad = num + '';
        while(numZeropad.length < count) {
            numZeropad = "0" + numZeropad;
        }
        return numZeropad;
    };

    this.secondsToHms = function(secs) {
        var t = new Date(1970,0,1);
        t.setSeconds(secs);
        return t.toTimeString().substr(0,8);
    };

    this.secondsToHm = function(secs) {
        var t = new Date(1970,0,1);
        t.setSeconds(secs);
        return t.toTimeString().substr(0,5);
    };

    this.log = function(object) {
        if (typeof console !== 'undefined' && console.log) {
            if(typeof Date.now === 'function') {
                var timestamp = '[' + Date.now() + '] ';
                console.log(timestamp, object);
            } else {
                console.log(object);
            }
        }
    };

    /**
     * Initializes jQuery.dataTables on a plain HTML table element
     * @param config
     * tableId: the HTML id
     * url: populate the table with data from this RESTful resource identifier, e.g. "/rest/workstation/branches/" + sessvars.branchId + "/services"
     * rowCallback: called when a row is clicked
     * columns: defines visibility and searchability for the table columns
     * filter: boolean to enable a search field in the table
     * headerCallback: modifies the table header. Called each time the table is drawn
     */
    this.buildTableJsonNoUrl = function(config) {
        var table;

        table = $('#' + config.tableId).dataTable( {
            "bDestroy": true,
            "sScrollX": "100%",
            "sScrollY": (config.scrollYHeight ? config.scrollYHeight : "158px"),
            "oLanguage": {
                "sEmptyTable": typeof config.emptyTableLabel !== 'undefined' ? translate.msg(config.emptyTableLabel): "",
                "sInfo": "",
                "sInfoEmpty": "",
                "sZeroRecords": "",
                "sSearch": "",
                "sSearchPlaceholder": config.placeholder ? config.placeholder : ""
            },
            "bFilter": config.filter,
            "fnRowCallback": config.rowCallback,
            "fnHeaderCallback": config.headerCallback,
            "bLengthChange": false,
            "bPaginate": false,
            "aoColumns": config.columns,
            "bProcessing": true,
            "data": config.data
        });
        $(window).bind('resize', function () {
            table.fnAdjustColumnSizing();
        } );
        return table;
    };

    /**
     *  Take User back to home page
     */
    this.goToModulesPage = function () {
        window.location.href = "/"
    }
};