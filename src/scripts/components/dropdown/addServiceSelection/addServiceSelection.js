$(function () {
    window.$Qmatic.components.dropdown.addServiceSelection = new window.$Qmatic.components.dropdown.BaseDropdownComponent('#availableServicesFilter', {
        single_disable: false,
        allow_single_deselect: false,
        expand_dropdown_height: function (elem) {
            var heightOfContentSection = elem.parent().parent().parent().parent().parent().parent().find(".qm-card__content-section").height() -
                elem.parent().parent().parent().parent().parent().parent().find(".chosen-search").height() +
                elem.parent().parent().parent().parent().parent().parent().find(".custom-list-header").height();

            elem.parent().find(".chosen-results").css("max-height", heightOfContentSection);
        }
    })
    $('#availableServicesFilter').change(function () {
        servicePoint.addService($(this).val())
        $('#availableServicesFilter').val('').trigger('chosen:updated');
    });
})

