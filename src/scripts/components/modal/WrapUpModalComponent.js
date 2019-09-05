var counterValue =   "00 min 00 seconds";
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
        $("#wrapUpTimerSrOnly").text(translate.msg("info.wrapup.timerText") + ' ' + "00 min 00 seconds");
        window.$Qmatic.components.modal.WrapUpModalComponent.prototype.show.call(this);
        var visitCounter = sessvars.state.visit.parameterMap && sessvars.state.visit.parameterMap.wrapUpTime;
        var counter = visitCounter != undefined ? Math.floor(Date.now() / 1000) - parseInt(visitCounter) : 0;
        var documentFocused = true;
        counterInterval = setInterval(function () {
            counter++;
          
            $("#wrapUpTimerTime").text(util.formatIntoHHMMSS(counter));
            counterValue = util.formatIntoHHMMSS(counter)
            if(!document.hasFocus()) {
                documentFocused = false;
            }
            if(documentFocused == false) {
                if(document.hasFocus()) {
                    documentFocused = true;
                    $("#wrapUpTimerSrOnly").text(translate.msg("info.wrapup.timerText") + ' ' + counterValue);   
                }
            }
            if(counter % 60 == 0) {
                $("#wrapUpTimerSrOnly").text(translate.msg("info.wrapup.timerText") + ' ' + counterValue);
            }
        }, 1000);
    }

    this.hide = function () {
        window.$Qmatic.components.modal.WrapUpModalComponent.prototype.hide.call(this);
        if (counterInterval) {
            $("#wrapUpTimerTime").text("00:00:00");
            $("#wrapUpTimerSrOnly").text(translate.msg("info.wrapup.timerText") + ' ' + "00 min 00 seconds");
            clearInterval(counterInterval);
        }
    }

    this.onInit.apply(this, arguments);
}
$("#wrapUpTimerWhiteBox").click(function() {
    $("#wrapUpTimerSrOnly").text(translate.msg("info.wrapup.timerText") + ' ' + counterValue);   
});
//  Base Modal Class Inherits from BaseComponent
window.$Qmatic.components.modal.WrapUpModalComponent.prototype = new window.$Qmatic.components.modal.BaseModalComponent()
window.$Qmatic.components.modal.WrapUpModalComponent.prototype.constructor = window.$Qmatic.components.modal.WrapUpModalComponent
