window.$Qmatic.components.NavView = function () {
    this.$selector;
    this.$elem;

    this.hide = function(){
        this.getElem().hide()
    }

    this.show = function(){
        this.getElem().show()
    }
}

window.$Qmatic.components.NavView.prototype = new window.$Qmatic.components.BaseComponent();