// Modal Component
window.$Qmatic.components.modal = {}

// Base Modal Class
window.$Qmatic.components.modal.BaseModalComponent = function (selector) {

    this.onInit.apply(this, arguments);

    // @Override
    this.onInit = function (selector){
        this.__proto__.__proto__.onInit(selector)
        this.hide()
    }   
}

//  Base Modal Class Inherits from BaseComponent
window.$Qmatic.components.modal.BaseModalComponent.prototype = new window.$Qmatic.components.NavView()