// Dropdown Component
window.$Qmatic.components.dropdown = {}

window.$Qmatic.components.dropdown.BaseDropdown = function (selector, config) {
    
    // @Override
    this.onInit = function (selector, config){
        this.__proto__.onInit(selector)
        if (config){
            $(this.getSelector()).chosen(config)
        }
        this.clearError()
    }

    this.onError = function(msg){
        console.log(msg)
        console.log(this.getElem())
        $(this.getSelector()).next().addClass("drop-has-error");
        $(this.getSelector()).parent().next().removeClass("invisible-on-load");
        $(this.getSelector()).parent().next().text(msg);
    }

    this.clearError = function(){
        $(this.getSelector()).next().removeClass("drop-has-error");
        $(this.getSelector()).parent().next().addClass("invisible-on-load");
        $(this.getSelector()).parent().next().text("");
    }

    this.onInit.apply(this, arguments);
}

window.$Qmatic.components.dropdown.BaseDropdown.prototype = new window.$Qmatic.components.BaseComponent();
