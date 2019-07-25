window.$Qmatic.components.modal.GenericConfirmModal = function (selector, config) {

    // @Override
    this.onInit = function (selector, config) {
        if (selector) {
            window.$Qmatic.components.modal.GenericConfirmModal.prototype.onInit.call(this, selector);
            if (!this.isValidConfig(config))
            throw new Error("Please check your configuration. You need a valid message and yesCallback");
            this.reset();
            this.hide();
            this.bindYesText(config.yesText);
            this.bindNoText(config.noText);
            this.bindNoCallback(config.noCallback || function () {
                modalNavigationController.pop()
            });
            this.bindYesCallback(config.yesCallback);
            this.bindMessage(config.message);
        }
    }

    this.reset = function () {
        $(this.getSelector()).find("#genericConfirmYes").unbind('click');
        $(this.getSelector()).find("#genericConfirmNo").unbind('click');
    }

    this.bindMessage = function (text) {
        var self = this;
        setTimeout(function() {
            $(self.getSelector()).find("#genericConfirmPrompt").empty().text(text);
        });
    }

    this.bindYesText = function (yesText) {
        $(this.getSelector()).find("#genericConfirmYes").empty().text(yesText || jQuery.i18n.prop('general.btn.yes'));
    }

    this.bindNoText = function (noText) {
        $(this.getSelector()).find("#genericConfirmNo").empty().text(noText || jQuery.i18n.prop('general.btn.no'));
    }

    this.bindYesCallback = function (func) {
        $(this.getSelector()).find("#genericConfirmYes").on('click', func);
    }

    this.bindNoCallback = function (func) {
        $(this.getSelector()).find("#genericConfirmNo").on('click', func);
    }

    this.isValidConfig = function (config) {
        if (config["message"] != undefined && config["yesCallback"] != undefined) {
            return true;
        } else {
            return false;
        }
    }

    this.hide = function () {
        window.$Qmatic.components.modal.GenericConfirmModal.prototype.hide.call(this);
        $(this.getSelector()).find("#genericConfirmYes").unbind();
        $(this.getSelector()).find("#genericConfirmNo").unbind();
        
    }

    this.onInit.apply(this, arguments);
}

//  Base Modal Class Inherits from BaseComponent
window.$Qmatic.components.modal.GenericConfirmModal.prototype = new window.$Qmatic.components.modal.BaseModalComponent()
window.$Qmatic.components.modal.GenericConfirmModal.prototype.constructor = window.$Qmatic.components.modal.GenericConfirmModal