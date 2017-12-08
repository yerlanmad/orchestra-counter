window.$Qmatic.components = {}

// Base Class for every component
window.$Qmatic.components.BaseComponent = function () {
    this.$selector;
    this.$elem;
}

window.$Qmatic.components.BaseComponent.prototype = {
    onInit: function(selector) {
        this.$selector = selector;
        this.$elem = $(selector);
        window.$Qmatic.utils.log.info("Component "+ this.getSelector() + " is being initialized!!")
    },
    onDestroy: function(){
        window.$Qmatic.utils.log.warn("Component " + this.getSelector()+ " is being destroyed!!")
        $(this.getSelector()).hide()
    },
    getSelector: function(){
        return this.$selector
    },
    getElem: function() {
        return this.$elem 
    }
}