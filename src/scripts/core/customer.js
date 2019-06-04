/**
 *
 * TODO: Add confirmation messages for customer actions, e.g.
 * "Success, customer updated".
 */
var customer = new function() {

	var customerDbOnline = true;

	var isDefined = function(object) {
        return object !== null && object !== undefined;
    };

    this.addUserPressed = function (e) {
        e.preventDefault();
        window.$Qmatic.components.card.addCustomerCard.showAddForm();
        this.setFormButtonsState('#createCustomerForm', false);
        cardNavigationController.push(window.$Qmatic.components.card.addCustomerCard);
    };

    this.editUserPressed = function (e, index) {
        e.preventDefault();
        if(moduleCustomerEnabled) {
            cardNavigationController.push(window.$Qmatic.components.card.editCustomerCard);
            this.populateEditAttachedCustomerFields("editAttached", index);
        }
    }

    this.editAttachedCustomer = function (e) {
        e.preventDefault();
        this.editCustomer("editAttached", true);
    }

    this.navigateToCustomerOverview = function (e) {
        e.preventDefault();
        cardNavigationController.push(window.$Qmatic.components.card.customerListCard);
    }
    // Real
    this.populateAdditionalCustomersList = function () {
        var customerIds = sessvars.state.visit.customerIds.slice(0);
        customerIds.shift();
        var $customerList = $('.js-customer-list');
        $customerList.empty();
        var listItems = [];
        _.each(customerIds, function (customerId, i) {
            var customer = spService.get("customers/"+customerId);
            listItems.push(createCustomerListItem(customer.id, customer.firstName, customer.lastName, customer.properties.email, customer.properties.phoneNumber, customer.properties["dateOfBirth"], i+1));
        });
        $customerList.append(listItems);
    };

    var createCustomerListItem = function (id, firstName, lastName, email, phoneNumber, dateOfBirth, index) {
        var entry = document.createElement('LI');
        entry.classList.add('qm-customer-list__item');
        if(firstName && lastName) {
            var nameNode = document.createElement("P");
            nameNode.classList.add('qm-customer-list__name');
            var nameText = document.createTextNode(firstName + " " + lastName);
            nameNode.appendChild(nameText);
            entry.appendChild(nameNode);
        }
        if(email) {
            var emailNode = document.createElement("P");
            emailNode.classList.add('qm-customer-list__information');
            var emailText = document.createTextNode(email);
            emailNode.appendChild(emailText);
            entry.appendChild(emailNode);
        }
        if(phoneNumber) {
            var phoneNode = document.createElement("P");
            phoneNode.classList.add('qm-customer-list__information');
            var phoneText = document.createTextNode(phoneNumber);
            phoneNode.appendChild(phoneText);
            entry.appendChild(phoneNode);
        }
        if(dateOfBirth) {
            var dobNode = document.createElement("P");
            dobNode.classList.add('qm-customer-list__information');
            var dateOfBirthText = document.createTextNode(util.formatDateToDateConvention(dateOfBirth));
            dobNode.appendChild(dateOfBirthText);
            entry.appendChild(dobNode);
        }
        var editBtnNode = document.createElement("BUTTON");
        editBtnNode.onclick = function (e) {
            customer.editUserPressed(e, index);
        };
        editBtnNode.className += 'qm-action-btn qm-action-btn--only-icon qm-customer-list__edit-btn js-customer-edit-btn';
        var editIconNode = document.createElement("I");
        editIconNode.className += 'qm-action-btn__icon icon-edit';
        editIconNode.setAttribute('aria-hidden', true);
        editBtnNode.appendChild(editIconNode);
        var srSpan = document.createElement("SPAN");
        var srText = document.createTextNode(jQuery.i18n.prop('customer.edit') + " " + firstName + " " + lastName);
        srSpan.appendChild(srText);
        srSpan.classList.add('sr-only');
        editBtnNode.appendChild(srSpan);
        entry.appendChild(editBtnNode);
        return entry;
    }

    /*
        The locale identifier we get may contain a country identifier which may not exist among the
        supported date picker regions, so we need to try get by language identifier if a direct locale
        identifier match could not be made. Otherwise defaults to english date picker region.
        Example: User's locale could be fr-CA which is not supported by the date picker so we need to
                 try with "fr" instead.
    */
	var determineDatePickerRegion = function(localeIdentifier) {
	    var countryIdentifier,
	        languageMatch,
	        determinedRegion = ""; // Empty string gives English calendar translation

        if ( isDefined(localeIdentifier) && localeIdentifier !== "en") {

            if ($.datepicker.regional[localeIdentifier] === undefined) {
                // Checks both "_" and "-" just to be sure. Hyphen is from newer locale spec.
                languageMatch = /(\w+)[_-](\w+)/.exec(localeIdentifier);
                if (languageMatch !== null && languageMatch.length === 3 && $.datepicker.regional[languageMatch[1]] !== undefined) {
                    determinedRegion = languageMatch[1];
                }

            } else {
                determinedRegion = localeIdentifier;
            }
        }

        return determinedRegion;
	};

    this.init = function() {

        this.setFormButtonsState("#createCustomerForm", true);
        this.setFormButtonsState("#editCustomerForm", true);
        this.setFormButtonsState("#editAttachedCustomerForm", true);

        this.initClearInputField();
        $('input[type="tel"]').keyup(function(e) {
            // Backspace and programmatically reset
            if(e.which === 8 || e.which === undefined) {
              toggleErrorLabel(false, $(this));
            }
        });
        $('input[type="tel"]').keypress(function(e) {
            var phonePattern = /^[0-9\+\s]+$/;
            var passedTest = phonePattern.test(String.fromCharCode(e.which));
            if (!passedTest) {
              toggleErrorLabel(true, $(this));
              return false;
            } else {
              toggleErrorLabel(false, $(this));
            };
        });
        /*
         * Functionality below for autocomplete customer-search.
         * uses a simple input text field and jQuery datatable
         */
        $("#customerInput")
            .on("keydown", function(event) {
                // only process these events if we're in "search" mode
                if (document.getElementById('customerSearchDiv').style.display != "block") {
                    return;
                }
                var row = parseInt($(this).data('selectedRow'));
                var rowCount = parseInt($(this).data('rowCount'));
                // prevent using TAB key if we're in "search mode"
                if (event.keyCode === $.ui.keyCode.TAB) {
                    event.preventDefault();
                    // step up or down in the list
                } else if (event.keyCode === $.ui.keyCode.DOWN) {
                    row++;
                    if (row >= rowCount) {
                        row = rowCount - 1;
                    }
                    $(this).data('selectedRow', row);
                    customer.setSelectedRow(row, true);
                } else if (event.keyCode === $.ui.keyCode.UP) {
                    row--;
                    if (row <= 0) {
                        row = 0;
                    }
                    $(this).data('selectedRow', row);
                    customer.setSelectedRow(row, true);
                    // select the highlighted item
                } else if (event.keyCode === $.ui.keyCode.ENTER) {
                    customer.setSelectedCustomer(row);
                    util.hideModal('customerSearchDiv');
                }
            });

        $("#customerInput")
            .on("keyup", function(event) {
                var val = $(this).val();
                if (val) {
                    val = $.trim(val);
                }
                // these events are handled in "keydown" event handler
                if (event.keyCode === $.ui.keyCode.ENTER ||
                    event.keyCode === $.ui.keyCode.UP ||
                    event.keyCode === $.ui.keyCode.DOWN ||
                    event.keyCode === $.ui.keyCode.TAB) {

                    // cancel search
                } else if (event.keyCode === $.ui.keyCode.ESCAPE) {
                    util.hideModal('customerSearchDiv');
                    event.preventDefault();
                    return;
                } else {
                    // stop any timers running
                    var timer = $(this).data('timer');
                    if(timer) {
                        clearTimeout(timer);
                    }
                    if(val.length > 0) {
                        $('.js-search-input__icon').hide();
                        $('.qm-form-field--search .js-clear-field').show();
                    } else {
                        $('.js-search-input__icon').show();
                        $('.qm-form-field--search .js-clear-field').hide();
                    }

                    sessvars.currentCustomer = null;

                    if (val.length >= 2) { //We want at least 2 characters entered.
                        $(this).data('enteredVal', val); //Store the previous value on the autocomplete object.
                        $(this).data('selectedRow', 0); // reset which row has been selected
                        // start a timer to prevent searching "too fast"
                        $(this).data('timer', setTimeout(function() {
                            customer.filterList(val);
                            var rowCount = $('#customerSearchTable').dataTable().fnGetData().length;
                            $("#customerInput").data('rowCount', rowCount);
                            if(customer.customerDbOnline) {
                            	util.showModal('customerSearchDiv');
                                customer.positionCustomerResult();
                                if (rowCount != 0) {
                                    customer.setSelectedRow(0, true);
                                }
    						}

                        },
                        300));
                        // less than 2 chars -> clear the table and hide it
                    } else {
                        $('#customerSearchTable').dataTable().fnClearTable();
                        window.$Qmatic.components.card.addCustomerCard.disableEditSave();
                        window.$Qmatic.components.card.addCustomerCard.clearEditForm();
                        window.$Qmatic.components.card.addCustomerCard.showAddForm();
                        util.hideModal('customerSearchDiv');
                    }
                }
            });

        // column header definitions for the data table
        // read them from i18n to get the visible names
        this.COLUMN_NAMES = ["fullName", "phoneNumber", "email", "dateOfBirth"];
        var columnDefs = [];
        for (var i=0; i < customer.COLUMN_NAMES.length; i++) {
            var i18name = "field." + customer.COLUMN_NAMES[i];
            columnDefs.push({
                mDataProp: customer.COLUMN_NAMES[i],
                sTitle: '<span class="customerSearchHeader">' + jQuery.i18n.prop(i18name) + '</span>'
            });
        }
        var rowCallback = function(nRow, aData, iDisplayIndex) {
            var searchTerm = $("#customerInput").val();
            if(searchTerm.indexOf('+') > -1) {
                searchTerm = searchTerm.replace('+', '\\+');
            }
            var pattern = new RegExp(searchTerm, "ig");
            $('td:eq(0)', nRow).html(aData.fullName.replace(pattern, "<span class='qm-table__highlight'>$&</span>"))
            $('td:eq(1)', nRow).html(aData.phoneNumber.replace(pattern, "<span class='qm-table__highlight'>$&</span>"))
            $('td:eq(2)', nRow).html(aData.email.replace(pattern, "<span class='qm-table__highlight'>$&</span>"))
            if (aData.dateOfBirth) {
                $('td:eq(3)', nRow).html(util.formatDateToDateConvention(aData.dateOfBirth))
            }
        }

        // initialise datatable for the auto-complete customer search
        $("#customerSearchTable").dataTable({
            aaData : [],
            bLengthChange : false,
            bPaginate : false,
            bInfo : false,
            bFilter : false,
            sScrollX: "100%",
            autoWidth: true,
            bSort: false,
            asStripClasses: [],
            oLanguage: {
                sEmptyTable: jQuery.i18n.prop('customer.not.found')
            },
            aoColumns : columnDefs,
            fnRowCallback: rowCallback
        });

        util.hideModal('customerSearchDiv');

    };

    this.handleShowResetButton = function ($inputs) {
        $inputs.on('keyup', function (e) {
            var $self = $(this),
                val = $self.val().trim();

            if(val.length > 0) {
                $self.next('.js-clear-field').show();
            } else {
                $self.next('.js-clear-field').hide();
            }
        })
    }

    this.setFormButtonsState = function (formSelector, setListeners) {
        var $form = $(formSelector);
        var $inputs = $form.find('input');
        var $requiredFields = $form.find('[required]');
        var $saveBtn = $form.find('[save-btn]');
        var $emailField = $form.find('[name="email"]');
        var $dobMonth = $form.find('[dobmonth]');
        var $dobDay = $form.find('[dobday]');
        var $dobYear = $form.find('[dobyear]');
        var dob = [$dobMonth, $dobDay, $dobYear];

        $form.find('.qm-field-error').removeClass('qm-field-error');
        this.setSaveButtonState($requiredFields, $saveBtn, $emailField, dob);
        if(setListeners) {
            this.setRequiredFieldsListener($requiredFields, $saveBtn, $emailField, dob);
            this.handleShowResetButton($inputs);
        }
    }

    this.setSaveButtonState = function ($requiredFields, $saveBtn, $emailField, dob) {
        var isValid = true;
        $.each($requiredFields, function (i, requiredField) {
            var $reqField = $(requiredField);
            if($reqField.val().trim() === "") {
                isValid = false;
            } else {
                $reqField.removeClass('qm-field-error');
            }
        });

        if(!isValid) {
            $saveBtn.prop('disabled', true);
        } else {
            $saveBtn.prop('disabled', false);
        }

        if($emailField.val() !== "" && !isEmailValid($emailField.val())) {
            $saveBtn.prop('disabled', true);
        } else {
            $emailField.removeClass('qm-field-error');
        }

        if(customer.validateDateOfBirth(dob) !== true) {
            $saveBtn.prop('disabled', true);
        }
    };

    this.clearInput = function (e) {
        e.preventDefault();
        var $input = $(this).siblings('input');
        $input.val("");
        $input.trigger('keyup');
    }

    this.initClearInputField = function () {
        $clearBtns = $('.js-clear-field');
        $clearBtns.on('click', this.clearInput);
    }

    this.setSaveButtonStateWithError = function ($requiredFields, $saveBtn, $emailField, dob) {
        var isValid = true;
        $.each($requiredFields, function (i, requiredField) {
            var $reqField = $(requiredField);
            if($reqField.val().trim() === "") {
                isValid = false;
                $reqField.addClass('qm-field-error');
                toggleErrorLabel(true, $reqField);
              } else {
                toggleErrorLabel(false, $reqField);
                $reqField.removeClass('qm-field-error');
            }
        });
        if(!isValid) {
            $saveBtn.prop('disabled', true);
        } else {
            $saveBtn.prop('disabled', false);
        }

        if($emailField.val() !== "" && !isEmailValid($emailField.val())) {
            toggleErrorLabel(true, $emailField);
            $emailField.addClass('qm-field-error');
            $saveBtn.prop('disabled', true);
          } else {
            toggleErrorLabel(false, $emailField);
            $emailField.removeClass('qm-field-error');
        }

        if(customer.validateDateOfBirth(dob) !== true) {
            // toggleErrorLabel(true, dob[1]);
            $saveBtn.prop('disabled', true);
        } else {
            toggleErrorLabel(false, dob[1]);
        }
    };

    var toggleErrorLabel = function (showError, $field, errorMessage) {
      var fieldName = $field.prop('name');
      switch(fieldName) {
        case 'firstName': {
          var $errorLabel = findErrorLabel($field);
          showError ? $errorLabel.text(jQuery.i18n.prop('error.first.name.mandatory')) : $errorLabel.text('');
          break;
        }
        case 'lastName': {
          var $errorLabel = findErrorLabel($field);
          showError ? $errorLabel.text(jQuery.i18n.prop('error.last.name.mandatory')) : $errorLabel.text('');
          break;
        }
        case 'email': {
          var $errorLabel = findErrorLabel($field);
          showError ? $errorLabel.text(jQuery.i18n.prop('error.validate.email.with.example')) : $errorLabel.text('');
          break;
        }
        case 'phoneNumber': {
          var $errorLabel = findErrorLabel($field);
          showError ? $errorLabel.text(jQuery.i18n.prop('error.validate.phone.number')) : $errorLabel.text('');
          break;
        }
        case 'dobDay': {
          var $errorLabel = findErrorLabel($field);
          showError ?
            (errorMessage ? $errorLabel.text(errorMessage) : $errorLabel.text(jQuery.i18n.prop('error.validate.dateOfBirth')))
            : $errorLabel.text('');
          break;
        }
        default: {

        }
      }
    }

    var findErrorLabel = function($formField) {
      return $formField.closest('.qm-form-field').find('.js-form-field-error');
    }

    this.validateDateOfBirth = function (dob) {
        var mm = dob[0].val();
        var dd = dob[1].val().trim();
        var yyyy = dob[2].val().trim();
        var hasStartedDob = false;
        var isValid = false;
        if (mm !== "-1" || dd !== '' || yyyy !== '') {
            hasStartedDob = true;
        } else {
            hasDobStarted = false;
        }

        if(hasStartedDob) {
            isValid = this.isValidDateOfBirth(dob);
        } else {
            isValid = true;
        }

        return isValid;
    };

    this.isValidDateOfBirth = function (dob) {
        var mm = dob[0].val();
        var dd = dob[1].val().trim();
        var yyyy = dob[2].val().trim();
        var inputDate = dd + '-' + mm + '-' + yyyy;

        var dateformat = /^(0[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/;
        // Match the date format through regular expression
        if(inputDate.match(dateformat)) {
            var pdate = inputDate.split('-');

            var dd = parseInt(pdate[0]);
            var mm  = parseInt(pdate[1]);
            var yy = parseInt(pdate[2]);

            // Check if the date is in the future
            var now = new Date();
            var dobYear = new Date(yy, mm, dd);

            if (dobYear.getTime() > now.getTime()) {
                this.showDobFieldError(dob[2]);
                toggleErrorLabel(true, dob[1], jQuery.i18n.prop('error.validate.dob.date.in.future'));
                return false;
            } else {
                this.hideDobFieldError(dob[2]);
            }

            // Create list of days of a month [assume there is no leap year by default]
            var ListofDays = [31,28,31,30,31,30,31,31,30,31,30,31];
            if (mm==1 || mm>2) {
                if (dd>ListofDays[mm-1]) {
                    // Faulty day
                    this.showDobFieldError(dob[1]);
                    toggleErrorLabel(true, dob[1], jQuery.i18n.prop('error.validate.dob.invalid.day'));
                    return false;
                } else {
                    this.hideDobFieldError(dob[1]);
                }
            }
            if (mm==2) {
                var lyear = false;
                if ( (!(yy % 4) && yy % 100) || !(yy % 400)) {
                    lyear = true;
                }
                if ((lyear === false) && (dd>=29)) {
                    this.showDobFieldError(dob[1]);
                    toggleErrorLabel(true, dob[1], jQuery.i18n.prop('error.validate.dob.invalid.day'));
                    return false;
                }
                if ((lyear === true) && (dd>29)) {
                    this.showDobFieldError(dob[1]);
                    toggleErrorLabel(true, dob[1], jQuery.i18n.prop('error.validate.dob.invalid.day'));
                    return false;
                }
                this.hideDobFieldError(dob[1]);
            }
        } else {
            var splitRegex = [/^(0[1-9]|[12][0-9]|3[01])$/, /^(0?[1-9]|1[012])$/, /^\d{4}$/];
            var validDay = dd.match(splitRegex[0]);
            var validMonth = mm.match(splitRegex[1]);
            var validYear = yyyy.match(splitRegex[2]);
            var errorLabels = [];

            if (validMonth) {
              this.hideDobFieldError(dob[0]);
            } else {
              this.showDobFieldError(dob[0]);
              errorLabels.push(jQuery.i18n.prop('error.validate.dob.month'));
            }
            if (validDay) {
              this.hideDobFieldError(dob[1]);
            } else {
              this.showDobFieldError(dob[1]);
              errorLabels.push(jQuery.i18n.prop('error.validate.dob.day'));
            }
            if (validYear) {
              this.hideDobFieldError(dob[2]);
            } else {
              this.showDobFieldError(dob[2]);
              errorLabels.push(jQuery.i18n.prop('error.validate.dob.year'));
            }
            if (errorLabels.length > 0) {
              var shouldSeparate = errorLabels.length > 1;
              var message = errorLabels.reduce(function(combinedMessage, currentError, index, errorLabels) {
                if (index === errorLabels.length - 1) {
                  return combinedMessage + (shouldSeparate ? (" " + jQuery.i18n.prop('error.validate.dob.separator')) : "") + " " + currentError;
                } else if (shouldSeparate && index === errorLabels.length - 2) {
                  return combinedMessage + " " + currentError;
                } else {
                  return combinedMessage + " " + currentError + ","
                }
              }, jQuery.i18n.prop('error.validate.dob.invalid'));
              toggleErrorLabel(true, dob[1], message);
            }

            return false;
        }

        this.hideDobFieldError(dob[0]);
        this.hideDobFieldError(dob[1]);
        this.hideDobFieldError(dob[2]);

        return true;
    };

    this.showDobFieldError = function ($elem) {
        $elem.addClass('qm-field-error');
    };

    this.hideDobFieldError = function ($elem) {
        $elem.removeClass('qm-field-error');
    };

    this.setRequiredFieldsListener = function ($requiredFields, $saveBtn, $emailField, dob) {
        var self = this;
        $requiredFields.on('keyup keydown input', this.setSaveButtonStateWithError.bind(this, $requiredFields, $saveBtn, $emailField, dob));
        $emailField.on('keyup keydown input', this.setSaveButtonStateWithError.bind(this, $requiredFields, $saveBtn, $emailField, dob));
        if (dob.length > 0) {
            for(var i = 0; i < dob.length; i++) {
                dob[i].on('keyup keydown input', this.setSaveButtonStateWithError.bind(this, $requiredFields, $saveBtn, $emailField, dob));
            }
        }
    }

    // the actual search function
    this.filterList = function(val) {
    	// QP-1285, IE caches things way too aggressively
    	var urlextra = "";
    	if (typeof lowfiie !== 'undefined' && lowfiie) {
    		urlextra = '&breakcache=' + Math.random();
    	}
        var prev = $(this).data('enteredVal');
        var $customerSearchTable = $('#customerSearchTable').dataTable();
        $customerSearchTable.fnClearTable();
        if(val !== prev) {

            if(val.indexOf("+") > -1) {
                val = encodeURIComponent(val);
            }

            $.ajax({
                url: "/rest/servicepoint/customers/search?text=" + val + urlextra,
                dataType: 'json',
                async: false,
                success: function(data){
                    customer.customerDbOnline = true;
                    $.map(data, function(item){
                        var transformedCustomer = transformCustomer(item, customer.COLUMN_NAMES);
                        $customerSearchTable.fnAddData(transformedCustomer);
                    });

                    window.$Qmatic.components.card.addCustomerCard.showAddForm();

                },
                error: function(jqXHR, textStatus, errorThrown) {
                    if(jqXHR.status == 503) {
                      customer.customerDbOnline = false;
                      util.showError(jQuery.i18n.prop('error.central.server.unavailable'));
                      util.hideModal("customerSearchDiv");
                    }
  			  }
            });
            // add click listener to select a customer if table is not empty
            if($customerSearchTable.fnGetData().length > 0) {
                $('#customerSearchTable tbody tr').click( function () {
                    var index = $customerSearchTable.fnGetPosition( this );
                    customer.setSelectedCustomer(index);
                    $('#customerSearchTable tbody tr').unbind();
                    // hide table
                    util.hideModal("customerSearchDiv");
                });
            }
            // add mouseover listener, to have the "selected" row follow the mouse pointer
            $('#customerSearchTable tbody tr').mouseover( function () {
                var index = $customerSearchTable.fnGetPosition( this );
                customer.setSelectedRow(index);
                $("#customerInput").data('selectedRow', index);
            });
            // bind loosing focus on the input field
            $("html").off('click');
            $("html").click( function(event) {
                // if we're in search mode, hide the window
                if (document.getElementById('customerSearchDiv').style.display == "block") {
                    util.hideModal("customerSearchDiv");
                }
            });
        }
    };

    /**
     * As of R5, we have a customer object with fixed fields for firstName, lastName, id and cardNumber. All other
     * fields goes into a properties map. This method transforms the "new" Customer object into a plain JS object with
     * all the fields in the properties map set directly as "normal" properties onto the JS object.
     *
     * @param item
     * @returns {___anonymous20437_20559}
     */
    var transformCustomer = function(item, columnNames) {
        // Add the declared fields
        var cust = {
            "fullName":item.firstName + " " + item.lastName,
            "firstName":item.firstName,
            "lastName":item.lastName,
            "cardNumber":item.cardNumber,
            "id":item.id
        };

        // Add the other properties
        var props = item.properties;
        for (var key in props) {
            if(props.hasOwnProperty(key)) {
                if( key === 'dateOfBirth' && props[key]) {
                    cust[key] = props[key].substring(0, 10);
                } else {
                    cust[key] = props[key];
                }
            }
        }

        // Finally, make sure all columns from columnNames are added to the customer object, otherwise, then table component will throw an error
        for(var a = 0; a < columnNames.length; a++) {
            if(typeof cust[columnNames[a]] === 'undefined' || cust[columnNames[a]] == null) {
                cust[columnNames[a]] = '';
            }
        }
        return cust;
    };

    // sets selected CSS style on one row
    this.setSelectedRow = function(index, scroll) {
        // clear all styles
        var doScroll = scroll ? true : false;
        $("#customerSearchTable tr").removeClass("row_selected");

        var rows = $("#customerSearchTable").dataTable().fnGetNodes();
        $(rows[index]).addClass('row_selected');

        // scroll to selected index if its outside the visible area
        // only do this if its called by the key listener, scrolling when mouseover is called makes it jump around
        if (doScroll) {
            if (index == 0) {
                document.getElementById("customerSearchDiv").scrollTop = 0;
            } else {
                var currentScroll = document.getElementById("customerSearchDiv").scrollTop;
                var totalHeight = document.getElementById("customerSearchDiv").scrollHeight;
                var currentHeight = parseInt($("#customerSearchDiv").css("height").replace("px", ""));
                if (totalHeight > currentHeight) {
                    var pxPerItem = (totalHeight) / (rows.length);
                    if ((pxPerItem * (index + 1 )) > (currentHeight / 2) ||
                        (pxPerItem * (index + 1)) < currentScroll) {
                        document.getElementById("customerSearchDiv").scrollTop = (pxPerItem * index) - (currentHeight/2);
                    }
                }
            }
        }
    };

    // sets the internal (sessvars) value for the selected customer, and prints the text in the input field
    this.setSelectedCustomer = function(index) {
        var searchCustomer = $('#customerSearchTable').dataTable().fnGetData(index);
        if (searchCustomer) {
            sessvars.currentCustomer = searchCustomer;
            $("#customerInput").value = searchCustomer.firstName + " " + searchCustomer.lastName;
            customer.updateSearchFieldText();
            //customer.updateCustomerModule();
            window.$Qmatic.components.card.addCustomerCard.clearEditForm();
            this.populateEditCustomerFields("edit");
            window.$Qmatic.components.card.addCustomerCard.showEditForm();
        }
    };

    this.setEditFields = function (prefix, customer) {
        for(var customerField in customer) {
            if(customer.hasOwnProperty(customerField)) {
                if(customerField == 'properties') {
                    // Iterate over all properties
                    var value;
                    for(var property in customer['properties']) {
                        if(customer['properties'].hasOwnProperty(property)) {
                            value = customer['properties'][property];
                            switch(property) {
                                case 'firstName':
                                case 'lastName':
                                case 'phoneNumber':
                                case 'email':
                                    $("#" + prefix + property).val(value);
                                    break;
                                case 'dateOfBirth': {
                                    if(value) {
                                        var dob = value.split('-');
                                        var year = dob[0];
                                        var month = dob[1];
                                        var day = dob[2];
                                        $("#" + prefix + property + 'Month').val(month);
                                        $("#" + prefix + property + 'Month').trigger('chosen:updated');

                                        $("#" + prefix + property + 'Day').val(day);
                                        $("#" + prefix + property + 'Year').val(year);
                                    }
                                }
                                default:
                                    break;
                            }
                        }
                    }
                } else {
                    value = customer[customerField];
                    if(customerField != "id") {
                        try {
                            $("#" + prefix + customerField).val(value);
                        } finally {}
                    }
                }
            }
        }
    }

    this.populateEditAttachedCustomerFields = function (prefix, index) {
        if(typeof sessvars.state.visit !== "undefined" && sessvars.state.visit.customerIds != null) {
            // clear form to not have old values in there
            $('#' + prefix + 'CustomerForm input').val("");
            //customer might have been updated elsewhere, fetch from database before display
            var customerId = sessvars.state.visit.customerIds[index]
            sessvars.currentCustomer = spService.get("customers/"+customerId);

            this.setEditFields(prefix, sessvars.currentCustomer)
            this.setFormButtonsState('#' + prefix + 'CustomerForm', false);
        }
    }

    this.populateEditCustomerFields = function (prefix) {
        if(typeof sessvars.currentCustomer !== "undefined" && sessvars.currentCustomer != null) {
            // clear form to not have old values in there
            $('#' + prefix + 'CustomerForm input').val("");
            //customer might have been updated elsewhere, fetch from database before display
            var params = {customerId : parseInt(sessvars.currentCustomer.id)};
            sessvars.currentCustomer = spService.get("customers/"+sessvars.currentCustomer.id);

            this.setEditFields(prefix, sessvars.currentCustomer);
            this.setFormButtonsState('#' + prefix + 'CustomerForm', false);
            //window.$Qmatic.components.card.addCustomerCard.enableEditSave();
        }
    }

    this.editAndLink = function (e) {
        e.preventDefault();
        var prefix = "edit";
        var formName = "editCustomerForm";
        this.editAndSaveCustomer(prefix, formName);
        cardNavigationController.pop();
    }

    this.editAndSaveCustomer = function (prefix, formName) {
        var isUpdated = this.determineIfCustomerUpdated(formName);

        if(isUpdated) {
             this.editCustomer(prefix, false);
        }
        this.linkCustomerPressed();
    }

    this.determineIfCustomerUpdated = function (formName) {
        var serializedForm = $('#' + formName).serializeArray();
        var isUpdated = false;

        for(var i = 0; i < serializedForm.length; i++) {
            var field = serializedForm[i];
            if((field.name === 'firstName' || field.name === 'lastName') && sessvars.currentCustomer[field.name] !== field.value) {
                isUpdated = true;
                break;
            } else if ((field.name === 'email' || field.name === 'phoneNumber' || field.name === 'dobMonth' || field.name === 'dobDay' || field.name === 'dobYear') && sessvars.currentCustomer.properties[field.name] !== field.value) {
                isUpdated = true;
                break;
            }
        }
        return isUpdated;
    }

    this.setAmountOfAdditionalCustomers = function () {
        var $amountOfAdditionalCustomers = $('#amountOfAdditionalCustomers');

        if(typeof sessvars.state.visit !== "undefined" && sessvars.state.visit != null &&
            sessvars.state.visit.customerIds != null && sessvars.state.visit.customerIds.length > 1) {
                $amountOfAdditionalCustomers.text("+" + (sessvars.state.visit.customerIds.length - 1));
                $amountOfAdditionalCustomers.css("display", "");
        } else {
            $amountOfAdditionalCustomers.empty();
            $amountOfAdditionalCustomers.hide();
        }
    };

    this.saveAndLinkCustomer = function(e) {
        e.preventDefault();
        if(servicePoint.hasValidSettings() && sessvars.state.userState == servicePoint.userState.SERVING) {
            var parameterizedCustomer = parameterizeCustomer("createCustomerForm");
            if(validateCustomerForm(parameterizedCustomer.$entity)) {

                var createdCustomer = createCustomer(parameterizedCustomer);
                if(typeof createdCustomer !== "undefined") {
                    //validation ok, all fields nice and proper
                    linkCustomer(createdCustomer);

                    //$("#linkedCustomerField").html(createdCustomer.firstName + " " + createdCustomer.lastName);
                    this.setAmountOfAdditionalCustomers();
                    $('#ticketNumber').removeClass('qm-card-header__highlighted');
                    //cleanCustomerForm("create");
                    window.$Qmatic.components.card.addCustomerCard.clearAddForm();
                    cardNavigationController.pop();
                }
            }
        }
    };

    this.editCustomer = function(prefix, shouldPop) {
        var customerParameterized = parameterizeCustomer(prefix + "CustomerForm");
        if(validateCustomerForm(customerParameterized.$entity)) {

            customerParameterized.customerId = sessvars.currentCustomer.id;

			var params = servicePoint.createParams();
            params.json =jsonString(customerParameterized);
            spService.putParams("customers/"+customerParameterized.customerId, params);

            //update current customer i.e. the selected customer, NOT the linked customer
            sessvars.currentCustomer = customerParameterized.$entity;
            sessvars.currentCustomer.id = customerParameterized.customerId;

            //update linked customer field if the customer is linked to the current transaction
            var $linkedCustomerField = $("#linkedCustomerField");
            if(servicePoint.hasValidSettings(false) && sessvars.state.userState == servicePoint.userState.SERVING &&
                typeof sessvars.state.visit !== "undefined" && sessvars.state.visit != null &&
                sessvars.state.visit.customerIds != null && sessvars.state.visit.customerIds.length > 0 &&
                sessvars.state.visit.customerIds[0] == customerParameterized.customerId) {
                        $linkedCustomerField.html(customerParameterized.$entity.firstName + " " + customerParameterized.$entity.lastName);
                        $linkedCustomerField.css("display", "");
                        this.setAmountOfAdditionalCustomers();
                        $('#ticketNumber').removeClass('qm-card-header__highlighted');
            } else {
                // $linkedCustomerField.hide();
            }
            if(shouldPop === true) {
                if(sessvars.state.visit.customerIds[0] === sessvars.currentCustomer.id) {
                    var updateParams = servicePoint.createParams();
                    updateParams.customerId = sessvars.currentCustomer.id;
                    updateParams.visitId = sessvars.state.visit.id;
                    updateParams.json = '{"customers":"' + customerParameterized.$entity.firstName + ' ' + customerParameterized.$entity.lastName + '"}';
                    spService.putParams("branches/" + params.branchId + "/visits/" + sessvars.state.visit.id + "/parameters", updateParams);
                }

                cardNavigationController.pop();
            }
        }
    };

    //util functions

    var parameterizeCustomer = function(formName) {
        var customerArray = $("#" + formName).serializeArray();
        var customerParameterized = {};
        var properties = {};
        customerParameterized.properties = properties;
        for(var i = 0; i < customerArray.length; i++) {
            if(customerArray[i].name == "firstName" || customerArray[i].name == "lastName" ||
                customerArray[i].name == "id" || customerArray[i].name == "cardNumber") {
                customerParameterized[customerArray[i].name] = customerArray[i].value;
            } else {
                // First, a little special "hack" for the gender select.
                // if(customerArray[i].name == "gender" && customerArray[i].value == -1) {
                //     customerParameterized.properties[customerArray[i].name] = "";
                //     continue;
                // }
                customerParameterized.properties[customerArray[i].name] = customerArray[i].value;
            }
		}
        return {"$entity" : customerParameterized};
    };

    var createCustomer = function(parameterizedCustomer) {
		var params = servicePoint.createParams();
        params.json = jsonString(parameterizedCustomer);

		return spService.postParams("customers", params);
    };

    var shouldIncludeDob = function (prop) {
        return prop["dobMonth"] !== "-1" || prop["dobDay"] !== '' || prop["dobYear"] !== '' ? true : false;
    }

    var jsonString = function (val) {
		var main = val.$entity;
        var prop = val.$entity.properties;
        var includeDob = shouldIncludeDob(prop);

        var j = '{';
            j += '"firstName":"' + main.firstName + '","lastName":"' + main.lastName + '"'
        if (includeDob === true) {
            j +=',"properties":{"phoneNumber":"' + prop.phoneNumber + '","email":"' + prop.email + '", "dateOfBirth":"' + prop.dobYear + '-' + prop.dobMonth + '-' + prop.dobDay + '"}}';
        } else {
            j +=',"properties":{"phoneNumber":"' + prop.phoneNumber + '","email":"' + prop.email + '"}}';
        }

		return j;
    }

    //link customer stuff below

    var linkCustomer = function(customer) {
        var params = servicePoint.createParams();
        params.customerId = customer.id;
        params.visitId = sessvars.state.visit.id;
        params.json = '{"customers":"' + customer.firstName + " " + customer.lastName + '"}';
        sessvars.state = servicePoint.getState(spService.putCallback("branches/" + params.branchId + "/visits/" + params.visitId + "/customers/" + params.customerId));
        if(isFirstCustomerLinked()) {
            spService.putParams("branches/" + params.branchId + "/visits/" + params.visitId + "/parameters", params);
        }
        sessvars.statusUpdated = new Date();
        servicePoint.updateWorkstationStatus(false, true);
    };

    this.linkCustomerPressed = function() {
        if(servicePoint.hasValidSettings() && sessvars.state.userState == servicePoint.userState.SERVING) {
            if(typeof sessvars.currentCustomer !== "undefined" && sessvars.currentCustomer != null &&
                typeof sessvars.currentCustomer.id !== "undefined" && sessvars.currentCustomer.id != null &&
                typeof sessvars.currentCustomer.id === 'number') {
                linkCustomer(sessvars.currentCustomer);
                if(isFirstCustomerLinked()) {
                    $linkedCustomerField = $("#linkedCustomerField");
                    $linkedCustomerField.html(sessvars.currentCustomer.firstName + " " + sessvars.currentCustomer.lastName);
                    $linkedCustomerField.css("display", "");
                }
                this.setAmountOfAdditionalCustomers();
                $('#ticketNumber').removeClass('qm-card-header__highlighted');
                sessvars.currentCustomer = null;
                //customer.updateCustomerModule();
            }
        }
    };

    var isFirstCustomerLinked = function () {
        if(sessvars.state
            && sessvars.state.visit
            && sessvars.state.visit.customerIds
            && sessvars.state.visit.customerIds.length === 1) {
                return true;
        }
        return false;
    };

    this.updateSearchFieldText = function () {
        if(typeof sessvars.currentCustomer !== "undefined" && sessvars.currentCustomer != null) {
            $("#customerInput").val(sessvars.currentCustomer.firstName + " " +
                                    sessvars.currentCustomer.lastName);
        }
    }

    // this.updateCustomerModule = function() {
    //     $("#createCustomerLink").addClass("newCust customLink");
    //     $("#createCustomerLink").prop('disabled', false);
    //     if(typeof sessvars.currentCustomer !== "undefined" && sessvars.currentCustomer != null) {
    //         $("#customerInput").val(sessvars.currentCustomer.firstName + " " +
    //             sessvars.currentCustomer.lastName);
    //         $("#editCustomerLink").removeClass("customLinkDisabled").addClass("editCust customLink");
    //         $("#editCustomerLink").prop('disabled', false);
    //         if(servicePoint.hasValidSettings() && sessvars.state.userState == servicePoint.userState.SERVING) {
    //             $("#linkCustomerLink").removeClass("customLinkDisabled").addClass("linkCust customLink");
    //             $("#linkCustomerLink").prop('disabled', false);
    //         }
    //         $("#deleteCustomerLink").removeClass("customLinkDisabled").addClass("deleteCust customLink");
    //         $("#deleteCustomerLink").prop('disabled', false);
    //         return;
    //     }
    //     $("#customerInput").val("");
    //     $("#editCustomerLink").removeClass("customLink").addClass("editCust customLinkDisabled");
    //     $("#editCustomerLink").prop('disabled', true);
    //     $("#linkCustomerLink").removeClass("customLink").addClass("linkCust customLinkDisabled");
    //     $("#linkCustomerLink").prop('disabled', true);
    //     $("#deleteCustomerLink").removeClass("customLink").addClass("deleteCust customLinkDisabled");
    //     $("#deleteCustomerLink").prop('disabled', true);
    // };

    this.updateCustomer = function() {
        if((sessvars.state.userState == servicePoint.userState.SERVING || sessvars.state.userState == servicePoint.userState.WRAPUP) && typeof sessvars.state.visit !== "undefined" &&
            sessvars.state.visit != null) {
            if(sessvars.state.visit.parameterMap != null &&
                typeof sessvars.state.visit.parameterMap.customers != 'undefined' &&
                sessvars.state.visit.parameterMap.customers != null &&
                sessvars.state.visit.parameterMap.customers != "") {
                var $linkedCustomerField = $("#linkedCustomerField");
                $linkedCustomerField.html(sessvars.state.visit.parameterMap.customers);
                $linkedCustomerField.css("display", "");
                this.setAmountOfAdditionalCustomers();
                $('#ticketNumber').removeClass('qm-card-header__highlighted');

            } else if(typeof sessvars.state.visit.customerIds !== "undefined" &&
                sessvars.state.visit.customerIds != null && sessvars.state.visit.customerIds.length > 0) {
                var customer =spService.get("customers/"+sessvars.state.visit.customerIds[0]);
                var $linkedCustomerField = $("#linkedCustomerField");
                $linkedCustomerField.html(customer.firstName + " " + customer.lastName);
                $linkedCustomerField.css("display", "");
                this.setAmountOfAdditionalCustomers();
                $('#ticketNumber').removeClass('qm-card-header__highlighted');
            } else {
                $("#ticketNumber").addClass("qm-card-header__highlighted");
                this.setAmountOfAdditionalCustomers();
            }
        }
    };

    var validateCustomerForm = function(customer) {
        var validationError = "";
        var error = false;
        if(customer.firstName == null || customer.firstName == "") {
            error = true;
            validationError = jQuery.i18n.prop('error.first.name.mandatory');
        }
        if(customer.lastName == null || customer.lastName == "") {
            error = true;
            if(validationError == "") {
                validationError = jQuery.i18n.prop('error.last.name.mandatory');
            } else {
                validationError += ", " + jQuery.i18n.prop('error.last.name.mandatory');
            }
        }
        if(!isEmailValid(customer.properties.email)) {
            error = true;
            if(validationError == "") {
                validationError = jQuery.i18n.prop('error.validate.email');
            }
            else {
                validationError += ", " + jQuery.i18n.prop('error.validate.email');
            }
        }

        if(error) {
            util.showError(validationError);
            return false;
        }
        return true;
    };

    // position the search box (this is also used when updating the queues)
    this.positionCustomerResult = function() {
        $("#customerSearchDiv")
            .css("minWidth", $('#customerInput').outerWidth(), "width", $('#customerSearchTable').outerWidth())
            .position({
                my: "left top",
                at: "left bottom",
                of: $("#customerInput")
            });
    };

    var isEmailValid = function(emailString) {
        // Don't validate empty Strings - those are OK
        if (emailString == null || emailString == "") {
            return true;
        }

        // var p = new RegExp(".+@.+\\.[a-z]+");
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(emailString);
    };
};

