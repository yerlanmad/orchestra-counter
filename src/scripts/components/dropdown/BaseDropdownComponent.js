// Dropdown Component
window.$Qmatic.components.dropdown.BaseDropdownComponent = function (selector, chosenConfig) {

    // DefaultConfiguration
    this.chosenConfig = {
        disable_search_threshold: 5,
        single_disable: true
    }

    // @Override
    this.onInit = function (selector, choosenConfig) {
        window.$Qmatic.components.dropdown.BaseDropdownComponent.prototype.onInit.call(this, selector);
        this.activate(choosenConfig)
        this.clearError()
    }

    this.onError = function (msg) {
        $(this.getSelector()).next().addClass("drop-has-error");
        $(this.getSelector()).parent().next().removeClass("invisible-on-load");
        $(this.getSelector()).parent().next().text(msg);
    }

    this.clearError = function () {
        $(this.getSelector()).next().removeClass("drop-has-error");
        $(this.getSelector()).parent().next().addClass("invisible-on-load");
        $(this.getSelector()).parent().next().text("");
    }

    this.activate = function (config) {

        this.chosenConfig = config ? $.extend( this.chosenConfig , config ) : this.chosenConfig        
        $(this.getSelector()).chosen(this.chosenConfig)

        if (this.chosenConfig.single_disable && $(this.getSelector()).children().length == 1){
            $(this.getSelector()).prop('disabled', true).trigger("chosen:updated");
        } else {
            $(this.getSelector()).prop('disabled', false).trigger("chosen:updated");
        }
    }

    this.update = function(config){
        $.extend(this.chosenConfig, config)
    }

    this.onSingleItem = function () {
        $(this.getSelector()).next().addClass("single-item")
    }

    this.onRemoveSingleItem = function () {
        $(this.getSelector()).next().removeClass("single-item")
    }

    this.onInit.apply(this, arguments);
}

window.$Qmatic.components.dropdown.BaseDropdownComponent.prototype = new window.$Qmatic.components.BaseComponent()
window.$Qmatic.components.dropdown.BaseDropdownComponent.prototype.constructor = window.$Qmatic.components.dropdown.BaseDropdownComponent
