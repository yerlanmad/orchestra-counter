var projectedVisits = new function() {

    var MAX_WORKLOAD_TO_SHOW = 15;
    
    var projectedVisitsTable;

    var clearAndUpdateDataOnTable = function() {
        projectedVisitsTable.fnClearTable();
        projectedVisitsTable.fnAddData(createProjectedWorkLoad());
        projectedVisitsTable.fnAdjustColumnSizing();    	
    };
    
    var getColumns = function() {
    	var columns = [
        /* index added for sorting, the dataTable sorts as default on first column values (unsure how to modify this behavior) */	
        	{"bSearchable": false, "bVisible": false, "mDataProp": "index"},
        /* Ticket id */         
            {"sClass": "firstColumn", "mDataProp": "ticketId", "bSortable" : false},
        /* Waiting time */      
            {"sClass": "lastColumn", "mDataProp": "waitingTime", "bSortable" : false}
        ];
        return columns;
    };
    
    this.updateProjectedVisits = function(keepCalling) {
        if(!servicePoint.getWorkstationOffline() && servicePoint.hasValidSettings()) {
            if(typeof projectedVisitsTable !== 'undefined') {
            	clearAndUpdateDataOnTable();
            } else {
            	var columns = getColumns();
                var headerCallback = function(nHead, aasData, iStart, iEnd, aiDisplay) {
                    nHead.style.borderBottom = "1px solid #c0c0c0";
                    nHead.getElementsByTagName('th')[0].innerHTML = jQuery.i18n.prop('info.queue.tickets');
                    nHead.getElementsByTagName('th')[1].innerHTML = jQuery.i18n.prop('info.queue.waiting.time');
                };
                var rowCallback = function(nRow, aData, iDisplayIndex) {
                    if($('td:eq(0)', nRow).find('span').length == 0) {
                        //format ticket number
                        $('td:eq(0)', nRow).html("<span class='ticketNumSpan'>" + aData.ticketId + "</span>");
                        var formattedTime = util.formatIntoHHMM(parseInt(aData.waitingTime));
                    }
                    $('td:eq(1)', nRow).html(formattedTime);
                    return nRow;
                };

                //create new table since not defined
                projectedVisitsTable = util.buildTableJsonNoUrl({"tableId": "projectedVisits", "rowCallback": rowCallback,
                    "columns": columns, "filter": false, "headerCallback": headerCallback, "emptyTableLabel": "info.queue.tickets.empty"});
                clearAndUpdateDataOnTable();
            }
        }

        if(keepCalling) {
            sessvars.projectedVisitsTimer = setTimeout(function() {
                projectedVisits.updateProjectedVisits(true);
            }, queueRefeshTime*1000);
        }
    };

    var createProjectedWorkLoad = function() {
    	//Get work profile types
    	var workProfileType = getWorkProfileFirstCallingRuleType();
    	var sortByMaxWaitingTime = (workProfileType === 'MaxWaitingtimeExecutor');
        var params = servicePoint.createParams();

        var queueVisits = getVisitsForWorkProfile(params.branchId, params.workProfileId);
    	if(sortByMaxWaitingTime === true) {
        	sortVisitsByMaxWaitingTimeDesc(queueVisits);
    	}
    	if(queueVisits.length > MAX_WORKLOAD_TO_SHOW) {
    		queueVisits = queueVisits.slice(0, MAX_WORKLOAD_TO_SHOW);
    	}
    	addIndexToVisits(queueVisits);
    	return queueVisits;
    };
    
    var sortVisitsByMaxWaitingTimeDesc = function(visits) {
    	visits.sort(function(a, b) {
    		if(a.waitingTime === b.waitingTime) {
    			//if we have the same waiting time we sort by ticketId ascending
    			if(a.ticketId === b.ticketId) {
    				return 0;
    			}
    			if(a.ticketId > b.ticketId) {
    				return 1;
    			}
    			return -1;
    		}
    		if(a.waitingTime > b.waitingTime) {
    			return -1;
    		}
    		return 1;
    	});
    };
    
    var addIndexToVisits = function(queues) {
    	var index = 0;
    	$.each(queues, function(key, item) {
    		item.index = index++;
    	});
    };
    
    /**
     * This function returns last part of the className of the last calling rule ("finally call by" for the work profile
     */
    var getWorkProfileFirstCallingRuleType = function() {
    	var params = servicePoint.createParams(); 
    	var workProfiles = getWorkProfiles(params.branchId);
    	var workProfileType = '';
    	$.each(workProfiles, function(key, item) {
    		if(item.id === params.workProfileId) {
    			var finallyCallByIndex = item.callingRules.length - 1;
    			var className = item.callingRules[finallyCallByIndex].className; //get class name of first calling rule
    			var parts = className.split(".");
    			workProfileType = parts.pop();
    		}
    	});
    	return workProfileType;
    };
    
    var getVisitsForWorkProfile = function(branchId, workProfileId) {
    	var allVisitsForWorkProfile = spService.get("branches/" + branchId + "/workProfiles/" + workProfileId + "/visits");
    	return allVisitsForWorkProfile;
    };
    
    var getWorkProfiles = function(branchId) {
    	var workProfiles = spService.get("branches/" + branchId + "/workProfiles");
    	return workProfiles;
    };    
    
};