// Dropdown Component
window.$Qmatic.components.dropdown = {}

window.$Qmatic.components.dropdown.BaseDropdownComponent = function (selector, choosenConfig) {

    // @Override
    this.onInit = function (selector, choosenConfig){
        this.__proto__.onInit(selector)
        this.activate(choosenConfig)
        this.clearError()
    }

    this.onError = function(msg){
        $(this.getSelector()).next().addClass("drop-has-error");
        $(this.getSelector()).parent().next().removeClass("invisible-on-load");
        $(this.getSelector()).parent().next().text(msg);
    }

    this.clearError = function(){
        $(this.getSelector()).next().removeClass("drop-has-error");
        $(this.getSelector()).parent().next().addClass("invisible-on-load");
        $(this.getSelector()).parent().next().text("");
    }

    this.activate = function(choosenConfig) {
        if (choosenConfig){
            $(this.getSelector()).chosen(choosenConfig)
        }
    }

    this.onInit.apply(this, arguments);
}

window.$Qmatic.components.dropdown.BaseDropdownComponent.prototype = new window.$Qmatic.components.BaseComponent();
