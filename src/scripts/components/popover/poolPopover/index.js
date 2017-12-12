
// Pool
window.$Qmatic.components.popover.PoolPopoverComponent = function(options) {
    window.$Qmatic.components.popover.BasePopoverComponent.call(this, options);
    this.visitId        = options.popTarget.getAttribute('data-visitId');
    this.disableCall    = options.disableCall || false;
    this.views          = {
        ACTION_BAR: 'action-bar',
        TRANSFER_SELECTION: 'transfer-selection'
    }
}

window.$Qmatic.components.popover.PoolPopoverComponent.prototype 
    = Object.create(window.$Qmatic.components.popover.BasePopoverComponent.prototype);

// correct the constructor pointer
window.$Qmatic.components.popover.PoolPopoverComponent.prototype.constructor 
    = window.$Qmatic.components.popover.PoolPopoverComponent;

window.$Qmatic.components.popover.PoolPopoverComponent.prototype 
    = $.extend(window.$Qmatic.components.popover.BasePopoverComponent.prototype, {
    init: function () {
        this.instance = new Tooltip(this.target, {
            container: document.body,
            trigger: 'manual',
            title: ' ',
            placement: 'bottom-start',
            template: this.template,
            offset: '0, 10'
        });

        this._attachTargetEventListeners();
    },
    _attachTargetEventListeners: function () {
        this.target.addEventListener('click', this._toggleAndAttachPopoverTemplateEvents.bind(this));
    },
    _toggleAndAttachPopoverTemplateEvents: function (e) {
        var shouldAttachCloseEvent = this.instance._tooltipNode ? false : true; 
        this._toggleInstance(e);
        this._navigateTo(this.views.ACTION_BAR);

        if(shouldAttachCloseEvent) {
            this._attachTemplateEvents();
        }
    },
    _attachTemplateEvents: function () {
        var closeBtns   = this.instance._tooltipNode.querySelectorAll('.js-popover-close'),
            callBtn     = this.instance._tooltipNode.querySelector('.js-popover-call'),
            backBtns    = this.instance._tooltipNode.querySelectorAll('.js-popover-back');
            //transferBtn = this.instance._tooltipNode.querySelector('.js-popover-transfer'),

        for(var i = 0; i < closeBtns.length; i ++) {
            closeBtns[i].addEventListener('click', this._toggleInstance.bind(this));
        }

        for(var j = 0; j < backBtns.length; j ++) {
            backBtns[j].addEventListener('click', this._navigateBack.bind(this));
        }
        if(this.disableCall) {
            callBtn.disabled = true;
        } else {
            callBtn.addEventListener('click', this._call.bind(this));
        }
        
        
        //transferBtn.addEventListener('click', this._navigateTo.bind(this, this.views.TRANSFER_SELECTION));
        
    }
});
