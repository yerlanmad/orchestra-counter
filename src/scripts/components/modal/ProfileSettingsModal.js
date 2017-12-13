// Base Modal Class
window.$Qmatic.components.modal.ProfileSettingsModal = function (selector) {

    // @Override
    this.onInit = function (selector){
        window.$Qmatic.components.modal.BaseModalComponent.prototype.onInit.call(this, selector);
        this.hide()
    }  

    this.cleanUp = function(){
        window.$Qmatic.components.modal.BaseModalComponent.prototype.cleanUp.call(this, selector);
        $Qmatic.components.dropdown.branchSelection.clearError()
        $Qmatic.components.dropdown.counterSelection.clearError()
        $Qmatic.components.dropdown.profileSelection.clearError()
    } 

    this.onError = function(message) {
        $(this.getSelector())
    }

    this.clearError = function () {
        $(this.getSelector())
    }

    this.onInit.apply(this, arguments);
}

//  Base Modal Class Inherits from BaseComponent
window.$Qmatic.components.modal.ProfileSettingsModal.prototype = new window.$Qmatic.components.modal.BaseModalComponent()
window.$Qmatic.components.modal.ProfileSettingsModal.prototype.constructor = window.$Qmatic.components.modal.ProfileSettingsModal