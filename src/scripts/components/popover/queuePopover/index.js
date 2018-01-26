
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
        COUNTER_POOL: 'counter-pool-view'
    }
}

window.$Qmatic.components.popover.QueuePopoverComponent.prototype 
    = Object.create(window.$Qmatic.components.popover.BasePopoverComponent.prototype);

// correct the constructor pointer
window.$Qmatic.components.popover.QueuePopoverComponent.prototype.constructor 
    = window.$Qmatic.components.popover.QueuePopoverComponent;

window.$Qmatic.components.popover.QueuePopoverComponent.prototype 
    = $.extend(window.$Qmatic.components.popover.QueuePopoverComponent.prototype, {
    init: function () {
        this._attachOverlayEvent();
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

            var shouldAttachTemplateEvents = this.instance._tooltipNode ? false : true; 
            
            this._toggleInstance();
            this._navigateTo(this.views.ACTION_BAR);
    
            if(shouldAttachTemplateEvents) {
                this._attachTemplateEvents();
            }
        }
    },
    _attachOverlayEvent: function () {
        this.popoverOverlay.addEventListener('click', this.disposeInstance.bind(this));
    },
    _attachTemplateEvents: function () {
        
        var closeBtns   = this.instance._tooltipNode.querySelectorAll('.js-popover-close'),
            callBtn     = this.instance._tooltipNode.querySelector('.js-popover-call'),
            backBtns    = this.instance._tooltipNode.querySelectorAll('.js-popover-back'),
            deleteBtn   = this.instance._tooltipNode.querySelector('.js-popover-delete'),
            transferBtn = this.instance._tooltipNode.querySelector('.js-popover-transfer');

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
            transferBtn.addEventListener('click', this._navigateTo.bind(this, this.views.TRANSFER_SELECTION));
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
        
        // Transfer view

        var transferToQueueBtn          = this.instance._tooltipNode.querySelector('.js-popover-transferToQueue'),
            transferToUserPoolBtn       = this.instance._tooltipNode.querySelector('.js-popover-transferToUserPool'),
            transferToCounterPoolBtn    = this.instance._tooltipNode.querySelector('.js-popover-transferToCounterPool'),
            popoverQueueTable           = this.instance._tooltipNode.querySelector('.js-popover-table-queues'),
            popoverUserPoolTable        = this.instance._tooltipNode.querySelector('.js-popover-table-user-pool'),
            popoverCounterPoolTable     = this.instance._tooltipNode.querySelector('.js-popover-table-counter-pool');
            

        transferToQueueBtn.addEventListener('click', this._navigateTo.bind(this, this.views.QUEUE, this._initQueuesTable.bind(this, popoverQueueTable)));
        transferToUserPoolBtn.addEventListener('click', this._navigateTo.bind(this, this.views.USER_POOL, this._initUserPoolTable.bind(this, popoverUserPoolTable)));
        transferToCounterPoolBtn.addEventListener('click', this._navigateTo.bind(this, this.views.COUNTER_POOL, this._initCounterPoolTable.bind(this, popoverCounterPoolTable)));

        if (transferToUserPoolEnabled == false) {
            transferToUserPoolBtn.parentNode.removeChild(transferToUserPoolBtn);
        }
    
        if (transferToServicePointPoolEnabled == false) {
            transferToCounterPoolBtn.parentNode.removeChild(transferToCounterPoolBtn);
        }

    },
    _remove: function (element) {

    },
    _initQueuesTable: function (selector) {
        this.queueTable = transfer.buildTransferToQueueTable(this, selector, this.queueTable, this.ticketId, this.visitId);
        queueViewController.resetTimer();
    },
    _initUserPoolTable: function (selector) {
        this.userPoolTable = transfer.buildTransferToUserPoolTable(this, selector, this.userPoolTable, this.ticketId, this.visitId);
        queueViewController.resetTimer();
    },
    _initCounterPoolTable: function (selector) {
        this.counterPoolTable = transfer.buildTransferToCounterPoolTable(this, selector, this.counterPoolTable, this.ticketId, this.visitId);
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
            message: jQuery.i18n.prop('btn.deteleVisit.confirm.message'),
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
        this.instance && this.instance.dispose();
        this.popoverOverlay.style.display = "none";
    }
});
