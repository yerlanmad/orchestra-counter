window.$Qmatic.components.card.MessageCardComponent = function (selector) {

    // @Override
    this.onInit = function (selector) {
        if (selector) {
            window.$Qmatic.components.card.MessageCardComponent.prototype.onInit.call(this, selector);
            this.hide()
        }
    }

    this.onMessage = function (message) {
        $("#cardCustomMessage").empty().text(message);
    }

    this.onInit.apply(this, arguments);
}

window.$Qmatic.components.card.MessageCardComponent.prototype = new window.$Qmatic.components.card.CardBaseComponent()
window.$Qmatic.components.card.MessageCardComponent.prototype.constructor = window.$Qmatic.components.card.MessageCardComponent;

