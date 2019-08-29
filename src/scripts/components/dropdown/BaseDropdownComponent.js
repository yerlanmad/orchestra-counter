// Dropdown Component
window.$Qmatic.components.dropdown.BaseDropdownComponent = function (selector, chosenConfig) {

    // DefaultConfiguration
    this.chosenConfig = {
        disable_search_threshold: 0,
        single_disable: true,
        search_contains: true,
        expand_dropdown_height: null
    }

    // @Override
    this.onInit = function (selector, choosenConfig) {
        if (selector) {
            window.$Qmatic.components.dropdown.BaseDropdownComponent.prototype.onInit.call(this, selector);
            this.activate(choosenConfig)
            this.setChosenSingleFocusable();
            this.clearError();
            this.setupFocusListener();
            this.setupChangeListener();
            this.setupUpdateListener();
            this.setupCloseListener();
            if (this.chosenConfig.expand_dropdown_height) {
                this.setupOpenListener();
                this.setupWindowResizeListener();
            }
        }
    }

    this.setupCloseListener = function () {
        this.onClose = (function (evt) {
           $ (evt.target).parent().focus();
        }).bind(this);

        this.get$Elem().on("chosen:hiding_dropdown", this.onClose);
    }

    // =======================
    // On Window Resize Funcitonality......
    // =======================

    this.setupWindowResizeListener = function () {
        this.onResize = (function (evt) {
            this.get$Elem().trigger("chosen:close");
        }).bind(this);

        $(window).on("resize", this.onResize);
    }

    this.teardownResizeListener = function () {
        $(window).off('resize', this.onResize);
    }

    // =======================
    // On Open Funcitonality......
    // =======================

    this.setupOpenListener = function () {
        this.onOpen = (function () {
            this.chosenConfig.expand_dropdown_height(this.get$Elem());
        }).bind(this);

        this.get$Elem().on("chosen:showing_dropdown", this.onOpen);
    }

    this.teardownOpenListener = function () {
        this.get$Elem().off('chosen:showing_dropdown', this.onOpen);
    }

    // =======================
    // On Update Funcitonality......
    // =======================

    this.setupUpdateListener = function () {
        this.onUpdate = (function (evt, params) {
            if (this.get$Elem().find("option").is(":selected") && this.get$Elem().find(":selected").val() && this.get$Elem().find(":selected").val() != -1) {
                this.selectOption();
            } else {
                this.unSelectOption();
            }
        }).bind(this);

        this.get$Elem().on("chosen:updated", this.onUpdate);
    }

    this.teardownSetupUpdateListener = function () {
        this.get$Elem().off('chosen:updated', this.onUpdate);
    }

    // =======================
    // On Change Funcitonality......
    // =======================

    this.setupChangeListener = function () {
        this.teardownSetupChangeListener();
        this.onChange = (function (evt, params) {
            if (params.selected == -1) {
                this.unSelectOption();
            } else {
                this.selectOption();
            }
        }).bind(this);

        this.get$Elem().on("change", this.onChange);
    }

    this.teardownSetupChangeListener = function () {
        this.get$Elem().off('change', this.onChange);
    }

    // =======================
    // On Focus Funcitonality......
    // =======================

    this.setupFocusListener = function () {
        this.tearDownFocusListener();
        this.onFocus = (function (e) {
            if (e.keyCode == 13) {
                if (document.activeElement == e.target) {
                    this.get$Elem().trigger("chosen:open");
                }
                e.preventDefault();
                e.stopPropagation();
            }
        }).bind(this);

        this.get$Elem().parent().on("keyup", this.onFocus);
    }

    this.tearDownFocusListener = function () {
        this.get$Elem().parent().off('keyup', this.onFocus);
    }

    this.setChosenSingleFocusable = function () {
        this.get$Elem().parent().attr("tabIndex", "0");
        this.get$Elem().parent().addClass("qm-tab");
    }

    this.onError = function (msg) {
        this.clearError();
        var selector =   $(this.getSelector());
        setTimeout(function () {
            selector.next().addClass("drop-has-error");
            selector.parent().next().removeClass("invisible-on-load");
            selector.parent().next().text(msg);
        },100);

    }

    this.clearError = function () {
        $(this.getSelector()).next().removeClass("drop-has-error");
        $(this.getSelector()).parent().next().addClass("invisible-on-load");
        $(this.getSelector()).parent().next().text("");
    }

    this.activate = function (config) {

        this.chosenConfig = config ? $.extend(this.chosenConfig, config) : this.chosenConfig
        $(this.getSelector()).chosen(this.chosenConfig)

        if (this.chosenConfig.single_disable && $(this.getSelector()).children().length == 1) {
            $(this.getSelector()).prop('disabled', true).trigger("chosen:updated");
        } else {
            $(this.getSelector()).prop('disabled', false).trigger("chosen:updated");
        }
    }

    this.update = function (config) {
        $.extend(this.chosenConfig, config)
    }

    this.onSingleItem = function () {
        $(this.getSelector()).next().addClass("single-item")
    }

    this.onRemoveSingleItem = function () {
        $(this.getSelector()).next().removeClass("single-item")
    }

    this.selectOption = function () {
        $(this.getSelector()).parent().addClass("optionSelected");
    }

    this.unSelectOption = function () {
        $(this.getSelector()).parent().removeClass("optionSelected");
    }

    this.onInit.apply(this, arguments);
}

window.$Qmatic.components.dropdown.BaseDropdownComponent.prototype = new window.$Qmatic.components.BaseComponent()
window.$Qmatic.components.dropdown.BaseDropdownComponent.prototype.constructor = window.$Qmatic.components.dropdown.BaseDropdownComponent
