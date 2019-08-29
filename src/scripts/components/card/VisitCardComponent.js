window.$Qmatic.components.card.VisitCardComponent = function (selector) {

    // @Override
    this.onInit = function (selector) {
        util.showGotoCardLink();
        if (selector) {
            window.$Qmatic.components.card.CardBaseComponent.prototype.onInit.call(this, selector);
            this.hide()
        }
    }

    // @Override
    this.onAwake = function () {
        util.showGotoCardLink();
        window.$Qmatic.components.card.CardBaseComponent.prototype.onAwake.call(this, selector);
    }

    // @Override
    this.cleanUp = function () {
        util.hideGotoCardLink();
        window.$Qmatic.components.card.VisitCardComponent.prototype.cleanUp.call(this);
        window.$Qmatic.utils.log.info("Cleaning up compnent " + this.getSelector())
        contextMarketingController.close("contextmarketing");
    }

    this.onInit.apply(this, arguments);
}

window.$Qmatic.components.card.VisitCardComponent.prototype = new window.$Qmatic.components.card.CardBaseComponent()
window.$Qmatic.components.card.VisitCardComponent.prototype.constructor = window.$Qmatic.components.card.VisitCardComponent;

