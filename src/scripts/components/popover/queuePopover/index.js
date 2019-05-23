
// Pool
window.$Qmatic.components.popover.QueuePopoverComponent = function(options) {
    window.$Qmatic.components.popover.BasePopoverComponent.call(this, options);
    this.visitId            = options.visitId;
    this.ticketId           = options.ticketId;
    this.showCallBtn        = _.isBoolean(options.showCallBtn) ? options.showCallBtn : true;
    this.showTransferBtn    = _.isBoolean(options.showTransferBtn) ? options.showTransferBtn : true;
    this.showDeleteBtn      = _.isBoolean(options.showDeleteBtn) ? options.showDeleteBtn : true;
    this.disableCall        = _.isBoolean(options.disableCall) ? options.disableCall : false;
    this.disableTransfer    = _.isBoolean(options.disableTransfer) ? options.disableTransfer : false;
    this.disableDelete      = _.isBoolean(options.disableDelete) ? options.disableDelete : false;

    //Tables
    this.queueTable         = null;
    this.userPoolTable      = null;
    this.counterPoolTable   = null;

    this.isRTL              = document.getElementsByTagName("html")[0].getAttribute("dir")
                                && document.getElementsByTagName("html")[0].getAttribute("dir")
                                                .indexOf('rtl') > -1 ? true : false;
    this.views          = {
        ACTION_BAR: 'action-bar-view',
        TRANSFER_SELECTION: 'transfer-selection-view',
        QUEUE: 'queue-view',
        USER_POOL: 'user-pool-view',
        COUNTER_POOL: 'counter-pool-view',
        DELAYED_TRANSFER: 'delayed-transfer-view',
    }
    this.enhancedTransferDelayButtons = [];
}

window.$Qmatic.components.popover.QueuePopoverComponent.prototype
    = Object.create(window.$Qmatic.components.popover.BasePopoverComponent.prototype);

// correct the constructor pointer
window.$Qmatic.components.popover.QueuePopoverComponent.prototype.constructor
    = window.$Qmatic.components.popover.QueuePopoverComponent;

window.$Qmatic.components.popover.QueuePopoverComponent.prototype
    = $.extend(window.$Qmatic.components.popover.QueuePopoverComponent.prototype, {
    init: function () {
        this._attachTargetEventListeners();
        this.boundariesElement = document.querySelector('.qm-main');
    },
    _attachTargetEventListeners: function () {
        this.target.addEventListener('click', this._toggleAndAttachPopoverTemplateEvents.bind(this));
    },
    _toggleAndAttachPopoverTemplateEvents: function (e) {
        if(this.instance && this.instance._isOpen) {
            this._toggleInstance();
        } else {
            this.instance = new Tooltip(this.target, {
                container: document.getElementById('renderedPopovers'),
                boundariesElement: this.boundariesElement,
                trigger: 'manual',
                title: ' ',
                placement: this.isRTL ? 'bottom-end' : 'bottom-start',
                template: this.template,
                offset: '0, 10'
            });

            popoverController.pushPopover(this);

            var shouldAttachTemplateEvents = this.instance._tooltipNode ? false : true;

            this._toggleInstance();
            this._navigateTo(this.views.ACTION_BAR);

            if(shouldAttachTemplateEvents) {
                this._attachTemplateEvents();
            }
        }
    },
    _attachOverlayEvent: function () {
        this.popoverOverlay.addEventListener('click', this.disposeInstance.bind(this), {once: true});
    },
    _removeOverlayEvent: function () {
        this.popoverOverlay.removeEventListener('click', this.disposeInstance);
    },
    _attachTemplateEvents: function () {
        // Action view
        var closeBtns   = this.instance._tooltipNode.querySelectorAll('.js-popover-close'),
            callBtn     = this.instance._tooltipNode.querySelector('.js-popover-call'),
            backBtns    = this.instance._tooltipNode.querySelectorAll('.js-popover-back'),
            deleteBtn   = this.instance._tooltipNode.querySelector('.js-popover-delete'),
            transferBtn = this.instance._tooltipNode.querySelector('.js-popover-transfer');


        // Transfer view
        var transferToQueueBtn          = this.instance._tooltipNode.querySelector('.js-popover-transferToQueue'),
            transferToUserPoolBtn       = this.instance._tooltipNode.querySelector('.js-popover-transferToUserPool'),
            transferToCounterPoolBtn    = this.instance._tooltipNode.querySelector('.js-popover-transferToCounterPool'),
            popoverQueueTable           = this.instance._tooltipNode.querySelector('.js-popover-table-queues'),
            popoverUserPoolTable        = this.instance._tooltipNode.querySelector('.js-popover-table-user-pool'),
            popoverCounterPoolTable     = this.instance._tooltipNode.querySelector('.js-popover-table-counter-pool');

        for(var i = 0; i < closeBtns.length; i ++) {
            closeBtns[i].addEventListener('click', this.disposeInstance.bind(this));
        }

        for(var j = 0; j < backBtns.length; j ++) {
            backBtns[j].addEventListener('click', this._navigateBack.bind(this));
        }
        if(this.disableCall) {
            callBtn.disabled = true;
        } else {
            callBtn.addEventListener('click', this._call.bind(this));
        }
        if(this.disableTransfer) {
            transferBtn.disabled = true;
        } else {
            if(transferToQueueEnabled
                && transferToUserPoolEnabled === false
                && transferToServicePointPoolEnabled === false) {
                    transferBtn.addEventListener('click', this._navigateTo.bind(this, this.views.QUEUE, this._initQueuesTable.bind(this, popoverQueueTable)));
            }
            else if(transferToUserPoolEnabled
                && transferToQueueEnabled === false
                && transferToServicePointPoolEnabled === false) {
                    transferBtn.addEventListener('click', this._navigateTo.bind(this, this.views.USER_POOL, this._initUserPoolTable.bind(this, popoverUserPoolTable)));
            } else if(transferToServicePointPoolEnabled
                && transferToUserPoolEnabled === false
                && transferToQueueEnabled === false) {
                    transferBtn.addEventListener('click', this._navigateTo.bind(this, this.views.COUNTER_POOL, this._initCounterPoolTable.bind(this, popoverCounterPoolTable)));
            } else {
                transferBtn.addEventListener('click', this._navigateTo.bind(this, this.views.TRANSFER_SELECTION));
            }
        }
        if(this.disableDelete) {
            deleteBtn.disabled = true;
        } else {
            deleteBtn.addEventListener('click', this._delete.bind(this));
        }
        if(!this.showCallBtn) {
            callBtn.parentNode.removeChild(callBtn);
        }
        if(!this.showTransferBtn) {
            transferBtn.parentNode.removeChild(transferBtn);
        }
        if(!this.showDeleteBtn) {
            deleteBtn.parentNode.removeChild(deleteBtn);
        }

        transferToQueueBtn.addEventListener('click', this._navigateTo.bind(this, this.views.QUEUE, this._initQueuesTable.bind(this, popoverQueueTable)));
        transferToUserPoolBtn.addEventListener('click', this._navigateTo.bind(this, this.views.USER_POOL, this._initUserPoolTable.bind(this, popoverUserPoolTable)));
        transferToCounterPoolBtn.addEventListener('click', this._navigateTo.bind(this, this.views.COUNTER_POOL, this._initCounterPoolTable.bind(this, popoverCounterPoolTable)));

        if(transferToQueueEnabled === false) {
            transferToQueueBtn.parentNode.removeChild(transferToQueueBtn);
        }

        if (transferToUserPoolEnabled === false) {
            transferToUserPoolBtn.parentNode.removeChild(transferToUserPoolBtn);
        }

        if (transferToServicePointPoolEnabled === false) {
            transferToCounterPoolBtn.parentNode.removeChild(transferToCounterPoolBtn);
        }

    },
    _remove: function (element) {

    },
    _initQueuesTable: function (selector) {
        this.queueTable = transfer.buildTransferToQueueTable(this, selector, this.queueTable, this.ticketId, this.visitId);
        var searchContainer = this.instance._tooltipNode.querySelector('.js-popover-filter-queue-container');
        var searchClearButton = this.instance._tooltipNode.querySelector('.js-popover-filter-queue-clear-btn');
        var searchInput = this.instance._tooltipNode.querySelector('.js-popover-filter-queue');

        this._setupAriaAttributes(this.queueTable, searchInput);
        this._setupSearchListener(this.queueTable, searchInput, searchContainer, searchClearButton);
        queueViewController.resetTimer();
    },
    _setupAriaAttributes: function (table, searchInput) {
        searchInput.setAttribute('aria-controls', table.attr('id'));
    },
    _showTransferWithDelay: function (transferTo, aData) {
      this._navigateTo(this.views.DELAYED_TRANSFER);
      this._initTransferWithDelay(transferTo, aData);
    },
    _initTransferWithDelay: function (transferTo, aData) {
      var transferButtons = this.instance._tooltipNode.querySelectorAll('.js-transfer-delay-btn');
      var transferInput = this.instance._tooltipNode.querySelector('.js-transfer-delay-input');
      var transferInputSubmit = this.instance._tooltipNode.querySelector('.js-transfer-delay-submit-btn');
      var transferInputLabel = this.instance._tooltipNode.querySelector('.js-label-custom-delay');
      var clearInputButton = this.instance._tooltipNode.querySelector('.js-clear-field');

      transferInput.setAttribute('id', 'popoverDelayInput');
      transferInputLabel.setAttribute('for', 'popoverDelayInput');
      transferInput.removeEventListener('keydown', util.validateTransferInput);
      transferInput.removeEventListener('input', this._clearInputToggler);
      transferInput.addEventListener('keydown', util.validateTransferInput);
      transferInput.addEventListener('input', this._clearInputToggler);

      if (this.clearInputFunction !== undefined) {
        clearInputButton.removeEventListener('click', this.clearInputFunction);
      }
      this.clearInputFunction = this._getClearInputFunction(transferInput);
      clearInputButton.addEventListener('click', this.clearInputFunction);

      util.setTransferDelayTitle($(this.instance._tooltipNode.querySelector('.js-transfer-delay-popover-description')), transferTo, aData);
      if (this.transferSubmitFunction !== undefined) {
        transferInputSubmit.removeEventListener('click', this.transferSubmitFunction);
      }
      this.transferSubmitFunction = this._getTransferDelaySubmitFunction(transferInput, transferTo, aData).bind(this);

      transferInputSubmit.addEventListener('click', this.transferSubmitFunction);

      this._removeTransferDelayListeners();
      for(var i = 0; i < transferButtons.length; i++) {
        var delay = transferButtons[i].getAttribute('data-delay');
        var transferFn = this._getTransferDelayFunction(transferTo, delay, aData).bind(this);
        transferButtons[i].addEventListener('click', transferFn);
        this.enhancedTransferDelayButtons.push({
          element: transferButtons[i],
          elementListener: transferFn
        });
      }
    },
    _getClearInputFunction: function (transferInput) {
      return function clearInput(e) {
        transferInput.value = "";
        var event = util.createEvent('input');
        transferInput.dispatchEvent(event);
      }
    },
    _getTransferDelaySubmitFunction: function (transferInput, transferTo, aData) {
      return function delaySubmitFunction(e) {
        if (transferInput.value.trim() !== '') {
          this._getTransferDelayFunction(transferTo, transferInput.value, aData).bind(this)(e);
        }
      }
    },
    _removeTransferDelayListeners: function () {
      this.enhancedTransferDelayButtons.forEach(function(item) {
        item.element.removeEventListener('click', item.elementListener);
      });
      this.enhancedTransferDelayButtons = [];
    },
    _clearInputToggler: function (e) {
      e.target.value = e.target.value.replace(/[^0-9]/g, '');
      if (e.target.value !== '') {
        e.target.nextElementSibling.style.display = "block";
      } else {
        e.target.nextElementSibling.style.display = "none";
      }
    },
    _getTransferDelayFunction: function (transferTo, delay, aData) {
      return function transferFunction(e) {
        e.preventDefault();
        var delayInMinutes = +delay * 60;
        if (transferTo === 'counterPool') {
          transfer._transferVisitInQueueToServicePointPoolClicked("FIRST", aData, this.visitId, delayInMinutes);
        } else if (transferTo === 'staffPool') {
          transfer._transferVisitInQueueToStaffPoolClicked("FIRST", aData, this.visitId, delayInMinutes);
        } else if (transferTo === 'queue') {
          transfer._transferTicketToQueue(null, aData, this.visitId, delayInMinutes);
        }
      }
    },

    _setupSearchListener: function (table, searchInput, searchContainer, searchClearButton) {
        searchClearButton.removeEventListener('click', this._clearSearchField);
        searchClearButton.addEventListener('click', this._clearSearchField.bind(this, searchInput));
        searchInput.removeEventListener('keyup', this._filterTable);
        searchInput.addEventListener('keyup', this._filterTable.bind(this, table, searchContainer));
    },
    _filterTable: function (table, searchContainer, e) {
        var val = e.target.value;
        this._toggleClearButton(searchContainer, val);
        this._filter(table, val);
    },
    _toggleClearButton: function (searchContainer, val) {
        if (val !== "") {
            searchContainer.classList.add('qm-search-filter--show-clear-btn');
        } else {
            searchContainer.classList.remove('qm-search-filter--show-clear-btn');
        }
    },
    _clearSearchField: function (searchInput) {
        var event;
        if (typeof(Event) === 'function') {
            event = new Event('keyup');
        } else {
            // IE 11
            event = document.createEvent('Event');
            event.initEvent('keyup', true, true);
        }
        searchInput.value = "";
        searchInput.dispatchEvent(event);
    },
    _filter: function (table, val) {
        table.fnFilter(val);
    },
    _initUserPoolTable: function (selector) {
        this.userPoolTable = transfer.buildTransferToUserPoolTable(this, selector, this.userPoolTable, this.ticketId, this.visitId);
        var searchContainer = this.instance._tooltipNode.querySelector('.js-popover-filter-user-pool-container');
        var searchClearButton = this.instance._tooltipNode.querySelector('.js-popover-filter-user-pool-clear-btn');
        var searchInput = this.instance._tooltipNode.querySelector('.js-popover-filter-user-pool');

        this._setupAriaAttributes(this.userPoolTable, searchInput);
        this._setupSearchListener(this.userPoolTable, searchInput, searchContainer, searchClearButton);
        queueViewController.resetTimer();
    },
    _initCounterPoolTable: function (selector) {
        this.counterPoolTable = transfer.buildTransferToCounterPoolTable(this, selector, this.counterPoolTable, this.ticketId, this.visitId);
        var searchContainer = this.instance._tooltipNode.querySelector('.js-popover-filter-counter-pool-container');
        var searchClearButton = this.instance._tooltipNode.querySelector('.js-popover-filter-counter-pool-clear-btn');
        var searchInput = this.instance._tooltipNode.querySelector('.js-popover-filter-counter-pool');

        this._setupAriaAttributes(this.counterPoolTable, searchInput);
        this._setupSearchListener(this.counterPoolTable, searchInput, searchContainer, searchClearButton);
        queueViewController.resetTimer();
    },
    _call: function () {
        this.disposeInstance();
        queues.callFromQueue(this.visitId);
        queueViewController.navigateToOverview();
    },
    _delete: function () {
        this.disposeInstance();
        var visitId = this.visitId;
        var ticketId = this.ticketId;
        var deleteConfirmation = new $Qmatic.components.modal.GenericConfirmModal("#generic-confirm-modal", {
            message: jQuery.i18n.prop('info.deteleVisit.confirm.message'),
            yesCallback: function () {
                queues.removeTicket(visitId, ticketId);
                modalNavigationController.pop();
                queueViewController.navigateToOverview();
            }
        });
        modalNavigationController.push(deleteConfirmation);
    },
    disposeInstance: function () {
        this.navigationStack    = [];
        this.queueTable         = null;
        this.userPoolTable      = null;
        this.counterPoolTable   = null;
        this.target.focus();
        this._removeTransferDelayListeners();
        this.instance && this.instance.dispose();
        this.popoverOverlay.style.display = "none";
    }
});
