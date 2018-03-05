window.$Qmatic.components.card.WalkInCardComponent = function (selector) {
    this.activeView = null;

    // @Override
    this.onInit = function (selector) {
        if(selector) {
            window.$Qmatic.components.card.WalkInCardComponent.prototype.onInit.call(this, selector);
            this.hide();
        }
    }

    this.show = function () {
        window.$Qmatic.components.card.WalkInCardComponent.prototype.show.call(this);
        this.clearSearchInput();
    }

    this.clearSearchInput = function () {
        this.get$Elem().find('input').val("");
        var dataTable = servicePoint.getWalkdirectDT();
        if (dataTable) {
            servicePoint.getWalkdirectDT().fnFilter("");
        }
    }

    this.onInit.apply(this, arguments);
}

window.$Qmatic.components.card.WalkInCardComponent.prototype = new window.$Qmatic.components.card.CardBaseComponent()
window.$Qmatic.components.card.WalkInCardComponent.prototype.constructor = window.$Qmatic.components.card.CustomerCardComponent;

