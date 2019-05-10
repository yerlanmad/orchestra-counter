window.$Qmatic = window.$Qmatic || {};
window.$Qmatic.components = window.$Qmatic.components || {};

// Dropdown Component
window.$Qmatic.components.tabs = (function(){

    var tablist, tabs, panels;

    var keys = {
        end: 35,
        home: 36,
        left: 37,
        up: 38,
        right: 39,
        down: 40
    }

    var direction = {
        37: -1,
        38: -1,
        39: 1,
        40: 1
    };

    function addListeners (index) {
        tabs[index].addEventListener('click', clickEventListener);
        tabs[index].addEventListener('keydown', keydownEventListener);
        tabs[index].addEventListener('keyup', keyupEventListener);

        // Build an array with all tabs (<button>s) in it
        tabs[index].index = index;
    };

      // When a tab is clicked, activateTab is fired to activate it
     function clickEventListener (event) {
        var tab = event.target;
        activateTab(tab, false);
    };

    // Handle keyup on tabs
    function keyupEventListener (event) {
        var key = event.keyCode;

        switch (key) {
            case keys.left:
            case keys.right:
                determineOrientation(event);
                break;
        };
    };

    // Handle keydown on tabs
    function keydownEventListener (event) {
        var key = event.keyCode;

        switch (key) {
            case keys.end:
                event.preventDefault();
                // Activate last tab
                activateTab(tabs[tabs.length - 1]);
                break;
            case keys.home:
                event.preventDefault();
                // Activate first tab
                activateTab(tabs[0]);
                break;

            // Up and down are in keydown
            // because we need to prevent page scroll
            case keys.up:
            case keys.down:
                determineOrientation(event);
                break;
        }
    };

    // When a tablists aria-orientation is set to vertical,
    // only up and down arrow should function.
    // In all other cases only left and right arrow function.
    function determineOrientation (event) {
        var key = event.keyCode;
        var vertical = tablist.getAttribute('aria-orientation') == 'vertical';
        var proceed = false;

        if (vertical) {
            if (key === keys.up || key === keys.down) {
                event.preventDefault();
                proceed = true;
            }
        }
        else {
            if (key === keys.left || key === keys.right) {
                proceed = true;
            }
        }

        if (proceed) {
            switchTabOnArrowPress(event);
        }
    };

    // Either focus the next, previous, first, or last tab
    // depening on key pressed
    function switchTabOnArrowPress (event) {
        var pressed = event.keyCode;

        for (var x = 0; x < tabs.length; x++) {
            tabs[x].addEventListener('focus', focusEventHandler);
        }

        if (direction[pressed]) {
            var target = event.target;
            if (target.index !== undefined) {
                if (tabs[target.index + direction[pressed]]) {
                    tabs[target.index + direction[pressed]].focus();
                }
                else if (pressed === keys.left || pressed === keys.up) {
                    focusLastTab();
                }
                else if (pressed === keys.right || pressed == keys.down) {
                    focusFirstTab();
                }
            }
        }
    };

    // Activates any given tab panel
    function activateTab (tab, setFocus) {
        setFocus = setFocus || true;
        // Deactivate all other tabs
        deactivateTabs();

        // Remove tabindex attribute
        tab.removeAttribute('tabindex');

        // Set the tab as selected
        tab.setAttribute('aria-selected', 'true');

        // Get the value of aria-controls (which is an ID)
        var controls = tab.getAttribute('aria-controls');

        // Remove hidden attribute from tab panel to make it visible
        document.getElementById(controls).removeAttribute('hidden');

        // Set focus when required
        if (setFocus) {
            tab.focus();
        }
    };

    // Deactivate all tabs and tab panels
    function deactivateTabs () {
        for (var t = 0; t < tabs.length; t++) {
            tabs[t].setAttribute('tabindex', '-1');
            tabs[t].setAttribute('aria-selected', 'false');
            tabs[t].removeEventListener('focus', focusEventHandler);
        }

        for (var p = 0; p < panels.length; p++) {
            panels[p].setAttribute('hidden', 'hidden');
        }
    };

    function focusFirstTab () {
        tabs[0].focus();
    };

    function focusLastTab () {
        tabs[tabs.length - 1].focus();
    };

    function focusEventHandler (event) {
        var target = event.target;
        var delay = 0;
        setTimeout(checkTabFocus, delay, target);
    };

    // Only activate tab on focus if it still has focus after the delay
    function checkTabFocus (target) {
        var focused = document.activeElement;

        if (target === focused) {
            activateTab(target, false);
        }
    };

    // Customization parameters, ...
    return function (config) {
        // If no configuratiion object passe, then use component defaults
        defaultConfigurations = !!config ? config : defaultConfigurations;

        var tabComponent = document.getElementById(config.tabComponentId);

        tablist = tabComponent.querySelector('[role="tablist"]');
        tabs = tabComponent.querySelectorAll('[role="tab"][data-activated="true"]');
        panels = tabComponent.querySelectorAll('[role="tabpanel"]');
        // Bind listeners
        for (var i = 0; i < tabs.length; ++i) {
            addListeners(i);
        }
    }
})();
