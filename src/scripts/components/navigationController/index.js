// Generic Class (Needs to be instantiated)
window.$Qmatic.components.NavController = function (navSelector) {
    this.navigationStack = [];

    this.push = function (modalComponent) {
        if (!(modalComponent instanceof window.$Qmatic.components.NavView))
            throw new Error("You are trying to stack a component that does not comform to the NavView protocol")
        this.hideTopModalComponent()
        $(this.getSelector()).show()
        this.navigationStack.push(modalComponent)
        // Modal components are hidden by default when initialized, so nav controller needs to show it now!
        modalComponent.show()
    }
    
    this.pop =  function() {
        this.navigationStack.pop().hide()
        this.showTopModalComponent()
        if (this.navigationStack.length == 0)
            this.onDestroy()
    }

    this.popModal = function(modalComponent) {
        var context = this;
        this.navigationStack.forEach(function(modal, index){
            if (modal === modalComponent) {
                context.navigationStack[index].hide()
                context.navigationStack.splice(index, 1);
            }
        })
        if (this.navigationStack.length == 0)
            this.onDestroy()
    }

    this.hideTopModalComponent = function (){
        if (this.navigationStack[this.navigationStack.length - 1])
            this.navigationStack[this.navigationStack.length - 1].hide()
    }

    this.showTopModalComponent = function (){
        if (this.navigationStack[this.navigationStack.length - 1])
            this.navigationStack[this.navigationStack.length - 1].show()
    }

    this.viewCount = function() {
        return this.navigationStack.length
    }

    this.peekData = function () {
        return this.navigationStack
    }

    this.onInit.apply(this, arguments);

    // @Override
    this.onInit = function (selector){
        this.__proto__.onInit(selector)
        this.hide()
    }
};

window.$Qmatic.components.NavController.prototype = new window.$Qmatic.components.BaseComponent()
