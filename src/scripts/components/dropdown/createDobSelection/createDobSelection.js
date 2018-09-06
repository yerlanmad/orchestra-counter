$(function() {
    window.$Qmatic.components.dropdown.createDobSelection = new window.$Qmatic.components.dropdown.BaseDropdownComponent('#createdateOfBirthMonth', {
        single_disable: false,
        allow_single_deselect: true,
        disable_search_threshold: 13,
    })
})

