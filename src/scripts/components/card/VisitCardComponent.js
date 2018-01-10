// Dropdown Component
window.$Qmatic.components.card.VisitCardComponent = function (selector) {

    // @Override
    this.onInit = function (selector) {
        if(selector) {
            window.$Qmatic.components.card.CardBaseComponent.prototype.onInit.call(this, selector);
            this.hide()
        }
    }

    // @Override
    this.cleanUp = function () {
        window.$Qmatic.components.card.CardBaseComponent.prototype.cleanUp.call(this, selector);
        window.$Qmatic.utils.log.info("Cleaning up compnent " + this.getSelector())
        contextMarketingController.close("contextmarketing");
    }

    this.onInit.apply(this, arguments);
}

window.$Qmatic.components.card.VisitCardComponent.prototype = new window.$Qmatic.components.card.CardBaseComponent()
window.$Qmatic.components.card.VisitCardComponent.prototype.constructor = window.$Qmatic.components.card.VisitCardComponent;

