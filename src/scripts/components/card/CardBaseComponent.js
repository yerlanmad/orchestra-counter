// Card base Component
window.$Qmatic.components.card.CardBaseComponent = function (selector) {

    // @Override
    this.onInit = function (selector) {
        if(selector == "#inactiveCard"){
            util.hideGotoCardLink();
        }
        if (selector) {
            window.$Qmatic.components.card.CardBaseComponent.prototype.onInit.call(this, selector);
            this.hide();
        }
    }

    this.show = function () {
        window.$Qmatic.components.card.CardBaseComponent.prototype.show.call(this);
        if(selector == "#inactiveCard"){
            // var inactiveCardTitleText = $('#inactiveCardTitle').text();
            // $('#inactiveCardTitle').text(' ');
            // setTimeout(function () {
            //     $('#inactiveCardTitle').text(inactiveCardTitleText);
			// },100);
			// var inactiveCardSubTitleText = $('#inactiveCardSubTitle').text();
            // $('#inactiveCardSubTitle').text(' ');
            // setTimeout(function () {
            //     $('#inactiveCardSubTitle').text(inactiveCardSubTitleText);
			// },100);
		
            
    }
        
        if (window.jQuery) {
            $(".qm-card__content-section").scrollTop(0);
        }
    }

    this.onInit.apply(this, arguments);
}

window.$Qmatic.components.card.CardBaseComponent.prototype = new window.$Qmatic.components.NavView()
window.$Qmatic.components.card.CardBaseComponent.prototype.constructor = window.$Qmatic.components.card.CardBaseComponent
