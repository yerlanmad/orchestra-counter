// Dropdown Component
window.$Qmatic.components.card.CardBaseComponent = function (selector) {

    // @Override
    this.onInit = function (selector) {
        if(selector) {
            window.$Qmatic.components.BaseComponent.prototype.onInit.call(this, selector);
            this.hide()
        }
    }

    this.onInit.apply(this, arguments);
}

window.$Qmatic.components.card.CardBaseComponent.prototype = new window.$Qmatic.components.NavView()
window.$Qmatic.components.card.CardBaseComponent.prototype.constructor = window.$Qmatic.components.card.CardBaseComponent
