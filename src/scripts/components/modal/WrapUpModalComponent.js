window.$Qmatic.components.modal.WrapUpModalComponent = function (selector) {

    var counterInterval;

    // @Override
    this.onInit = function (selector) {
        if (selector) {
            window.$Qmatic.components.modal.WrapUpModalComponent.prototype.onInit.call(this, selector);
            this.hide()
        }
    }

    this.show = function () {
        window.$Qmatic.components.modal.WrapUpModalComponent.prototype.show.call(this);
        var visitCounter = sessvars.state.visit.parameterMap && sessvars.state.visit.parameterMap.wrapUpTime;
        var counter = visitCounter != undefined ? Math.floor(Date.now() / 1000) - parseInt(visitCounter) : 0;
        counterInterval = setInterval(function () {
            counter++;
            $("#wrapUpTimerTime").text(util.formatIntoHHMMSS(counter));
        }, 1000);
    }

    this.hide = function () {
        window.$Qmatic.components.modal.WrapUpModalComponent.prototype.hide.call(this);
        if (counterInterval) {
            $("#wrapUpTimerTime").text("00:00:00");
            clearInterval(counterInterval);
        }
    }

    this.onInit.apply(this, arguments);
}

//  Base Modal Class Inherits from BaseComponent
window.$Qmatic.components.modal.WrapUpModalComponent.prototype = new window.$Qmatic.components.modal.BaseModalComponent()
window.$Qmatic.components.modal.WrapUpModalComponent.prototype.constructor = window.$Qmatic.components.modal.WrapUpModalComponent