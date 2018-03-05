window.$Qmatic.components.card.MarksCardComponent = function (selector) {

    // @Override
    this.onInit = function (selector) {
        if(selector) {
            window.$Qmatic.components.card.MarksCardComponent.prototype.onInit.call(this, selector);
            this.hide();
        }
    }

    this.show = function () {
        window.$Qmatic.components.card.MarksCardComponent.prototype.show.call(this);
        $Qmatic.components.dropdown.multiMarkSelection.resetSelected();
    }

    this.onInit.apply(this, arguments);
}

window.$Qmatic.components.card.MarksCardComponent.prototype = new window.$Qmatic.components.card.CardBaseComponent()
window.$Qmatic.components.card.MarksCardComponent.prototype.constructor = window.$Qmatic.components.card.MarksCardComponent;

