window.$Qmatic.components = {}

// Base Class for every component
window.$Qmatic.components.BaseComponent = function () {
    this.$selector;
}

window.$Qmatic.components.BaseComponent.prototype = {
    onInit: function(selector) {
        this.$selector = selector;
        window.$Qmatic.utils.log.info("Component "+ this.getSelector() + " is being initialized!!")
    },
    onDestroy: function(){
        window.$Qmatic.utils.log.warn("Component " + this.getSelector()+ " is being destroyed!!")
        this.hide()
    },
    getSelector: function(){
        return this.$selector
    },
    hide: function(){
        $(this.getSelector()).hide()
    },
    show: function(){
        $(this.getSelector()).show()
    }
}