// Dropdown Component
window.$Qmatic.components.dropdown.AddMarksDropdownComponent = function (selector, chosenConfig) {

    this.selectedId = null
    this.selectedText = ""
    this.noOfMarksToBeAdded = 1;

    // Elements
    var $markCountInputField = null
    var $marksAddBtn = null
    var $mainOverlayContainer = null


    // @Override
    this.onInit = function (selector, choosenConfig) {
        if (selector) {
            window.$Qmatic.components.dropdown.AddMarksDropdownComponent.prototype.onInit.call(this, selector, chosenConfig);
            this.initElements()
            this.resetSelected();
            this.setupListeners();
        }
    }

    this.initElements = function () {
        $markCountInputField = $(this.getSelector()).prev("div.main").find("#noMarkCount")
        $marksAddBtn = $(this.getSelector()).prev("div.main").find("#addMarksToVisitBtn")
        $mainOverlayContainer = $(this.getSelector()).prev("div.main")
    }

    this.setupListeners = function () {
        var parentContext = this;
        $(this.getSelector()).change(function() {
            parentContext.selectedId = $(this).val()
            parentContext.selectedText = $(this).find(":selected").text()
            if (multiMarks) {
                parentContext.setSelectedText(parentContext.selectedText)
            } else {
                customMarks.customMarkClicked(parentContext.selectedId, 1, parentContext.selectedText);
            }
            $(this).val('').trigger('chosen:updated');
        });

        $(this.getSelector()).prev("div.main").find(".cross-icon button").on("click", function() {
            parentContext.resetSelected();
        });

        $marksAddBtn.click(function() {
            $marksAddBtn.blur();
            if (parentContext.noOfMarksToBeAdded > 0 && parentContext.noOfMarksToBeAdded <= parseInt($markCountInputField.attr('max'))) {
                customMarks.customMarkClicked(parentContext.selectedId, parentContext.noOfMarksToBeAdded, parentContext.selectedText);
                parentContext.resetSelected();
            } else {
                $markCountInputField.addClass("invalid")
            }
        });

        $markCountInputField.on('change blur keyup', function() {
            if (!$(this).val() || parseInt($(this).val(), 10) < 1) {
                $(this).addClass("invalid")
                 parentContext.noOfMarksToBeAdded = 1;
                 $marksAddBtn.prop('disabled', true);
            } else {
                $(this).removeClass("invalid")
                parentContext.noOfMarksToBeAdded = $(this).val();
                $marksAddBtn.prop('disabled', false);
            }
        });
    }

    this.setSelectedText = function (text) {
        $mainOverlayContainer.show();
        $marksAddBtn.focus();
        customMarks.hideAddedMarksTable();
        $mainOverlayContainer.find(".selected-text").text(text);
    }

    this.resetSelected = function () {
        this.selectedText = ""
        this.selectedId = null
        this.noOfMarksToBeAdded = 1;
        customMarks.showAddedMarksTable();
        $markCountInputField.removeClass("invalid")
        $markCountInputField.val(1)
        $mainOverlayContainer.hide();
    }

    this.onInit.apply(this, arguments);
}

window.$Qmatic.components.dropdown.AddMarksDropdownComponent.prototype = new window.$Qmatic.components.dropdown.BaseDropdownComponent()
window.$Qmatic.components.dropdown.AddMarksDropdownComponent.prototype.constructor = window.$Qmatic.components.dropdown.AddMarksDropdownComponent
