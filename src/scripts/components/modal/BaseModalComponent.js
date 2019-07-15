// Base Modal Class
window.$Qmatic.components.modal.BaseModalComponent = function (selector) {

    // @Override
    this.onInit = function (selector) {
        if (selector) {
            window.$Qmatic.components.modal.BaseModalComponent.prototype.onInit.call(this, selector);
            this.hide()
        }
    }

    // =======================
    // Tab Funcitonality......
    // =======================

    this.clearTabActiveElement = function () {
        if (document.activeElement) document.activeElement.blur();
    }

    this.setupTabListener = function () {
        this.clearTabActiveElement();
        this.tearDownTabListener();

        this.tabTriggerFunc = (function (e) {
            var elem;
            if (e.keyCode == 9) {
                if (e.shiftKey) {
                    // Backward
                    elem = this.getPrevTabbaleElement();
                } else {
                    // Forward
                    elem = this.getNextTabbaleElement();
                }
                e.preventDefault();
                e.stopPropagation();
                $(elem).focus();
                       
            }
        }).bind(this);

        window.addEventListener('keydown', this.tabTriggerFunc);
    }

    this.tearDownTabListener = function () {
        window.removeEventListener('keydown', this.tabTriggerFunc);
    }

    this.tabFilterFunc = function (i, item) {
        if ($(item).hasClass("qm-tab")) {
            if ($($(item).children()[0]).is(':disabled')) {
                return false;
            }
        } else if ($(item).is(':hidden')) {
            return false;
        }
        return true;
    }

    this.getNextTabbaleElement = function () {
        var focusableElements = this.get$Elem().find(".qm-tab, .qm-action-btn").filter(this.tabFilterFunc.bind(this));
        var focusableItemCount = focusableElements.length;

        if (document.activeElement) {
            var index = focusableElements.index(document.activeElement);
            if (index == -1 || index == focusableItemCount - 1) {
                return focusableElements[0];
            } else {
                return focusableElements[index + 1];
            }
        } else {
            return focusableElements[0]
        }
    }

    this.getPrevTabbaleElement = function () {
        var focusableElements = this.get$Elem().find(".qm-tab, .qm-action-btn").filter(this.tabFilterFunc.bind(this));
        var focusableItemCount = focusableElements.length;

        if (document.activeElement) {
            var index = focusableElements.index(document.activeElement);
            if (index == -1 || index == 0) {
                return focusableElements[focusableItemCount - 1];
            } else {
                return focusableElements[index - 1];
            }
        } else {
            return focusableElements[focusableItemCount - 1];
        }
    }

    this.show = function () {
        window.$Qmatic.components.modal.BaseModalComponent.prototype.show.call(this);
        this.setupTabListener();
    }

    this.hide = function () {
        window.$Qmatic.components.modal.BaseModalComponent.prototype.hide.call(this);
        this.tearDownTabListener();
    }

    this.cleanUp = function () {
        window.$Qmatic.components.modal.BaseModalComponent.prototype.cleanUp.call(this);
        this.tearDownTabListener();
    }

    this.onInit.apply(this, arguments);
}

//  Base Modal Class Inherits from BaseComponent
window.$Qmatic.components.modal.BaseModalComponent.prototype = new window.$Qmatic.components.NavView()
window.$Qmatic.components.modal.BaseModalComponent.prototype.constructor = window.$Qmatic.components.modal