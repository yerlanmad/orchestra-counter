var servicePointPool = new function() {

    var servicePointPoolTable;

    this.updateServicePointPool = function() {
        if(typeof servicePointPoolTable !== 'undefined') {
            //empty the tickets table and populate with new data from server if table is not created
            servicePointPoolTable.fnClearTable();
            var params = servicePoint.createParams();
            var tickets = spService.get("branches/"+params.branchId+"/servicePoints/"+params.servicePointId+"/pool/visits");
            servicePointPoolTable.fnAddData(tickets);
        } else {
            var columns = [
/* Id */                {"bSearchable": false,
                         "bVisible": false,
                         "mDataProp": "visitId"},
/* Ticket id */         {"sClass": "firstColumn",
                         "mDataProp": "ticketId"},
/* Waiting time */      {"sClass": "lastColumn",
                         "mDataProp": "waitingTime"}
            ];
            var headerCallback = function(nHead, aasData, iStart, iEnd, aiDisplay) {
                nHead.style.borderBottom = "1px solid #c0c0c0";
                nHead.getElementsByTagName('th')[0].innerHTML = jQuery.i18n.prop('info.servicepoint.pool.tickets');
                nHead.getElementsByTagName('th')[0].style.textAlign = "center";
                nHead.getElementsByTagName('th')[1].innerHTML = jQuery.i18n.prop('info.servicepoint.pool.waiting.time');
                nHead.getElementsByTagName('th')[1].style.textAlign = "center";
            };
            var t = new Date();
            var url = "/rest/servicepoint/branches/" + sessvars.branchId + "/servicePoints/" + sessvars.servicePointId + "/pool/visits?call=" + t;
            var rowCallback = function(nRow, aData, iDisplayIndex) {
                //format ticket number
                if(!(servicePoint.isOutcomeOrDeliveredServiceNeeded() /*&& sessvars.forceMark && !hasMark()*/)) {
                    $('td:eq(0)', nRow).html("<span class='ticketNumSpan'>" + aData.ticketId + "</span>");
                } else {
                    $('td:eq(0)', nRow).addClass("ticketIdDisabled");
                }
                var formattedTime = util.formatIntoHHMM(parseInt(aData.waitingTime));
                $('td:eq(1)', nRow).html(formattedTime);
                $(nRow).addClass("");
                return nRow;
            };

            //create new table since not defined
            servicePointPoolTable = util.buildTableJson({"tableId": "servicePointPool", "url": url,
                "rowCallback": rowCallback, "columns":columns, "filter": false, "headerCallback": headerCallback,
                "scrollYHeight": "54px", "emptyTableLabel": "info.servicepoint.pool.no.tickets"});
        }

        //kill old event handlers
        $('tbody td span.ticketNumSpan', $('#servicePointPool')).die('click');

        //callbacks for calling, transferring and removing tickets
        $('tbody td span.ticketNumSpan', $('#servicePointPool')).live('click', function() {
            var nTr = $(this).closest("tr").get(0);
            var aData = servicePointPoolTable.fnGetData(nTr);
            ticketClicked(aData);
            return false;
        });

        $(document).ready(function() {
            var sorting = [[2, 'desc']];
            servicePointPoolTable.fnSort(sorting);
        });

        // Sadly clearing and adding data to the queue "data table" resets the position of our search result
        customer.positionCustomerResult();
    };

    var ticketClicked = function(aRowData) {
        if(servicePoint.hasValidSettings()) {
            var params = servicePoint.createParams();
            params.visitId = aRowData.visitId;
			userPoolUpdateNeeded = false;
            sessvars.state = servicePoint.getState(spService.put("branches/"+params.branchId+"/servicePoints/"+params.servicePointId+"/pool/"+params.visitId));
            sessvars.statusUpdated = new Date();
            servicePoint.updateWorkstationStatus();
            sessvars.currentCustomer = null;
            customer.updateCustomerModule();
        }
    };

    this.isEmpty = function() {
        var isEmpty = true;
        var params = servicePoint.createParams();
        var tickets = spService.get("branches/"+params.branchId+"/servicePoints/"+params.servicePointId+"/pool/visits");
        if(typeof tickets !== 'undefined' && tickets != null && tickets.length > 0) {
            isEmpty = false;
        }
        return isEmpty;
    };

    this.emptyPool = function() {
        servicePointPoolTable.fnClearTable();
    }
};