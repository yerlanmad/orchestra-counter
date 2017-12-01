var queues = new function() {

    var queuesTable;
    var ticketsTable;
    var SORTING = [[2, 'desc'], [3, 'desc'], [0, 'asc']];

    /*
     * keepCalling should be set to true to have this function call itself every 30 secs.
     * sessvars.queueTimer can be used to stop the call
     */
    this.updateQueues = function(keepCalling) {
        if(!servicePoint.getWorkstationOffline() && servicePoint.hasValidSettings()) {
            if(typeof queuesTable !== 'undefined') {
                queuesTable.fnClearTable();
                var queuesData = spService.get("branches/" + sessvars.branchId + "/queues");
                queuesTable.fnAddData(queuesData);
                queuesTable.fnSort(SORTING);
            } else {
                var columns = [
                    /* Queue name */        {"sClass": "qm-table__first-column",
                        "mDataProp": "name",
                        "sDefaultContent" : null},
                    /* Queue id */          {"bSearchable": false,
                        "bVisible": false,
                        "mDataProp": "id",
                        "sDefaultContent" : null},
                    /* Queue waiting num */ {"sClass": "qm-table__middle-column",
                        "mDataProp": "customersWaiting",
                        "sDefaultContent" : null},
                    /* Queue waiting time */{"sClass": "qm-table__last-column",
                        "mDataProp": "waitingTime",
                        "sDefaultContent" : null}
                ];
                var headerCallback = function(nHead, aasData, iStart, iEnd, aiDisplay) {
                    //nHead.style.borderBottom = "1px solid #c0c0c0";
                    nHead.getElementsByTagName('th')[0].innerHTML = jQuery.i18n.prop('info.queue.name.short');
                    nHead.getElementsByTagName('th')[1].innerHTML = jQuery.i18n.prop('info.queue.waiting.short');
                    nHead.getElementsByTagName('th')[2].innerHTML = jQuery.i18n.prop('info.queue.waiting.time.short');
                };
				var t= new Date();
                var url = "/rest/servicepoint/branches/" + sessvars.branchId + "/queues?call="+t;
                var rowCallback = function(nRow, aData, iDisplayIndex) {
	
                    if(sessvars.state.servicePointState == servicePoint.servicePointState.OPEN &&
                        !(servicePoint.isOutcomeOrDeliveredServiceNeeded() /*&& sessvars.forceMark && !hasMark()*/)) {
                        var queueName = $('td:eq(0)', nRow).text();
                        $('td:eq(0)', nRow).empty().append("<span class=\"qm-table__queue-name\" " +
                            "title=\"" + jQuery.i18n.prop("action.title.queue.click") + "\">" + queueName + "</span>");

							
                        $('td:eq(0) > span.qm-table__queue-name', nRow).click(function() {
                            queueClicked(nRow);
							
						
							
                        });
                    } else {
                        $('td:eq(0)', nRow).addClass("qm-table__queue-name--disabled");
                    }
                    
                    $('td:eq(2)', nRow).html(util.formatIntoMM(parseInt(aData.waitingTime)));
                    return nRow;
                };
                queuesTable = util.buildTableJson({"tableId": "queues", "url": url, "rowCallback": rowCallback,
                    "columns": columns, "filter": false, "headerCallback": headerCallback, "emptyTableLabel": "info.queues.none", "scrollYHeight": "100%"});
                queuesTable.fnSort(SORTING);
            }

            // Sadly clearing and adding data to the queue "data table" resets the position of our search result
            customer.positionCustomerResult();
        }
        if(keepCalling) {
            sessvars.queueTimer = setTimeout(function() {
                queues.updateQueues(true);
            }, queueRefeshTime*1000);
        }
    };

    var queueClicked = function(rowClicked) {
        if(servicePoint.hasValidSettings() && sessvars.state.servicePointState == servicePoint.servicePointState.OPEN &&
            !(servicePoint.isOutcomeOrDeliveredServiceNeeded() /*&& sessvars.forceMark && !hasMark()*/)) {
            sessvars.clickedQueueId = queuesTable.fnGetData(rowClicked).id; //ql queue id
            util.showModal("ticketsDialogue");
            if(typeof ticketsTable !== 'undefined') {
                //empty the tickets table and populate with new data from server if table is not created
                ticketsTable.fnClearTable();
                var params = {};
                params.branchId = sessvars.branchId;
                params.queueId = sessvars.clickedQueueId;
                var tickets = spService.get("branches/" + params.branchId + "/queues/" + params.queueId + "/visits");
                ticketsTable.fnAddData(tickets);
                ticketsTable.fnAdjustColumnSizing();
            } else {
                var columns = [
                    /* Id */                {"bSearchable": false,
                        "bVisible": false,
                        "mDataProp": "visitId"},

                    /* Ticket id */         {"sClass": "firstColumn",
                        "mDataProp": "ticketId"},

                    /* Actions */      {"sClass": "middleColumn",
                        "mData": null,
                        "sDefaultContent": ""},
                    /* Waiting time */      {"sClass": "lastColumn",
                        "mDataProp": "waitingTime"}

                ];
                var headerCallback = function(nHead, aasData, iStart, iEnd, aiDisplay) {
                    nHead.style.borderBottom = "1px solid #c0c0c0";
                    nHead.getElementsByTagName('th')[0].innerHTML = jQuery.i18n.prop('info.queue.tickets');
                    nHead.getElementsByTagName('th')[1].innerHTML = jQuery.i18n.prop('info.queue.tickets.actions');
                    nHead.getElementsByTagName('th')[2].innerHTML = jQuery.i18n.prop('info.queue.waiting.time');
                };
                var t = new Date();
                var url = "/rest/servicepoint/branches/" + sessvars.branchId + "/queues/" + sessvars.clickedQueueId + "/visits?call=" + t;
                var rowCallback = function(nRow, aData, iDisplayIndex) {
                    if($('td:eq(0)', nRow).find('span').length == 0) {
                        //format ticket number
                        $('td:eq(0)', nRow).html("<span class='ticketNumSpan'>" + aData.ticketId + "</span>");
						if ( buttonTransferFromQueueEnabled  == true ) {						
							$('td:eq(1)', nRow).append("<span><a href=\"#\" class=\"transferTicket\" title=\"" + jQuery.i18n.prop("action.title.transfer") + "\"></a></span>");
						}
						if ( buttonRemoveFromQueueEnabled == true ) {
							$('td:eq(1)', nRow).append("<span><a href=\"#\" class=\"removeTicket\" title=\"" + jQuery.i18n.prop("action.title.remove") + "\"></a></span>");
						}
						if ( buttonCallFromQueueEnabled  == true ) {						
							$('td:eq(1)', nRow).append("<span><a href=\"#\" class=\"callTicket\" title=\"" +  jQuery.i18n.prop("action.title.call.ticket")  + "\"></a></span>");
						}
                        var formattedTime = util.formatIntoMM(parseInt(aData.waitingTime));
                    }
                    $('td:eq(2)', nRow).html(formattedTime);
                    $(nRow).addClass("");
                    return nRow;
                };

                //create new table since not defined
                ticketsTable = util.buildTableJson({"tableId": "tickets", "url": url, "rowCallback": rowCallback,
                    "columns": columns, "filter": false, "headerCallback": headerCallback, "scrollYHeight": "300px",
                    "emptyTableLabel": "info.queue.tickets.empty"});
            }

            //kill old event handlers
			if ( buttonTransferFromQueueEnabled  == true ) {
				$('tbody td span a.transferTicket', $('#tickets')).die('click');
			}
			if ( buttonRemoveFromQueueEnabled  == true ) {
				$('tbody td span a.removeTicket', $('#tickets')).die('click');
			}
			if ( buttonCallFromQueueEnabled  == true ) {
				$('tbody td span a.callTicket', $('#tickets')).die('click');
			}
	
			if ( buttonTransferFromQueueEnabled  == true ) {	
				$('tbody td span a.transferTicket', $('#tickets')).live('click', function() {
					var nTr = $(this).closest("tr").get(0);
					var aData = ticketsTable.fnGetData(nTr);
					transfer.transferTicketToQueueClicked(aData);
					util.hideModal('ticketsDialogue');
					return false;
				});
			}			

			if ( buttonRemoveFromQueueEnabled == true ) {
				$('tbody td span a.removeTicket', $('#tickets')).live('click', function() {
					var nTr = $(this).closest("tr").get(0);
					var aData = ticketsTable.fnGetData(nTr);
					removeTicketClicked(aData);
					util.hideModal('ticketsDialogue');
					return false;
				});
			}

			if ( buttonCallFromQueueEnabled  == true ) {			
				$('tbody td span a.callTicket', $('#tickets')).live('click', function() {
					var nTr = $(this).closest("tr").get(0);
					var aData = ticketsTable.fnGetData(nTr);
					callTicketClicked(aData);
					util.hideModal('ticketsDialogue');
					return false;
				});
			}
            $("#ticketListHeader").empty();
            $("#ticketListHeader").html(
                '<a href=\"#\" class=\"closeButton\" onclick="javascript:util.hideModal(\'ticketsDialogue\')"></a>' +
                    translate.msg("info.list.of.tickets.in", [queuesTable.fnGetData(rowClicked).name]));
        }
    };

    this.emptyQueues = function() {
        queuesTable.fnClearTable();
    };

    var removeTicketClicked = function(aRowData) {
        if(servicePoint.hasValidSettings()) {
            var params = servicePoint.createParams();
            params.queueId = sessvars.clickedQueueId;
            params.visitId = aRowData.visitId;
            spService.del("branches/"+params.branchId+"/servicePoints/"+params.servicePointId+"/visits/"+params.visitId);
            queues.updateQueues(false);
        }
    };

	var callTicketClicked = function(aRowData) {
        if(servicePoint.hasValidSettings()) {
            var params = servicePoint.createParams();
            params.queueId = sessvars.clickedQueueId;
            params.visitId = aRowData.visitId;
			userPoolUpdateNeeded = false;
			spPoolUpdateNeeded = false;
			sessvars.state = servicePoint.getState(spService.post("branches/"+params.branchId+"/servicePoints/"+params.servicePointId+"/visits/"+params.visitId));
			queues.updateQueues(false);
			if (sessvars.state.visitState == "CALL_NEXT_TO_QUICK") {
				util.showMessage(jQuery.i18n.prop("info.call.next.to.quick"));
			} else {
				sessvars.statusUpdated = new Date();
				servicePoint.updateWorkstationStatus();
				sessvars.currentCustomer = null;
			}
        }
    };
};