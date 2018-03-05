// Customer list card Component
window.$Qmatic.components.card.CustomerListCardComponent = function (selector) {

    // @Override
    this.onInit = function (selector) {
        if(selector) {
            window.$Qmatic.components.card.CardBaseComponent.prototype.onInit.call(this, selector);
            this.hide();
        }
    }

    this.show = function () {
        window.$Qmatic.components.card.CustomerListCardComponent.prototype.show.call(this);
        customer.populateAdditionalCustomersList();
    }

    // @Override
    this.cleanUp = function () {
        window.$Qmatic.components.card.CardBaseComponent.prototype.cleanUp.call(this);
    }

    this.onInit.apply(this, arguments);
}

window.$Qmatic.components.card.CustomerListCardComponent.prototype = new window.$Qmatic.components.card.CardBaseComponent()
window.$Qmatic.components.card.CustomerListCardComponent.prototype.constructor = window.$Qmatic.components.card.CustomerListCardComponent;

