
// Base Notes Class
window.$Qmatic.components.NotesController = function (options) {
    if(typeof options === 'undefined') {
        options = {};
    }
    this.numberOfAllowedCharacters = options.maxAmountOfCharacters || 255;
    this.notesInputView            = null;
    this.notesInput                = null;
    this.numberOfWrittenChar       = null;
    this.notesPresentationalView   = null;
    this.notesPresentationalBtn    = null;
}

//  Base Notes Class Methods
window.$Qmatic.components.NotesController.prototype = {
    init: function () {
        if(this.notesInputView === null && this.notesPresentationalView === null) {
            this.notesInputView             = document.querySelector('.qm-notes__edit-container');
            this.notesPresentationalView    = document.querySelector('.qm-notes__presentation-container');
            this.notesPresentationalBtn     = this.notesPresentationalView.querySelector('.qm-notes-btn');
            this.notesPresentationalBtnText = this.notesPresentationalBtn.querySelector('.qm-notes-btn__text');
            this.notesInput                 = this.notesInputView.querySelector('.qm-notes__textarea');
            this.numberOfWrittenChar        = this.notesInputView.querySelector('.js-notes-written-characters');
            this.maxCharacters              = this.notesInputView.querySelector('.js-notes-max-characters');
            this.cancelBtn                  = this.notesInputView.querySelector('.js-notes-cancel-btn');
            this.saveBtn                    = this.notesInputView.querySelector('.js-notes-save-btn');
            this.errorLabel                 = document.querySelector('.qm-notes__error-label');
            
            this.maxCharacters.innerText = "/" + this.numberOfAllowedCharacters;
            this._attachEventListeners();
        }
    },
    _attachEventListeners: function () {
        this.notesPresentationalBtn.addEventListener('click', this.navigateToInput.bind(this));
        this.notesInput.addEventListener('keyup', this._updateNotesInput.bind(this));
        this.cancelBtn.addEventListener('click', this._cancel.bind(this));
        this.saveBtn.addEventListener('click', this._save.bind(this));
    },
    _setButtonState: function () {
        if(this._getNumberOfTrimmedCharacters() === 0) {
            this.saveBtn.disabled = true;
        } else {
            this.saveBtn.disabled = false;
        }
    },
    _updateNotesInput: function () {
        this.numberOfWrittenChar.innerText = this._getNumberOfCharacters()
        this._setButtonState();
        if(this._getNumberOfTrimmedCharacters() === this.numberOfAllowedCharacters){
            this._toggleErrorLabel(true);
        }else{
            this._toggleErrorLabel(false);
        }
    },
    _getNumberOfCharacters: function () {
        return this.notesInput.value.length;
    },
    _getNumberOfTrimmedCharacters: function () {
        return this.notesInput.value.trim().length;
    },
    navigateToPresentational: function () {
        this.notesInputView.style.display = "none";
        this.notesPresentationalView.style.display = "block";
    },
    navigateToInput: function () {
        this.notesPresentationalView.style.display = "none";
        this.notesInputView.style.display = "block";
        this._setButtonState();
        this.notesInput.focus();
    },
    reload: function (text) {
        this._toggleErrorLabel(false);
        this.navigateToPresentational();
        this.notesPresentationalBtnText.innerText = text;
        this.notesInput.value = text;
        this._updateNotesInput();
    },
    _save: function () {
        // Save and set presentational
        this._toggleErrorLabel(false);
        servicePoint.saveNotes();
        this.navigateToPresentational();
    },
    _cancel: function () {
        this._toggleErrorLabel(false);
        this.navigateToPresentational();
    },
    _toggleErrorLabel: function (value) {
        value ? this.errorLabel.innerHTML =  translate.msg('error.validate.notes.maxlength', [this.numberOfAllowedCharacters]) : this.errorLabel.innerHTML = '';
    }
}