

// Base Context Marketing Class
window.$Qmatic.components.popover.ContextMarketingPopoverController = function (options) {
    if(typeof options === 'undefined') {
        options = {};
    }
    this.instances = {};
    
}

//  Base Context marketing Class Methods
window.$Qmatic.components.popover.ContextMarketingPopoverController.prototype = {
    init: function (key, referenceElement, config) {
        this._create(key, referenceElement, config);
        referenceElement.off('click');
        referenceElement.on('click', this.toggle.bind(this, key));
    },
    _create: function (key, refElement, config) {
        if(!_.isEmpty(config.placement) && config.placement === "right" && this.isRTL) {
            config.placement = "left";
        }
        
        this.isRTL     = document.getElementsByTagName("html")[0].getAttribute("dir") 
                        && document.getElementsByTagName("html")[0].getAttribute("dir")
                                                .indexOf('rtl') > -1 ? true : false;

        var instance = new Tooltip(refElement, {
            container: document.body,
            trigger: 'manual',
            boundariesElement: 'viewport',
            title: ' ',
            placement: this.isRTL ? 'left-start' : 'right-start',
            template: config.template,
            offset: '0, 10'
        });

        this._add(key, instance);
        this.open(key);
        this._attachTemplateEvents(key);
        this._setText(key, config.text);
    },
    _attachTemplateEvents: function (key) {
        if(this._hasInstance(key)) {
            var closeBtn = this.instances[key]._tooltipNode.querySelector('.js-popover-close');
            closeBtn.addEventListener('click', this.close.bind(this, key));
        }
    },
    _getInstance: function (key) {
        if(this._hasInstance(key)) {
            return this.instances[key];
        } else {
            return null;
        }
    },
    _setText: function (key, text) {
        if(this._hasInstance(key)) {
            if(this.instances[key]._tooltipNode !== undefined) {
                this.instances[key]._tooltipNode
                        .querySelector('.qm-popover-context-marketing__text')
                            .innerText = text;
            }
        }
    },
    _add: function(key, instance) {
        this.dispose(key);
        this.instances[key] = instance;
    },
    _hasInstance: function (key) {
        if(this.instances.hasOwnProperty(key)) {
            return true;
        } else {
            return false;
        }
    },
    open: function (key) {
        if(this._hasInstance(key)) {
            this.instances[key].show();
        }
    },
    close: function (key) {
        if(this._hasInstance(key)) {
            this.instances[key].hide();
        }
    },
    toggle: function (key) {
        if(this._hasInstance(key)) {
            this.instances[key].toggle();
        }
    },
    dispose: function (key) {
        if(this._hasInstance(key)) {
            this.instances[key].dispose();
            delete this.instances[key];
        }
    }
};
