// Dropdown Component
window.$Qmatic.components.dropdown = (function(){

    var defaultConfigurations = {
        data: [],       // Data component will hold
        selector: ''    // Selector id on the DOM
    }

    // Customization parameters, ...
    return function (config) {
        // If no configuratiion object passe, then use component defaults
        config = !!config ? config : defaultConfigurations;

        // Dom Eelement
        this.elem = $(config.selector);

        

    }  
})();

