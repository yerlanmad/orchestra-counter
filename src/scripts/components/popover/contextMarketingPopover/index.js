

// Base Context Marketing Class
window.$Qmatic.components.popover.ContextMarketingPopoverController = function (options) {
    if(typeof options === 'undefined') {
        options = {};
    }
    this.instances = {};
    this.isRTL     = document.getElementsByTagName("html")[0].getAttribute("dir") 
                        && document.getElementsByTagName("html")[0].getAttribute("dir")
                                                .indexOf('rtl') > -1 ? true : false;
}

//  Base Context marketing Class Methods
window.$Qmatic.components.popover.ContextMarketingPopoverController.prototype = {
    init: function (key, referenceElement, config) {
        this._create(key, referenceElement, config);
        referenceElement.off('click');
        referenceElement.on('click', this.toggle.bind(this, key));
    },
    _create: function (key, refElement, config) {
        var instance = new Tooltip(refElement, {
            container: document.body,
            trigger: 'manual',
            boundariesElement: 'viewport',
            title: ' ',
            placement: config.placement ? config.placement : 'top',
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
            console.log('this instance: ', this.instances[key]);
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
            console.log('toggled');
        }
    },
    dispose: function (key) {
        if(this._hasInstance(key)) {
            this.instances[key].dispose();
            delete this.instances[key];
        }
    }
};




//     init: function () {
//         this._attachOverlayEvent();
//         this._attachTargetEventListeners();
//     },
//     _attachTargetEventListeners: function () {
//         this.target.addEventListener('click', this._toggleAndAttachPopoverTemplateEvents.bind(this));
//     },
//     _toggleAndAttachPopoverTemplateEvents: function (e) {
//         if(this.instance && this.instance._isOpen) {
//             this._toggleInstance();
//         } else {
            
    

//             var shouldAttachTemplateEvents = this.instance._tooltipNode ? false : true; 
            
//             this._toggleInstance();
//             this._navigateTo(this.views.ACTION_BAR);
    
//             if(shouldAttachTemplateEvents) {
//                 this._attachTemplateEvents();
//             }
//         }
//     },
//     _attachOverlayEvent: function () {
//         this.popoverOverlay.addEventListener('click', this.disposeInstance.bind(this));
//     },
//     _attachTemplateEvents: function () {
        
//             callBtn     = this.instance._tooltipNode.querySelector('.js-popover-call'),
//             backBtns    = this.instance._tooltipNode.querySelectorAll('.js-popover-back');

//         for(var i = 0; i < closeBtns.length; i ++) {
//             closeBtns[i].addEventListener('click', this._toggleInstance.bind(this));
//         }

//         for(var j = 0; j < backBtns.length; j ++) {
//             backBtns[j].addEventListener('click', this._navigateBack.bind(this));
//         }
//         if(this.disableCall) {
//             callBtn.disabled = true;
//         } else {
//             callBtn.addEventListener('click', this._call.bind(this));
//         }
//     },
//     disposeInstance: function () {
//         this.navigationStack = [];
//         this.instance && this.instance.dispose();
//         this.popoverOverlay.style.display = "none";
//     }
// });
