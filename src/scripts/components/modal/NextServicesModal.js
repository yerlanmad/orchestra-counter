window.$Qmatic.components.modal.NextServicesModal = function (selector) {

    // @Override
    this.onInit = function (selector) {
        if (selector) {
            window.$Qmatic.components.modal.NextServicesModal.prototype.onInit.call(this, selector);
            this.hide()
        }
    }

    this.updateList = function (nextServices) {
        $(this.getSelector() + " #nextServicesList").empty()
        nextServices.forEach(function(element) {
            $(this.getSelector() + " #nextServicesList").append(
                "<div class='nextServicesList-row'>" + 
                element.serviceInternalName + 
                "</div>"

                )
        }, this);
        
    }

    this.onInit.apply(this, arguments);
}

//  Base Modal Class Inherits from BaseComponent
window.$Qmatic.components.modal.NextServicesModal.prototype = new window.$Qmatic.components.modal.BaseModalComponent()
window.$Qmatic.components.modal.NextServicesModal.prototype.constructor = window.$Qmatic.components.modal.NextServicesModal