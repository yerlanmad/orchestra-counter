// Base Modal Class
window.$Qmatic.components.modal.BaseModalComponent = function (selector) {

    // @Override
    this.onInit = function (selector){
        window.$Qmatic.components.NavView.prototype.onInit.call(this, selector);
        this.hide()
    }   

    this.onInit.apply(this, arguments);
}

//  Base Modal Class Inherits from BaseComponent
window.$Qmatic.components.modal.BaseModalComponent.prototype = new window.$Qmatic.components.NavView()
window.$Qmatic.components.modal.BaseModalComponent.prototype.constructor = window.$Qmatic.components.modal