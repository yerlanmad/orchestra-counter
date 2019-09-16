
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
    if (typeof refreshFn !== "function") {
      this.init();
    } else {
      this.initWithRefresh(refreshFn);
    }
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
    initWithRefresh: function (refreshFn) {
      if(!!this.tableId) {
          this.$tableWrapper = $("#" + this.tableId + "_wrapper");
          this.$tableWrapperInner = this.$tableWrapper.find('.dataTables_scroll');
          this.$scrollContainer = this.$tableWrapper
              .find('.dataTables_scrollBody');

          this.scrollTopButton = this._generateScrollTopButton();
          this.refreshButton = this._generateRefreshButton();
          this.$tableWrapperInner.css('position', 'relative');
          var $buttonWrapper = $('<div class="qm-queue-actions-wrapper"></div>');
          $buttonWrapper.append(this.refreshButton);
          $buttonWrapper.append(this.scrollTopButton);
          this.$tableWrapperInner.append($buttonWrapper);
          this._attachEventListeners(refreshFn);
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
        if (typeof refreshFn === 'function') {
          $(this.refreshButton).off('click');
          $(this.refreshButton).on('click', _.bind(util.updateTableAndRestoreScrollPosition, this, this.$scrollContainer, refreshFn));
        }
    },
    disableRefreshButton: function () {
      var t = new Date();
      t.setSeconds(t.getSeconds() + 30);
      var $refreshButton = this.$tableWrapperInner.find('.js-refresh-queue-btn');
      var $refreshCountdown = this.$tableWrapperInner.find('.js-refresh-queue-countdown');
      $refreshButton.attr('disabled', true);
      $refreshCountdown.countdown('destroy');
      $refreshCountdown.countdown({until: t, compact: true, format: "S", onExpiry: function() {
        $refreshButton.attr('disabled', false);
        $refreshCountdown.countdown('destroy');
      }});
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
    _generateRefreshButton: function () {
      // Refresh button
      var refreshButton = document.createElement('BUTTON');
      refreshButton.className += 'qm-action-btn '
                              + 'qm-action-btn--only-icon '
                              + 'qm-refresh-queue-btn '
                              + 'js-refresh-queue-btn';

      // Wrapper for positioning
      var buttonInnerWrapper = document.createElement('SPAN');
      buttonInnerWrapper.className += "qm-refresh-queue-btn__wrapper";


      // Refresh icon
      var refreshIcon   = document.createElement('I');
      refreshIcon.className += "icon-refresh";
      refreshIcon.setAttribute('aria-hidden', true);
      buttonInnerWrapper.appendChild(refreshIcon);

      // Refresh counter
      var refreshCountdown = document.createElement('P');
      refreshCountdown.className += "qm-refresh-queue-countdown js-refresh-queue-countdown";

      buttonInnerWrapper.appendChild(refreshCountdown);

      // SR text
      var refreshSRElem = document.createElement('SPAN');
      refreshSRElem.className += 'sr-only';
      var refreshSRText = document.createTextNode(jQuery.i18n.prop("action.refresh.workprofile.visits"));
      refreshSRElem.appendChild(refreshSRText);

      buttonInnerWrapper.appendChild(refreshSRElem);

      refreshButton.appendChild(buttonInnerWrapper);
      return refreshButton;
    },
    disposeInstance: function () {
        $(this.scrollTopButton).remove();
        this._removeEventListeners();
    }
}