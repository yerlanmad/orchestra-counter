$(function() {
    window.$Qmatic.components.dropdown.multiMarkSelection = new window.$Qmatic.components.dropdown.AddMarksDropdownComponent('#marksFilter', {
				single_disable: false,
				allow_single_deselect: false,
				expand_dropdown_height: function (elem) {
					var heightOfContentSection = elem.closest('.qm-card').find(".qm-card__content-section").height() + 70;
					elem.parent().find(".chosen-results").css("max-height", heightOfContentSection);
				}
			});
})