$(function () {
    window.$Qmatic.components.dropdown.addServiceSelection = new window.$Qmatic.components.dropdown.BaseDropdownComponent('#availableServicesFilter', {
        single_disable: false,
        allow_single_deselect: false
    })
    $('#availableServicesFilter').change(function () {
        servicePoint.addService($(this).val())
        $('#availableServicesFilter').val('').trigger('chosen:updated');
    });
})

