
// Base Tooltip Class
window.$Qmatic.components.TooltipController = function () {
    this.instances = {};
}

window.$Qmatic.components.TooltipController.prototype = {
    init: function (key, referenceElement, config) {
        var instance = new Tooltip(referenceElement, {
            placement: config.placement ? config.placement : 'top', // or bottom, left, right, and variations
            title: config.text,
            container: document.body,
        });
        this._add(key, instance);
    },
    _add: function (key, instance) {
        this.dispose(key);
        this.instances[key] = instance;
    },
    dispose: function (key) {
        if (this.instances.hasOwnProperty(key)) {
            this.instances[key].dispose();
            delete this.instances[key];
        }
    },
    disposeAll: function () {
        for (var key in this.instances) {
            if (this.instances.hasOwnProperty(key)) {
                this.dispose(key)
            }
        }
    },
    disposeAllPrefixedWith: function(prefix) {
      for (var key in this.instances) {
        if (key.indexOf(prefix) > -1) {
          this.dispose(key);
        }
      }
    }
}