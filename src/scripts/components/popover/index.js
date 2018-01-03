// Popover Component
window.$Qmatic.components.popover = {}

// Base Popover Class
window.$Qmatic.components.popover.BasePopoverComponent = function (options) {
    this.template           = options.template;
    this.target             = options.popTarget;
    this.popoverOverlay     = document.getElementById('js-popover-overlay')
    this.navigationStack    = [];
}

//  Base Popover Class Methods
window.$Qmatic.components.popover.BasePopoverComponent.prototype = {
    _stackHasPreviousView: function () {
        return this.navigationStack.length > 1
    },
    _getLatestAddedView: function () {
        return this.navigationStack[this.navigationStack.length - 1]
    },
    _navigateBack: function () {
        if(this._stackHasPreviousView()) {
            this._hideView(this.navigationStack.pop());
            this._navigate();
        }
    },
    _navigateTo: function (view, initFn) {
        this.navigationStack.push(view);
        this._navigate();
        
        if(initFn !== null && _.isFunction(initFn)) {
            initFn();
        }
    },
    _navigate: function () {
        var nextView = this._getLatestAddedView();
        var lastView = this._stackHasPreviousView() ? 
                        this.navigationStack[this.navigationStack.length - 2] : '';

        this._hideView(lastView);
        this._showView(nextView);
    },
    _showView: function (view) {
        this.instance._tooltipNode.classList.add('popover-show--' + view);
    },
    _hideView: function (view) {
        this.instance._tooltipNode.classList.remove('popover-show--' + view);
    },
    _toggleInstance: function () {
        if(this.instance._isOpen) {
            // Clean up navigation
            this.disposeInstance();
            this.popoverOverlay.style.display = "none";
            return;
        }
        this.popoverOverlay.style.display = "block";
        this.instance.toggle();
    }
}