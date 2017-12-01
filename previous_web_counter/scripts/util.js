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
                "sSearch": jQuery.i18n.prop('info.search')
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
                "sSearch": jQuery.i18n.prop('info.search')
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
                        config.filterData(json);
                    }
                    fnCallback({"iTotalRecords":json.length,"iTotalDisplayRecords":json.length, "aaData":json});
                });
            }
 //       });
         };
        if(typeof config.infoFiltered !== 'undefined') {
        	tableConfig.oLanguage.sInfoFiltered = translate.msg(config.infoFiltered, ["_MAX_"]);
        }
        table = $('#' + config.tableId).dataTable(tableConfig);
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

        var minutes = parseInt(secsIn / 60);
        var formatted = minutes < 1 ? "< 1 min" : minutes + " min";
        
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
        var messageDiv = $('<div/>').text(text).css({"width": "auto"});
        if(isError) {
            messageDiv.addClass("message errmsg");
        } else {
            messageDiv.addClass("message warningmessage");
        }

        // Do not show more than 3 messages
        if ($('#message').children().length > 2) {
            $('#message').children().first().remove();
        }

        $("#message").css('left', 0);
        $("#message").css("top", (parseInt($("#header").height())) + "px");
        messageDiv.appendTo($('#message'));

        var removeFunction = function() {
            messageDiv.remove();
            if($("#message").children().length == 0) {
                $("#message").css("visibility", "hidden");
                $("#message").css("top", 0);
            }
        };

        hideMessageTime = setTimeout(removeFunction, 5000);

        // set id to one bigger than last
        var messageId = "message_" + hideMessageTime;
        messageDiv.prop('id', messageId);

        messageDiv.append('<a href="#" onClick="util.removeMe(' + messageId + ', ' + hideMessageTime + ');" class="dismiss">X</a>');
        $('#message').css("visibility", "visible");
    };

    this.removeMe = function(toBeRemovedId, hideMessageTime) {
        window.clearTimeout(hideMessageTime);
        $(toBeRemovedId).remove();
        if($("#message").children().length == 0) {
            $("#message").css("visibility", "hidden");
            $("#message").css("top", 0);
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
        if(typeof paramArray === 'undefined' || !paramArray) {
            var errorDiv = $('<div/>').text(translate.msg(errorMessage));
        } else {
            var errorDiv = $('<div/>').text(translate.msg(errorMessage, paramArray));
        }
        errorDiv.appendTo($('#error'));
        var removeFunction = function() { errorDiv.remove(); };
        var hideErrorTime = setTimeout(removeFunction, 15000);
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
        var err = $("#error");
        var errorTextDiv = $("<div/>").text(text).css({"width": "auto"});;
        errorTextDiv.prop("id", 'text');
        errorTextDiv.addClass("message errmsg");
        err.css('left', 0);
        err.css("top", (parseInt($("#header").height())) + "px");

        errorTextDiv.appendTo(err);

        err.css("visibility", "visible");
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
                "sSearch": jQuery.i18n.prop('info.search')
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
};