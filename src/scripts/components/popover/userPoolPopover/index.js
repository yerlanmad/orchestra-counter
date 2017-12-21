
// UserPool
window.$Qmatic.components.popover.UserPoolPopoverComponent = function(options) {
    window.$Qmatic.components.popover.PoolPopoverComponent.call(this, options);
}

window.$Qmatic.components.popover.UserPoolPopoverComponent.prototype 
    = Object.create(window.$Qmatic.components.popover.PoolPopoverComponent.prototype);

// correct the constructor pointer
window.$Qmatic.components.popover.UserPoolPopoverComponent.prototype.constructor 
    = window.$Qmatic.components.popover.UserPoolPopoverComponent;

window.$Qmatic.components.popover.UserPoolPopoverComponent.prototype._call = function () {
    this.disposeInstance();
    userPool.callFromPool(this.visitId);
};
