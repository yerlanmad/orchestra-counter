// Customer card Component
window.$Qmatic.components.card.CustomerCardComponent = function (selector) {

    // @Override
    this.onInit = function (selector) {
        if(selector) {
            window.$Qmatic.components.card.CardBaseComponent.prototype.onInit.call(this, selector);
            this.hide();
        }
    }

    this.clearSearchInput = function () {
        this.get$Elem().find('.js-customer-search-view input').val("");
        this.get$Elem().find('.js-customer-search-view input').trigger('click');
        this.get$Elem().find('.js-search-input__icon').show();
        this.get$Elem().find('.qm-form-field--search .js-clear-field').hide();
    }

    this.clearAddForm = function () {
        this.get$Elem().find('.js-add-new-customer-form input').val("");
    }

    this.clearEditForm = function () {
        this.get$Elem().find('.js-edit-customer-form input').val("");
    }

    this.showEditForm = function () {
        this.get$Elem().find('.js-edit-customer-form').removeClass('qm-hide');
        this.get$Elem().find('.js-add-new-customer-form').addClass('qm-hide');
    }

    this.showAddForm = function () {
        this.get$Elem().find('.js-add-new-customer-form').removeClass('qm-hide');
        this.get$Elem().find('.js-edit-customer-form').addClass('qm-hide');
    }

    this.enableEditSave = function () {
        this.get$Elem().find('.js-edit-customer-save').prop('disabled', false);
    }

    this.disableEditSave = function () {
        this.get$Elem().find('.js-edit-customer-save').prop('disabled', true);
    }

    // @Override
    this.cleanUp = function () {
        window.$Qmatic.components.card.CardBaseComponent.prototype.cleanUp.call(this, selector);
        this.clearSearchInput();
        this.clearAddForm();
        this.clearEditForm();
    }

    this.onInit.apply(this, arguments);
}

window.$Qmatic.components.card.CustomerCardComponent.prototype = new window.$Qmatic.components.card.CardBaseComponent()
window.$Qmatic.components.card.CustomerCardComponent.prototype.constructor = window.$Qmatic.components.card.CustomerCardComponent;

