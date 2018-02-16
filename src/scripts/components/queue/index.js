
// Base Queue Nav Class
window.$Qmatic.components.QueueNavController = function (options) {
    if(typeof options === 'undefined') {
        options = {};
    }

    this.queueOverviewView  = null;
    this.queueDetailView    = null;
    this.queueDetailBackBtn = null;
    this.timerFunction      = null;
    this.timerWait          = options.wait || 2*60*1000; // 2 minutes
}

//  Base Queue Nav Class Methods
window.$Qmatic.components.QueueNavController.prototype = {
    init: function () {
        if(this.queueOverviewView === null && this.queueDetailView === null) {
            this.queueOverviewView  = document.getElementById('queuesModule');
            this.queueDetailView    = document.getElementById('queueDetailView');
            this.queueTableContent  = document.querySelector('.qm-queue-detail__content');
            this.queueDetailBackBtn = document.querySelector('.js-queue-detail-back');
            this._attachEventListeners();
        }
    },
    _attachEventListeners: function () {
        this.queueTableContent.addEventListener('click', this._handleClickInsideDetailView.bind(this));
        this.queueDetailBackBtn.addEventListener('click', this.navigateToOverviewWithRefresh.bind(this));
    },
    navigateToOverview: function () {
        this._clearTimer();
        queues.runClearQueuePopovers();
        this.queueDetailView.style.display = "none";
        this.queueOverviewView.style.display = "block";
    },
    navigateToOverviewWithRefresh: function () {
        this._clearTimer();
        queues.updateQueues(true);
        queues.runClearQueuePopovers();
        this.queueDetailView.style.display = "none";
        this.queueOverviewView.style.display = "block";
    },
    _handleClickInsideDetailView: function () {
        this.resetTimer();
    },
    navigateToDetail: function () {
        this._startTimer();
        this.queueOverviewView.style.display = "none";
        this.queueDetailView.style.display = "block";
    },
    _startTimer: function () {
        this.timerFunction = setTimeout(this._timerFn.bind(this), this.timerWait)
    },
    _timerFn: function () {
        this.navigateToOverview();
    },
    _clearTimer: function () {
        if(this.timerFunction !== null) {
            clearTimeout(this.timerFunction);
        }
    },
    resetTimer: function () {
        this._clearTimer();
        this._startTimer();
    }
}