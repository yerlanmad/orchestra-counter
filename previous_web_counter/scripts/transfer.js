var transfer = new function() {
    var transferTable;
    var transferToStaffPoolTable;
    var transferToServicePointPoolTable;

    var transferTicketToQueueTable;
    var transferQueueToStaffPoolTable;
    var transferQueueToServicePointPoolTable;

    this.transferPressed = function() {
        if(servicePoint.hasValidSettings() && sessvars.state.userState == servicePoint.userState.SERVING) {
            util.showModal("transfers");

            // Transfer to queue
            if(typeof transferTable !== 'undefined') {
                transferTable.fnClearTable();
                var queues = spService.get("branches/" + sessvars.branchId + "/queues");
                transferTable.fnAddData(queues);
                transferTable.fnAdjustColumnSizing();
            } else {
                var columns = [
                    /* Queue name */        {"sClass": "firstColumn",
                        "mDataProp": "name"},
                    /* Actions */      {"sClass": "middleColumn",
                        "mData": null,
                        "sDefaultContent": ""},
                    /* Queue id */          {"bSearchable": false,
                        "bVisible": false,
                        "mDataProp": "id"},
                    /* Queue waiting time */{"sClass": "middleColumn",
                        "mDataProp": "waitingTime"},
                    /* Queue waiting num */ {"sClass": "lastColumn",
                        "mDataProp": "customersWaiting"}
                ];
				var t = new Date();
                var url = "/rest/servicepoint/branches/" + sessvars.branchId + "/queues?call="+t;
                var headerCallback = function(nHead, aasData, iStart, iEnd, aiDisplay) {
                    $(nHead).closest('thead, THEAD').find('.transferQueueHeader').each( function (i, item) {
                        $(item).html(jQuery.i18n.prop('info.transfer.queue.header'));
                        $(item).addClass('subheader');
                    });
                    $(nHead).closest('thead, THEAD').find('.transferQueueName').each( function (i, item) {
                        $(item).parent().css('borderBottom', "1px solid #c0c0c0");
                        $(item).html(jQuery.i18n.prop('info.transfer.queue.name'));
                    });
                    $(nHead).closest('thead, THEAD').find('.transferQueueActions').each( function (i, item) {
                        $(item).html(jQuery.i18n.prop('info.transfer.queue.actions'));
                    });
                    $(nHead).closest('thead, THEAD').find('.transferQueueWaitingTime').each( function (i, item) {
                        $(item).html(jQuery.i18n.prop('info.transfer.queue.waiting.time'));
                    });
                    $(nHead).closest('thead, THEAD').find('.transferQueueCustomerWaiting').each( function (i, item) {
                        $(item).html(jQuery.i18n.prop('info.transfer.queue.waiting'));
                    });
                };
                var rowCallback = function(nRow, aData, iDisplayIndex) {
                    if($('td:eq(0)', nRow).find('span').length == 0) {
                        var queueName = $('td:eq(0)', nRow).text();
                        $('td:eq(0)', nRow).empty().append("<span class=\"queueNameSpan\">" + queueName + "</span>");
						if ( buttonTransferFirstEnabled  == true ) {						
							$('td:eq(1)', nRow).append("<span><a href=\"#\" class=\"transferTicketFirst\" title=\"" +
								translate.msg("action.title.transfer.first", [sessvars.state.visit.ticketId]) + "\"></a></span>");
						}
						if ( buttonTransferLastEnabled  == true ) {
							$('td:eq(1)', nRow).append("<span><a href=\"#\" class=\"transferTicketLast\" title=\"" +
								translate.msg("action.title.transfer.last", [sessvars.state.visit.ticketId]) + "\"></a></span>");
						}
						if ( buttonTransferSortEnabled  == true ) {							
							$('td:eq(1)', nRow).append("<span><a href=\"#\" class=\"transferTicketSort\" title=\"" +
								translate.msg("action.title.transfer.sorted.lifetime", [sessvars.state.visit.ticketId]) + "\"></a></span>");
						}
                    }
                    $('td:eq(2)', nRow).html(util.formatIntoHHMM(parseInt(aData.waitingTime)));
                    return nRow;
                };
                transferTable = util.buildTableJson({"tableId": "transferQueues", "url": url, "rowCallback": rowCallback,
                    "columns": columns, "filter": false, "headerCallback": headerCallback, "scrollYHeight": "150px",
                    "emptyTableLabel":"info.transfer.queue.empty"});
            }
            //destroy old event handlers
			if ( buttonTransferFirstEnabled  == true ) {			
				$('tbody tr td span a.transferTicketFirst', $('#transferQueues')).die('click');
			}
			if ( buttonTransferLastEnabled  == true ) {
				$('tbody tr td span a.transferTicketLast', $('#transferQueues')).die('click');
			}
			if ( buttonTransferSortEnabled  == true ) {
				$('tbody tr td span a.transferTicketSort', $('#transferQueues')).die('click');
			}
            //make new ones
			if ( buttonTransferFirstEnabled  == true ) {	
				$('tbody tr td span a.transferTicketFirst', $('#transferQueues')).live('click',function(){
					var nTr = $(this).closest("tr").get(0);
					var aData = transferTable.fnGetData(nTr);
					transferCurrentVisitToQueueClicked("FIRST", aData);
				});
			}
			if ( buttonTransferLastEnabled  == true ) {	
				$('tbody tr td span a.transferTicketLast', $('#transferQueues')).live('click',function(){
					var nTr = $(this).closest("tr").get(0);
					var aData = transferTable.fnGetData(nTr);
					transferCurrentVisitToQueueClicked("LAST", aData);
				});
			}
			if ( buttonTransferSortEnabled  == true ) {	
				$('tbody tr td span a.transferTicketSort', $('#transferQueues')).live('click',function(){
					var nTr = $(this).closest("tr").get(0);
					var aData = transferTable.fnGetData(nTr);
					transferCurrentVisitToQueueClicked("SORTED", aData);
				});
			}
            // Transfer to staff pool
            if(typeof transferToStaffPoolTable !== 'undefined') {
                transferToStaffPoolTable.fnClearTable();
                var callParams = servicePoint.createParams();
                callParams.onlyServicePoints = 'true';
                var users = spService.get("branches/" + callParams.branchId + "/users/validForUserPoolTransfer/");
                if(users.length > 0) {
                    transferToStaffPoolTable.fnAddData(users);
                    transferToStaffPoolTable.fnAdjustColumnSizing();
                }
            } else {
                var staffPoolColumns = [
                    /* Id */         {"bSearchable": false,
                        "bVisible": false,
                        "mDataProp": "id"},
                    /* User name  */ {"sClass": "firstColumn",
                        "mDataProp": "userName"},
                    /* Actions */      {"sClass": "middleColumn",
                        "mData": null,
                        "sDefaultContent": ""},
                    /* First mme */  {"sClass": "middleColumn",
                        "mDataProp": "firstName"},
                    /* Last name */  {"sClass": "lastColumn",
                        "mDataProp": "lastName"},
                    /* Locale */     {"bSearchable": false,
                        "bVisible": false,
                        "mDataProp": "locale"},
                    /* Direction */  {"bSearchable": false,
                        "bVisible": false,
                        "mDataProp": "direction"}
                ];
                var staffPoolUrl = "/rest/servicepoint/branches/" + sessvars.branchId + "/users/validForUserPoolTransfer/";
                var staffPoolHeaderCallback = function(nHead, aasData, iStart, iEnd, aiDisplay) {
                    $(nHead).closest('thead, THEAD').find('.transferStaffPoolHeader').each( function (i, item) {
                        $(item).html(jQuery.i18n.prop('info.transfer.staff.pool.header'));
                        $(item).addClass('subheader');
                    });
                    $(nHead).closest('thead, THEAD').find('.transferStaffPoolUserName').each( function (i, item) {
                        $(item).parent().css('borderBottom', "1px solid #c0c0c0");
                        $(item).html(jQuery.i18n.prop('info.transfer.staff.pool.username'));
                    });
                    $(nHead).closest('thead, THEAD').find('.transferStaffPoolActions').each( function (i, item) {
                        $(item).html(jQuery.i18n.prop('info.transfer.staff.pool.actions'));
                    });
                    $(nHead).closest('thead, THEAD').find('.transferStaffPoolFirstName').each( function (i, item) {
                        $(item).html(jQuery.i18n.prop('info.transfer.staff.pool.firstname'));
                    });
                    $(nHead).closest('thead, THEAD').find('.transferStaffPoolLastName').each( function (i, item) {
                        $(item).html(jQuery.i18n.prop('info.transfer.staff.pool.lastname'));
                    });
                };
                var staffPoolRowCallback = function(nRow, aData, iDisplayIndex) {
                    if($('td:eq(0)', nRow).find('span').length == 0) {
                        var staffName = $('td:eq(0)', nRow).text();
                        $('td:eq(0)', nRow).empty().append("<span class=\"staffNameSpan\">" + staffName + "</span>");
                        $('td:eq(1)', nRow).append("<span><a href=\"#\" class=\"transferTicketFirst\" title=\"" +
                            translate.msg("action.title.transfer.staff.pool", [sessvars.state.visit.ticketId, staffName]) + "\"></a></span>");
                    }
                    return nRow;
                };
                transferToStaffPoolTable = util.buildTableJson({"tableId": "transferTicketToStaffPoolTable",
                    "url": staffPoolUrl, "rowCallback": staffPoolRowCallback, "columns": staffPoolColumns,
                    "filter": false, "headerCallback": staffPoolHeaderCallback, "scrollYHeight": "150px",
                    "emptyTableLabel":"info.transfer.staff.pool.empty"});
            }
            //destroy old event handlers
            $('tbody tr td span a.transferTicketFirst', $('#transferTicketToStaffPoolTable')).die('click');
            //make new ones
            $('tbody tr td span a.transferTicketFirst', $('#transferTicketToStaffPoolTable')).live('click',function(){
                var nTr = $(this).closest("tr").get(0);
                var aData = transferToStaffPoolTable.fnGetData(nTr);
                transferCurrentVisitToStaffPoolClicked("FIRST", aData);
            });

            // Transfer to service point pool
            if(typeof transferToServicePointPoolTable !== 'undefined') {
                transferToServicePointPoolTable.fnClearTable();
                var params = servicePoint.createParams();
                var servicePoints = spService.get("branches/"+params.branchId+"/servicePoints/validForServicePointPoolTransfer/");
                if (servicePoints.length > 0){
                transferToServicePointPoolTable.fnAddData(servicePoints);
                transferToServicePointPoolTable.fnAdjustColumnSizing();
                }
            } else {
                var servicePointColumns = [
                    /* Name */        {"sClass": "firstColumn",
                        "mDataProp": "name"},
                    /* Actions */      {"sClass": "middleColumn",
                        "mData": null,
                        "sDefaultContent": ""},
                    /* Id */          {"bSearchable": false,
                        "bVisible": false,
                        "mDataProp": "id"},
                    /* Unit id */     {"bSearchable": false,
                        "bVisible": false,
                        "mDataProp": "unitId"},
                    /* State*/{"sClass": "lastColumn",
                        "mDataProp": "state"},
                    /* Parameters */ {"bSearchable": false,
                        "bVisible": false,
                        "mDataProp": "parameters"}
                ];
                var servicePointUrl = "/rest/servicepoint/branches/" + sessvars.branchId + "/servicePoints/validForServicePointPoolTransfer/";
                var servicePointHeaderCallback = function(nHead, aasData, iStart, iEnd, aiDisplay) {
                    $(nHead).closest('thead, THEAD').find('.transferServicePointPoolHeader').each( function (i, item) {
                        $(item).html(jQuery.i18n.prop('info.transfer.servicepoint.pool.header'));
                        $(item).addClass('subheader');
                    });
                    $(nHead).closest('thead, THEAD').find('.transferServicePointPoolName').each( function (i, item) {
                        $(item).parent().css('borderBottom', "1px solid #c0c0c0");
                        $(item).html(jQuery.i18n.prop('info.transfer.servicepoint.pool.name'));
                    });
                    $(nHead).closest('thead, THEAD').find('.transferServicePointPoolActions').each( function (i, item) {
                        $(item).html(jQuery.i18n.prop('info.transfer.servicepoint.pool.actions'));
                    });
                    $(nHead).closest('thead, THEAD').find('.transferServicePointPoolState').each( function (i, item) {
                        $(item).html(jQuery.i18n.prop('info.transfer.servicepoint.pool.state'));
                    });
                };
                var servicePointRowCallback = function(nRow, aData, iDisplayIndex) {
                    if($('td:eq(0)', nRow).find('span').length == 0) {
                        var servicePointName = $('td:eq(0)', nRow).text();
                        $('td:eq(0)', nRow).empty().append("<span class=\"servicePointNameSpan\">" + servicePointName +
                            "</span>");
                        $('td:eq(1)', nRow).append("<span><a href=\"#\" class=\"transferTicketFirst\" title=\"" +
                            translate.msg("action.title.transfer.servicepoint.pool", [sessvars.state.visit.ticketId, servicePointName]) + "\"></a></span>");
                    }
                    $('td:eq(2)', nRow).html(translate.msg("info.transfer.servicepoint.pool.state." + aData.state));
                    return nRow;
                };
                transferToServicePointPoolTable = util.buildTableJson({"tableId": "transferTicketToServicePointPoolTable",
                    "url": servicePointUrl, "rowCallback": servicePointRowCallback, "columns": servicePointColumns,
                    "filter": false, "headerCallback": servicePointHeaderCallback, "scrollYHeight": "150px",
                    "emptyTableLabel":"info.transfer.servicepoint.pool.empty"});
            }
            //destroy old event handlers
            $('tbody tr td span a.transferTicketFirst', $('#transferTicketToServicePointPoolTable')).die('click');
            //make new ones
            $('tbody tr td span a.transferTicketFirst', $('#transferTicketToServicePointPoolTable')).live('click',function(){
                var nTr = $(this).closest("tr").get(0);
                var aData = transferToServicePointPoolTable.fnGetData(nTr);
                transferCurrentVisitToServicePointPoolClicked("FIRST", aData);
            });
        }
    };

    var transferCurrentVisitToQueueClicked = function(sortType, rowData) {
        if(sessvars.state.userState == servicePoint.userState.SERVING) {
            var transferParams = servicePoint.createParams();
            transferParams.queueId = rowData.id;
            transferParams.$entity = {
                "fromId" : sessvars.servicePointId,
                "fromBranchId" : sessvars.branchId,
                "visitId": sessvars.state.visit.id,
                "sortPolicy" : sortType
            };
            transferParams.json='{"fromId":'+ sessvars.servicePointId + ',"fromBranchId":'+ sessvars.branchId + ',"visitId":' + sessvars.state.visit.id + ',"sortPolicy":"'+sortType + '"}';
			spService.putParams('branches/' +  transferParams.branchId + '/queues/' +  transferParams.queueId + '/visits/',transferParams);
            sessvars.state = servicePoint.getState();
            sessvars.statusUpdated = new Date();
            servicePoint.updateWorkstationStatus(false);
            if(sessvars.state.userState == servicePoint.userState.NO_STARTED_USER_SESSION) {
                util.showError(jQuery.i18n.prop("error.not.loggedin"));
                util.hideModal("transfers");
                return;
            }
            sessvars.currentCustomer = null;
            sessvars.cfuSelectionSet = true;
            customer.updateCustomerModule();
        } else {
            util.showError(jQuery.i18n.prop("error.no.ongoing.transaction"));
        }
        util.hideModal("transfers");
    };

    //transfer current visit to new service
    var transferCurrentVisitToServicePointPoolClicked = function(sortType, rowData) {
        if(sessvars.state.userState == servicePoint.userState.SERVING) {

            var transferParams = servicePoint.createParams();
            transferParams.servicePointId = rowData.id;
            transferParams.$entity = {
                "fromId" : sessvars.servicePointId,
                "fromBranchId" : sessvars.branchId,
                "visitId": sessvars.state.visit.id
            };
			userPoolUpdateNeeded = false;
			transferParams.json='{"fromId":'+ sessvars.servicePointId + ',"fromBranchId":'+ sessvars.branchId + ',"visitId":' + sessvars.state.visit.id + '}';			
 			spService.putParams('branches/' +  transferParams.branchId + '/servicePoints/' +  transferParams.servicePointId + '/visits/',transferParams);
            sessvars.state = servicePoint.getState();
            sessvars.statusUpdated = new Date();
            servicePoint.updateWorkstationStatus(false);
            if(sessvars.state.userState == servicePoint.userState.NO_STARTED_USER_SESSION) {
                util.showError(jQuery.i18n.prop("error.not.loggedin"));
                util.hideModal("transfers");
                return;
            }
            sessvars.currentCustomer = null;
            customer.updateCustomerModule();
        } else {
            util.showError(jQuery.i18n.prop("error.no.ongoing.transaction"));
        }
        util.hideModal("transfers");
    };

    var transferCurrentVisitToStaffPoolClicked = function(sortType, rowData) {
        if(sessvars.state.userState == servicePoint.userState.SERVING) {

            var transferParams = servicePoint.createParams();
            transferParams.userId = rowData.id;
            transferParams.$entity = {
                "fromId" : sessvars.servicePointId,
                "fromBranchId" : sessvars.branchId,
                "visitId": sessvars.state.visit.id
            };
			spPoolUpdateNeeded = false;
			transferParams.json='{"fromId":'+ sessvars.servicePointId + ',"fromBranchId":'+ sessvars.branchId + ',"visitId":' + sessvars.state.visit.id + '}';			
			spService.putParams('branches/' +  transferParams.branchId + '/users/' +  transferParams.userId + '/visits/',transferParams);
            sessvars.state = servicePoint.getState();
            sessvars.statusUpdated = new Date();
            servicePoint.updateWorkstationStatus(false);
            if(sessvars.state.userState == servicePoint.userState.NO_STARTED_USER_SESSION) {
                util.showError(jQuery.i18n.prop("error.not.loggedin"));
                util.hideModal("transfers");
                return;
            }
            sessvars.currentCustomer = null;
            customer.updateCustomerModule();
        } else {
            util.showError(jQuery.i18n.prop("error.no.ongoing.transaction"));
        }
        util.hideModal("transfers");
    };

    this.hideTransfers = function() {
        util.hideModal("transfers");
    };

    this.cancelTransfer = function() {
        util.hideModal("transfers");
    };

    //transfer clicked in ticket list => open a new dialogue presenting a list of services and transfer options for each service
    this.transferTicketToQueueClicked = function(aRowData) {
        var filterQueues = function(queuesData){
            var i = queuesData.length;
            while(i--){
                if(queuesData[i].queueType != "QUEUE"){
                    queuesData.splice(i, 1);
                }
            }
            return queuesData;
        };
        if(servicePoint.hasValidSettings()) {
            // ugly but working. used in the row callback to put the ticket number in the header.
            sessvars.ticketIdToTransfer = aRowData.ticketId;
            util.showModal("transferQueueToQueueDialogue");
            //need to store some information from the tickets table for later usage, when calling/transferring a ticket
            if(typeof transferTicketToQueueTable != 'undefined') {
                transferTicketToQueueTable.fnClearTable();
                var queues = spService.get("branches/" + sessvars.branchId + "/queues");
                var filteredQueues = filterQueues(queues);
                transferTicketToQueueTable.fnAddData(filteredQueues);
                transferTicketToQueueTable.fnAdjustColumnSizing();
            } else {
                var columns = [
                    /* Queue name */        {"sClass": "firstColumn",
                        "mDataProp": "name"},
                    /* Actions */      {"sClass": "middleColumn",
                        "mData": null,
                        "sDefaultContent": ""},
                    /* Queue id */          {"bSearchable": false,
                        "bVisible": false,
                        "mDataProp": "id"},
                    /* Queue waiting time */{"sClass": "middleColumn",
                        "mDataProp": "waitingTime"},
                    /* Queue waiting num */ {"sClass": "lastColumn",
                        "mDataProp": "customersWaiting"}
                ];
                var t = new Date();
                var url = "/rest/servicepoint/branches/" + sessvars.branchId + "/queues?call=" + t;
                var headerCallback = function(nHead, aasData, iStart, iEnd, aiDisplay) {
                    $(nHead).closest('thead, THEAD').find('.transferQueueHeader').each( function (i, item) {
                        $(item).html(jQuery.i18n.prop('info.transfer.queue.header'));
                        $(item).addClass('subheader');
                    });
                    $(nHead).closest('thead, THEAD').find('.transferQueueName').each( function (i, item) {
                        $(item).parent().css('borderBottom', "1px solid #c0c0c0");
                        $(item).html(jQuery.i18n.prop('info.transfer.queue.name'));
                    });
                    $(nHead).closest('thead, THEAD').find('.transferQueueActions').each( function (i, item) {
                        $(item).html(jQuery.i18n.prop('info.transfer.queue.actions'));
                    });
                    $(nHead).closest('thead, THEAD').find('.transferQueueWaitingTime').each( function (i, item) {
                        $(item).html(jQuery.i18n.prop('info.transfer.queue.waiting.time'));
                    });
                    $(nHead).closest('thead, THEAD').find('.transferQueueCustomerWaiting').each( function (i, item) {
                        $(item).html(jQuery.i18n.prop('info.transfer.queue.waiting'));
                    });
                };
                var rowCallback = function(nRow, aData, iDisplayIndex) {
                    if($('td:eq(0)', nRow).find('span').length == 0) {
                        var queueName = $('td:eq(0)', nRow).text();
                        $('td:eq(0)', nRow).empty().append("<span class=\"queueNameSpan\">" + queueName + "</span>");
						if ( buttonTransferFirstEnabled  == true ) {	
							$('td:eq(1)', nRow).append("<span><a href=\"#\" class=\"transferTicketFirst\" title=\"" +
								translate.msg("action.title.transfer.first", [sessvars.ticketIdToTransfer]) + "\"></a></span>");
						}
						if ( buttonTransferLastEnabled  == true ) {	
							$('td:eq(1)', nRow).append("<span><a href=\"#\" class=\"transferTicketLast\" title=\"" +
								translate.msg("action.title.transfer.last", [sessvars.ticketIdToTransfer]) + "\"></a></span>");
						}
						if ( buttonTransferSortEnabled  == true ) {	
							$('td:eq(1)', nRow).append("<span><a href=\"#\" class=\"transferTicketSort\" title=\"" +
								translate.msg("action.title.transfer.sorted.lifetime", [sessvars.ticketIdToTransfer]) + "\"></a></span>");
						}
                    }
                    $('td:eq(2)', nRow).html(util.formatIntoHHMMSS(parseInt(aData.waitingTime)));
                    return nRow;
                };
                transferTicketToQueueTable = util.buildTableJson({"tableId": "transferTicketQueueToQueueTable", "url": url,
                    "rowCallback": rowCallback, "columns": columns, "filter": false, "headerCallback": headerCallback,
                    "scrollYHeight": "150px", "emptyTableLabel":"info.transfer.queue.empty", "filterData": filterQueues});
                //transferTicketToQueueTable = util.buildTable("transferTicketQueueToQueueTable", url, rowCallback, columns, false, headerCallback, true);
            }
            //destroy old event handlers
			if ( buttonTransferFirstEnabled  == true ) {	
				$('tbody td a.transferTicketFirst', $('#transferTicketQueueToQueueTable')).die('click');
			}
			if ( buttonTransferLastEnabled  == true ) {	
				$('tbody td a.transferTicketLast', $('#transferTicketQueueToQueueTable')).die('click');
			}
			if ( buttonTransferSortEnabled  == true ) {	
				$('tbody td a.transferTicketSort', $('#transferTicketQueueToQueueTable')).die('click');
			}
            //make new ones
			if ( buttonTransferFirstEnabled  == true ) {	
				$('tbody td a.transferTicketFirst', $('#transferTicketQueueToQueueTable')).live('click',function(){
					var nTr = $(this).closest("tr").get(0);
					var aData = transferTicketToQueueTable.fnGetData(nTr);
					transferTicketToQueue("FIRST", aData, aRowData.visitId);
				});
			}
			if ( buttonTransferLastEnabled  == true ) {	
				$('tbody td a.transferTicketLast', $('#transferTicketQueueToQueueTable')).live('click',function(){
					var nTr = $(this).closest("tr").get(0);
					var aData = transferTicketToQueueTable.fnGetData(nTr);
					transferTicketToQueue("LAST", aData, aRowData.visitId);
				});
			}
			if ( buttonTransferSortEnabled  == true ) {	
				$('tbody td a.transferTicketSort', $('#transferTicketQueueToQueueTable')).live('click',function(){
					var nTr = $(this).closest("tr").get(0);
					var aData = transferTicketToQueueTable.fnGetData(nTr);
					transferTicketToQueue("SORTED", aData, aRowData.visitId);
				});
			}

            // Transfer to staff pool
            if(typeof transferQueueToStaffPoolTable != 'undefined') {
                transferQueueToStaffPoolTable.fnClearTable();
                var callParams = servicePoint.createParams();
                var users = spService.get("branches/" + callParams.branchId +"/users/validForUserPoolTransfer/");
                transferQueueToStaffPoolTable.fnAddData(users);
                transferQueueToStaffPoolTable.fnAdjustColumnSizing();
            } else {
                var staffPoolColumns = [
                    /* Id */         {"bSearchable": false,
                        "bVisible": false,
                        "mDataProp": "id"},
                    /* User name  */ {"sClass": "firstColumn",
                        "mDataProp": "userName"},
                    /* Actions */      {"sClass": "middleColumn",
                        "mData": null,
                        "sDefaultContent": ""},
                    /* First name */ {"sClass": "middleColumn",
                        "mDataProp": "firstName"},
                    /* Last name */  {"sClass": "lastColumn",
                        "mDataProp": "lastName"},
                    /* Locale */     {"bSearchable": false,
                        "bVisible": false,
                        "mDataProp": "locale"},
                    /* Direction */  {"bSearchable": false,
                        "bVisible": false,
                        "mDataProp": "direction"}
                ];
                var staffPoolUrl = "/rest/servicepoint/branches/" + sessvars.branchId + "/users/validForUserPoolTransfer/";
                var staffPoolHeaderCallback = function(nHead, aasData, iStart, iEnd, aiDisplay) {
                    $(nHead).closest('thead, THEAD').find('.transferStaffPoolHeader').each( function (i, item) {
                        $(item).html(jQuery.i18n.prop('info.transfer.staff.pool.header'));
                        $(item).addClass('subheader');
                    });
                    $(nHead).closest('thead, THEAD').find('.transferStaffPoolUserName').each( function (i, item) {
                        $(item).parent().css('borderBottom', "1px solid #c0c0c0");
                        $(item).html(jQuery.i18n.prop('info.transfer.staff.pool.username'));
                    });
                    $(nHead).closest('thead, THEAD').find('.transferStaffPoolActions').each( function (i, item) {
                        $(item).html(jQuery.i18n.prop('info.transfer.staff.pool.actions'));
                    });
                    $(nHead).closest('thead, THEAD').find('.transferStaffPoolFirstName').each( function (i, item) {
                        $(item).html(jQuery.i18n.prop('info.transfer.staff.pool.firstname'));
                    });
                    $(nHead).closest('thead, THEAD').find('.transferStaffPoolLastName').each( function (i, item) {
                        $(item).html(jQuery.i18n.prop('info.transfer.staff.pool.lastname'));
                    });
                };
                var staffPoolRowCallback = function(nRow, aData, iDisplayIndex) {
                    if($('td:eq(0)', nRow).find('span').length == 0) {
                        var staffName = $('td:eq(0)', nRow).text();
                        $('td:eq(0)', nRow).empty().append("<span class=\"staffNameSpan\">" + staffName + "</span>");
                        $('td:eq(1)', nRow).append("<span><a href=\"#\" class=\"transferTicketFirst\" title=\"" +
                            translate.msg("action.title.transfer.staff.pool", [sessvars.ticketIdToTransfer, staffName]) + "\"></a></span>");
                    }
                    return nRow;
                };
                transferQueueToStaffPoolTable = util.buildTableJson({"tableId": "transferQueueToStaffPoolTable",
                    "url": staffPoolUrl, "rowCallback": staffPoolRowCallback, "columns": staffPoolColumns,
                    "filter": false, "headerCallback": staffPoolHeaderCallback, "scrollYHeight": "150px",
                    "emptyTableLabel":"info.transfer.staff.pool.empty"});
            }
            //destroy old event handlers
            $('tbody tr td span a.transferTicketFirst', $('#transferQueueToStaffPoolTable')).die('click');
            //make new ones
            $('tbody tr td span a.transferTicketFirst', $('#transferQueueToStaffPoolTable')).live('click',function(){
                var nTr = $(this).closest("tr").get(0);
                var aData = transferQueueToStaffPoolTable.fnGetData(nTr);
                transferVisitInQueueToStaffPoolClicked("FIRST", aData, aRowData.visitId);
            });

            // Transfer to service point pool
            if(typeof transferQueueToServicePointPoolTable != 'undefined') {
                transferQueueToServicePointPoolTable.fnClearTable();
                var params = servicePoint.createParams();
                var servicePoints = spService.get("branches/"+params.branchId+"/servicePoints/validForServicePointPoolTransfer/");
                transferQueueToServicePointPoolTable.fnAddData(servicePoints);
                transferQueueToServicePointPoolTable.fnAdjustColumnSizing();
            } else {
                var servicePointColumns = [
                    /* Name */        {"sClass": "firstColumn",
                        "mDataProp": "name"},
                    /* Actions */      {"sClass": "middleColumn",
                        "mData": null,
                        "sDefaultContent": ""},
                    /* Id */          {"bSearchable": false,
                        "bVisible": false,
                        "mDataProp": "id"},
                    /* Unit id */     {"bSearchable": false,
                        "bVisible": false,
                        "mDataProp": "unitId"},
                    /* State*/{"sClass": "lastColumn",
                        "mDataProp": "state"},
                    /* Parameters */ {"bSearchable": false,
                        "bVisible": false,
                        "mDataProp": "parameters"}
                ];
                var servicePointUrl = "/rest/servicepoint/branches/" + sessvars.branchId + "/servicePoints/validForServicePointPoolTransfer/";
                var servicePointHeaderCallback = function(nHead, aasData, iStart, iEnd, aiDisplay) {
                    $(nHead).closest('thead, THEAD').find('.transferServicePointPoolHeader').each( function (i, item) {
                        $(item).html(jQuery.i18n.prop('info.transfer.servicepoint.pool.header'));
                        $(item).addClass('subheader');
                    });
                    $(nHead).closest('thead, THEAD').find('.transferServicePointPoolName').each( function (i, item) {
                        $(item).parent().css('borderBottom', "1px solid #c0c0c0");
                        $(item).html(jQuery.i18n.prop('info.transfer.servicepoint.pool.name'));
                    });
                    $(nHead).closest('thead, THEAD').find('.transferServicePointPoolActions').each( function (i, item) {
                        $(item).html(jQuery.i18n.prop('info.transfer.servicepoint.pool.actions'));
                    });
                    $(nHead).closest('thead, THEAD').find('.transferServicePointPoolState').each( function (i, item) {
                        $(item).html(jQuery.i18n.prop('info.transfer.servicepoint.pool.state'));
                    });
                };
                var servicePointRowCallback = function(nRow, aData, iDisplayIndex) {
                    if($('td:eq(0)', nRow).find('span').length == 0) {
                        var servicePointName = $('td:eq(0)', nRow).text();
                        $('td:eq(0)', nRow).empty().append("<span class=\"servicePointNameSpan\">" + servicePointName +
                            "</span>");
                        $('td:eq(1)', nRow).append("<span><a href=\"#\" class=\"transferTicketFirst\" title=\"" +
                            translate.msg("action.title.transfer.servicepoint.pool", [sessvars.ticketIdToTransfer, servicePointName]) + "\"></a></span>");
                    }
                    $('td:eq(2)', nRow).html(translate.msg("info.transfer.servicepoint.pool.state." + aData.state));
                    return nRow;
                };
                transferQueueToServicePointPoolTable = util.buildTableJson({"tableId": "transferQueueToServicePointPoolTable",
                    "url": servicePointUrl, "rowCallback": servicePointRowCallback, "columns": servicePointColumns,
                    "filter": false, "headerCallback": servicePointHeaderCallback, "scrollYHeight": "150px",
                    "emptyTableLabel":"info.transfer.servicepoint.pool.empty"});
            }
            //destroy old event handlers
            $('tbody tr td span a.transferTicketFirst', $('#transferQueueToServicePointPoolTable')).die('click');
            //make new ones
            $('tbody tr td span a.transferTicketFirst', $('#transferQueueToServicePointPoolTable')).live('click',function(){
                var nTr = $(this).closest("tr").get(0);
                var aData = transferQueueToServicePointPoolTable.fnGetData(nTr);
                transferVisitInQueueToServicePointPoolClicked("FIRST", aData, aRowData.visitId);
            });
        }
    };

    this.buildTransferToQueueTable = function (popoverComponent, selector, table, ticketId, visitId) {
        var filterQueues = function(queuesData){
            var i = queuesData.length;
            while(i--){
                if(queuesData[i].queueType != "QUEUE"){
                    queuesData.splice(i, 1);
                }
            }
            return queuesData;
        };
        if(servicePoint.hasValidSettings()) {
            // ugly but working. used in the row callback to put the ticket number in the header.
            sessvars.ticketIdToTransfer = ticketId;
            //util.showModal("transferQueueToQueueDialogue");
            //need to store some information from the tickets table for later usage, when calling/transferring a ticket
            if(table != null) {
                table.fnClearTable();
                var queues = spService.get("branches/" + sessvars.branchId + "/queues");
                var filteredQueues = filterQueues(queues);
                table.fnAddData(filteredQueues);
                table.fnAdjustColumnSizing();
            } else {
                var columns = [
                    /* Queue name */        {"sClass": "qm-table__first-column",
                        "mDataProp": "name"},
                    /* Queue id */          {"bSearchable": false,
                        "bVisible": false,
                        "mDataProp": "id"},
                    /* Actions */      {"sClass": "qm-table__last-column",
                        "mData": null,
                        "sDefaultContent": ""}
                ];
                var t = new Date();
                var url = "/rest/servicepoint/branches/" + sessvars.branchId + "/queues?call=" + t;
                var headerCallback = function(nHead, aasData, iStart, iEnd, aiDisplay) {
                    $(nHead).closest('thead, THEAD').find('.transferQueueName').each( function (i, item) {
                        $(item).html(jQuery.i18n.prop('info.transfer.queue.name'));
                    });
                    $(nHead).closest('thead, THEAD').find('.transferQueueActions').each( function (i, item) {
                        $(item).html(jQuery.i18n.prop('info.transfer.queue.actions'));
                    });
                };
                var rowCallback = function(nRow, aData, iDisplayIndex) {
                    if($('td:eq(0)', nRow).find('span').length == 0) {
                        var queueName = $('td:eq(0)', nRow).text();
                        $('td:eq(0)', nRow).empty().append("<span class=\"queueNameSpan\">" + queueName + "</span>");
						if ( buttonTransferFirstEnabled  == true ) {	
                            $('td:eq(1)', nRow).append("<button class='qm-action-btn qm-action-btn--only-icon transferTicketFirst' title='" + translate.msg("action.title.transfer.first", [sessvars.ticketIdToTransfer]) + "'>"
                            + "<i class='qm-action-btn__icon icon-queue-first' aria-hidden='true'></i>"
                            + "<span class='sr-only'>" + translate.msg("action.title.transfer.first", [sessvars.ticketIdToTransfer]) + "</span></button>");
						}
						if ( buttonTransferLastEnabled  == true ) {	
                            $('td:eq(1)', nRow).append("<button class='qm-action-btn qm-action-btn--only-icon transferTicketLast' title='" + translate.msg("action.title.transfer.last", [sessvars.ticketIdToTransfer]) + "'>"
                                + "<i class='qm-action-btn__icon icon-queue-last' aria-hidden='true'></i>"
                                + "<span class='sr-only'>" + translate.msg("action.title.transfer.last", [sessvars.ticketIdToTransfer]) + "</span></button>");
						}
						if ( buttonTransferSortEnabled  == true ) {	
                            $('td:eq(1)', nRow).append("<button class='qm-action-btn qm-action-btn--only-icon transferTicketSort' title='" + translate.msg("action.title.transfer.sorted.lifetime", [sessvars.ticketIdToTransfer]) + "'>"
                                + "<i class='qm-action-btn__icon icon-clock' aria-hidden='true'></i>"
                                + "<span class='sr-only'>" + translate.msg("action.title.transfer.sorted.lifetime", [sessvars.ticketIdToTransfer]) + "</span></button>");
						}
                    }
                    return nRow;
                };
                
                table = util.buildTableJson({"tableSelector": selector, "url": url,
                    "rowCallback": rowCallback, "columns": columns, "filter": false, "headerCallback": headerCallback,
                    "scrollYHeight": "300px", "emptyTableLabel":"info.transfer.queue.empty", "filterData": filterQueues});
                //transferTicketToQueueTable = util.buildTable("transferTicketQueueToQueueTable", url, rowCallback, columns, false, headerCallback, true);
            }
            //destroy old event handlers
			if ( buttonTransferFirstEnabled  == true ) {	
				$('tbody td button.transferTicketFirst', $(selector)).die('click');
			}
			if ( buttonTransferLastEnabled  == true ) {	
				$('tbody td button.transferTicketLast', $(selector)).die('click');
			}
			if ( buttonTransferSortEnabled  == true ) {	
				$('tbody td button.transferTicketSort', $(selector)).die('click');
			}
            //make new ones
			if ( buttonTransferFirstEnabled  == true ) {	
				$('tbody td button.transferTicketFirst', $(selector)).live('click',function(){
					var nTr = $(this).closest("tr").get(0);
					var aData = table.fnGetData(nTr);
                    transferTicketToQueue("FIRST", aData, visitId);
                    popoverComponent.disposeInstance();
				});
			}
			if ( buttonTransferLastEnabled  == true ) {	
				$('tbody td button.transferTicketLast', $(selector)).live('click',function(){
					var nTr = $(this).closest("tr").get(0);
					var aData = table.fnGetData(nTr);
                    transferTicketToQueue("LAST", aData, visitId);
                    popoverComponent.disposeInstance();
				});
			}
			if ( buttonTransferSortEnabled  == true ) {	
				$('tbody td button.transferTicketSort', $(selector)).live('click',function(){
					var nTr = $(this).closest("tr").get(0);
					var aData = table.fnGetData(nTr);
                    transferTicketToQueue("SORTED", aData, visitId);
                    popoverComponent.disposeInstance();
				});
            }

            return table;
        }
    };

    // Transfer to User pool
    this.buildTransferToUserPoolTable = function (popoverComponent, selector, table, ticketId, visitId) {
        if(servicePoint.hasValidSettings()) {
            // ugly but working. used in the row callback to put the ticket number in the header.
            sessvars.ticketIdToTransfer = ticketId;
        
            if(table != null) {
                table.fnClearTable();
                var callParams = servicePoint.createParams();
                var users = spService.get("branches/" + callParams.branchId +"/users/validForUserPoolTransfer/");
                table.fnAddData(users);
                table.fnAdjustColumnSizing();
            } else {
                var staffPoolColumns = [
                    /* Id */         {"bSearchable": false,
                        "bVisible": false,
                        "mDataProp": "id"},
                    /* User name  */ {"sClass": ".qm-table__first-column",
                        "mDataProp": "fullName"},
                    /* Actions */      {"sClass": "qm-table__last-column",
                        "mData": null,
                        "sDefaultContent": ""},
                    /* Locale */     {"bSearchable": false,
                        "bVisible": false,
                        "mDataProp": "locale"},
                    /* Direction */  {"bSearchable": false,
                        "bVisible": false,
                        "mDataProp": "direction"}
                ];
                var staffPoolUrl = "/rest/servicepoint/branches/" + sessvars.branchId + "/users/validForUserPoolTransfer/";
                var staffPoolHeaderCallback = function(nHead, aasData, iStart, iEnd, aiDisplay) {
                    
                    $(nHead).closest('thead, THEAD').find('.transferStaffPoolName').each( function (i, item) {
                        //$(item).parent().css('borderBottom', "1px solid #c0c0c0");
                        $(item).html(jQuery.i18n.prop('info.transfer.staff.pool.username'));
                    });
                    $(nHead).closest('thead, THEAD').find('.transferStaffPoolActions').each( function (i, item) {
                        $(item).html(jQuery.i18n.prop('info.transfer.staff.pool.actions'));
                    });
                };
                var staffPoolRowCallback = function(nRow, aData, iDisplayIndex) {
                    if($('td:eq(0)', nRow).find('span').length == 0) {
                        var staffName = $('td:eq(0)', nRow).text();
                        $('td:eq(0)', nRow).empty().append("<span class=\"staffNameSpan\">" + staffName + "</span>");
                        $('td:eq(1)', nRow).append("<button class='qm-action-btn qm-action-btn--only-icon transferTicketFirst' title='" + translate.msg("action.title.transfer.staff.pool", [sessvars.ticketIdToTransfer, staffName]) + "'>"
                            + "<i class='qm-action-btn__icon icon-queue-first' aria-hidden='true'></i>"
                            + "<span class='sr-only'>" + translate.msg("action.title.transfer.staff.pool", [sessvars.ticketIdToTransfer, staffName]) + "</span></button>");
                    }
                    return nRow;
                };
                table = util.buildTableJson({"tableSelector": selector,
                    "url": staffPoolUrl, "rowCallback": staffPoolRowCallback, "columns": staffPoolColumns,
                    "filter": false, "headerCallback": staffPoolHeaderCallback, "scrollYHeight": "300px",
                    "emptyTableLabel":"info.transfer.staff.pool.empty"});
            }
            //destroy old event handlers
            $('tbody tr td button.transferTicketFirst', $(selector)).die('click');
            //make new ones
            $('tbody tr td button.transferTicketFirst', $(selector)).live('click',function(){
                var nTr = $(this).closest("tr").get(0);
                var aData = table.fnGetData(nTr);
                transferVisitInQueueToStaffPoolClicked("FIRST", aData, visitId);
                popoverComponent.disposeInstance();
            });

            return table;
        }
    };


    // Transfer to Counter pool
    this.buildTransferToCounterPoolTable = function (popoverComponent, selector, table, ticketId, visitId) {
        if(servicePoint.hasValidSettings()) {
            // ugly but working. used in the row callback to put the ticket number in the header.
            sessvars.ticketIdToTransfer = ticketId;

            if(table != null) {
                table.fnClearTable();
                var params = servicePoint.createParams();
                var servicePoints = spService.get("branches/"+params.branchId+"/servicePoints/validForServicePointPoolTransfer/");
                table.fnAddData(servicePoints);
                table.fnAdjustColumnSizing();
            } else {
                var servicePointColumns = [
                    /* Name */        {"sClass": "qm-table__first-column",
                        "mDataProp": "name"},
                    /* Actions */      {"sClass": "qm-table__last-column",
                        "mData": null,
                        "sDefaultContent": ""},
                    /* Id */          {"bSearchable": false,
                        "bVisible": false,
                        "mDataProp": "id"},
                    /* Unit id */     {"bSearchable": false,
                        "bVisible": false,
                        "mDataProp": "unitId"},
                    /* State*/{"bVisible": false,
                        "mDataProp": "state"},
                    /* Parameters */ {"bSearchable": false,
                        "bVisible": false,
                        "mDataProp": "parameters"}
                ];
                var servicePointUrl = "/rest/servicepoint/branches/" + sessvars.branchId + "/servicePoints/validForServicePointPoolTransfer/";
                var servicePointHeaderCallback = function(nHead, aasData, iStart, iEnd, aiDisplay) {
                    
                    $(nHead).closest('thead, THEAD').find('.transferServicePointPoolName').each( function (i, item) {
                        //$(item).parent().css('borderBottom', "1px solid #c0c0c0");
                        $(item).html(jQuery.i18n.prop('info.transfer.servicepoint.pool.name'));
                    });
                    $(nHead).closest('thead, THEAD').find('.transferServicePointPoolActions').each( function (i, item) {
                        $(item).html(jQuery.i18n.prop('info.transfer.servicepoint.pool.actions'));
                    });
                };
                var servicePointRowCallback = function(nRow, aData, iDisplayIndex) {
                    if($('td:eq(0)', nRow).find('span').length == 0) {
                        var servicePointName = $('td:eq(0)', nRow).text();
                        if(aData.state === "CLOSED") {
                            $('td:eq(0)', nRow).empty().append("<span class=\"servicePointNameSpan\">" + servicePointName +
                            "</span> <i class='icon-lock' aria-hidden='true'></i>");
                        } else {
                            $('td:eq(0)', nRow).empty().append("<span class=\"servicePointNameSpan\">" + servicePointName +
                            "</span>");
                        }

                        $('td:eq(1)', nRow).append("<button class='qm-action-btn qm-action-btn--only-icon transferTicketFirst' title='" + translate.msg("action.title.transfer.servicepoint.pool", [sessvars.ticketIdToTransfer, servicePointName]) + "'>"
                            + "<i class='qm-action-btn__icon icon-queue-first' aria-hidden='true'></i>"
                            + "<span class='sr-only'>" + translate.msg("action.title.transfer.servicepoint.pool", [sessvars.ticketIdToTransfer, servicePointName]) + "</span></button>");
                    }
                    //$('td:eq(2)', nRow).html(translate.msg("info.transfer.servicepoint.pool.state." + aData.state));
                    return nRow;
                };
                table = util.buildTableJson({"tableSelector": selector,
                    "url": servicePointUrl, "rowCallback": servicePointRowCallback, "columns": servicePointColumns,
                    "filter": false, "headerCallback": servicePointHeaderCallback, "scrollYHeight": "300px",
                    "emptyTableLabel":"info.transfer.servicepoint.pool.empty"});
            }
            //destroy old event handlers
            $('tbody tr td button.transferTicketFirst', $(selector)).die('click');
            //make new ones
            $('tbody tr td button.transferTicketFirst', $(selector)).live('click',function(){
                var nTr = $(this).closest("tr").get(0);
                var aData = table.fnGetData(nTr);
                transferVisitInQueueToServicePointPoolClicked("FIRST", aData, visitId);
                popoverComponent.disposeInstance();
            });
            return table;
        }
    };

    //transfer icon pressed
    var transferTicketToQueue = function(sortType, aRowData, visitId) {
        if(servicePoint.hasValidSettings()) {
            var transferParams = servicePoint.createParams();
            transferParams.queueId = aRowData.id;
            transferParams.$entity = {
                "fromId": sessvars.servicePointId,
                "fromBranchId" : sessvars.branchId,
                "visitId": visitId,
                "sortPolicy" : sortType
            };

			transferParams.json='{"fromId":'+ sessvars.servicePointId + ',"fromBranchId":'+ sessvars.branchId + ',"visitId":' + visitId + ',"sortPolicy":"'+sortType + '"}';			
			spService.putParams('branches/' +  transferParams.branchId + '/queues/' +  transferParams.queueId + '/visits/',transferParams);
			queues.updateQueues();
            //util.hideModal("transferQueueToQueueDialogue");
        }
    };

    var transferVisitInQueueToStaffPoolClicked = function(sortType, aRowData, visitId) {
        if(servicePoint.hasValidSettings()) {

            var transferParams = servicePoint.createParams();
            transferParams.userId = aRowData.id;
            transferParams.$entity = {
                "fromId" : sessvars.servicePointId,
                "fromBranchId" : sessvars.branchId,
                "visitId": visitId
            };
			spPoolUpdateNeeded = false;
            transferParams.json='{"fromId":'+ sessvars.servicePointId + ',"fromBranchId":'+ sessvars.branchId + ',"visitId":' + visitId + '}';
            spService.putParams('branches/' +  transferParams.branchId + '/users/' +  transferParams.userId + '/visits/',transferParams);
            //util.hideModal("transferQueueToQueueDialogue");
        }
    };

    var transferVisitInQueueToServicePointPoolClicked = function(sortType, aRowData, visitId) {
        
        if(servicePoint.hasValidSettings()) {
            var transferParams = servicePoint.createParams();
            transferParams.servicePointId = aRowData.id;
            transferParams.$entity = {
                "fromId" : sessvars.servicePointId,
                "fromBranchId" : sessvars.branchId,
                "visitId": visitId
            };
			userPoolUpdateNeeded = false;
            transferParams.json='{"fromId":'+ sessvars.servicePointId + ',"fromBranchId":'+ sessvars.branchId + ',"visitId":' + visitId + '}';
            spService.putParams('branches/' +  transferParams.branchId + '/servicePoints/' +  transferParams.servicePointId + '/visits/',transferParams);
            //util.hideModal("transferQueueToQueueDialogue");
        }
    };
};