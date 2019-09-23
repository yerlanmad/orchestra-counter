
// Table scrollTop
window.$Qmatic.components.TableScrollController = function () {
    this.instances = [];
}

window.$Qmatic.components.TableScrollController.prototype = {
    initTableScroll: function (key, refreshFn) {
        if(this.instances.hasOwnProperty(key)) {
            this.instances[key].disposeInstance();
            delete this.instances[key];
        }
        var tableScroll = new window.$Qmatic.components.TableScroll(key, refreshFn);
        this.instances[key] = tableScroll;
    },
    getInstance: function (key) {
      return this.instances.hasOwnProperty(key) ? this.instances[key] : null;
    }
}

window.$Qmatic.components.TableScroll = function (id, refreshFn) {
    this.tableId = id;
    this.SCROLL_THRESHOLD = 30;
    this.scrollIsVisible = false;
    this.onScroll = this._showScroll.bind(this);
    this.scrollToTop = this._scrollToTop.bind(this);
      this.init();
}

window.$Qmatic.components.TableScroll.prototype = {
    init: function () {
        if(!!this.tableId) {
            this.$tableWrapper = $("#" + this.tableId + "_wrapper");
            this.$tableWrapperInner = this.$tableWrapper.find('.dataTables_scroll');
            this.$scrollContainer = this.$tableWrapper
                .find('.dataTables_scrollBody');

            this.scrollTopButton = this._generateScrollTopButton();
            this.$tableWrapperInner.css('position', 'relative');
            this.$tableWrapperInner.append(this.scrollTopButton);
            this._attachEventListeners();
            this._showScroll();
        } else {
            console.error('Must specify table id');
        }
    },
    _attachEventListeners: function (refreshFn) {
        this.$scrollContainer.off('scroll', this.onScroll);
        this.$scrollContainer.on('scroll', this.onScroll);
        $(this.scrollTopButton).off('click', this.scrollToTop);
        $(this.scrollTopButton).on('click', this.scrollToTop);
    },
    _showScroll: function (e) {
        if(this.$scrollContainer.scrollTop() > this.SCROLL_THRESHOLD) {
            if(!this.scrollIsVisible) {
                this.scrollTopButton.style.display = "block";
                this.scrollIsVisible = true;
            }
        } else {
            if(this.scrollIsVisible) {
                this.scrollTopButton.style.display = "none";
                this.scrollIsVisible = false;
            }
        }
    },
    _scrollToTop: function () {
        this.$scrollContainer.animate({
            scrollTop: 0
        }, 300);
    },
    _removeEventListeners: function () {
        this.$scrollContainer.off('scroll', this.onScroll);
        $(this.scrollTopButton).off('scroll', this.scrollToTop);
    },
    _generateScrollTopButton: function () {
        // Scroll button
        var scrollButton = document.createElement('BUTTON');
        scrollButton.className += 'qm-action-btn '
                                + 'qm-action-btn--only-icon '
                                + 'qm-scroll-top-btn '
                                + 'js-scroll-top-btn';

        // Scroll icon
        var scrollIcon   = document.createElement('I');
        scrollIcon.className += "icon-caret-up";
        scrollIcon.setAttribute('aria-hidden', true);
        scrollButton.appendChild(scrollIcon);

        // SR text
        var scrollSRElem = document.createElement('SPAN');
        scrollSRElem.className += 'sr-only';
        var scrollSRText = document.createTextNode(jQuery.i18n.prop("action.scroll.to.top"));
        scrollSRElem.appendChild(scrollSRText);

        scrollButton.appendChild(scrollSRElem);

        return scrollButton;
    },
    disposeInstance: function () {
        $(this.scrollTopButton).remove();
        this._removeEventListeners();
    }
}