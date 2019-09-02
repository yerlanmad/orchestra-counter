var servicePointPool = new function() {

    var servicePointPoolTable;

    this.renderCounterPool = function () {

        var url = "branches/" + sessvars.branchId + "/servicePoints/"
                    + sessvars.servicePointId + "/pool/visits";

        // Get DOM elements
        var counterPool         = $('#servicePointPoolModule'),
            counterPoolList     = counterPool.find('.qm-pool__list'),
            counterPoolToggle   = counterPool.find('.qm-pool__toggle-btn');

        // Empty list
        counterPoolList.empty();

        // Templates
        var counterPoolItemTemplate = $('<li class="qm-pool__list-item"><div class="qm-pool-item"><a href="#" class="qm-pool-item__content qm-pool-item__content--ticket"></a><span class="qm-pool-item__content qm-pool-item__content--wait"></span></div></li>')
        var noResultTemplate = $('<li class="qm-pool__list-item qm-pool__list-item--auto-width"><span class="qm-pool__no-result-text">' + jQuery.i18n.prop('info.pools.no_customers_in_pool') + '</span></li>');
        var popoverTemplate = document.querySelector('.qm-popover--pool').outerHTML.trim();

        // Popover options
        var options = {
            template: popoverTemplate
        }

        // Get the data
        var counterPoolData = spService.get(url);

        if(counterPoolData && counterPoolData.length > 0) {
            // Sort based on time in pool
            counterPoolData.sort(util.compareTimeInPool);
            counterPoolData.forEach(function(data, i) {
                var template = counterPoolItemTemplate.clone();

                template.find('.qm-pool-item__content--ticket').text(data.ticketId);
                template.find('.qm-pool-item__content--wait').text(util.formatIntoMM(data.waitingTime));
                counterPoolList.append(template);

                // Popover options and initialization
                options.popTarget = template.get(0).querySelector('.qm-pool-item__content--ticket');
                if(servicePoint.isOutcomeOrDeliveredServiceNeeded()  || sessvars.state.servicePointState === "CLOSED") {
                    options.disableCall = true;
                }
                options.visitId = data.visitId;
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
            var $ticketNumber = $('#ticketNumber');
            var ticketNumStr = $ticketNumber.text();
            $ticketNumber.text('');
            setTimeout(function () {
                $ticketNumber.text(ticketNumStr);
            });   
        }
    }

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
        // Get DOM elements
        var counterPool         = $('#servicePointPoolModule'),
            counterPoolList     = counterPool.find('.qm-pool__list');

        // Empty list
        counterPoolList.empty();
    }
};