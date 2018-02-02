$(function() {
    window.$Qmatic.components.dropdown.deliveredServicesSelection = new window.$Qmatic.components.dropdown.BaseDropdownComponent('#deliveredServicesFilter', {
        single_disable: false,
        allow_single_deselect: false,
        expand_dropdown_height: function (elem) {
            var heightOfContentSection = elem.parent().parent().parent().parent().parent().parent().find(".qm-card__content-section").height() -
                (elem.parent().parent().parent().parent().parent().parent().find(".chosen-search").height() +
                elem.parent().parent().parent().parent().parent().parent().find(".custom-list-header").height() + 25);

            elem.parent().find(".chosen-results").css("max-height", heightOfContentSection);
        }
    })
})

