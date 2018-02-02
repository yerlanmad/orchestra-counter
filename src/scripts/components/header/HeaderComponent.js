// Generic Class (Needs to be instantiated)
window.$Qmatic.components.HeaderController = function (navSelector) {

    // @Override
    this.onInit = function (selector) {
        if (selector) {
            window.$Qmatic.components.BaseComponent.prototype.onInit.call(this, selector);
            this.get$Elem().find('.qm-header__middle').hide();
        }
    }

    this.setInformation = function (branch, workstation, profile) {
        this.get$Elem().find('#branch').text(branch !== undefined ? branch : '');
        this.get$Elem().find('#workstation').text(workstation !== undefined ? workstation : '');
        this.get$Elem().find('#profile').text(profile !== undefined ? profile : '');
        if(branch === undefined && workstation === undefined && profile === undefined) {
            this.get$Elem().find('.qm-header__middle').hide();
        } else {
            this.get$Elem().find('.qm-header__middle').css('display', '');
        }
    }

    this.onInit.apply(this, arguments);
};

window.$Qmatic.components.HeaderController.prototype = new window.$Qmatic.components.BaseComponent()
window.$Qmatic.components.HeaderController.prototype.constructor = window.$Qmatic.components.HeaderController
