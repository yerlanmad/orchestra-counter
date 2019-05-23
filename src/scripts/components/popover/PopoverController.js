
window.$Qmatic.components.popover = window.$Qmatic.components.popover || {}

// PopoverController
window.$Qmatic.components.popover.PopoverController = function() {
    this.instances = [];
}

window.$Qmatic.components.popover.PopoverController.prototype.constructor
    = window.$Qmatic.components.popover.PopoverController

window.$Qmatic.components.popover.PopoverController.prototype = {
    pushPopover: function (popover) {
        this.disposeAllInstances();
        this.instances.push(popover);
        popover._attachOverlayEvent();
    },
    disposeAllInstances: function () {
        if(this.instances.length > 0) {
            _.each(this.instances, function(p) {
                p._removeOverlayEvent();
                p.disposeInstance();
            });
            this.instances = [];
        }
    }
};
