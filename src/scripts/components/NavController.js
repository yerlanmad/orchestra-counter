// Generic Class (Needs to be instantiated)
window.$Qmatic.components.NavController = function (navSelector) {
    this.navigationStack = [];

    this.push = function (modalComponent) {
        if (!(modalComponent instanceof window.$Qmatic.components.NavView))
            throw new Error("You are trying to stack a component that does not comform to the NavView protocol (" + typeof modalComponent + ")")

        // Don't stack components that are already on the top
        if (this.navigationStack[this.navigationStack.length - 1] !== modalComponent) {

            if (this.isComponentInStack(modalComponent)) {
                // If component exist inside the stack then empty stack to reset 0th index to pushing component
                // Note: Added to avoid any memory leaks, incase the view is not popped before pushing again.
                this.popAllModals();
            }
            
            this.hideTopModalComponent()
            if (this.navigationStack.length == 0)
                this.show()
            
            this.navigationStack.push(modalComponent)
            // Modal components are hidden by default when initialized, so nav controller needs to show it now!
           
        //    setTimeout(function() {
            modalComponent.show();
        //    }, 1); 
       
        }
        setTimeout(function() {
            $('.qm-modal__layout .qm-modal-focus-init:visible').focus();
        }, 1000);   
    }

    this.pop = function () {
        this.navigationStack.pop().hide()
        this.showTopModalComponent()
        if (this.navigationStack.length == 0)
            this.hide()
    }

    this.popModal = function (modalComponent) {
        var context = this;
        this.navigationStack.forEach(function (modal, index) {
            if (modal === modalComponent) {
                context.navigationStack[index].hide()
                context.navigationStack.splice(index, 1);
            }
        })
        this.showTopModalComponent()
        if (this.navigationStack.length == 0)
            this.hide()
    }

    this.popAllModals = function () {
        var count = this.navigationStack.length
        for (var i = 0; i < count; i++) {
            this.navigationStack.pop().hide()
        }
        this.hide()
    }

    this.hideTopModalComponent = function () {
        if (this.navigationStack[this.navigationStack.length - 1])
            this.navigationStack[this.navigationStack.length - 1].hide()
    }

    this.showTopModalComponent = function () {
        if (this.navigationStack[this.navigationStack.length - 1])
            this.navigationStack[this.navigationStack.length - 1].show()
    }

    this.viewCount = function () {
        return this.navigationStack.length
    }

    this.peekData = function () {
        return this.navigationStack.slice(0)
    }

    // @Override
    this.onInit = function (selector) {
        if (selector) {
            window.$Qmatic.components.BaseComponent.prototype.onInit.call(this, selector);
            this.hide()
        }
    }

    this.isComponentInStack = function (component) {
        return window.$Qmatic.utils.containsObject(component, this.navigationStack);
    }

    this.isTopComponent = function (component) {
        return this.navigationStack[this.navigationStack.length - 1] === component;
    }

    this.onInit.apply(this, arguments);
};

window.$Qmatic.components.NavController.prototype = new window.$Qmatic.components.BaseComponent()
window.$Qmatic.components.NavController.prototype.constructor = window.$Qmatic.components.NavController
