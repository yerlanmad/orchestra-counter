window.$Qmatic.components.card.TransferDelayCardComponent = function (selector) {
  this.enhancedTransferDelayButtons = [];

  this.attachListeners = function (transferTo, aData) {
    var transferButtons = this.get$Elem().find('.js-transfer-delay-btn');
    var transferInput = this.get$Elem().find('.js-transfer-delay-input');
    var transferInputSubmit = this.get$Elem().find('.js-transfer-delay-submit-btn');
    var clearInputButton = this.get$Elem().find('.js-clear-field');

    transferInput.val("");
    transferInput.off('keydown', util.validateTransferInput);
    transferInput.off('input', this._clearInputToggler);
    transferInput.on('keydown', util.validateTransferInput);
    transferInput.on('input', this._clearInputToggler);

    if (this.clearInputFunction !== undefined) {
      clearInputButton.off('click', this.clearInputFunction);
    }
    this.clearInputFunction = this._getClearInputFunction(transferInput);
    clearInputButton.on('click', this.clearInputFunction);

    if (this.transferSubmitFunction !== undefined) {
      transferInputSubmit.off('click', this.transferSubmitFunction);
    }
    this.transferSubmitFunction = this._getTransferDelaySubmitFunction(transferInput, transferTo, aData).bind(this);

    util.setTransferDelayTitle(this.get$Elem().find('.js-transfer-delay-description'), transferTo, aData);
    transferInputSubmit.on('click', this.transferSubmitFunction);
    this._removeTransferDelayListeners();
    for(var i = 0; i < transferButtons.length; i++) {
      var delay = transferButtons[i].getAttribute('data-delay');
      var transferFn = this._getTransferDelayFunction(transferTo, delay, aData).bind(this);
      transferButtons[i].addEventListener('click', transferFn);
      this.enhancedTransferDelayButtons.push({
        element: transferButtons[i],
        elementListener: transferFn
      });
    }
  }

  this._getTransferDelaySubmitFunction = function (transferInput, transferTo, aData) {
    return function delaySubmitFunction(e) {
      if (transferInput.val().trim() !== '') {
        this._getTransferDelayFunction(transferTo, transferInput.val(), aData).bind(this)(e);
      }
    }
  }

  this._clearInputToggler = function (e) {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
    if (e.target.value !== '') {
      e.target.nextElementSibling.style.display = "block";
    } else {
      e.target.nextElementSibling.style.display = "none";
    }
  },

  this._getClearInputFunction = function (transferInput) {
    return function clearInput(e) {
      transferInput.val("");
      var event = util.createEvent('input');
      transferInput.trigger('input');
    }
  },

  this._removeTransferDelayListeners = function () {
    this.enhancedTransferDelayButtons.forEach(function(item) {
      item.element.removeEventListener('click', item.elementListener);
    });
    this.enhancedTransferDelayButtons = [];
  }

  this._getTransferDelayFunction = function (transferTo, delay, aData) {
    return function transferFunction(e) {
      e.preventDefault();
      var delayInMinutes = +delay * 60;
      if (transferTo === 'counterPool') {
        transfer._transferCurrentVisitToCounterPoolClicked("FIRST", aData, delayInMinutes);
      } else if (transferTo === 'staffPool') {
        transfer._transferCurrentVisitToUserPoolClicked("FIRST", aData, delayInMinutes);
      } else if (transferTo === 'queue') {
        transfer._transferCurrentVisitToQueueClicked(null, aData, delayInMinutes);
      }
    }
  }

  this.onInit.apply(this, arguments);
}

window.$Qmatic.components.card.TransferDelayCardComponent.prototype = new window.$Qmatic.components.card.CardBaseComponent()
window.$Qmatic.components.card.TransferDelayCardComponent.prototype.constructor = window.$Qmatic.components.card.TransferDelayCardComponent;

