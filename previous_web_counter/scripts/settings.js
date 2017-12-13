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
transferToUserPoolEnabled = true;					// Transfer to User Pool
transferToServicePointPoolEnabled = true;			// Transfer to ServicePoint Pool
buttonTransferEnabled = true;						// Transfer button
buttonRecycleEnabled = true;						// Recycle button
buttonParkEnabled = false;							// Park Button
buttonNotesEnabled = false;							// Edit/Add Notes Button
buttonNoShowsEnabled = true;						// No Shows Button
buttonWalkDirectEnabled = true;						// Walk Direct Button
buttonRemoveFromQueueEnabled = true;				// Remove from Queue Button 
buttonTransferFromQueueEnabled = true;				// Transfer from Queue Button 
buttonCallFromQueueEnabled = false;					// Call from Queue Button 
buttonTransferFirstEnabled  = true;				// Transfer to first in Queue Button
buttonTransferLastEnabled  = true; 				// Transfer to last in Queue Button
buttonTransferSortEnabled  = true;					// Transfer Sorted in Queue Button
moduleChatEnabled = false;							// Chat Module

queueRefeshTime = 30;								// refresh time in seconds, please note that lowering this value can decrease performance


function showModules() {
	var $main = $('.qm-main');

	if (moduleCustomerEnabled == true) {
		$('#customerModule').show();
	}

	if (moduleDeliveredServicesEnabled == true) {
		$('#deliveredServicesModule').css("visibility","visible");
		$('#addDeliveredServiceLink').css("visibility","visible");
	} else {
//		$('#deliveredServicesModule').hide();
	}

	if (moduleMultiServicesEnabled == true) {
		$('#multiServicesModule').css("visibility","visible");
		$('#addMultiServiceLink').css("visibility","visible");
		if (moduleDeliveredServicesEnabled == false) {
			$('#deliveredServicesModule').hide();
		}
	} else {
		$('#multiServicesModule').hide();
	}
	
	
	if (moduleCustomMarksEnabled == true) {
		$('#customMarksModule').css("visibility","visible");
		$('#addCustomMarkLink').css("visibility","visible");
		if (moduleDeliveredServicesEnabled == false) {
			$('#deliveredServicesModule').hide();
		}
	} else {
		$('#customMarksModule').hide();
	}
	
	
	if (moduleOutcomeEnabled == true) {
		$('#selectOutcome').css("visibility","visible");
		$('#selectOutcomeLabel').css("visibility","visible");
	}
	if (moduleServicePointPoolEnabled == true) {
		$('#servicePointPoolModule').css("visibility","visible");
		var counterPool = $('#userPoolModule');
		util.poolResizeHandler(counterPool);
	} else {
		$('#servicePointPoolModule').hide();
	}
	
	if (moduleUserPoolEnabled == true) {
		$('#userPoolModule').css("visibility","visible");
		var userPool = $('#userPoolModule');
		util.poolResizeHandler(userPool);
	} else {
		$('#userPoolModule').hide();
	}

	if(moduleServicePointPoolEnabled == false && moduleUserPoolEnabled == false) {
		$main.addClass('qm-main--no-pools');
	}

	if (moduleQueuesEnabled == true) {
		$('#queuesModule').css("visibility","visible");
	} else {
		$main.addClass('qm-main--no-queues');
		$('#queuesModule').hide();
	}
	if (transferToUserPoolEnabled == false) {
		$('#transferTicketToStaffPoolDiv').hide();
		$('#transferQueueToStaffPoolDiv').hide();
	}

	if (transferToServicePointPoolEnabled == false) {
		$('#transferTicketToServicePointPoolDiv').hide();
		$('#transferQueueToServicePointPoolDiv').hide();
	}

	if (buttonTransferEnabled == true) {
		$('#transferBtn').css("visibility","visible");
	} else {
		$('#transferBtn').prop('disabled', true);
	}
	if (buttonWalkDirectEnabled == true) {
		$('#walkDirectBtn').css("visibility","visible");
	} else {
		$('#walkDirectBtn').hide();
	}

	if (buttonNoShowsEnabled == true) {
		$('#noShowBtn').css("visibility","visible");
	} else {
		$("#noShowBtn").prop('disabled', true);
	}

	if (buttonParkEnabled == true) {
		$('#parkBtn').css("visibility","visible");
	} else {
		$('#parkBtn').prop('disabled', true);
	}
	if (buttonNotesEnabled == true) {
		$('#notesBtn').css("visibility","visible");
	} else {
		$('#notesBtn').hide();
	}
	if (buttonRecycleEnabled == true) {
		$('#reinsertBtn').css("visibility","visible");
	} else {
		$('#reinsertBtn').prop('disabled', true);
	}
  
  	if (multiMarks == false) {
		$('#marksQuantityDiv').hide();
	}
	if (moduleChatEnabled == true){
		$('#chatModule').css("visibility","visible");
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
		if ( params.mdMarks != undefined) {
			moduleCustomMarksEnabled = params.mdMarks ;					// Custom Marks
		}
		if ( params.marksType != undefined) {
			customMarkTypeName = params.marksType	;					// name of the custom mark set in the admin
		}
		if ( params.multiMarks != undefined) {
			multiMarks = params.multiMarks								// feature to add a quantity for marks
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
		
		showModules();
}