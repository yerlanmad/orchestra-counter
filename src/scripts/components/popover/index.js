// Popover Component
window.$Qmatic.components.popover = window.$Qmatic.components.popover || {}

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

        if(_.isFunction(initFn)) {
            initFn();
        }
    },
    _navigate: function () {
        var nextView = this._getLatestAddedView();
        var lastView = this._stackHasPreviousView() ?
                        this.navigationStack[this.navigationStack.length - 2] : '';

        this._hideView(lastView);
        this._showView(nextView);
        this.instance.popperInstance.update();
    },
    _showView: function (view) {
        this.instance._tooltipNode.classList.add('popover-show--' + view);
    },
    _hideView: function (view) {
        this.instance._tooltipNode.classList.remove('popover-show--' + view);
    },
    _toggleInstance: function () {
        if(this.instance._isOpen) {
            this.target.focus();
            // Clean up navigation
            this.disposeInstance();
            this.popoverOverlay.style.display = "none";
            return;
        }
        this.popoverOverlay.style.display = "block";
        this.instance.toggle();
        this.instance._tooltipNode.focus();
        this.tabFocus();
    },
    //manage tabbing 
    tabFocus: function () {
        $(this.instance._tooltipNode).on('keydown', $.proxy(function (event) {
            if (event.shiftKey && event.keyCode == $.ui.keyCode.TAB) {
                if ($(event.target).is($(this.instance._tooltipNode).find(':tabbable').first())) {
                    event.preventDefault();
                    this._toggleInstance();
                    this.target.focus();
                } else if ($(event.target).is($(this.instance._tooltipNode))) {
                    event.preventDefault();
                    this._toggleInstance();
                    this.target.focus();
                }
            } else if (event.keyCode == $.ui.keyCode.TAB) {
                if ($(event.target).is($(this.instance._tooltipNode).find(':tabbable').last())) {
                    event.preventDefault();
                    this._toggleInstance();
                    var index = $(':tabbable').index(this.target);
                    var fields = $(':tabbable');
                    if (index > -1 && (index + 1) < fields.length) {
                        fields.eq(index + 1).focus();
                    } else {
                        fields.eq(0).focus();
                    }
                } else {

                }
            }
        }, this));
    }
}