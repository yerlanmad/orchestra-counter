// Dropdown Component

window.$Qmatic.components.dropdown = (function(){

    var defaultConfigurations = {
        data: [],       // Data component will hold
        selector: ''    // Selector id on the DOM
    }

    // Customization parameters, ...
    return function (config) {
        // If no configuratiion object passe, then use component defaults
        defaultConfigurations = !!config ? config : defaultConfigurations;

        

    }  
})();