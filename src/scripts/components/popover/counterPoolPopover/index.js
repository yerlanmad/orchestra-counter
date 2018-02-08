
// CounterPool
window.$Qmatic.components.popover.CounterPoolPopoverComponent = function(options) {
    window.$Qmatic.components.popover.PoolPopoverComponent.call(this, options);
}

window.$Qmatic.components.popover.CounterPoolPopoverComponent.prototype 
    = Object.create(window.$Qmatic.components.popover.PoolPopoverComponent.prototype);

// correct the constructor pointer
window.$Qmatic.components.popover.CounterPoolPopoverComponent.prototype.constructor 
    = window.$Qmatic.components.popover.CounterPoolPopoverComponent;

window.$Qmatic.components.popover.CounterPoolPopoverComponent.prototype._call = function () {
    this.disposeInstance();
    servicePointPool.callFromPool(this.visitId);
};

