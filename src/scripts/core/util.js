/**
 * www.datatables.net contains documentation and source code of the data table model used in
 * e.g. the walk direct table
 */
var util = new function () {

    var hideErrorTime;
    var hideMessageTime;

    this.disableOnChange = function (select) {
        //Temporarily remove selection box event listeners to avoid firing the onchange event...
        if (select.removeEventListener) {
            //...in nice browsers...
            select.removeEventListener('onchange', select.onchange, false);
        }
        else if (select.detachEvent) {
            //...in crappy browsers
            select.detachEvent('onchange', select.onchange);
        }
        else {
            select.onchange = "";
        }
    };

    this.updateServicesExpectedTransactionTimes = function () {
        if(sessvars.branchId !== null) {
            var t = new Date();
            var url = "branches/" + sessvars.branchId
                + "/services?call=" + t;
            var services = spService.get(url);
            var expectedTransactionTimes = {};
            for(var i = 0; i < services.length; i++) {
                expectedTransactionTimes[services[i].id] = services[i].targetTransactionTime;
            }
            window.servicesExpectedTransactionTimes = expectedTransactionTimes;
        }
    };

    this.setServiceExpectedTransactionTime = function () {
        if(sessvars.state && sessvars.state.visit && sessvars.state.visit.currentVisitService) {
            var serviceId = sessvars.state.visit.currentVisitService.serviceId;
            var $expectedTransactionTime = $("#expectedTransactionTime");
            if (serviceId) {
                $expectedTransactionTime.empty().text('(' + this.secondsToMs(window.servicesExpectedTransactionTimes[serviceId]) + ')');
                $expectedTransactionTime.attr('title', translate.msg('info.card.visitCard.expected.transaction.time'));
            }
        }
    };

    this.clearServiceExpectedTransactionTime = function () {
        var $expectedTransactionTime = $("#expectedTransactionTime");
        $expectedTransactionTime.empty();
        $expectedTransactionTime.attr('title', null);

    };

    this.enableOnChange = function (select) {
        //Enable selection box firing of the onchange event...
        if (select.addEventListener) {
            //...in nice browsers...
            select.addEventListener('onchange', select.onchange, false);
        }
        else if (select.attachEvent) {
            //...in crappy browsers
            select.attachEvent('onchange', select.onchange);
        }
        else {
            select.onchange = "";
        }
    };

    this.clearSelect = function (select) {
        select.find('option[value != "-1"]').remove();
    };

    this.twinkleTicketNumber = function () {
        var $ticketNumber = $('#ticketNumber'),
            lengthOfAnimation = 3000;

        $ticketNumber.addClass('qm-twinkle-animation');
        setTimeout(function () {
            $ticketNumber.removeClass('qm-twinkle-animation');
        }, lengthOfAnimation);
    };

    /**
     *
     * @param select the jquery select object
     * @param value the value to set
     */
    this.setSelect = function (select, value) {
        select.prop('selectedIndex', $("#" + select.prop('id') + " option[value=" + value + "]").index());
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
    this.buildTable = function (tableId, url, rowCallback, columns, filter, headerCallback, popup) {
        var table;
        table = $('#' + tableId).dataTable({
            "bDestroy": true,
            "sScrollX": "100%",
            "sScrollY": (popup ? "300px" : "158px"),
            "oLanguage": {
                "sEmptyTable": "",
                "sInfo": "",
                "sInfoEmpty": "",
                "sZeroRecords": "",
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
            "fnServerData": function (sSource, aoData, fnCallback) {
                $.getJSON(sSource, aoData, function (json) {
                    fnCallback({ "iTotalRecords": json.length, "iTotalDisplayRecords": json.length, "aaData": json });
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
    this.buildTableJson = function (config) {
        // QP-1285, IE caches things way too aggressively
        if (typeof lowfiie !== 'undefined' && lowfiie) {
            if (config.url.indexOf('?') == -1) {
                config.url = config.url + '?breakcache=' + Math.random();
            } else {
                config.url = config.url + '&breakcache=' + Math.random();
            }
        }
        var table;
        var tableConfig = {
            "bDestroy": true,
            "sScrollX": "100%",
            "sScrollY": (config.scrollYHeight ? config.scrollYHeight : "158px"),
            "oLanguage": {
                "sEmptyTable": typeof config.emptyTableLabel !== 'undefined' ? translate.msg(config.emptyTableLabel) : "",
                "sInfo": "",
                "sInfoEmpty": "",
                "sZeroRecords": typeof config.emptySearchLabel !== 'undefined' ? translate.msg(config.emptySearchLabel) : "",
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
            "fnServerData": function (sSource, aoData, fnCallback) {
                $.getJSON(sSource, aoData, function (json) {
                    if (typeof config.filterData !== 'undefined') {
                        json = config.filterData(json);
                    }
                    if (typeof config.initFn !== 'undefined') {
                        config.initFn(json);
                    }
                    fnCallback({ "iTotalRecords": json.length, "iTotalDisplayRecords": json.length, "aaData": json });
                });
            }
        };
        if (typeof config.infoFiltered !== 'undefined') {
            tableConfig.oLanguage.sInfoFiltered = translate.msg(config.infoFiltered, ["_MAX_"]);
        }
        if (typeof config.tableSelector !== 'undefined') {
            table = $(config.tableSelector).dataTable(tableConfig);
        } else {
            table = $('#' + config.tableId).dataTable(tableConfig);
        }
        if (config.filter && config.customFilter) {
            var $searchableContainer = $("#" + config.tableId + "_filter");
            var $searchInput = $searchableContainer.find("input");
            var $clearBtn = $searchableContainer.find('.js-table-filter-clear-btn');
            var _self = this;

            $searchInput.off('keyup change', '**');
            $searchInput.on('keyup change', function () {
                var searchVal = $(this).val();
                _self.toggleClearButton(searchVal, $searchableContainer);
                table.api().search(searchVal).draw();
            });
            $clearBtn.off('click', this._clearSearchField);
            $clearBtn.on('click', this._clearSearchField.bind(this, $searchInput));
        }
        $(window).bind('resize', function () {
            table.fnAdjustColumnSizing();
        });
        return table;
    };

    this.toggleClearButton = function (searchValue, searchContainer) {
        if (searchValue !== "") {
            searchContainer.addClass('qm-search-filter--show-clear-btn');
        } else {
            searchContainer.removeClass('qm-search-filter--show-clear-btn');
        }
    };
    
    this._clearSearchField = function ($searchInput) {
        var event = $.Event('keyup');
        $searchInput.val("");
        $searchInput.trigger(event);
    };

    this.dateReplacer = function(match, dateOfBirth) {
        var numberOfChars = match.length;
        if (match.toLocaleLowerCase().indexOf("y") > -1) {
            // Year
            if (numberOfChars === 2) {
                return dateOfBirth[0].substring(2, 4);
            }
            return dateOfBirth[0].substring(0, 4);
        } else if (match.toLocaleLowerCase().indexOf("m") > -1) {
            // Month
            if (numberOfChars === 1) {
                return "" + parseInt(dateOfBirth[1], 10);
            }
            return dateOfBirth[1];
        } else if (match.toLocaleLowerCase().indexOf("d") > -1) {
            // Day
            var day = dateOfBirth[2].substring(0, 2);
            if (numberOfChars === 1) {
                return "" + parseInt(day, 10);
            }
            return dateOfBirth[2];
        }
    }
    
    this.formatDateToDateConvention = function (dateOfBirth) {
        if (dateOfBirth) {
            var splitDate = dateOfBirth.split("-");
            if (splitDate.length === 3) {
                var dateFormatRegExp = new RegExp(/(y+)|(m+)|(d+)/, "gi");
                return sessvars.systemInformation.dateConvention.replace(dateFormatRegExp, function (match) {
                    return util.dateReplacer(match, splitDate);
                });
            } else {
                return dateOfBirth.substring(0, 10);
            }
        }
        return dateOfBirth;
    }

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
    this.buildSubtable = function (table, data, rowCallback, subtableId, columns) {
        var subtable = $('<table class="subTable" cellpadding="0" cellspacing="0"><tbody></tbody></table>');
        $.each(data, function (i, item) {
            if (typeof item[columns.id] !== 'undefined') {
                subtable.find('tbody')
                    .append($('<tr>').prop('id', item[columns.id]).click(function () {
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

    this.clearTable = function (table) {
        if (typeof table != "undefined") {
            if (table != null) {
                if (table.fnClearTable instanceof Function) {
                    table.fnClearTable();
                }
            }
        }
    };

    this.buttonHover = function (button) {
        if (button.className != button.id + "_dim")
            button.className = button.id + "_over";
    };

    this.buttonOut = function (button) {
        if (button.className != button.id + "_dim")
            button.className = button.id;
    };

    this.formatHHMMSSIntoHHMMA = function (time) {
        if (sessvars.systemInformation.timeConvention === "AM/PM") {
            var H = +time.substr(0, 2);
            var h = H % 12 || 12;
            var ampm = this.amPmFromHour(H);
            return h + time.substr(2, 3) + ampm;
        } else {
            return time.substr(0, 5);
        }
    }

    this.formatIntoHHMMSS = function (secsIn) {
        if (secsIn == -1) {
            return "";
        }
        var hours = parseInt(secsIn / 3600);
        var remainder = secsIn % 3600;
        var minutes = parseInt(remainder / 60);
        var seconds = remainder % 60;
        var formatted = (hours < 10 ? "0" : "") + hours
            + ":" + (minutes < 10 ? "0" : "") + minutes
            + ":" + (seconds < 10 ? "0" : "") + seconds;
        return formatted;
    };

    this.amPmFromHour = function (hours) {
        var ampm = (hours < 12 || hours === 24) ? " AM" : " PM";
        return ampm;
    }

    this.formatIntoHHMM = function (secsIn) {
        if (secsIn == -1) {
            return "";
        }
        var hours = parseInt(secsIn / 3600);
        var remainder = secsIn % 3600;
        var minutes = parseInt(remainder / 60);
        var formatted = (hours < 10 ? "0" : "") + hours
            + ":" + (minutes < 10 ? "0" : "") + minutes;
        return formatted;
    };

    this.formatIntoMM = function (secsIn) {
        if (secsIn == -1) {
            return "";
        }
        var formatted;

        if (secsIn == 0) {
            formatted = "0 min";
        } else {
            var minutes = parseInt(secsIn / 60);
            formatted = minutes < 1 ? "< 1 min" : minutes + " min";
        }

        return formatted;
    };

    this.formatDateIntoHHMMSS = function (timeAsDateObject) {
        if (timeAsDateObject == null) {
            return "";
        }
        var hours = timeAsDateObject.getHours();
        var minutes = timeAsDateObject.getMinutes();
        var seconds = timeAsDateObject.getSeconds();
        var formatted = (hours < 10 ? "0" : "") + hours
            + ":" + (minutes < 10 ? "0" : "") + minutes
            + ":" + (seconds < 10 ? "0" : "") + seconds;
        return formatted;
    };

    this.formatDateIntoHHMM = function (timeAsDateObject) {
        if (timeAsDateObject == null) {
            return "";
        }
        var hours = timeAsDateObject.getHours();
        var minutes = timeAsDateObject.getMinutes();
        if(sessvars.systemInformation.timeConvention === "AM/PM") {
            var ampm = this.amPmFromHour(hours);
            var h = hours % 12 || 12;
            return h + ":" + (minutes < 10 ? "0" : "") + minutes + ampm;
        } else {
            return (hours < 10 ? "0" : "") + hours
            + ":" + (minutes < 10 ? "0" : "") + minutes;
        }
    };

    this.formatHHMMToTimeConvention = function(dateAsHHMM) {
        var time = dateAsHHMM.split(':');
        var date = new Date();
        date.setHours(time[0]);
        date.setMinutes(time[1]);
        return this.formatDateIntoHHMM(date);
    }

    this.validateProfile = function (profileSel) {
        if (profileSel.val() == -1) {
            util.showError(jQuery.i18n.prop("error.no.profile"));
            return false;
        }
        return true;
    };

    this.populateSettingsSelect = function (items, select) {
        util.populateSelect(items, select);
        if (items.length <= 1) {
            select.prop('selectedIndex', 1);
        }
    };

    /**
     *
     * @param items
     * @param select
     */
    this.populateSelect = function (items, select, metaDataProp) {
        $.each(items, function (key, value) {
            select
                .append($('<option>', { value: typeof metaDataProp !== 'undefined' ? value[metaDataProp] : value.id })
                    .text(value.name));
        });
    };

    this.populateDateSelect = function ($selects) {
        var months = [
            {id: "01", name: translate.msg('info.month.january')},
            {id: "02", name: translate.msg('info.month.february')},
            {id: "03", name: translate.msg('info.month.march')},
            {id: "04", name: translate.msg('info.month.april')},
            {id: "05", name: translate.msg('info.month.may')},
            {id: "06", name: translate.msg('info.month.june')},
            {id: "07", name: translate.msg('info.month.july')},
            {id: "08", name: translate.msg('info.month.august')},
            {id: "09", name: translate.msg('info.month.september')},
            {id: "10", name: translate.msg('info.month.october')},
            {id: "11", name: translate.msg('info.month.november')},
            {id: "12", name: translate.msg('info.month.december')},
        ];

        $selects.each(function(index, select) {
            var $select = $(select);
            util.populateSelect(months, $select);
            $select.trigger('chosen:updated');
        });
    }



    this.showMessage = function (text, isError) {
        // Build toast
        var toast = $('<div class="qm-toast"><div class="qm-toast__layout"><span class="qm-toast__message"></span></div></div>');

        if (isError) {
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

        var removeFunction = function () {
            toast.fadeOut(400, function () {
                toast.remove();
                if ($messageContainer.children().length == 0) {
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

    this.removeMe = function (toBeRemovedId, hideMessageTime) {
        window.clearTimeout(hideMessageTime);
        var $elem = $(toBeRemovedId);

        $elem.fadeOut(400, function () {
            $elem.remove();
            if ($("#message").children().length == 0) {
                $("#message").css("visibility", "hidden");
                $("#message").css("top", 0);
            }
        });
    };

    this.compareTimeInPool = function (a, b) {
        var a1 = a.waitingTime;
        var a2 = a.ticketId;
        var b1 = b.waitingTime;
        var b2 = b.ticketId;
        if (a1 < b1) return 1;
        if (a1 > b1) return -1;
        if (a2 < b2) return -1;
        if (a2 > b2) return 1;
        return 0;
    };

    this.poolResizeHandler = function (pool) {
        var poolList = pool.find('.qm-pool__list'),
            poolToggle = pool.find('.qm-pool__toggle-btn');

        $(window).on('resize', _.debounce(function () {
            util.determineIfToggleNeeded(pool, poolList, poolToggle);
        }, 300));
    };

    this.determineIfToggleNeeded = function ($pool, $poolList, $poolToggle) {
        var isPoolView = $('.qm-main').hasClass('qm-main--no-queues');
        if (!isPoolView) {
            if ($poolList.height() > 50) {
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
    this.showError = function (errorMessage) {
        util.showMessage(errorMessage, true);
    };

    /**
     * Not used yet
     * @param errorMessage
     * @param paramArray
     */
    this.showCometDError = function (errorMessage, paramArray) {

        var toast = $('<div class="qm-toast qm-toast--danger"><div class="qm-toast__layout"><span class="qm-toast__message"></span></div></div>');

        if (typeof paramArray === 'undefined' || !paramArray) {
            toast.find('.qm-toast__message').text(translate.msg(errorMessage));
        } else {
            toast.find('.qm-toast__message').text(translate.msg(errorMessage, paramArray));
        }

        var $messageContainer = $('#error');

        if ($messageContainer.children().length > 2) {
            $messageContainer.children().last().remove();
        }

        $messageContainer.css('left', 0);
        $messageContainer.css("top", (parseInt($("#header").height())) + "px");

        var removeFunction = function () {
            toast.fadeOut(400, function () {
                toast.remove();
                if ($messageContainer.children().length == 0) {
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
    this.asChannelStr = function (str) {
        return str.replace(new RegExp(':', 'g'), '/');
    };

    this.asChannelStrWithUserName = function (unitId, userName) {
        return this.asChannelStr(unitId) + "/" + userName;
    }

    this.showPermanentError = function (text) {
        setError(text);
    };

    var setError = function (text) {
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

    this.hideError = function () {
        $("#text").remove();
        $("#error").css("visibility", "hidden");
    };

    this.showModal = function (divId) {
        window.onscroll = function () {
            $("#" + divId).css("top", document.body.scrollTop);
        };
        $("#" + divId).css("display", "block");
        $("#" + divId).css("top", document.body.scrollTop);
    };

    this.hideModal = function (divId) {
        $("#" + divId).hide();
    };

    this.zeroPad = function (num, count) {
        var numZeropad = num + '';
        while (numZeropad.length < count) {
            numZeropad = "0" + numZeropad;
        }
        return numZeropad;
    };

    this.secondsToHms = function (secs) {
        var t = new Date(1970, 0, 1);
        t.setSeconds(secs);
        return t.toTimeString().substr(0, 8);
    };

    this.secondsToHm = function (secs) {
        var t = new Date(1970, 0, 1);
        t.setSeconds(secs);
        return t.toTimeString().substr(0, 5);
    };

    this.secondsToMs = function (secs) {
        var m = Math.floor(secs / 60);
        var s = secs % 60;
        if (m < 10) {
            m = '0' + m;
        }
        if (s < 10) {
            s = '0' + s;
        }
        return m + ':' + s;
    };

    this.log = function (object) {
        if (typeof console !== 'undefined' && console.log) {
            if (typeof Date.now === 'function') {
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
    this.buildTableJsonNoUrl = function (config) {
        var table;

        table = $('#' + config.tableId).dataTable({
            "bDestroy": true,
            "sScrollX": "100%",
            "sScrollY": (config.scrollYHeight ? config.scrollYHeight : "158px"),
            "oLanguage": {
                "sEmptyTable": typeof config.emptyTableLabel !== 'undefined' ? translate.msg(config.emptyTableLabel) : "",
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
        });
        return table;
    };

    /**
     *  Take User back to home page
     */
    this.goToModulesPage = function () {
        window.location.href = "/"
    }

    this.sortArrayCaseInsensitive = function (array, property, sortOrder) {
        if (!!!array) return;
        // Default Sort is Asc
        array.sort(function (a, b) {
            var multiplier = 0;
            var ax = [], bx = [];

            var a = multiplier ? (parseFloat(a[property]) * multiplier).toString() : a[property].toString();
            var b = multiplier ? (parseFloat(b[property]) * multiplier).toString() : b[property].toString();

            a.replace(/(\d+)|(\D+)/g, function (_, $1, $2) { ax.push([$1 || Infinity, $2 || ""]) });
            b.replace(/(\d+)|(\D+)/g, function (_, $1, $2) { bx.push([$1 || Infinity, $2 || ""]) });

            while (ax.length && bx.length) {
                var an = ax.shift();
                var bn = bx.shift();
                var nn = (an[0] - bn[0]) || an[1].localeCompare(bn[1]);
                if (nn) return nn;
            }

            return ax.length - bx.length;
        });
        if (sortOrder == "desc")
            array.reverse();
    }

    this.getLimitedArrayWithRemainingCount = function (array, maxCount) {
        var maxShowDsItemCount = maxCount;
        var filteredDsList = array.slice(0).filter(function (val, i) {
            if (i > maxShowDsItemCount - 1) {
                return false
            } else {
                return true
            }
        });

        var diffCount = array.length - maxShowDsItemCount;
        if (diffCount > 0)
            filteredDsList.push(diffCount);
        return filteredDsList;
    };

    this.mapDsNameAndOutcomes = function (array) {
        return $.map(array.slice(0), function (val, i) {
            if (val['outcomeExists'] && val['outcomeExists'] == true) {
                return val['deliveredServiceName'] + ' (' + (val['visitOutcome'] != null ? val['visitOutcome']['outcomeName'] : '?') + ')';
            } else {
                return val['deliveredServiceName']
            }
        });
    };

    this.mapMarksAndAmount = function (array) {

        var mapOfMarkAndCount = {};

        array.slice(0).forEach(function (val, i) {
            if (mapOfMarkAndCount[val["markName"]] == undefined) {
                mapOfMarkAndCount[val["markName"]] = 1;
            } else {
                mapOfMarkAndCount[val["markName"]] += 1;;
            }
        });

        var arrayOfMappedMarksAndCount = [];

        for (var key in mapOfMarkAndCount) {
            if (mapOfMarkAndCount.hasOwnProperty(key)) {
                if (mapOfMarkAndCount[key] > 1) {
                    arrayOfMappedMarksAndCount.push(key + " - " + mapOfMarkAndCount[key])
                } else {
                    arrayOfMappedMarksAndCount.push(key)
                }
            }
        }

        return arrayOfMappedMarksAndCount;
    };

    this.setIntervalCount = function (callback, delay, repetitions) {
        var x = 0;
        return intervalID = window.setInterval(function () {

            callback();

            if (++x === repetitions) {
                window.clearInterval(intervalID);
            }
        }, delay);
    };
};
