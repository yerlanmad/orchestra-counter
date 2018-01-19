window.$Qmatic.components.modal.GenericConfirmModal = function (selector, config) {

    // @Override
    this.onInit = function (selector, config) {
        if (selector) {
            window.$Qmatic.components.modal.GenericConfirmModal.prototype.onInit.call(this, selector);
            if (!this.isValidConfig(config))
            throw new Error("Please check your configuration. You need a valid message and yesCallback");
            
            this.hide();
            this.bindNoCallback(config.noCallback || function () {
                modalNavigationController.pop()
            });
            this.bindYesCallback(config.yesCallback);
            this.bindMessage(config.message);
        }
    }

    this.bindMessage = function (text) {
        $(this.getSelector()).find("#genericConfirmPrompt").empty().text(text);
    }

    this.bindYesCallback = function (func) {
        $(this.getSelector()).find("#deleteVisitYes").on('click', func);
    }

    this.bindNoCallback = function (func) {
        $(this.getSelector()).find("#deleteVisitNo").on('click', func);
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
        $(this.getSelector()).find("#deleteVisitYes").unbind();
        $(this.getSelector()).find("#deleteVisitNo").unbind();
        
    }

    this.onInit.apply(this, arguments);
}

//  Base Modal Class Inherits from BaseComponent
window.$Qmatic.components.modal.GenericConfirmModal.prototype = new window.$Qmatic.components.modal.BaseModalComponent()
window.$Qmatic.components.modal.GenericConfirmModal.prototype.constructor = window.$Qmatic.components.modal.GenericConfirmModal