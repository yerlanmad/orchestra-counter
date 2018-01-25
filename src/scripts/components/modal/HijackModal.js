window.$Qmatic.components.modal.HijackModal = function (selector) {

    // @Override
    this.onInit = function (selector) {
        if (selector) {
            window.$Qmatic.components.modal.HijackModal.prototype.onInit.call(this, selector);
            this.hide()
        }
    }

    this.cleanUp = function () {
        window.$Qmatic.components.modal.HijackModal.prototype.cleanUp.call(this, selector);
        $(this.getSelector() + " #hijackUser").text("")
    }

    this.updateLoggedInUser = function (name) {
        $(this.getSelector() + " #hijackUser").text(name)
    }

    this.onInit.apply(this, arguments);
}

//  Base Modal Class Inherits from BaseComponent
window.$Qmatic.components.modal.HijackModal.prototype = new window.$Qmatic.components.modal.BaseModalComponent()
window.$Qmatic.components.modal.HijackModal.prototype.constructor = window.$Qmatic.components.modal.HijackModal