$(function() {
  window.$Qmatic.components.dropdown.markTypeSelection = new window.$Qmatic.components.dropdown.BaseDropdownComponent('#markTypeFilter', {
      single_disable: false,
      allow_single_deselect: false,
      expand_dropdown_height: function (elem) {
        var heightOfContentSection = elem.closest('.qm-card').find(".qm-card__content-section").height()
           + 70;

        elem.parent().find(".chosen-results").css("max-height", heightOfContentSection);
      }
    });

  $('#markTypeFilter').on('change', function () {
    customMarks.updateSelectMarkDropdown($(this).val());
  });
})