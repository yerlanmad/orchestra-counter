// Base Class for every component
window.$Qmatic.components.BaseComponent = function () {
    this.$selector;
}

window.$Qmatic.components.BaseComponent.prototype = {
    onInit: function(selector) {
        this.$selector = selector;
        window.$Qmatic.utils.log.info("Component "+ this.getSelector() + " is being initialized!!")
    },
    onAwake: function(){
        window.$Qmatic.utils.log.info("Waking up compnent " + this.getSelector())
        $(this.getSelector()).show();
    },
    onDestroy: function(){
        window.$Qmatic.utils.log.warn("Component " + this.getSelector()+ " is being destroyed!!")
        this.cleanUp()
        $(this.getSelector()).hide()
    },
    getSelector: function(){
        return this.$selector
    },
    get$Elem: function (){
        return $(this.$selector)
    },
    hide: function(){
        this.onDestroy()
    },
    show: function(){
        this.onAwake()
    },
    cleanUp: function(){
        window.$Qmatic.utils.log.info("Cleaning up compnent " + this.getSelector())
    }
}