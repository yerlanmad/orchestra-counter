// Dropdown Component
window.$Qmatic.components.dropdown.AddMarksDropdownComponent = function (selector, chosenConfig) {

    this.selectedId = null
    this.selectedText = ""
    this.noOfMarksToBeAdded = 0;

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
                customMarks.customMarkClicked(parentContext.selectedId, 1);
            }
            $(this).val('').trigger('chosen:updated');
        });

        $(this.getSelector()).prev("div.main").find(".cross-icon button").on("click", function() {
            console.log("clicked on cross")
            parentContext.resetSelected()
        });

        $marksAddBtn.click(function() {
            if (parentContext.noOfMarksToBeAdded > 0 && parentContext.noOfMarksToBeAdded <= parseInt($markCountInputField.attr('max'))) {
                customMarks.customMarkClicked(parentContext.selectedId, parentContext.noOfMarksToBeAdded);
                parentContext.resetSelected();
            } else {
                $markCountInputField.addClass("invalid")
            }
        });

        $markCountInputField.change(function() {
            if ($(this).val() <= 0) {
                $(this).addClass("invalid")
                 parentContext.noOfMarksToBeAdded = 0
            } else {
                $(this).removeClass("invalid")
                parentContext.noOfMarksToBeAdded = $(this).val()
            }
        });
    }

    this.setSelectedText = function (text) {
        $mainOverlayContainer.show();
        customMarks.hideAddedMarksTable();
        $mainOverlayContainer.find(".selected-text").text(text);
    }

    this.resetSelected = function () {
        this.selectedText = ""
        this.selectedId = null
        this.noOfMarksToBeAdded = 0
        customMarks.showAddedMarksTable();
        $markCountInputField.removeClass("invalid")
        $markCountInputField.val(0)
        $mainOverlayContainer.hide();
    }
    
    this.onInit.apply(this, arguments);
}

window.$Qmatic.components.dropdown.AddMarksDropdownComponent.prototype = new window.$Qmatic.components.dropdown.BaseDropdownComponent()
window.$Qmatic.components.dropdown.AddMarksDropdownComponent.prototype.constructor = window.$Qmatic.components.dropdown.AddMarksDropdownComponent
