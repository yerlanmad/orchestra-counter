var i18n = new function () {// helper method (that doesnt bomb) for setting innerHTML text on a html element
    var i18nQmBtn = function(elementName, propName) {
        $("#" + elementName + " span").attr("title", jQuery.i18n.prop(propName))
        i18nSafe(elementName + " span", propName)
    };
    
    
    var i18nSafe = function(elementName, propName, padding) {
        try {
            var value = propName;
            if (! (elementName == null || typeof elementName == 'undefined' ||
                propName == null || typeof propName == 'undefined') &&
                (jQuery.i18n.prop(propName))) {
                value = jQuery.i18n.prop(propName);
            }
            var element = $("#" + elementName);
            if (element != null && typeof element != 'undefined') {
                element.html(value + (typeof padding !== 'undefined' ? padding : ''));
            }
        } catch(e) {}
    };

    // prepends the i18n text to the start of the inner html string
    var i18nSafePrepend = function(elementName, propName, padding) {
        try {
            var value = propName;
            if (! (elementName == null || typeof elementName == 'undefined' ||
                propName == null || typeof propName == 'undefined') &&
                (jQuery.i18n.prop(propName))) {
                value = jQuery.i18n.prop(propName);
            }
            var element = $("#" + elementName);
            if (element != null && typeof element != 'undefined') {
                element.html(value + (typeof padding !== 'undefined' ? padding : '') + $("#" + elementName).html());
            }
        } catch(e) {}
    };

    // appends the i18n text to the end of the inner html string
    var i18nSafeAppend = function(elementName, propName, padding) {
        try {
            var value = propName;
            if (! (elementName == null || typeof elementName == 'undefined' ||
                propName == null || typeof propName == 'undefined') &&
                (jQuery.i18n.prop(propName))) {
                value = jQuery.i18n.prop(propName);
            }
            var element = $("#" + elementName);
            if (element != null && typeof element != 'undefined') {
                element.html($("#" + elementName).html() + value + (typeof padding !== 'undefined' ? padding : ''));
            }
        } catch(e) {}
    };

    var i18nSafeSelectorAppend = function (selector, propName) {
        try {
            $(selector).text(jQuery.i18n.prop(propName));
        } catch(e) {}
    };

    var i18nSafeSelectorBtnAppend = function (selector, propName) {
        try {
            $(selector).attr('title', jQuery.i18n.prop(propName));
            $(selector).text(jQuery.i18n.prop(propName));
        } catch(e) {}
    };

    this.i18nPage = function() {

        //document title in web browser header
        document.title = jQuery.i18n.prop('title.application_name');
        i18nSafeAppend("appName", 'application.counter');

        //modal login page
        i18nSafe("selectBranchModal", 'object.branch');
        i18nSafe("selectWorkstationModal", 'object.logicWorkstation');
        i18nSafe("selectProfileModal", 'object.profile');
//		i18nSafe("selectSkillModal", 'object.skill');
        i18nSafe("chooseBranch", 'field.chooseBranch');
        i18nSafe("chooseWorkstation", 'field.chooseCounter');
        i18nSafe("chooseProfile", 'field.chooseProfile');
//		i18nSafe("chooseSkill", 'field.choose');
        i18nQmBtn("confirmSettingsBtnModal", 'button.apply.settings');
        i18nQmBtn("cancelSettingsBtnModal", 'button.cancel');

        //action bar
        i18nQmBtn("walkDirectBtn", 'info.actionbar.walkIn');
        i18nQmBtn("callNextBtn", 'info.actionbar.callNext');
        i18nQmBtn("closeBtn", 'info.actionbar.closeCounter');

        //in terminal labels and selection boxes
        i18nSafe("infoServing", 'info.is.serving');
        i18nSafe("chooseProfile", 'field.chooseProfile');
        i18nSafe("infoCustomers", 'info.customers.at');
        i18nSafe("infoIn", 'info.in');
        i18nSafe("chooseProfileTerminal", 'field.choose');

        //ongoing visit information
        i18nSafe("waitingTimeDesc", 'info.waiting.time');
        i18nSafe("transactionTime", 'info.transaction.time');
        i18nSafe("chooseOutcome", "field.choose");
        i18nSafe("selectOutcomeLabel", 'info.outcomes');
        i18nSafe("noOfMarksLabel", 'info.custom.mark.quantity');
        //header links
        i18nSafe("settingsLink", 'menu.tab.settings');
        i18nSafe("logoutLink", 'button.logout');
        i18nSafe("loggedOutLink", 'button.logged.out');

        // confirm logout dialog
        i18nSafeAppend("logoutWindowHeader", "info.confirm.logout.header");
        i18nSafe("confirmLogoutLink", "info.confirm.logout.proceed");
        i18nSafe("cancelLogoutLink", "info.confirm.logout.cancel");

        //ongoing visit button
        i18nSafe("callNextLabel", 'action.next');
        i18nSafe("walkDirectLabel", 'action.walk.direct');
        i18nSafe("endVisitLabel", 'action.end.visit');
        i18nSafe("closeLabel", 'action.close');
        i18nSafe("transferLabel", 'action.transfer');
        i18nSafe("noShowLabel", 'action.noshow');
        i18nSafe("recallLabel", 'action.recall');
        i18nSafe("reinsertLabel", 'action.reinsert');
		i18nSafe("notesLabel", 'action.notes');
        //modal window headers
        i18nSafeAppend("workstationSettingsHeader", 'info.select.your.settings');
        i18nSafeAppend("changeSettingsHeader", 'info.confirm.change.profile.header');

        //confirm labels
        $("#confirmChangeProfileBtn").val(jQuery.i18n.prop('info.confirm.change.settings.confirm'));
        $("#cancelChangeProfileBtn").val(jQuery.i18n.prop('info.confirm.change.settings.cancel'));

        //walk direct form
        i18nSafeAppend("walkDirectServiceHeader", 'action.walk.direct');
        i18nSafeAppend("walkInHeader", 'info.card.header.walkin');
        i18nSafeAppend("walkInSubHeader", 'info.card.sub.header.walkin');
        i18nQmBtn("cancelWalkIn", 'button.cancel');
        
        //card details
        // Closed Card
        i18nSafe("closedCardTitle", 'info.card.closedCard.title');
        i18nSafe("closedCardSubTitle", 'info.card.closedCard.subTitle');

        // Visit Card
        i18nSafe("nextServiceLbl", 'info.card.visitCard.nextServiceLbl');
        i18nSafe("previousServiceLbl", 'info.card.visitCard.previousServiceLbl');
        i18nSafe("visitWaitingTime", 'info.waiting.time');
        i18nSafe("visitTransactionTime", 'info.transaction.time');
        i18nSafe("visitAddDsLbl", 'info.card.visitCard.addDs');
        i18nSafe("visitAddMarksLbl", 'info.card.visitCard.addMarks');
        i18nSafe("visitAddOutcomesLbl", 'info.card.visitCard.addOutcomes');
        i18nQmBtn("recallBtn", 'action.recall');
        i18nQmBtn("reinsertBtn", 'action.reinsert');
        i18nQmBtn("transferBtn", 'action.transfer');
        i18nQmBtn("parkBtn", 'action.parkBtn');
        i18nQmBtn("noShowBtn", 'action.noshow');
        i18nQmBtn("endVisitBtn", 'action.finish.visit');
        
        
        
        
         

        // Inactive Card
        i18nSafe("inactiveCardTitle", 'info.card.inactiveCard.title');
        i18nSafe("inactiveCardSubTitle", 'info.card.inactiveCard.subTitle');

        //transfer form
        i18nSafeAppend("transferServiceHeader", 'action.transfer');

        //notes form
        i18nSafe("noteLabel", 'button.add.note');

        //add and edit notes dialogue
        i18nSafeAppend("notesHeader", 'info.note');
        i18nSafe("notesModuleLabel", 'info.notes');
        i18nSafe("saveNotesBtnModal", 'button.save.notes');
        i18nSafe("cancelNotesBtnModal", 'button.cancel.save.notes');

        //chat
		i18nSafeAppend("chatModuleLabel", 'info.chat');
		i18nSafeAppend("chatPartnerHeader", 'info.chat.new.select');
		i18nSafe("chatPartnerName","info.chat.new.list");

        // outcomes
        //i18nSafe("outcomesModuleLabel", 'info.outcomes');
        i18nSafe("addOutcomeLabel", 'button.add.outcome');

//        //add marks table
//        i18nSafeAppend("addMarksHeader", 'info.marks');

        //add outcomes table
        i18nSafeAppend("addOutcomesHeader", 'info.outcomes');

        //add delivered services table
        i18nSafeAppend("addDeliveredServicesHeader", 'info.delivered.services');
		
		 // multi services 
		 i18nSafeAppend("addMultiServicesHeader", 'info.multi.services');
        i18nSafe("multiServicesModuleLabel", 'info.multi.services');
        i18nSafe("addMultiServiceLabel", 'button.add.multi.service');		
		i18nSafe("nextServicesListHeader", "action.services.list");
		i18nSafe("unServedName",'info.unserved.name');
		i18nSafe("servedName",'info.served.name');
        i18nSafe("confirmServicesBtn",'button.confirm.services');
        i18nSafe("resortServicesBtn",'button.resort.services');
		i18nSafe("selectedName",'info.selected.name');
		i18nSafe("availableName",'info.available.name');

        i18nSafe("parkLabel", 'button.park');		
		
		i18nSafeAppend("addEditServicesHeader", 'edit.multi.services');
        $("#closeServicesBtn").val(jQuery.i18n.prop('button.close.services'));
        $("#closeResortServicesBtn").val(jQuery.i18n.prop('button.close.resort.services'));

		
		// custom marks
		i18nSafeAppend("addCustomMarksHeader", 'add.custom.marks');
        i18nSafe("customMarksModuleLabel", 'info.custom.marks');
        i18nSafe("addCustomMarkLabel", 'button.add.custom.marks');		
		
	
        $("#closeServicesBtn").val(jQuery.i18n.prop('button.close.custom.marks'));
		
        // delivered services
        i18nSafe("deliveredServicesModuleLabel", 'info.delivered.services');
        i18nSafe("addDeliveredServiceLabel", 'button.add.delivered.service');

        // Service point pool
        i18nSafe("servicePointPoolModuleLabel", 'info.servicepoint.pool');

        // User pool
        i18nSafe("userPoolModuleLabel", 'info.user.pool');

        //confirm customer
        i18nSafeAppend("waitingForCustomer", "info.waiting.for.customer.header");
        i18nSafe("waitingForCustomerPrompt", "info.waiting.for.customer.prompt");
        i18nSafe("cancelCall", "info.cancel.waiting.for.customer");

        //queues module
        i18nSafe("queuesModuleLabel", "info.queues");

        //projected visits module
        i18nSafe("projectedVisitsModuleLabel", "info.projected.visits");

        //ticket list header is i18nized in script.js

        //modal dialog header for transfer queue to queue
        i18nSafeAppend("transferFromQueueHeader", "action.transfer");

        //customer module
        i18nSafe("customerModuleLabel", "customer.information");
        i18nSafe("customerInputLabel", "customer.search");
        i18nSafeAppend("createNewCustomerLabel", "customer.create");
        i18nSafeAppend("linkCustomerLabel", "customer.link.to.visit");
        i18nSafeAppend("editCustomerLabel", "customer.edit");
        i18nSafeAppend("deleteCustomerLabel", "customer.delete");

        //create customer window
        i18nSafeAppend("createCustomerHeader", "customer.create");
        i18nSafe("createFirstNameLabel", "field.firstName");
        i18nSafe("createLastNameLabel", "field.lastName");
        i18nSafe("createAddressLine1Label", "field.addressLine1");
        i18nSafe("createAddressLine2Label", "field.addressLine2");
        i18nSafe("createAddressLine3Label", "field.addressLine3");
        i18nSafe("createAddressLine4Label", "field.addressLine4");
        i18nSafe("createAddressLine5Label", "field.addressLine5");
        i18nSafe("createAddressPostCodeLabel", "field.addressPostCode");
        i18nSafe("createPhoneNumberLabel", "field.phoneNumber");
        //i18nSafe("createPhoneMobileLabel", "field.phoneMobile");
        //i18nSafe("createPhoneHomeLabel", "field.phoneHome");
        //i18nSafe("createPhoneWorkLabel", "field.phoneWork");
        i18nSafe("createEmailLabel", "field.email");
        i18nSafe("createGenderLabel", "field.gender");
        i18nSafe("createChooseGender", "field.choose");
        i18nSafe("createChooseGenderMale", "field.gender.male");
        i18nSafe("createChooseGenderFemale", "field.gender.female");
        i18nSafe("createDateOfBirthLabel", "field.dateOfBirth");
        i18nSafe("createAccountNumberLabel", "field.accountNumber");
        i18nSafe("createCardNumberLabel", "field.cardNumber");
        //buttons
        i18nSafe("saveCustomerLabel", "customer.save");
        i18nSafe("saveAndLinkCustomerLabel", "customer.saveAndLink");
        i18nSafe("cancelCreateCustomerLabel", "customer.cancel");

        //edit customer window
        i18nSafeAppend("editCustomerHeader", "customer.edit");
        i18nSafe("editFirstNameLabel", "field.firstName");
        i18nSafe("editLastNameLabel", "field.lastName");
        i18nSafe("editAddressLine1Label", "field.addressLine1");
        i18nSafe("editAddressLine2Label", "field.addressLine2");
        i18nSafe("editAddressLine3Label", "field.addressLine3");
        i18nSafe("editAddressLine4Label", "field.addressLine4");
        i18nSafe("editAddressLine5Label", "field.addressLine5");
        i18nSafe("editAddressPostCodeLabel", "field.addressPostCode");
        i18nSafe("editPhoneNumberLabel", "field.phoneNumber");
        //i18nSafe("editPhoneMobileLabel", "field.phoneMobile");
        //i18nSafe("editPhoneHomeLabel", "field.phoneHome");
        //i18nSafe("editPhoneWorkLabel", "field.phoneWork");
        i18nSafe("editEmailLabel", "field.email");
        i18nSafe("editGenderLabel", "field.gender");
        i18nSafe("editChooseGender", "field.choose");
        i18nSafe("editChooseGenderMale", "field.gender.male");
        i18nSafe("editChooseGenderFemale", "field.gender.female");
        i18nSafe("editDateOfBirthLabel", "field.dateOfBirth");
        i18nSafe("editAccountNumberLabel", "field.accountNumber");
        i18nSafe("editCardNumberLabel", "field.cardNumber");
        //buttons
        i18nSafe("editCustomerWindowLabel", "customer.save");
        i18nSafe("cancelEditCustomerWindowLabel", "customer.cancel");

        //delete customer confirmation window
        i18nSafeAppend("deleteCustomerConfirmHeader", 'customer.delete.confirm');
        i18nSafe("confirmDeleteCustomerBtn", "customer.delete");
        i18nSafe("cancelDeleteCustomerBtn", "button.cancel");

        //hijack counter window is i18nized in script.js
        i18nSafe("confirmCounterHijackingHeader",'info.confirm.counter.hijacking.header');
        i18nQmBtn("hijackYesBtnModal", 'info.confirm.counter.hijacking.yes');
        i18nQmBtn("hijackNoBtnModal", 'info.confirm.counter.hijacking.no');
        i18nSafe("hijackMessagePartOne",'info.confirm.counter.hijacking.message.part.one');
        i18nSafe("hijackMessagePartTwo",'info.confirm.counter.hijacking.message.part.two');

        //confirm customer window
        i18nSafeAppend("calledCustomerHeader", 'info.confirm.customer.header');
        i18nSafe("confirmCustomerPrompt", "info.confirm.customer.prompt");
        i18nSafe("customerArrivedYes", "info.confirm.customer.yes");
        i18nSafe("customerArrivedNo", "info.confirm.customer.no");

        //customer did not arrive window
        i18nSafeAppend("customerOptionsHeader", 'info.not.confirmed.customer.header');
        i18nSafePrepend("notConfirmedOptions", "info.not.confirmed.customer.options", " ");
        i18nQmBtn("recallOption", "info.not.confirmed.customer.options.recall", " ");
        i18nSafe("notConfirmedRecallAppendCustomer", "info.not.confirmed.customer.options.recall.append.customer");
        i18nSafe("notConfirmedRecallAppendOr", "info.not.confirmed.customer.options.recall.append.or", " ");
        i18nQmBtn("reinsertOption", "info.not.confirmed.customer.options.reinsert", " ");
        i18nSafe("notConfirmedReinsertAppendIntoQueue", "info.not.confirmed.customer.options.reinsert.append.into.queue");
        i18nSafe("notConfirmedReinsertAppendOr", "info.not.confirmed.customer.options.reinsert.append.or", " ");
        i18nSafe("callNextOption", "info.not.confirmed.customer.options.callnext", " ");
        i18nSafe("notConfirmedCallNextAppendCustomer", "info.not.confirmed.customer.options.callnext.append.customer", " ");
        i18nQmBtn("cancelOptions", "info.not.confirmed.customer.options.cancel");
        i18nQmBtn("customerOptionsCallNext", "info.not.confirmed.customer.options.callNext");
        i18nQmBtn("customerOptionBack", "info.not.confirmed.customer.options.goBack");

        //reinsert customer window
        i18nSafeAppend("reinsertCustomerWindowHeader", 'info.reinsert.customer.header');
        i18nSafe("reinsertCustomerPrompt", "info.reinsert.customer.no.customers");
        i18nSafe("reinsertCustomerConfirm", "info.reinsert.customer.confirm");
        i18nSafe("cancelReinsert", "info.reinsert.customer.cancel");
        i18nSafe("reinsertPositionInputLabel", "info.reinsert.customer.position");

        i18nSafeAppend("displayQueueSpinnerText", "info.visit.in.display.queue");
       
        // Header
        i18nSafeSelectorAppend('.qm-header__home-btn > span', 'button.home');
        i18nSafeSelectorAppend('.qm-header__help-btn > span', 'application.sr.help');
        i18nSafeSelectorAppend('.qm-header__logout-btn > span', 'button.logout');
        
        // Pool
        i18nSafeSelectorAppend('.qm-pool__toggle-btn > span', 'application.sr.toggle');

        // Popover
        i18nSafeSelectorBtnAppend('.js-popover-call > span', 'action.pool.call');
        i18nSafeSelectorBtnAppend('.js-popover-close > span', 'application.sr.close');

        //footer
        sessvars.footer = translate.msg("label.poweredBy", 
        		["Qmatic " + sessvars.systemInformation.productName + " " + sessvars.systemInformation.releaseName + " [" + sessvars.systemInformation.productVersion + "]"]);
        
        if(sessvars.systemInformation.licenseCompanyName == null || sessvars.systemInformation.licenseCompanyName == "") {
        	sessvars.footer += " " + translate.msg("label.notLicensed");
        } else {
        	sessvars.footer += " " + translate.msg("label.licensedTo", [sessvars.systemInformation.licenseCompanyName]);
        }
        $("#footerText").html(sessvars.footer);
    };
};