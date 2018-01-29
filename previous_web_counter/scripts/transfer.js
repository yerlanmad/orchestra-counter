var transfer = new function() {
    var transferTable;
    var transferToStaffPoolTable;
    var transferToServicePointPoolTable;

    var transferTicketToQueueTable;
    var transferQueueToStaffPoolTable;
    var transferQueueToServicePointPoolTable;

    this.transferPressed = function () {
        if(transferToQueueEnabled 
            && transferToUserPoolEnabled === false
            && transferToServicePointPoolEnabled === false) {
                transfer.navigateToQueueView();
        } else if(transferToUserPoolEnabled 
            && transferToQueueEnabled === false
            && transferToServicePointPoolEnabled === false) {
                transfer.navigateToUserPoolView();
        } else if(transferToServicePointPoolEnabled 
            && transferToUserPoolEnabled === false
            && transferToQueueEnabled === false) {
                transfer.navigateToCounterPoolView();
        } else {
            cardNavigationController.push($Qmatic.components.card.transferOptionsCard);
        }
        
        if(transferToQueueEnabled) {
            $($Qmatic.components.card.transferOptionsCard.getSelector()).find('.js-transferToQueue').attr('style', '');
        } else {
            $($Qmatic.components.card.transferOptionsCard.getSelector()).find('.js-transferToQueue').css('display', 'none');
        }
        if(transferToUserPoolEnabled) {
            $($Qmatic.components.card.transferOptionsCard.getSelector()).find('.js-transferToUserPool').attr('style', '');
        } else {
            $($Qmatic.components.card.transferOptionsCard.getSelector()).find('.js-transferToUserPool').css('display', 'none');
        }
        if(transferToServicePointPoolEnabled) {
            $($Qmatic.components.card.transferOptionsCard.getSelector()).find('.js-transferToCounterPool').attr('style', '');
        } else {
            $($Qmatic.components.card.transferOptionsCard.getSelector()).find('.js-transferToCounterPool').css('display', 'none');
        }
        
    }

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
            util.showMessage(translate.msg('info.successful.transfer', [sessvars.state.visit.ticketId, rowData.name]), false);
            sessvars.state = servicePoint.getState();
            sessvars.statusUpdated = new Date();
            servicePoint.updateWorkstationStatus(false);
            if(sessvars.state.userState == servicePoint.userState.NO_STARTED_USER_SESSION) {
                util.showError(jQuery.i18n.prop("error.not.loggedin"));
                return;
            }
            sessvars.currentCustomer = null;
            sessvars.cfuSelectionSet = true;
            customer.updateCustomerModule();
        } else {
            util.showError(jQuery.i18n.prop("error.no.ongoing.transaction"));
        }
    };

    //transfer current visit to new service
    var transferCurrentVisitToCounterPoolClicked = function(sortType, rowData) {
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
            util.showMessage(translate.msg('info.successful.transfer', [sessvars.state.visit.ticketId, rowData.name]), false);
            sessvars.state = servicePoint.getState();
            sessvars.statusUpdated = new Date();
            servicePoint.updateWorkstationStatus(false);
            if(sessvars.state.userState == servicePoint.userState.NO_STARTED_USER_SESSION) {
                util.showError(jQuery.i18n.prop("error.not.loggedin"));
                return;
            }
            sessvars.currentCustomer = null;
            customer.updateCustomerModule();
        } else {
            util.showError(jQuery.i18n.prop("error.no.ongoing.transaction"));
        }
    };

    var transferCurrentVisitToUserPoolClicked = function(sortType, rowData) {
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
            util.showMessage(translate.msg('info.successful.transfer', [sessvars.state.visit.ticketId, rowData.fullName]), false);
			spService.putParams('branches/' +  transferParams.branchId + '/users/' +  transferParams.userId + '/visits/',transferParams);
            sessvars.state = servicePoint.getState();
            sessvars.statusUpdated = new Date();
            servicePoint.updateWorkstationStatus(false);
            if(sessvars.state.userState == servicePoint.userState.NO_STARTED_USER_SESSION) {
                util.showError(jQuery.i18n.prop("error.not.loggedin"));
                return;
            }
            sessvars.currentCustomer = null;
            customer.updateCustomerModule();
        } else {
            util.showError(jQuery.i18n.prop("error.no.ongoing.transaction"));
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
            //need to store some information from the tickets table for later usage, when calling/transferring a ticket
            if(table != null) {
                table.fnClearTable();
                var queues = spService.get("branches/" + sessvars.branchId + "/queues");
                if(queues.length > 0) {
                    var filteredQueues = filterQueues(queues);
                    table.fnAddData(filteredQueues);
                    table.fnAdjustColumnSizing();
                }
            } else {
                var columns = [
                    /* Queue name */        {"sClass": "qm-table__first-column",
                    "sType": "qm-sort",
                        "mDataProp": "name"},
                    /* Queue id */          {"bSearchable": false,
                    "sType": "qm-sort",
                        "bVisible": false,
                        "mDataProp": "id"},
                    /* Actions */      {"sClass": "qm-table__last-column",
                    "sType": "qm-sort",
                        "mData": null,
                        "sDefaultContent": ""}
                ];
                var t = new Date();
                var url = "/rest/servicepoint/branches/" + sessvars.branchId + "/queues?call=" + t;
                var headerCallback = function(nHead, aasData, iStart, iEnd, aiDisplay) {
                    $(nHead).closest('thead, THEAD').find('.transferQueueName').each( function (i, item) {
                        $(item).html(jQuery.i18n.prop('info.transfer.queue.name'));
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
                
                table.fnSort([0, 'asc']);
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
                if(users.length > 0) {
                    table.fnAddData(users);
                    table.fnAdjustColumnSizing();
                }
            } else {
                var staffPoolColumns = [
                    /* Id */         {"bSearchable": false,
                        "bVisible": false,
                        "sType": "qm-sort",
                        "mDataProp": "id"},
                    /* User name  */ {"sClass": "qm-table__first-column",
                    "sType": "qm-sort",
                        "mDataProp": "fullName"},
                    /* Locale */     {"bSearchable": false,
                    "sType": "qm-sort",
                        "bVisible": false,
                        "mDataProp": "locale"},
                    /* Direction */  {"bSearchable": false,
                    "sType": "qm-sort",
                        "bVisible": false,
                        "mDataProp": "direction"}
                ];
                var staffPoolUrl = "/rest/servicepoint/branches/" + sessvars.branchId + "/users/validForUserPoolTransfer/";
                var staffPoolHeaderCallback = function(nHead, aasData, iStart, iEnd, aiDisplay) {
                    
                    $(nHead).closest('thead, THEAD').find('.transferStaffPoolName').each( function (i, item) {
                        $(item).html(jQuery.i18n.prop('info.transfer.staff.pool.username'));
                    });
                };
                var staffPoolRowCallback = function(nRow, aData, iDisplayIndex) {
                    if($('td:eq(0)', nRow).find('span').length == 0) {
                        var staffName = $('td:eq(0)', nRow).text();
                        $('td:eq(0)', nRow).empty().append("<span class=\"staffNameSpan\" title=\"" + translate.msg("action.title.transfer.staff.pool", [sessvars.ticketIdToTransfer, staffName]) + "\">" + staffName + "</span>");
                    }
                    return nRow;
                };
                table = util.buildTableJson({"tableSelector": selector,
                    "url": staffPoolUrl, "rowCallback": staffPoolRowCallback, "columns": staffPoolColumns,
                    "filter": false, "headerCallback": staffPoolHeaderCallback, "scrollYHeight": "300px",
                    "emptyTableLabel":"info.transfer.staff.pool.empty"});

                table.fnSort([1, 'asc']);
            }
            //destroy old event handlers
            $('tbody tr td', $(selector)).die('click');
            //make new ones
            $('tbody tr td', $(selector)).live('click',function(){
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
                if(servicePoints.length > 0) {
                    table.fnAddData(servicePoints);
                    table.fnAdjustColumnSizing();
                }
            } else {
                var servicePointColumns = [
                    /* Name */        {"sClass": "qm-table__first-column",
                    "sType": "qm-sort",
                        "mDataProp": "name"},
                    /* Id */          {"bSearchable": false,
                    "sType": "qm-sort",
                        "bVisible": false,
                        "mDataProp": "id"},
                    /* Unit id */     {"bSearchable": false,
                    "sType": "qm-sort",
                        "bVisible": false,
                        "mDataProp": "unitId"},
                    /* State*/{"bVisible": false,
                    "sType": "qm-sort",
                        "mDataProp": "state"},
                    /* Parameters */ {"bSearchable": false,
                    "sType": "qm-sort",
                        "bVisible": false,
                        "mDataProp": "parameters"}
                ];
                var servicePointUrl = "/rest/servicepoint/branches/" + sessvars.branchId + "/servicePoints/validForServicePointPoolTransfer/";
                var servicePointHeaderCallback = function(nHead, aasData, iStart, iEnd, aiDisplay) {
                    
                    $(nHead).closest('thead, THEAD').find('.transferServicePointPoolName').each( function (i, item) {
                        $(item).html(jQuery.i18n.prop('info.transfer.servicepoint.pool.name'));
                    });
                };
                var servicePointRowCallback = function(nRow, aData, iDisplayIndex) {
                    if($('td:eq(0)', nRow).find('span').length == 0) {
                        var servicePointName = $('td:eq(0)', nRow).text();
                        if(aData.state === "CLOSED") {
                            $('td:eq(0)', nRow).empty().append("<span class=\"servicePointNameSpan\" title=\"" + translate.msg("action.title.transfer.servicepoint.pool", [sessvars.ticketIdToTransfer, servicePointName]) + "\">" + servicePointName +
                            "</span> <i class='qm-table__lock-icon icon-lock' aria-hidden='true'></i>");
                        } else {
                            $('td:eq(0)', nRow).empty().append("<span class=\"servicePointNameSpan\" title=\"" + translate.msg("action.title.transfer.servicepoint.pool", [sessvars.ticketIdToTransfer, servicePointName]) + "\">" + servicePointName +
                            "</span>");
                        }
                    }
                    return nRow;
                };
                table = util.buildTableJson({"tableSelector": selector,
                    "url": servicePointUrl, "rowCallback": servicePointRowCallback, "columns": servicePointColumns,
                    "filter": false, "headerCallback": servicePointHeaderCallback, "scrollYHeight": "300px",
                    "emptyTableLabel":"info.transfer.servicepoint.pool.empty"});
                
            }
            table.fnSort([[3, 'desc'], [0, 'asc']]); // open counters first
            //destroy old event handlers
            $('tbody tr td', $(selector)).die('click');
            //make new ones
            $('tbody tr td', $(selector)).live('click',function(){
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
            queueViewController.navigateToOverview();
            util.showMessage(translate.msg('info.successful.transfer', [sessvars.ticketIdToTransfer, aRowData.name]), false);
            
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
            queues.updateQueues();
            queueViewController.navigateToOverview();
            util.showMessage(translate.msg('info.successful.transfer', [sessvars.ticketIdToTransfer, aRowData.fullName]), false);
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
            queues.updateQueues();
            queueViewController.navigateToOverview();
            util.showMessage(translate.msg('info.successful.transfer', [sessvars.ticketIdToTransfer, aRowData.name]), false);
        }
    };

    this.navigateToQueueView = function () {
        cardNavigationController.push(window.$Qmatic.components.card.transferQueueCard);
        this.renderCardTransferToQueue();
    };

    this.navigateToUserPoolView = function () {
        cardNavigationController.push(window.$Qmatic.components.card.transferUserPoolCard);
        this.renderCardTransferToUserPool();
    };

    this.navigateToCounterPoolView = function () {
        cardNavigationController.push(window.$Qmatic.components.card.transferCounterPoolCard);
        this.renderCardTransferToCounterPool();
    };


    // Transfer to queue from card
    this.renderCardTransferToQueue = function () {
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
            //need to store some information from the tickets table for later usage, when calling/transferring a ticket
            if(transferTable != null) {
                transferTable.fnClearTable();
                var queues = spService.get("branches/" + sessvars.branchId + "/queues");
                if(queues.length > 0) {
                    var filteredQueues = filterQueues(queues);
                    transferTable.fnAddData(filteredQueues);
                    transferTable.fnAdjustColumnSizing();
                }
            } else {
                var columns = [
                    /* Queue name */        {"sClass": "qm-table__first-column",
                    "sType": "qm-sort",
                        "mDataProp": "name"},
                    /* Queue id */          {"bSearchable": false,
                    "sType": "qm-sort",
                        "bVisible": false,
                        "mDataProp": "id"},
                    /* Actions */      {"sClass": "qm-table__last-column",
                    "sType": "qm-sort",
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
                            $('td:eq(1)', nRow).append("<button class='qm-action-btn qm-action-btn--only-icon transferTicketFirst' title='" + translate.msg("action.title.transfer.first", [sessvars.state.visit.ticketId]) + "'>"
                            + "<i class='qm-action-btn__icon icon-queue-first' aria-hidden='true'></i>"
                            + "<span class='sr-only'>" + translate.msg("action.title.transfer.first", [sessvars.state.visit.ticketId]) + "</span></button>");
						}
						if ( buttonTransferLastEnabled  == true ) {	
                            $('td:eq(1)', nRow).append("<button class='qm-action-btn qm-action-btn--only-icon transferTicketLast' title='" + translate.msg("action.title.transfer.last", [sessvars.state.visit.ticketId]) + "'>"
                                + "<i class='qm-action-btn__icon icon-queue-last' aria-hidden='true'></i>"
                                + "<span class='sr-only'>" + translate.msg("action.title.transfer.last", [sessvars.state.visit.ticketId]) + "</span></button>");
						}
						if ( buttonTransferSortEnabled  == true ) {	
                            $('td:eq(1)', nRow).append("<button class='qm-action-btn qm-action-btn--only-icon transferTicketSort' title='" + translate.msg("action.title.transfer.sorted.lifetime", [sessvars.state.visit.ticketId]) + "'>"
                                + "<i class='qm-action-btn__icon icon-clock' aria-hidden='true'></i>"
                                + "<span class='sr-only'>" + translate.msg("action.title.transfer.sorted.lifetime", [sessvars.state.visit.ticketId]) + "</span></button>");
						}
                    }
                    return nRow;
                };
                
                transferTable = util.buildTableJson({"tableId": "transferToQueues", "url": url,
                    "rowCallback": rowCallback, "columns": columns, "filter": true, "customFilter": true, "infoFiltered": "info.filtered.fromEntries", "headerCallback": headerCallback,
                    "scrollYHeight": "auto", "emptyTableLabel":"info.transfer.queue.empty", "filterData": filterQueues, "placeholder": jQuery.i18n.prop("info.placeholder.transfer.search")});
                
            }
            transferTable.fnSort([0, 'asc']);
					
            //destroy old event handlers
			if ( buttonTransferFirstEnabled  == true ) {	
				$('tbody td button.transferTicketFirst', $('#transferToQueues')).die('click');
			}
			if ( buttonTransferLastEnabled  == true ) {	
				$('tbody td button.transferTicketLast', $('#transferToQueues')).die('click');
			}
			if ( buttonTransferSortEnabled  == true ) {	
				$('tbody td button.transferTicketSort', $('#transferToQueues')).die('click');
			}
            //make new ones
			if ( buttonTransferFirstEnabled  == true ) {	
				$('tbody td button.transferTicketFirst', $('#transferToQueues')).live('click',function(){
					var nTr = $(this).closest("tr").get(0);
                    var aData = transferTable.fnGetData(nTr);
                    transferCurrentVisitToQueueClicked("FIRST", aData);
				});
			}
			if ( buttonTransferLastEnabled  == true ) {	
				$('tbody td button.transferTicketLast', $('#transferToQueues')).live('click',function(){
                    var nTr = $(this).closest("tr").get(0);
                    var aData = transferTable.fnGetData(nTr);
                    transferCurrentVisitToQueueClicked("LAST", aData);
				});
			}
			if ( buttonTransferSortEnabled  == true ) {	
				$('tbody td button.transferTicketSort', $('#transferToQueues')).live('click',function(){
                    var nTr = $(this).closest("tr").get(0);
                    var aData = transferTable.fnGetData(nTr);
                    transferCurrentVisitToQueueClicked("SORTED", aData);
				});
            }
        }
    };

    // Transfer to queue from card
    this.renderCardTransferToUserPool = function () {
        if(servicePoint.hasValidSettings()) {
        
            if(transferToStaffPoolTable != null) {
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
                    "sType": "qm-sort",
                        "bVisible": false,
                        "mDataProp": "id"},
                    /* User name  */ {"sClass": "qm-table__first-column",
                    "sType": "qm-sort",
                        "mDataProp": "fullName"},
                    /* Locale */     {"bSearchable": false,
                    "sType": "qm-sort",
                        "bVisible": false,
                        "mDataProp": "locale"},
                    /* Direction */  {"bSearchable": false,
                    "sType": "qm-sort",
                        "bVisible": false,
                        "mDataProp": "direction"}
                ];
                var staffPoolUrl = "/rest/servicepoint/branches/" + sessvars.branchId + "/users/validForUserPoolTransfer/";
                var staffPoolHeaderCallback = function(nHead, aasData, iStart, iEnd, aiDisplay) {
                    
                    $(nHead).closest('thead, THEAD').find('.transferStaffPoolName').each( function (i, item) {
                        $(item).html(jQuery.i18n.prop('info.transfer.staff.pool.username'));
                    });
                };
                var staffPoolRowCallback = function(nRow, aData, iDisplayIndex) {
                    if($('td:eq(0)', nRow).find('span').length == 0) {
                        var staffName = $('td:eq(0)', nRow).text();
                        $('td:eq(0)', nRow).empty().append("<span class=\"staffNameSpan\" title=\"" + translate.msg("action.title.transfer.staff.pool", [sessvars.state.visit.ticketId, staffName]) + "\">" + staffName + "</span>");
                    }
                    return nRow;
                };
                transferToStaffPoolTable = util.buildTableJson({"tableId": "transferTicketToUserPoolTable", "url": staffPoolUrl,
                "rowCallback": staffPoolRowCallback, "columns": staffPoolColumns, "filter": true, "customFilter": true, "infoFiltered": "info.filtered.fromEntries", "headerCallback": staffPoolHeaderCallback,
                "scrollYHeight": "auto", "emptyTableLabel":"info.transfer.staff.pool.empty", "placeholder": jQuery.i18n.prop("info.placeholder.transfer.search")});
            }
            transferToStaffPoolTable.fnSort([1, 'asc']);
            //destroy old event handlers
            $('tbody tr td', $("#transferTicketToUserPoolTable")).die('click');
            //make new ones
            $('tbody tr td', $("#transferTicketToUserPoolTable")).live('click',function(){
                var nTr = $(this).closest("tr").get(0);
                var aData = transferToStaffPoolTable.fnGetData(nTr);
                transferCurrentVisitToUserPoolClicked("FIRST", aData);
            });
        }
    };

    // COUNTER POOL
    this.renderCardTransferToCounterPool = function () {
        if(servicePoint.hasValidSettings()) {

            if(transferToServicePointPoolTable != null) {
                transferToServicePointPoolTable.fnClearTable();
                var params = servicePoint.createParams();
                var servicePoints = spService.get("branches/"+params.branchId+"/servicePoints/validForServicePointPoolTransfer/");
                if (servicePoints.length > 0){
                    transferToServicePointPoolTable.fnAddData(servicePoints);
                    transferToServicePointPoolTable.fnAdjustColumnSizing();
                }
            } else {
                var servicePointColumns = [
                    /* Name */        {"sClass": "qm-table__first-column",
                    "sType": "qm-sort",
                        "mDataProp": "name"},
                    /* Id */          {"bSearchable": false,
                    "sType": "qm-sort",
                        "bVisible": false,
                        "mDataProp": "id"},
                    /* Unit id */     {"bSearchable": false,
                    "sType": "qm-sort",
                        "bVisible": false,
                        "mDataProp": "unitId"},
                    /* State*/{"bVisible": false,
                    "sType": "qm-sort",
                        "mDataProp": "state"},
                    /* Parameters */ {"bSearchable": false,
                    "sType": "qm-sort",
                        "bVisible": false,
                        "mDataProp": "parameters"}
                ];
                var servicePointUrl = "/rest/servicepoint/branches/" + sessvars.branchId + "/servicePoints/validForServicePointPoolTransfer/";
                var servicePointHeaderCallback = function(nHead, aasData, iStart, iEnd, aiDisplay) {
                    
                    $(nHead).closest('thead, THEAD').find('.transferServicePointPoolName').each( function (i, item) {
                        $(item).html(jQuery.i18n.prop('info.transfer.servicepoint.pool.name'));
                    });
                };
                var servicePointRowCallback = function(nRow, aData, iDisplayIndex) {
                    if($('td:eq(0)', nRow).find('span').length == 0) {
                        var servicePointName = $('td:eq(0)', nRow).text();
                        if(aData.state === "CLOSED") {
                            $('td:eq(0)', nRow).empty().append("<span class=\"servicePointNameSpan\" title=\"" + translate.msg("action.title.transfer.servicepoint.pool", [sessvars.ticketIdToTransfer, servicePointName]) + "\">" + servicePointName +
                            "</span> <i class='qm-table__lock-icon icon-lock' aria-hidden='true'></i>");
                        } else {
                            $('td:eq(0)', nRow).empty().append("<span class=\"servicePointNameSpan\" title=\"" + translate.msg("action.title.transfer.servicepoint.pool", [sessvars.ticketIdToTransfer, servicePointName]) + "\">" + servicePointName +
                            "</span>");
                        }
                    }
                    return nRow;
                };
                transferToServicePointPoolTable = util.buildTableJson({"tableId": "transferTicketToCounterPoolTable",
                "url": servicePointUrl, "rowCallback": servicePointRowCallback, "columns": servicePointColumns, "filter": true, "customFilter": true, "infoFiltered": "info.filtered.fromEntries", "headerCallback": servicePointHeaderCallback,
                "scrollYHeight": "auto", "emptyTableLabel":"info.transfer.servicepoint.pool.empty", "placeholder": jQuery.i18n.prop("info.placeholder.transfer.search")});
            }
            transferToServicePointPoolTable.fnSort([[3, 'desc'], [0, 'asc']]);// open counters first
            //destroy old event handlers
            $('tbody tr td', $("#transferTicketToCounterPoolTable")).die('click');
            //make new ones
            $('tbody tr td', $("#transferTicketToCounterPoolTable")).live('click',function(){
                var nTr = $(this).closest("tr").get(0);
                var aData = transferToServicePointPoolTable.fnGetData(nTr);
                transferCurrentVisitToCounterPoolClicked("FIRST", aData);
            });
        }
    };
};