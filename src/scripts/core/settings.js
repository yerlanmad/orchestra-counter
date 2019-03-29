// Enable/disable functionality

moduleCustomerEnabled = true ;						// Customer information edit/selection
moduleDeliveredServicesEnabled = true;				// Delivered services Panel
moduleMultiServicesEnabled = false;					// The Multi Services Panel and Popup
moduleOutcomeEnabled = true;						// Outcomes
moduleServicePointPoolEnabled = true;				// Service Point Pool overview
moduleUserPoolEnabled = true;						// User Pool overview
moduleQueuesEnabled = true;							// Queues overview
moduleCustomMarksEnabled = false ;					// Custom Marks
customMarkTypeName = 'custom'	;					// name of the custom mark set in the admin
multiMarks = false ;								// feature to add a quantity for marks
transferToQueueEnabled = true;						// Transfer to Queue
transferToUserPoolEnabled = true;					// Transfer to User Pool
transferToServicePointPoolEnabled = true;			// Transfer to ServicePoint Pool
buttonServeMultiService = false;        // Serve multi servive direct from visit
buttonTransferEnabled = true;						// Transfer button
buttonRecycleEnabled = true;						// Recycle button
allQueuesBtnEnabled = false;						// All queues tab button
buttonParkEnabled = false;							// Park Button
buttonNotesEnabled = false;							// Edit/Add Notes Button
buttonNoShowsEnabled = true;						// No Shows Button
buttonRecallEnabled = false;						// Recall Button
buttonWrapUpEnabled = false;						// Wrap up Button
buttonWalkDirectEnabled = true;						// Walk Direct Button
buttonWalkDirectService = '';						// Default Walk Direct
buttonRemoveFromQueueEnabled = true;				// Remove from Queue Button
buttonTransferFromQueueEnabled = true;				// Transfer from Queue Button
buttonCallFromQueueEnabled = false;					// Call from Queue Button
buttonTransferFirstEnabled  = true;				// Transfer to first in Queue Button
buttonTransferLastEnabled  = true; 				// Transfer to last in Queue Button
buttonTransferSortEnabled  = true;					// Transfer Sorted in Queue Button
moduleChatEnabled = false;							// Chat Module
minTimeBetweenCalls = '';
singleSession = false;
expectedTransactionTimeEnabled = false;

queueRefreshTime = 30;								// refresh time in seconds, please note that lowering this value can decrease performance


function showModules() {
	var $main = $('.qm-main');

	if (moduleCustomerEnabled == true) {
		$('.js-add-customer').attr("style", "");
	} else {
		$('.js-add-customer').hide();
	}

	if (moduleDeliveredServicesEnabled == true) {
		$('#deliveredServicesModule').css("display", "");
	} else {
		$('#deliveredServicesModule').hide();
	}

	if (moduleMultiServicesEnabled == true) {
		$('#addMultiServiceLink').show();
		$('#nextVisitServices').css("display", "");
		$('#previousVisitServices').css("display", "");
	} else {
		$('#addMultiServiceLink').hide();
		$('#nextVisitServices').css("display", "none");
		$('#previousVisitServices').css("display", "none");
	}


	if (moduleCustomMarksEnabled == true) {
		$('#addCustomMarkLink').show();
	} else {
		$('#addCustomMarkLink').hide();
	}


	if (moduleOutcomeEnabled == true) {
		$('#selectOutcome').parent().show();
	}
	else {
		$('#selectOutcome').parent().hide();
	}
	if (moduleServicePointPoolEnabled == true) {
		$('#servicePointPoolModule').attr("style","");
		var counterPool = $('#userPoolModule');
		util.poolResizeHandler(counterPool);
	} else {
		$('#servicePointPoolModule').hide();
	}

	if (moduleUserPoolEnabled == true) {
		$('#userPoolModule').attr("style", "");
		var userPool = $('#userPoolModule');
		util.poolResizeHandler(userPool);
	} else {
		$('#userPoolModule').hide();
	}

	if(moduleServicePointPoolEnabled == false && moduleUserPoolEnabled == false) {
		$main.addClass('qm-main--no-pools');
	} else {
		$main.removeClass('qm-main--no-pools');
	}

	if (moduleQueuesEnabled == true) {
		$('#queuesModule').attr("style","");
		$main.removeClass('qm-main--no-queues');
	} else {
		$main.addClass('qm-main--no-queues');
		$('#queuesModule').hide();
	}

	if(allQueuesBtnEnabled == true) {
		$('#allQueuesTab').attr("style", "");
	} else {
		$('#allQueuesTab').hide();
	}

	if (buttonTransferEnabled == true) {
		$('#transferBtn').show();
	} else {
		$('#transferBtn').hide();
	}
	if (buttonWalkDirectEnabled == true) {
		$('#walkDirectBtn').show();
	} else {
		$('#walkDirectBtn').hide();
	}

	if (buttonNoShowsEnabled == true) {
		$('#noShowBtn').show();
	} else {
		$("#noShowBtn").hide();
	}

	if (buttonParkEnabled == true) {
		$('#parkBtn').show();
	} else {
		$('#parkBtn').hide();
	}
	if (buttonNotesEnabled == true) {
		$('.js-notes').css("display", "");
	} else {
		$('.js-notes').hide();
	}

	if (buttonWrapUpEnabled == true) {
		$("#wrapUpBtn").show();
	} else {
		$("#wrapUpBtn").hide();
	}

	if (buttonRecycleEnabled == true) {
		$('#reinsertBtn').show();
		$('#reinsertOption').show();
	} else {
		$('#reinsertBtn').hide();
		$('#reinsertOption').hide();
	}

	if (buttonRecallEnabled == true) {
		$('#recallBtn').show();
		$('#recallOption').show();
	} else {
		$('#recallBtn').hide();
		$('#recallOption').hide();
	}

	if (expectedTransactionTimeEnabled == true) {
		$('#expectedTransactionTime').show();
	} else {
		$('#expectedTransactionTime').hide();
	}

	if (buttonRecallEnabled && buttonRecycleEnabled) {
		$("#customerOptionsText").empty();
		$("<span></span>").text(jQuery.i18n.prop("info.not.confirmed.customer.options")).append(
		$("<strong></strong>").text(" " + jQuery.i18n.prop("info.not.confirmed.customer.options.recall") + " ")).append(
		$("<span></span>").text(jQuery.i18n.prop("info.not.confirmed.customer.options.recall.append.customer"))).append(
		$("<span></span>").text(" " + jQuery.i18n.prop("info.not.confirmed.customer.options.recall.append.or"))).append(
		$("<strong></strong>").text(" " + jQuery.i18n.prop("info.not.confirmed.customer.options.reinsert") + " ")).append(
		$("<span></span>").text(jQuery.i18n.prop("info.not.confirmed.customer.options.reinsert.append.into.queue"))).append(
		$("<span></span>").text(" " + jQuery.i18n.prop("info.not.confirmed.customer.options.reinsert.append.or"))).append(
		$("<strong></strong>").text(" " + jQuery.i18n.prop("info.not.confirmed.customer.options.callnext") + " ")).append(
		$("<span></span>").text(jQuery.i18n.prop("info.not.confirmed.customer.options.callnext.append.customer"))).appendTo("#customerOptionsText");

	} else if (buttonRecallEnabled) {
		$("#customerOptionsText").empty();
		$("<span></span>").text(jQuery.i18n.prop("info.not.confirmed.customer.options")).append(
		$("<strong></strong>").text(" " + jQuery.i18n.prop("info.not.confirmed.customer.options.recall") + " ")).append(
		$("<span></span>").text(jQuery.i18n.prop("info.not.confirmed.customer.options.recall.append.customer"))).append(
		$("<span></span>").text(" " + jQuery.i18n.prop("info.not.confirmed.customer.options.recall.append.or"))).append(
		$("<strong></strong>").text(" " + jQuery.i18n.prop("info.not.confirmed.customer.options.callnext") + " ")).append(
		$("<span></span>").text(jQuery.i18n.prop("info.not.confirmed.customer.options.callnext.append.customer"))).appendTo("#customerOptionsText");

	} else if (buttonRecycleEnabled) {
		$("#customerOptionsText").empty();
		$("<span></span>").text(jQuery.i18n.prop("info.not.confirmed.customer.options")).append(
		$("<strong></strong>").text(" " + jQuery.i18n.prop("info.not.confirmed.customer.options.reinsert") + " ")).append(
		$("<span></span>").text(jQuery.i18n.prop("info.not.confirmed.customer.options.reinsert.append.into.queue"))).append(
		$("<span></span>").text(" " + jQuery.i18n.prop("info.not.confirmed.customer.options.reinsert.append.or"))).append(
		$("<strong></strong>").text(" " + jQuery.i18n.prop("info.not.confirmed.customer.options.callnext") + " ")).append(
		$("<span></span>").text(jQuery.i18n.prop("info.not.confirmed.customer.options.callnext.append.customer"))).appendTo("#customerOptionsText");

	} else {
		$("#customerOptionsText").empty();
		$("<span></span>").text(jQuery.i18n.prop("info.not.confirmed.customer.options")).append(
		$("<strong></strong>").text(" " + jQuery.i18n.prop("info.not.confirmed.customer.options.callnext") + " ")).append(
		$("<span></span>").text(jQuery.i18n.prop("info.not.confirmed.customer.options.callnext.append.customer"))).appendTo("#customerOptionsText");
	}

	if (moduleChatEnabled == true){
		$('#chatModule').show();
	} else {
		$('#chatModule').hide();
	}
  }


  function setUnitTypeModules(val) {
		var params = "";
		if (val != undefined) {
			params = val.parameters;
		}
		if ( params.mdCus != undefined) {
			moduleCustomerEnabled = params.mdCus ;						// Customer information edit/selection
		}
		if ( params.mdDelServ != undefined) {
			moduleDeliveredServicesEnabled = params.mdDelServ;			// Delivered services Panel
		}
		if ( params.mdMultiServ != undefined) {
			moduleMultiServicesEnabled = params.mdMultiServ;			// The Multi Services Panel and Popup
    }
    if (params.btnServMultiServ != undefined) {
      buttonServeMultiService = params.btnServMultiServ;
    }
		if ( params.mdOutcome != undefined) {
			moduleOutcomeEnabled = params.mdOutcome;					// Outcomes
		}
		if ( params.mdServPool != undefined) {
			moduleServicePointPoolEnabled = params.mdServPool;			// Service Point Pool overview
		}
		if ( params.mdUserPool != undefined) {
			moduleUserPoolEnabled = params.mdUserPool;					// User Pool overview
		}
		if ( params.mdQueues != undefined) {
			moduleQueuesEnabled = params.mdQueues;						// Queues overview
		}
		if ( params.btnAllQueues != undefined) {
			allQueuesBtnEnabled = params.btnAllQueues;						// Show all queues
		}
		if ( params.mdMarks != undefined) {
			moduleCustomMarksEnabled = params.mdMarks ;					// Custom Marks
		}
		if ( params.marksType != undefined) {
			customMarkTypeName = params.marksType	;					// name of the custom mark set in the admin
		}
		if ( params.multiMarks != undefined) {
			multiMarks = params.multiMarks								// feature to add a quantity for marks
		}
		if ( params.trQueue != undefined ) {
			transferToQueueEnabled = params.trQueue;								// Transfer to Queue
		}
		if ( params.trUserPool != undefined) {
			transferToUserPoolEnabled = params.trUserPool;				// Transfer to User Pool
		}
		if ( params.trServPool != undefined) {
			transferToServicePointPoolEnabled = params.trServPool;		// Transfer to ServicePoint Pool
		}
		if ( params.btnTransfer != undefined) {
			buttonTransferEnabled = params.btnTransfer;					// Transfer button
		}
		if ( params.btnRecycle != undefined) {
			buttonRecycleEnabled = params.btnRecycle;					// Recycle button
		}
		if ( params.btnRecall != undefined) {
			buttonRecallEnabled = params.btnRecall;						// Recall button
		}
		if ( params.btnPark != undefined) {
			buttonParkEnabled = params.btnPark;							// Park Button
		}
		if ( params.btnNotes != undefined) {
			buttonNotesEnabled = params.btnNotes;						// Notes Button
		}
		if ( params.btnNoShows != undefined) {
			buttonNoShowsEnabled = params.btnNoShows ;					// No Shows Button
		}
		if ( params.btnWalkDirect != undefined) {
			buttonWalkDirectEnabled = params.btnWalkDirect;				// Walk Direct Button
		}
		if ( params.wdService != undefined) {
			buttonWalkDirectService = params.wdService;				// Walk Direct Default Service
		} else {
			// Reset flag in the case this property doen't exist in the utt..
			buttonWalkDirectService = "";
		}
		if ( params.btnQueueRemove != undefined) {
			buttonRemoveFromQueueEnabled = params.btnQueueRemove ;		// Remove from Queue Button
		}
		if ( params.btnQueueTransfer != undefined) {
			buttonTransferFromQueueEnabled = params.btnQueueTransfer;	// Transfer from Queue Button
		}
		if ( params.btnQueueCall != undefined) {
			buttonCallFromQueueEnabled = params.btnQueueCall ;			// Call from Queue Button
		}
		if ( params.btnTransferFirst != undefined) {
			buttonTransferFirstEnabled  = params.btnTransferFirst;		// Transfer to first in Queue Button
		}
		if ( params.btnTransferLast != undefined) {
			buttonTransferLastEnabled  = params.btnTransferLast; 		// Transfer to last in Queue Button
		}
		if ( params.btnTransferSort != undefined) {
			buttonTransferSortEnabled  = params.btnTransferSort;		// Transfer Sorted in Queue Button
		}
		if (params.mdChat != undefined){
			moduleChatEnabled = params.mdChat;
		}
		if (params.minTimeBetweenCalls != undefined){
			minTimeBetweenCalls = params.minTimeBetweenCalls;
		}

		if (params.singleSession != undefined) {
			singleSession = params.singleSession;
		} else {
			singleSession = false;
		}

		if ( params.btnWrapUp != undefined) {
			buttonWrapUpEnabled = params.btnWrapUp;
		} else {
			buttonWrapUpEnabled = false;
		}

		if ( params.expectedTransactionTimeEnabled != undefined) {
			expectedTransactionTimeEnabled = params.expectedTransactionTimeEnabled;
		} else {
			expectedTransactionTimeEnabled = false;
		}

		showModules();
}
