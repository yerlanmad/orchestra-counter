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

    this.renderCounterPool = function () {
        var t = new Date();
        
        var url = "branches/" + sessvars.branchId + "/servicePoints/" 
                    + sessvars.servicePointId + "/pool/visits?call=" + t;
        

        // Get DOM elements
        var counterPool         = $('#servicePointPoolModule'),
            counterPoolList     = counterPool.find('.qm-pool__list'),
            counterPoolToggle   = counterPool.find('.qm-pool__toggle-btn');

        // Empty list    
        counterPoolList.empty();

        // Clean up popovers
        $('body > .qm-popover--pool').remove();

        // Templates
        var counterPoolItemTemplate = $('<li class="qm-pool__list-item"><div class="qm-pool-item"><a href="#" class="qm-pool-item__content qm-pool-item__content--ticket" data-toggle="popover"></a><span class="qm-pool-item__content qm-pool-item__content--wait"></span></div></li>')
        var noResultTemplate = $('<li class="qm-pool__list-item qm-pool__list-item--auto-width"><span class="qm-pool__no-result-text">' + jQuery.i18n.prop('info.pools.no_customers_in_pool') + '</span></li>');
        var popoverTemplate = document.querySelector('.qm-popover--pool').outerHTML.trim();
        
        // Popover options
        var options = {
            template: popoverTemplate
        }

        // Get the data
        var counterPoolData = spService.get(url);
        if(counterPoolData.length > 0) {
            // Sort based on time in pool
            counterPoolData.sort(util.compareTimeInPool);
            counterPoolData.forEach(function(data, i) {
                var template = counterPoolItemTemplate.clone();
                
                template.find('.qm-pool-item__content--ticket').text(data.ticketId).attr('data-visitId', data.visitId);
                template.find('.qm-pool-item__content--wait').text(util.formatIntoMM(data.waitingTime));
                counterPoolList.append(template);
    
                // Popover options and initialization
                options.popTarget = template.get(0).querySelector('.qm-pool-item__content--ticket');
                if(servicePoint.isOutcomeOrDeliveredServiceNeeded()) {
                    options.disableCall = true;
                }
                var popover = new window.$Qmatic.components.popover.CounterPoolPopoverComponent(options);
                popover.init();
            });
        } else {
            counterPoolList.append(noResultTemplate);
        }

        util.determineIfToggleNeeded(counterPool, counterPoolList, counterPoolToggle);
    };

    this.callFromPool = function (visitId) {
        if(servicePoint.hasValidSettings()) {
            var params = servicePoint.createParams();
            params.visitId = visitId;
			userPoolUpdateNeeded = false;
            sessvars.state = servicePoint.getState(spService.put("branches/"+params.branchId+"/servicePoints/"+params.servicePointId+"/pool/"+params.visitId));
            sessvars.statusUpdated = new Date();
            servicePoint.updateWorkstationStatus();
            sessvars.currentCustomer = null;
            customer.updateCustomerModule();
        }
    }

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