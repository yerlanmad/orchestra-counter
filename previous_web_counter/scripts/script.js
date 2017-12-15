var version = "5.3.16";
//
// 5.2.03 - BvD 20131118
// - Roles are now stored as global variables
// 5.2.04 - BvD 20131126
// 5.2.05 - BvD 20131205
// - Settings can be controlled from unit type
// 5.2.06 - BvD 20131210
// - IE7/IE10/IE11 compatibility
// 5.2.07 - BvD 20131216
// - Notes are not longer shown when the notes button is disabled.
// 5.2.08 - OC 20131217
// - Next etc are blocked when CFU is used.
// 5.2.09 - BvD 20140110
// 5.2.10 - BvD 20140121
// - Customer info was update (trt set to 0) if no customer could be called yet.
// - possible to hide the walk direct, no show, call from queue, remove from
// queue and transfer from queue
// 5.2.11 - BvD 20140121
// - Possible to set refresh time in settings.js
// 5.2.12 - BvD 20140122
// - Recall did not always handle the transaction time in the same way. Now the
// transaction time is always reset on recall
// 5.2.13 - BvD 20140128
// - possible to hide the different transfer option like first in queue
// 5.3.14 - BvD 20140203
// - Added improvements from 2.3.510 release
// 5.3.15 - AB 20140206
// - Added chat functionality
// - transaction time is not longer reset to zero on recall.
// 5.2.16 - BvD 20140219
// - Removed rest easy
// 5.2.17 - Petkri 20160614
// - Minor fixes client side for when the user attempts to switch branch / service point
// ---------------------------------------------------------------------------------------------------------------------------------

/**
 * This script relies on sessvars (the DOM object window.name with JSON inside +
 * some parsing utils) to store branch, workstation and profile information. Do
 * not put any kind of sensitive information in this variable; it is possible to
 * access it from other browser windows.
 * 
 * Documentation and source code for the data table model used in e.g. the walk
 * direct table: www.datatables.net
 */
var queuesUpdateNeeded = true;
var userPoolUpdateNeeded = true;
var spPoolUpdateNeeded = true;
var outcomeUpdateNeeded = true;
var delServUpdateNeeded = true;
var trtUpdateNeeded = true;
var journeyUpdateNeeded = true;
var unitMappings;

// Navigation Controllers.... modals, cards, etc
var modalNavigationController = new $Qmatic.components.NavController("#qm-modal-nav");

var servicePoint = new function () {

	var servicesLeft = false;
	var servicesList = '';
	var command = '';
	var walkTable;
	var workstationOffline = false;
	var storeNext = false;
	var confirmNeeded = false;
	var autoClose = 0;
	var displayQueueTimeout = -1;
	var displayQueueTimeoutId;
	var logoffTimer = null;

	var cfuForceSelection = false;

	// Service point states
	this.servicePointState = {
		OPEN: 'OPEN',
		CLOSED: 'CLOSED'
	};

	this.userState = {
		/** User has not started a session */
		NO_STARTED_USER_SESSION: "NO_STARTED_USER_SESSION",
		/** User has not started a session on any Service Point */
		NO_STARTED_SERVICE_POINT_SESSION: "NO_STARTED_SERVICE_POINT_SESSION",
		/** User has not set a work profile but is logged in */
		NO_PROFILE_SET: "NO_PROFILE_SET",
		/** User has started a service point session but not called any customer */
		INACTIVE: "INACTIVE",
		/**
		 * User called a customer but no customers were waiting. The next
		 * created visit will be called to the user automatically
		 */
		IN_STORE_NEXT: "IN_STORE_NEXT",
		/**
		 * User has called a customer and the customer is NOT confirmed, i.e.
		 * has NOT reached the ServicePoint
		 */
		CALLED: "CALLED",
		/** User has a confirmed customer and is currently serving that customer */
		SERVING: 'SERVING',
		/**
		 * User has served the customer and is doing some kind of wrap up
		 * activity
		 */
		WRAPUP: "WRAPUP",
		/**
		 * The current visit is not called. Most probably because of display
		 * throttling
		 */
		VISIT_NOT_CALLED: "VISIT_NOT_CALLED"
	};

	this.visitState = {
		/** Normal state for a visit. This visit can be ended */
		OK: "OK",
		// /** There is no visit that can be returned by a next visit request */
		// NO_CALLABLE_VISITS: "NO_CALLABLE_VISITS",
		/** The visit needs to be confirmed. */
		CONFIRM_NEEDED: "CONFIRM_NEEDED",
		/** The visit has a service that requires a delivered service */
		DELIVERED_SERVICE_NEEDED: "DELIVERED_SERVICE_NEEDED",
		/** The visit has a service or delivered service that requires an outcome */
		OUTCOME_NEEDED: "OUTCOME_NEEDED",
		/** The visit has a delivered service that requires an outcome */
		OUTCOME_FOR_DELIVERED_SERVICE_NEEDED: "OUTCOME_FOR_DELIVERED_SERVICE_NEEDED",
		/**
		 * The visit has a service that requires a delivered service or an
		 * outcome
		 */
		OUTCOME_OR_DELIVERED_SERVICE_NEEDED: "OUTCOME_OR_DELIVERED_SERVICE_NEEDED",
		/**
		 * User has served the customer and is doing some kind of wrap up
		 * activity
		 */
		WRAPUP: "WRAPUP",
		/**
		 * The current visit is not called. Most probably because of display
		 * throttling
		 */
		VISIT_IN_DISPLAY_QUEUE: "VISIT_IN_DISPLAY_QUEUE"
	};

	this.publicEvents = {
		VISIT_REMOVE: "VISIT_REMOVE",
		VISIT_CREATE: "VISIT_CREATE",
		VISIT_CALL: "VISIT_CALL",
		SERVICE_POINT_CLOSE: "SERVICE_POINT_CLOSE",
		RESET: "RESET",
		VISIT_CONFIRM: "VISIT_CONFIRM",
		VISIT_END: "VISIT_END",
		VISIT_NOSHOW: "VISIT_NOSHOW",
		USER_SESSION_START: "USER_SESSION_START",
		USER_SESSION_END: "USER_SESSION_END",
		VISIT_NEXT: "VISIT_NEXT",
		USER_SERVICE_POINT_SESSION_START: "USER_SERVICE_POINT_SESSION_START",
		USER_SERVICE_POINT_SESSION_END: "USER_SERVICE_POINT_SESSION_END",
		SERVICE_POINT_OPEN: "SERVICE_POINT_OPEN",
		USER_SERVICE_POINT_WORK_PROFILE_SET: "USER_SERVICE_POINT_WORK_PROFILE_SET",
		VISIT_TRANSFER_TO_QUEUE: "VISIT_TRANSFER_TO_QUEUE",
		VISIT_TRANSFER_TO_SERVICE_POINT_POOL: "VISIT_TRANSFER_TO_SERVICE_POINT_POOL",
		VISIT_TRANSFER_TO_USER_POOL: "VISIT_TRANSFER_TO_USER_POOL",
		VISIT_RECYCLE: "VISIT_RECYCLE",
		CFU_SELECTION_DONE: "CFU_SELECTION_DONE",
		UNSUPPORTED: "UNSUPPORTED"
	};

	this.SW_SERVICE_POINT = "SW_SERVICE_POINT";

	this.init = function () {
		if (!isLoggedInToWorkstation()) {
			$("#userName").html(sessvars.currentUser.userName);
			servicePoint.showSettingsWindow();
		} else {
			// $Qmatic.redux.store.dispatch($Qmatic.redux.actions.branch.selectedBranch({id: 1, name: "Sri"}));
			updateUI();
		}
	};

	var isLoggedInToWorkstation = function () {
		var isLoggedIn = false;
		if (servicePoint.hasValidSettings(false)) {
			isLoggedIn = !(sessvars.state.userState == servicePoint.userState.NO_STARTED_USER_SESSION);
		}
		return isLoggedIn;
	};

	// F5 pressed
	var updateUI = function () {
		// re-enable app shortcuts
		$('.orch-userinfo a').each(function () {
			$(this).attr({
				"disabled": false
			});
		});
		if (servicePoint.hasValidSettings(true)) {
			sessvars.state = servicePoint
				.getState(spService.get("user/status"));
			sessvars.statusUpdated = new Date();
			if (typeof sessvars.state.servicePointState === 'undefined'
				|| sessvars.state.servicePointState == null) {
				var params = servicePoint.createParams();
				var servicePointStatus = spService.get("branches/"
					+ params.branchId + "/servicePoints/"
					+ params.servicePointId);
				if (typeof servicePointStatus !== 'undefined'
					&& servicePointStatus != null
					&& typeof servicePointStatus.state !== 'undefined'
					&& servicePointStatus.state != null) {
					sessvars.state.servicePointState = servicePointStatus.state;
				}
			}
			readServicePointSettingsFromWorkstation();
			// queues will not be updated here since it is a refresh,
			servicePoint.updateWorkstationStatus(true);
			updateWorkstationSettings();

			// INIT command to qevents
			var initCmd = {
				"M": "C",
				"C": {
					"CMD": "INIT",
					"TGT": "CFM",
					"PRM": {
						"uid": "",
						"type": "60",
						"encoding": "QP_JSON"
					}
				},
				"N": "0"
			};
			initCmd.C.PRM.uid = sessvars.servicePointUnitId;
			initCmd.C.PRM.userName = sessvars.currentUser.userName;
			qevents.publish('/events/INIT', initCmd);

			// re-subscribe to events
			qevents.unsubscribe(util.asChannelStrWithUserName(sessvars.servicePointUnitId, sessvars.currentUser.userName));
			qevents.subscribe(util.asChannelStrWithUserName(sessvars.servicePointUnitId, sessvars.currentUser.userName),
				receiveEvent);

			if (!sessvars.queueTimerOn) {
				sessvars.queueTimerOn = true;
			}

			queues.updateQueues(true);
			if (typeof projectedVisits != "undefined") {
				projectedVisits.updateProjectedVisits(true);
			}
			if (moduleChatEnabled == true) {
				// chat.restoreTabs();
			}

		} else {
			clearTimeout(sessvars.queueTimer);
			sessvars.queueTimerOn = false;
			sessvars.currentUser = spService.get("user");
			$("#userName").html(sessvars.currentUser.userName);
			servicePoint.showSettingsWindow();
		}
	};

	// display modal popup with settings
	this.showSettingsWindow = function () {

		$Qmatic.components.dropdown.branchSelection.update({ no_results_text: jQuery.i18n.prop('dropdown.search.nothingFound') })
		$Qmatic.components.dropdown.counterSelection.update({ no_results_text: jQuery.i18n.prop('dropdown.search.nothingFound') })
		$Qmatic.components.dropdown.profileSelection.update({ no_results_text: jQuery.i18n.prop('dropdown.search.nothingFound') })
		$("#branchListModal").trigger("chosen:updated");
		$("#workstationListModal").trigger("chosen:updated");
		$("#prioListModal").trigger("chosen:updated");

		if (!workstationOffline
			&& servicePoint.hasValidSettings(false)
			&& !(sessvars.state.servicePointState == servicePoint.servicePointState.OPEN && servicePoint
				.isOutcomeOrDeliveredServiceNeeded())
			&& !(typeof sessvars.singleSettingsOnly !== 'undefined'
				&& sessvars.singleSettingsOnly != null && sessvars.singleSettingsOnly == true)) {

			// the user wants to change the branch, workstation or work profile
			showBranches();

			//util.showModal("settingsWindow");
			modalNavigationController.push($Qmatic.components.modal.profileSettings)
			var branchSel = $("#branchListModal");
			var workstationSel = $("#workstationListModal");
			var prioSel = $("#prioListModal");

			util.setSelect(branchSel, sessvars.branchId);
			showWorkstations(sessvars.branchId, workstationSel, prioSel);
			util.setSelect(workstationSel, sessvars.servicePointId);
			showProfiles(sessvars.branchId, sessvars.servicePointId, prioSel);
			util.setSelect(prioSel, sessvars.workProfileId);
			settingsShown = true;

		} else if (!servicePoint.hasValidSettings(false)) {
			if (showBranches()) {
				// Not logged in and multiple selection available for one or
				// many of branch, workstation and work profile
				sessvars.singleSettingsOnly = false;
				// util.showModal("settingsWindow");
				modalNavigationController.push($Qmatic.components.modal.profileSettings)
				settingsShown = true;


			} else {
				// only one of branch, workstation and work profile available
				sessvars.singleSettingsOnly = true;
				servicePoint.confirmSettings();
				// used to disable the settings link
			}
		} else {
			if (servicePoint.isOutcomeOrDeliveredServiceNeeded()) {
				util.showMessage(jQuery.i18n
					.prop('error.no.outcome.or.delivered.service'));
			} else {
				var branchSel = $("#branchListModal");
				var workstationSel = $("#workstationListModal");
				var prioSel = $("#prioListModal");
				showBranches();
				util.setSelect(branchSel, sessvars.branchId);
				showWorkstations(sessvars.branchId, workstationSel, prioSel);
				util.setSelect(workstationSel, sessvars.servicePointId);
				showProfiles(sessvars.branchId, sessvars.servicePointId, prioSel);
				util.setSelect(prioSel, sessvars.workProfileId);
				modalNavigationController.push($Qmatic.components.modal.profileSettings)
			}
		}
	};

	/**
	 * populates the branch select in the settings window
	 */
	var showBranches = function () {
		var isBranchSelectShown = false;
		var branches = spService.get("branches");
		$Qmatic.components.dropdown.branchSelection.onRemoveSingleItem()

		// We "filter" out the branches that do not have any software service
		// points
		var branches_tmp = [];
		for (var i = 0; i < branches.length; i++) {
			var params = {};
			params.branchId = parseInt(branches[i].id);
			params.deviceType = "SW_SERVICE_POINT";
			var softwareWorkstations = spService.get("branches/"
				+ params.branchId + "/servicePoints/deviceTypes/"
				+ params.deviceType);
			if (softwareWorkstations.length > 0) {
				branches_tmp.push(branches[i]);
			}
		}
		branches = branches_tmp;

		if (branches.length == 0) {
			// no branches returned
			//util.showError(jQuery.i18n.prop('error.no.branches.assigned'));
			$Qmatic.components.dropdown.branchSelection.onError(jQuery.i18n.prop('error.no.branches.assigned'))
		} else {
			var branchSelect = $("#branchListModal");

			var workstationSelect = $("#workstationListModal");
			var prioSelect = $("#prioListModal");
			util.clearSelect(branchSelect);

			util.populateSettingsSelect(branches, branchSelect);
			if (branches.length > 1) {
				branchSelect.removeAttr('disabled');
				isBranchSelectShown = true;
			} else if (branches.length == 1) {
				$Qmatic.components.dropdown.branchSelection.onSingleItem()
			} else {
				servicePoint.selectBranch(branches[0].id);
				branchSelect.attr('disabled', '');
				// if all settings are set, i.e. there is only one of each
				// branch, workstation and profile, set settings
				if (!(branchSelect.val() != -1 && workstationSelect.val() != -1 && prioSelect
					.val() != -1)) {
					isBranchSelectShown = true;
				}
			}
		}

		branchSelect.trigger("chosen:updated");

		return isBranchSelectShown;
	};

	this.selectBranch = function (branchId) {
		var selectWorkstationModal = $("#workstationListModal");
		var selectPrioModal = $("#prioListModal");

		util.clearSelect(selectWorkstationModal);
		util.clearSelect(selectPrioModal);

		selectWorkstationModal.removeAttr('disabled');
		selectPrioModal.removeAttr('disabled');

		if (branchId != -1) {
			showWorkstations(branchId, selectWorkstationModal, selectPrioModal);
			$Qmatic.components.dropdown.branchSelection.clearError()
		} else {
			$Qmatic.components.dropdown.counterSelection.onRemoveSingleItem()
			$Qmatic.components.dropdown.profileSelection.onRemoveSingleItem()
			selectWorkstationModal.attr('disabled', true);
			selectPrioModal.attr('disabled', true);
		}

		selectWorkstationModal.trigger("chosen:updated");
		selectPrioModal.trigger("chosen:updated");
	};

	// show workstations in settings window
	var showWorkstations = function (branchId, workstationSelect, prioSelect) {
		$Qmatic.components.dropdown.counterSelection.onRemoveSingleItem()
		var params = {};
		params.branchId = parseInt(branchId);
		params.deviceType = "SW_SERVICE_POINT";
		var softwareWorkstations = spService.get("branches/" + params.branchId
			+ "/servicePoints/deviceTypes/" + params.deviceType);

		if (softwareWorkstations.length == 0) {
			// no workstations returned
			// util.showError(jQuery.i18n.prop('error.no.available.counters'));
			$Qmatic.components.dropdown.counterSelection.onError(jQuery.i18n.prop('error.no.available.counters'))
			return;
		}

		util.clearSelect(workstationSelect);
		util.clearSelect(prioSelect);

		util.populateSettingsSelect(softwareWorkstations, workstationSelect);

		if (softwareWorkstations.length > 1) {
			workstationSelect.removeAttr('disabled');
		} else {
			workstationSelect.attr('disabled', '');
			$Qmatic.components.dropdown.counterSelection.onSingleItem()
			servicePoint.selectWorkstation(softwareWorkstations[0].id);
		}

		workstationSelect.trigger("chosen:updated");
		prioSelect.trigger("chosen:updated");
	};

	this.selectWorkstation = function (unitId) {
		// get the available profiles for the workstations
		var branchSelect = $("#branchListModal");
		var branchId = branchSelect.val();
		var prioSelect = $("#prioListModal");
		util.clearSelect(prioSelect);
		prioSelect.trigger("chosen:updated");
		if (unitId != "-1") {
			showProfiles(branchId, unitId, prioSelect);
			$Qmatic.components.dropdown.counterSelection.clearError()
		}
	};

	// show profiles in settings window and in status row
	var showProfiles = function (branchId, unitId, prioSelect) {
		$Qmatic.components.dropdown.profileSelection.onRemoveSingleItem()
		var params = {};
		params.branchId = parseInt(branchId);
		var profiles = spService.get("branches/" + params.branchId
			+ "/workProfiles");
		servicePoint.servicesList = spService.get("branches/" + params.branchId
			+ "/services");

		if (profiles.length == 0) {
			// no profiles returned
			// util.showError(jQuery.i18n.prop("error.no.available.profiles"));
			$Qmatic.components.dropdown.profileSelection.onError(jQuery.i18n.prop('error.no.available.profiles'))
			return;
		}
		util.clearSelect(prioSelect);

		util.populateSettingsSelect(profiles, prioSelect);

		if (profiles.length > 1) {
			prioSelect.removeAttr('disabled');
		} else {
			prioSelect.attr('disabled', '');
			$Qmatic.components.dropdown.profileSelection.onSingleItem()
		}

		prioSelect.trigger("chosen:updated");

		// add for skill based profiles
		/*
		 * if (skillEnabled == true) { skills.getServicePointSkill(unitId); }
		 */
	};

	this.selectProfile = function (val) {
		if (val != "-1") {
			$Qmatic.components.dropdown.profileSelection.clearError()
		}
	}

	this.confirmSettings = function (warnUser) {
		var isHijacking = false;
		var branchSel = $("#branchListModal");
		var workstationSel = $("#workstationListModal");
		var profileSel = $("#prioListModal");
		if (sessvars.singleSettingsOnly) {
			modalNavigationController.popAllModals()
		} else {
			if (hasValidDropboxSettings(branchSel, workstationSel, profileSel)) {
				var settings = getSettings(branchSel, workstationSel, profileSel);
				if (typeof warnUser === "undefined") {
					warnUser = true;
				}
				isHijacking = confirm(warnUser, settings);
			}
		}
		return isHijacking;
	};

	var confirm = function (warnUser, settings) {
		var isHijacking = false;

		var wantedWorkstation = spService.get("branches/" + settings.branchId
			+ "/servicePoints/" + settings.servicePointId);

		if (typeof wantedWorkstation !== 'undefined'
			&& null != wantedWorkstation) {
			if (warnUser) {
				isHijacking = isHijack(wantedWorkstation, settings);
			}
			if (!isHijacking) {
				// unsubscribe to events for old unit id if changed to avoid
				// being thrown out
				if (typeof sessvars.servicePointUnitId !== 'undefined' && sessvars.servicePointUnitId != null
					&& sessvars.servicePointUnitId != wantedWorkstation.unitId) {
					unsubscribeAndDisableQueues();
				}
				if (isApplied(settings)) {
					servicePoint.storeSettingsInSession(settings);
					setProfile(servicePoint.createParams());
					updateUI();
				} else {
					//util.showModal('settingsWindow');
					modalNavigationController.pop()
				}
			}
		}
		return isHijacking;
	};

	var isHijack = function (wantedWorkstation, params) {
		var isHijacking = false;
		if (null != wantedWorkstation.state
			&& wantedWorkstation.state != servicePoint.servicePointState.CLOSED) {
			var currentUser = spService.get("user");
			var usersOnWantedServicePoint = spService.get("branches/"
				+ params.branchId + "/servicePoints/"
				+ params.servicePointId + "/users");
			if (usersOnWantedServicePoint != null
				&& usersOnWantedServicePoint.length > 0
				&& usersOnWantedServicePoint[0].id != currentUser.id) {
				// the user wants to login to an occupied counter; display
				// warning message.
				//modalNavigationController.popModal($Qmatic.components.modal.profileSettings);
				// util.hideModal("settingsWindow");
				//util.showModal("confirmCounterHijackingWindow");
				$Qmatic.components.modal.hijack.updateLoggedInUser(usersOnWantedServicePoint[0].userName)
				modalNavigationController.push($Qmatic.components.modal.hijack)
				isHijacking = true;
			}
		}
		return isHijacking;
	};

	this.closeHijackModal = function () {
		// or modalNavigationController.pop()
		modalNavigationController.popModal($Qmatic.components.modal.hijack)
	}

	this.claseAllModals = function () {
		modalNavigationController.popAllModals()
	}

	var unsubscribeAndDisableQueues = function () {
		// end event subscription and clear queue timer
		if (servicePoint.hasValidSettings(false)) {
			qevents.unsubscribe(util.asChannelStrWithUserName(sessvars.servicePointUnitId, sessvars.currentUser.userName));
			clearTimeout(sessvars.queueTimer);
			sessvars.queueTimerOn = false;
		}
	};

	var isApplied = function (settings) {
		var isApplied = false;
		if (typeof sessvars.currentUser === 'undefined'
			|| sessvars.currentUser == null) {
			sessvars.currentUser = spService.get("user");
		}
		if (typeof sessvars.currentUser !== 'undefined'
			&& sessvars.currentUser.hasOwnProperty("userName")) {
			settings.userName = sessvars.currentUser.userName;

			// start user session. Set profile and update status if all went
			// well
			if (startUserSession(settings)) {
				modalNavigationController.popModal($Qmatic.components.modal.profileSettings);
				// util.hideModal("settingsWindow");
				isApplied = true;
			}
		}
		return isApplied;
	};

	this.cancelConfirmSettings = function () {
		var branchSel = $("#branchListModal");
		util.clearSelect(branchSel);
		var workstationSel = $("#workstationListModal");
		util.clearSelect(workstationSel);
		var prioSel = $("#prioListModal");
		util.clearSelect(prioSel);
		util.hideModal('settingsWindow');

		if (servicePoint.hasValidSettings()) {
			modalNavigationController.popModal($Qmatic.components.modal.profileSettings)
		} else {
			util.goToModulesPage()
			servicePoint.handleHome()
		}
	};

	this.changeProfile = function (value) {
		if (value != -1 && value != sessvars.workProfileId) {
			if (servicePoint.hasValidSettings()) {
				if (servicePoint.isOutcomeOrDeliveredServiceNeeded()) {
					return;
				}
			}
			util.showModal("changeProfileConfirmWindow");
		}
	};

	// set new profile
	this.changeSettings = function () {
		// Create params and set new values in sessvars
		var profileSel = $("#prioList");
		if (util.validateProfile(profileSel)) {
			sessvars.workProfileId = parseInt(profileSel.val());
			sessvars.profileName = $("option:selected", profileSel).text();
			var params = servicePoint.createParams();
			setProfile(params);
			if (typeof sessvars.state.servicePointState === 'undefined'
				|| sessvars.state.servicePointState == null
				|| sessvars.state.servicePointState == servicePoint.servicePointState.CLOSED) {
				confirm(true, params);
			}
			servicePoint.updateWorkstationStatus(false);
			sessvars.currentCustomer = null;
			customer.updateCustomerModule();
			updateWorkstationSettings();
			util.hideModal("changeProfileConfirmWindow");
			util.showMessage(jQuery.i18n.prop('info.changed.settings.success')
				+ ': ' + sessvars.branchName + ', '
				+ sessvars.servicePointName + ', ' + sessvars.profileName);

			/* update projected visits */
			if (typeof projectedVisits !== undefined) {
				projectedVisits.updateProjectedVisits(true);
			}

		}
	};

	this.cancelChangeSettings = function () {
		updateWorkstationSettings();
		util.hideModal("changeProfileConfirmWindow");
	};

	this.noShow = function () {
		if (servicePoint.hasValidSettings()
			&& sessvars.state.userState == servicePoint.userState.SERVING
			&& sessvars.state.visit.noshowAllowed) {
			var params = servicePoint.createParams();
			params.visitId = sessvars.state.visit.id;
			sessvars.state = servicePoint.getState(spService
				.putCallback("branches/" + params.branchId + "/visits/"
				+ params.visitId + "/noshow"));
			sessvars.statusUpdated = new Date();
			sessvars.cfuSelectionSet = true;
			servicePoint.updateWorkstationStatus(false);
			sessvars.currentCustomer = null;
			customer.updateCustomerModule();
		}
	};

	this.recall = function () {
		if (servicePoint.hasValidSettings()
			&& sessvars.state.userState == servicePoint.userState.SERVING
			&& sessvars.state.visit.recallAllowed) {
			var params = servicePoint.createParams();
			sessvars.state = servicePoint.getState(spService
				.putCallback("branches/" + params.branchId
				+ "/servicePoints/" + params.servicePointId
				+ "/visit/recall"));
			sessvars.statusUpdated = new Date();
			delServUpdateNeeded = false;
			outcomeUpdateNeeded = false;
			spPoolUpdateNeeded = false;
			userPoolUpdateNeeded = false;
			queuesUpdateNeeded = false;
			journeyUpdateNeeded = false;
			trtUpdateNeeded = false;
			servicePoint.updateWorkstationStatus();
		}
	};

	var setProfile = function (params) {
		sessvars.state = servicePoint.getState(spService.put('branches/'
			+ params.branchId + '/users/' + params.userName
			+ '/workProfile/' + params.workProfileId));
		sessvars.statusUpdated = new Date();
	};

	// multi services add/edit

	this.addMultiServicePressed = function () {

		var len = sessvars.state.visit.unservedVisitServices.length;
		var len1 = sessvars.state.visit.servedVisitServices.length;
		var select = document.getElementById("addEditServicesBox");
		while (select.length > 0) { // clear current list
			select.remove(select.length - 1);
		}

		for (i = 0; i < len; i++) {
			var opt = document.createElement("option");
			opt.text = sessvars.state.visit.unservedVisitServices[i].serviceInternalName;
			opt.value = sessvars.state.visit.unservedVisitServices[i].id;
			try {
				select.add(opt, null); // standards compliant; doesn't work in
				// IE
			} catch (ex) {
				select.add(opt); // IE only
			}
		}

		var select = document.getElementById("listServicesBox");
		while (select.length > 0) {// clear current list
			select.remove(select.length - 1);
		}

		for (i = 0; i < servicePoint.servicesList.length; i++) {

			var found = 0;
			for (j = 0; j < len; j++) {
				if (servicePoint.servicesList[i].id == sessvars.state.visit.unservedVisitServices[j].serviceId) {
					found = 1; // do not show this service in the list
				}
			}

			for (j = 0; j < len1; j++) {
				if (servicePoint.servicesList[i].id == sessvars.state.visit.servedVisitServices[j].serviceId) {
					found = 1; // do not show this service in the list
				}
			}
			if (servicePoint.servicesList[i].id == sessvars.state.visit.currentVisitService.serviceId) {
				found = 1; // do not show this service in the list
			}
			if (found == 0) {
				var opt = document.createElement("option");
				opt.value = servicePoint.servicesList[i].id;
				opt.text = servicePoint.servicesList[i].internalName;

				try {
					select.add(opt, null); // standards compliant; doesn't work
					// in IE
				} catch (ex) {
					select.add(opt); // IE only
				}

			}
		}

		util.showModal('addEditServicesDialogue');
	};

	this.addService = function () {
		if (listServicesBox.options[listServicesBox.selectedIndex].value != undefined) {
			var addServiceId = listServicesBox.options[listServicesBox.selectedIndex].value;
			addParams = servicePoint.createParams();
			addParams.branchId = sessvars.branchId;
			addParams.visitId = sessvars.state.visit.id;
			addParams.serviceId = addServiceId;
			sessvars.state = spService.post("branches/" + addParams.branchId
				+ "/visits/" + addParams.visitId + "/services/"
				+ addParams.serviceId);
			sessvars.statusUpdated = new Date();
			servicePoint.updateWorkstationStatus();
			servicePoint.addMultiServicePressed();
		}
	};

	this.removeService = function () {
		if (addEditServicesBox.options[addEditServicesBox.selectedIndex].value != undefined) {
			var removeServiceId = addEditServicesBox.options[addEditServicesBox.selectedIndex].value;
			removeParams = servicePoint.createParams();
			removeParams.branchId = sessvars.branchId;
			removeParams.visitId = sessvars.state.visit.id;
			removeParams.visitServiceId = removeServiceId;
			var returnInfo = spService.del("branches/" + removeParams.branchId
				+ "/visits/" + removeParams.visitId + "/services/"
				+ removeParams.visitServiceId);
			if (returnInfo != undefined) {
				sessvars.state = returnInfo;
				sessvars.statusUpdated = new Date();
				servicePoint.updateWorkstationStatus();
				servicePoint.addMultiServicePressed();
			}
		}
	};

	this.closeResortServices = function () {
		servicePoint.getQueuesAndService();
	};

	this.getQueuesAndService = function () {
		// currently not used, todo.
		sortParams = servicePoint.createParams();
		sortParams.branchId = sessvars.branchId;
		var queues = spService.get("branches/" + sortParams.branchId
			+ "/queues");
		sortParams.name = "queueAndServices";
		var returnInfo = spService.get("branches/" + sortParams.branchId
			+ "/variables/" + sortParams.name);
		var t = returnInfo.split('|');
		var len = sessvars.state.visit.unservedVisitServices.length;
		var listId = '';
		var listTime = '';

		for (i = 0; i < len; i++) {
			var s = sessvars.state.visit.unservedVisitServices[i].serviceId;
			var q;
			var r;

			// find the queue belonging to this service according to the value
			// in branch variable queueAndServices
			for (j = 0; j < t.length; j++) {
				var x = t[j].split(" ");
				for (k = 1; k < x.length; k++) {
					if (x[k] == s) {
						q = x[0]; // queue belonging to this service
					}
				}
			}

			// find the waiting time for that queue
			for (l = 0; l < queues.length; l++) {

				if (queues[l].id == q) {
					r = queues[l].waitingTime;
					// t=queues[l].customersWaiting //could do the same based on
					// waiting customers
				}
			}
			if (listId == '') {
				listId = sessvars.state.visit.unservedVisitServices[i].id;
				listTime = r;
			} else {
				listId += ","
					+ sessvars.state.visit.unservedVisitServices[i].id;
				listTime += "," + r;
			}
		}

		// lets resort the list according to above found values
		// example 284,286,287,288,289 - 12132,0,12119,12135,0

		listId = listId.split(",");
		listTime = listTime.split(",");
		var sortedId = "";
		var sortesValue = "";

		for (i = 0; i < listId.length; i++) {
			if (sortedId == "") {
				sortedId = listId[0];
				sortestValue = listTime[0];
			} else {
				if (sortestValue > parseInt(listTime[i])) {
					sortedId = listId[i] + "," + sortedId;
					sortestValue = listTime[i];
				} else {
					sortedId = sortedId + "," + listId[i];
				}
			}
		}
	};

	this.sortServices = function (value) {
		sessvars.state = value;
		sessvars.statusUpdated = new Date();
		servicePoint.updateWorkstationStatus();
		servicePoint.addMultiServicePressed();
		util.hideModal("addEditServicesDialogue");
	};

	this.closeServices = function () {
		util.hideModal("addEditServicesDialogue");
	};

	// commands like next needs to be checked for multi service to show popup.

	this.checkServicesLeft = function (command) {
		this.command = command;
		if (this.servicesLeft == true && moduleMultiServicesEnabled == true) {
			var len = sessvars.state.visit.unservedVisitServices.length;
			$("#nextServices").find("tr:gt(0)").remove();
			for (i = 0; i < len; i++) {
				var s = '';
				if (i % 2 == 1) {
					s += '<tr class="even">';
				} else {
					s += '<tr class="odd">';
				}

				s += '<td align="center">'
					+ sessvars.state.visit.unservedVisitServices[i].serviceInternalName
					+ '</td>';
				s += '</tr>';
				$('#nextServices').append(s);
			}
			util.showModal("nextServicesDialogue");
		} else {
			this.executeCommand();
		}
	};

	this.executeCommand = function () {

		if (servicePoint.command == 'callNext') {
			servicePoint.callNext();
		}
		if (servicePoint.command == 'walkDirectPressed') {
			servicePoint.walkDirectPressed();
		}
		if (servicePoint.command == 'endVisitPressed') {
			servicePoint.endVisitPressed();
		}
		if (servicePoint.command == 'handleClose') {
			servicePoint.handleClose();
		}
	};

	// pop-up with info where customer to go next.
	this.resortServices = function () {
		util.hideModal("nextServicesDialogue");
	};

	this.confirmServices = function () {
		this.executeCommand();
		util.hideModal("nextServicesDialogue");

	};

	this.callNext = function () {
		var params = servicePoint.createParams();
		if (servicePoint.hasValidSettings()
			&& !(servicePoint.isOutcomeOrDeliveredServiceNeeded() || sessvars.state.visitState == servicePoint.visitState.CONFIRM_NEEDED)) {
			sessvars.state = servicePoint.getState(spService.post("branches/"
				+ params.branchId + "/servicePoints/"
				+ params.servicePointId + "/visits/next"));
			sessvars.statusUpdated = new Date();
			if (sessvars.state.visitState == "CALL_NEXT_TO_QUICK") {
				util.showError(jQuery.i18n.prop("info.call.next.to.quick"));
			} else {
				// TODO: Calling should always start a user service point
				// session if none is started, implement in connectors
				if (sessvars.state.userState == servicePoint.userState.NO_STARTED_SERVICE_POINT_SESSION) {
					// the service point will be closed after application login
					// since it's a single session service point
					sessvars.state = servicePoint.getState(spService
						.putCallback("branches/" + params.branchId
						+ "/servicePoints/" + params.servicePointId
						+ "/users/" + params.userName));
					sessvars.statusUpdated = new Date();
					servicePoint.updateWorkstationStatus();
					sessvars.state = servicePoint.getState(spService
						.post("branches/" + params.branchId
						+ "/servicePoints/" + params.servicePointId
						+ "/visits/next"));
					sessvars.statusUpdated = new Date();
				} else if (sessvars.state.servicePointState == servicePoint.servicePointState.OPEN
					&& sessvars.state.visit == null) {
					// no tickets left in the queue(s) for the selected prio
					util.showMessage(jQuery.i18n
						.prop("info.no.waiting.customers"));

					// NEW 20131203. Send APPLICATION event
					var noCustWaitingEvent = {
						"M": "E",
						"E": {
							"evnt": "NO_CUSTOMERS_WAITING",
							"type": "APPLICATION",
							"prm": {}
						}
					};
					noCustWaitingEvent.E.prm.uid = sessvars.servicePointUnitId
						+ ":" + this.SW_SERVICE_POINT;
					qevents.publish('/events/APPLICATION', noCustWaitingEvent);
				}
				servicePoint.updateWorkstationStatus();
				sessvars.currentCustomer = null;
				customer.updateCustomerModule();
			}
		}
	};

	this.customerConfirmed = function () {
		// util.hideModal("confirmCustomer");
		modalNavigationController.popModal($Qmatic.components.modal.confirmCustomer)
		if (servicePoint.hasValidSettings()) {
			var params = servicePoint.createParams();
			params.visitId = sessvars.state.visit.id;
			sessvars.state = servicePoint.getState(spService
				.putCallback("branches/" + params.branchId + "/visits/"
				+ params.visitId + "/confirm"));
			sessvars.statusUpdated = new Date();
			servicePoint.updateWorkstationStatus();
		}
	};

	this.customerNotConfirmed = function () {
		// util.hideModal("confirmCustomer");
		if (servicePoint.hasValidSettings()) {
			// util.showModal("customerOptionsDialogue");
			modalNavigationController.push($Qmatic.components.modal.customerOptions)
		}
	};

	this.closeConfirmWindow = function () {
		// util.hideModal("confirmCustomer");
		modalNavigationController.popModal($Qmatic.components.modal.confirmCustomer)
		if (servicePoint.hasValidSettings()) {
			servicePoint.noShow();
		}
	};

	this.cancelCustomerOptionsDialogue = function () {
		util.hideModal("customerOptionsDialogue");
		if (servicePoint.hasValidSettings()) {
			servicePoint.noShow();
		}
	};

	/*
	 * Recycle really.
	 */
	this.reinsertClicked = function () {
		if (sessvars.state.visitState == servicePoint.visitState.CONFIRM_NEEDED) {
			util.hideModal("customerOptionsDialogue");
		}
		if (servicePoint.hasValidSettings()
			&& sessvars.state.userState == servicePoint.userState.SERVING
			&& sessvars.state.visit.recycleAllowed) {
			sessvars.cfuSelectionSet = true;
			servicePoint.reinsertCustomer();
		}
	};

	this.reinsertCustomer = function () {
		if (servicePoint.hasValidSettings()) {
			var params = servicePoint.createParams();
			sessvars.state = servicePoint.getState(spService
				.putCallback("branches/" + params.branchId
				+ "/servicePoints/" + params.servicePointId
				+ "/visit/recycle"));
			sessvars.statusUpdated = new Date();

			spPoolUpdateNeeded = false;
			userPoolUpdateNeeded = false;
			queuesUpdateNeeded = false;

			servicePoint.updateWorkstationStatus();
			sessvars.currentCustomer = null;
			customer.updateCustomerModule();
		}
	};

	this.cancelReinsertCustomer = function () {
		util.hideModal("reinsertCustomerWindow");
		if (sessvars.state.visitState == servicePoint.visitState.CONFIRM_NEEDED) {
			util.showModal("customerOptionsDialogue");
		}
	};

	this.cancelWaitingForVisit = function () {
		if (servicePoint.hasValidSettings()
			&& sessvars.state.userState == servicePoint.userState.IN_STORE_NEXT) {
			var params = servicePoint.createParams();
			sessvars.state = servicePoint.getState(spService
				.putCallback("branches/" + params.branchId
				+ "/servicePoints/" + params.servicePointId
				+ "/visit/cancelWait"));
			sessvars.statusUpdated = new Date();
			servicePoint.updateWorkstationStatus();
		}
		//util.hideModal("waitingForCustomerDialogue");
		modalNavigationController.popModal($Qmatic.components.modal.storeNext)
	};

	this.walkDirectPressed = function () {
		if (servicePoint.hasValidSettings()
			&& !(servicePoint.isOutcomeOrDeliveredServiceNeeded())/*
																		 * !(sessvars.state.userState ==
																		 * servicePoint.userState.SERVING &&
																		 * sessvars.forceMark &&
																		 * !hasMark())
																		 */) {

			util.showModal("walks");
			if (typeof walkTable === "undefined") {
				var columns = [
				/* Service ext name */{
						"bSearchable": false,
						"bVisible": false,
						"mDataProp": "externalName"
					},
				/* Service int name */{
						"sClass": "firstColumn",
						"mDataProp": "internalName"
					},
				/* Service id */{
						"bSearchable": false,
						"bVisible": false,
						"mDataProp": "id"
					},
				/* Service int desc */{
						"sClass": "lastColumn",
						"mDataProp": "internalDescription"
					},
				/* Service ext desc */{
						"bSearchable": false,
						"bVisible": false,
						"mDataProp": "externalDescription"
					}];
				var t = new Date();
				var url = "/rest/servicepoint/branches/" + sessvars.branchId
					+ "/services?call=" + t;
				var headerCallback = function (nHead, aasData, iStart, iEnd,
					aiDisplay) {
					nHead.style.borderBottom = "1px solid #c0c0c0";
					nHead.getElementsByTagName('th')[0].innerHTML = jQuery.i18n
						.prop('info.service.name');
					nHead.getElementsByTagName('th')[1].innerHTML = jQuery.i18n
						.prop('info.service.description');
				};
				var rowCallback = function (nRow, aData, iDisplayIndex) {
					/* Set onclick action */
					nRow.onclick = walkServiceClicked;
					return nRow;
				};
				walkTable = util.buildTableJson({
					"tableId": "walkDirectServices",
					"url": url,
					"rowCallback": rowCallback,
					"columns": columns,
					"filter": true,
					"headerCallback": headerCallback,
					"scrollYHeight": "300px",
					"infoFiltered": "info.filtered.fromEntries"
				});
			}
			var sorting = [[1, 'asc']];
			walkTable.fnSort(sorting);
		}
	};

	this.endVisitPressed = function () {
		if (servicePoint.hasValidSettings()
			&& sessvars.state.userState == servicePoint.userState.SERVING
			&& !servicePoint.isOutcomeOrDeliveredServiceNeeded()) {
			var params = servicePoint.createParams();
			params.visitId = sessvars.state.visit.id;
			sessvars.state = servicePoint.getState(spService
				.putCallback("branches/" + params.branchId + "/visits/"
				+ params.visitId + "/end"));
			sessvars.statusUpdated = new Date();
			spPoolUpdateNeeded = false;
			userPoolUpdateNeeded = false;
			queuesUpdateNeeded = false;

			servicePoint.updateWorkstationStatus();
			sessvars.currentCustomer = null;
			customer.updateCustomerModule();
		}
	};

	this.handleClose = function () {
		if (servicePoint.hasValidSettings()
			&& sessvars.state.servicePointState == servicePoint.servicePointState.OPEN
			&& !(servicePoint.isOutcomeOrDeliveredServiceNeeded())/*
																		 * !(sessvars.state.userState ==
																		 * servicePoint.userState.SERVING &&
																		 * sessvars.forceMark &&
																		 * !hasMark())
																		 */) {
			servicePoint.endVisitPressed();
			servicePoint.endUserServicePointSession();
			spPoolUpdateNeeded = false;
			userPoolUpdateNeeded = false;
			queuesUpdateNeeded = false;

			servicePoint.updateWorkstationStatus();
			sessvars.currentCustomer = null;
			customer.updateCustomerModule();
		}
	};

	var walkServiceClicked = function () {
		if (servicePoint.hasValidSettings()) {
			var walkParams = servicePoint.createParams();

			var serviceIdArray = [];
			serviceIdArray[0] = walkTable.fnGetData(this).id;
			walkParams.json = '{"services":[' + serviceIdArray + ']}'; // service
			// id
			spPoolUpdateNeeded = false;
			userPoolUpdateNeeded = false;
			queuesUpdateNeeded = false;
			sessvars.state = servicePoint.getState(spService
				.postParams("branches/" + walkParams.branchId
				+ "/servicePoints/" + walkParams.servicePointId
				+ "/visits", walkParams));
			if (sessvars.state.visitState != "CALL_NEXT_TO_QUICK") {
				sessvars.statusUpdated = new Date();
			}
			if (sessvars.state.userState == servicePoint.userState.NO_STARTED_USER_SESSION) {
				if (startUserSession(servicePoint.createParams())) {
					sessvars.state = servicePoint.getState(spService
						.postParams("branches/" + walkParams.branchId
						+ "/servicePoints/"
						+ walkParams.servicePointId + "/visits",
						walkParams));
					if (sessvars.state.visitState != "CALL_NEXT_TO_QUICK") {
						sessvars.statusUpdated = new Date();
					}
				} else {
					util.hideModal("walks");
					return;
				}
			}
			if (sessvars.state.userState == servicePoint.userState.NO_STARTED_USER_SESSION) {
				util.showError(jQuery.i18n.prop("error.not.loggedin"));
				util.hideModal("walks");
				clearOngoingVisit();
				$("#closeBtn").toggleClass("customButtonSmallDisabled");
				$("#closeBtn").prop('disabled', true);
				return;
			}
			if (!sessvars.state.servicePointState == servicePoint.servicePointState.OPEN) {
				util.hideModal("walks");
				sessvars.state = servicePoint.getState(spService
					.putCallback("branches/" + walkParams.branchId
					+ "/servicePoints/" + walkParams.servicePointId
					+ "/users/" + walkParams.userName));
				spPoolUpdateNeeded = false;
				userPoolUpdateNeeded = false;
				queuesUpdateNeeded = false;
				sessvars.state = servicePoint.getState(spService.postParams(
					"branches/" + walkParams.branchId + "/servicePoints/"
					+ walkParams.servicePointId + "/visits",
					walkParams));
				if (sessvars.state.visitState == "CALL_NEXT_TO_QUICK") {
					sessvars.statusUpdated = new Date();
					sessvars.currentCustomer = null;
					servicePoint.updateWorkstationStatus();
				}
			} else if (sessvars.state.servicePointState == servicePoint.servicePointState.OPEN
				|| sessvars.state.userState == servicePoint.userState.SERVING) {
				util.hideModal("walks");
				if (sessvars.state.visitState != "CALL_NEXT_TO_QUICK") {
					sessvars.currentCustomer = null;
					spPoolUpdateNeeded = false;
					userPoolUpdateNeeded = false;
					queuesUpdateNeeded = false;
					servicePoint.updateWorkstationStatus();
				}
			}
			if (sessvars.state.visitState == "CALL_NEXT_TO_QUICK") {
				util.showError(jQuery.i18n.prop("info.call.next.to.quick"));
			}
		}
	};

	this.hideWalks = function () {
		util.hideModal("walks");
	};

	this.notesPressed = function () {
		if (isNotesButtonEnabled()) {
			util.showModal("notesDialogue");
		}
	};

	var isNotesButtonEnabled = function () {
		return $('#notesBtn[class*=Disabled]').length == 0;
	};

	this.hideNotes = function () {
		util.hideModal("notesDialogue");
	};

	this.saveNotes = function () {
		util.hideModal("notesDialogue");
		var newNotes = document.getElementById("notesEdit").value;
		var params = {};
		params.branchId = sessvars.branchId;
		params.visitId = sessvars.state.visit.id;
		params.$entity = {
			'custom1': newNotes
		};
		params.json = '{"custom1":"' + newNotes + '"}';
		newNotes = spService.putParams("branches/" + params.branchId + "/visits/"
			+ params.visitId + "/parameters", params);

		if (newNotes !== null) {
			document.getElementById("notesMessage").innerHTML = newNotes.parameterMap.custom1;
		} else {
			document.getElementById("notesMessage").innerHTML = "";
		}
	};

	this.endUserServicePointSession = function () {
		if (servicePoint.hasValidSettings()
			&& sessvars.state.servicePointState == servicePoint.servicePointState.OPEN
			&& !(servicePoint.isOutcomeOrDeliveredServiceNeeded())/*
																		 * && !(
																		 * sessvars.state.userState ==
																		 * this.SERVING &&
																		 * sessvars.forceMark &&
																		 * !hasMark() )
																		 */) {
			try {
				var params = servicePoint.createParams();
				sessvars.state = servicePoint.getState(spService
					.del("branches/" + params.branchId + "/servicePoints/"
					+ params.servicePointId + "/users/"
					+ params.userName));

				sessvars.statusUpdated = new Date();
			} catch (ex) {
				util.showError(jQuery.i18n.prop("error.close") + ": " + ex);
				return false;
			}
		}
	};

	var startUserSession = function (params) {
		var isUserSessionStarted = false;
		try {
			var newState = servicePoint.getState(spService.putCallback("branches/" + params.branchId
				+ "/servicePoints/" + params.servicePointId + "/users/"
				+ params.userName));
			// validate that state was set correctly for e.g. branch id, service point id etc
			if (newState.servicePointState == servicePoint.servicePointState.OPEN &&
				newState.branchId == params.branchId && newState.servicePointId == params.servicePointId) {
				isUserSessionStarted = true;
				sessvars.state = newState;
				sessvars.statusUpdated = new Date();
			}
		} catch (ex) {
			util.showError(translate.msg('error.no.login', [ex]));
		}
		return isUserSessionStarted;
	};

	/**
	 * Updates the workstation status in case of user refresh (F5 pressed) or
	 * programmatic refresh e.g. call next ticket. The object sessvars.state
	 * corresponds the object QLWorkstationStatus, see api docs.
	 * 
	 * @param isRefresh
	 *            false if the call isn't a user refresh (F5); the queues shall
	 *            only be updated and no timeout will be created
	 * 
	 */
	this.updateWorkstationStatus = function (isRefresh) {
		clearOngoingVisit();

		if (sessvars.state.servicePointState == servicePoint.servicePointState.CLOSED) {
			$("#ticketNumber").html(jQuery.i18n.prop('info.closed'));

		} else if (sessvars.state.servicePointState == servicePoint.servicePointState.OPEN
			&& sessvars.state.userState == servicePoint.userState.IN_STORE_NEXT) {
			modalNavigationController.push($Qmatic.components.modal.storeNext)
			//util.showModal("waitingForCustomerDialogue");
			$("#ticketNumber").html(
				jQuery.i18n.prop('info.waiting.for.customer'));
		} else if (sessvars.state.servicePointState == servicePoint.servicePointState.OPEN
			&& sessvars.state.userState == servicePoint.userState.INACTIVE) {
			$("#ticketNumber").html(jQuery.i18n.prop('info.inactive'));

		} else if (sessvars.state.servicePointState == servicePoint.servicePointState.OPEN
			&& sessvars.state.visitState == servicePoint.visitState.NO_CALLABLE_VISITS) {
			$("#ticketNumber")
				.html(jQuery.i18n.prop('info.no.customer.called'));

		} else if (sessvars.state.servicePointState == servicePoint.servicePointState.OPEN
			&& sessvars.state.visitState == servicePoint.visitState.NO_CALLABLE_VISITS) {
			$("#ticketNumber")
				.html(jQuery.i18n.prop('info.no.customer.called'));

		} else if (sessvars.state.servicePointState == servicePoint.servicePointState.OPEN
				&& sessvars.state.userState == servicePoint.userState.SERVING
				&& servicePoint.isOutcomeOrDeliveredServiceNeeded()) {
			if (sessvars.state.visitState == servicePoint.visitState.OUTCOME_NEEDED) {
				util.showMessage(jQuery.i18n.prop('error.no.outcome'));
			} else if (sessvars.state.visitState == servicePoint.visitState.DELIVERED_SERVICE_NEEDED) {
				util
					.showMessage(jQuery.i18n
						.prop('error.no.delivered.service'));
			} else if (sessvars.state.visitState == servicePoint.visitState.OUTCOME_FOR_DELIVERED_SERVICE_NEEDED) {
				util.showMessage(jQuery.i18n
					.prop('error.no.outcome.for.delivered.service'));
			} else if (sessvars.state.visitState == servicePoint.visitState.OUTCOME_OR_DELIVERED_SERVICE_NEEDED) {
				util.showMessage(jQuery.i18n
					.prop('error.no.outcome.or.delivered.service'));
			} else if (cfuForceSelection || !sessvars.cfuSelectionSet) {
				util.showMessage(jQuery.i18n.prop('error.no.cfu.selection'));
			}
			$("#ticketNumber").html(sessvars.state.visit.ticketId);
			if (sessvars.state.visit.parameterMap != undefined) {
				if (sessvars.state.visit.parameterMap.custom1 != undefined) {
					// $("#notesEdit").val(
					// 		sessvars.state.visit.parameterMap.custom1);
					if (buttonNotesEnabled == true) {
						document.getElementById("notesMessage").innerHTML = sessvars.state.visit.parameterMap.custom1;
					}
				}
			}

			$("#waitingTimeCounter").html(
				util.formatIntoHHMMSS(sessvars.state.visit.waitingTime)); // createTime
			// -
			// callTime
			$("#callNextBtn").toggleClass("customButtonDisabled", true);
			$("#callNextBtn").toggleClass("customButton", false);
			$("#callNextBtn").prop('disabled', true);
			$("#walkDirectBtn").toggleClass("customButtonDisabled", true);
			$("#walkDirectBtn").toggleClass("customButton", false);
			$("#walkDirectBtn").prop('disabled', true);
			$("#endVisitBtn").toggleClass("customButtonDisabled", true);
			$("#endVisitBtn").toggleClass("customButton", false);
			$("#endVisitBtn").prop('disabled', true);

			$("#closeBtn").toggleClass("customButtonDisabled", true);
			$("#closeBtn").toggleClass("customButton", false);
			$("#closeBtn").prop('disabled', true);
			$("#transferBtn").toggleClass("customButtonSmall", true);
			$("#transferBtn").toggleClass("customButtonSmallDisabled", false);
			$("#transferBtn").prop('disabled', false);

			$("#parkBtn").toggleClass("customButtonSmall", true);
			$("#parkBtn").toggleClass("customButtonSmallDisabled", false);
			$("#parkBtn").prop('disabled', false);

			// $("#notesBtn").toggleClass("customButtonSmall", true);
			// $("#notesBtn").toggleClass("customButtonSmallDisabled", false);
			$("#notesBtn").prop('disabled', false);

			// is no-show allowed
			if (sessvars.state.visit.noshowAllowed) {
				// $("#noShowBtn").toggleClass("customButtonSmallDisabled", false);
				// $("#noShowBtn").toggleClass("customButtonSmall", true);
				$("#noShowBtn").prop('disabled', false);
			} else {
				// $("#noShowBtn").toggleClass("customButtonSmall", false);
				// $("#noShowBtn").toggleClass("customButtonSmallDisabled", true);
				$("#noShowBtn").prop('disabled', true);
			}
			// is recall allowed
			if (sessvars.state.visit.recallAllowed) {
				// $("#recallBtn").toggleClass("customButtonSmallDisabled", false);
				// $("#recallBtn").toggleClass("customButtonSmall", true);
				$("#recallBtn").prop('disabled', false);
			} else {
				// $("#recallBtn").toggleClass("customButtonSmallDisabled", true);
				// $("#recallBtn").toggleClass("customButtonSmall", false);
				$("#recallBtn").prop('disabled', true);
			}
			// is recycle allowed
			if (sessvars.state.visit.recycleAllowed) {
				// $("#reinsertBtn").toggleClass("customButtonSmall", true);
				// $("#reinsertBtn").toggleClass("customButtonSmallDisabled",
				// 		false);
				$("#reinsertBtn").prop('disabled', false);
			} else {
				// $("#reinsertBtn").toggleClass("customButtonSmall", false);
				// $("#reinsertBtn")
				// 		.toggleClass("customButtonSmallDisabled", true);
				$("#reinsertBtn").prop('disabled', true);
			}
			$("#prioList").prop('disabled', true);
			$("#homeLink").toggleClass("linkDisabled", true);
			$("#homeImage").toggleClass("imgDisabled", true);
			$("#settingsLink").toggleClass("linkDisabled", true);
			$("#logoutLink").toggleClass("linkDisabled", true);

			if ((sessvars.state.visit.currentVisitService.outcomeExists == true)) {
				$("#addOutcomeLink").toggleClass("customButtonSmall", true);
				$("#addOutcomeLink").toggleClass("customButtonSmallDisabled",
					false);
				$("#addOutcomeLink").prop('disabled', false);
			} else {
				$("#addOutcomeLink").toggleClass("customButtonSmall", false);
				$("#addOutcomeLink").toggleClass("customButtonSmallDisabled",
					true);
				$("#addOutcomeLink").prop('disabled', true);
			}
			if (sessvars.state.visit.currentVisitService.deliveredServiceExists == true) {
				$("#addDeliveredServiceLink").toggleClass("customButtonSmall",
					true);
				$("#addDeliveredServiceLink").toggleClass(
					"customButtonSmallDisabled", false);
				$("#addDeliveredServiceLink").prop('disabled', false);
			} else {
				$("#addDeliveredServiceLink").toggleClass("customButtonSmall",
					false);
				$("#addDeliveredServiceLink").toggleClass(
					"customButtonSmallDisabled", true);
				$("#addDeliveredServiceLink").prop('disabled', true);
			}

			$("#addMultiServiceLink").toggleClass("customButtonSmall", true);
			$("#addMultiServiceLink").toggleClass("customButtonSmallDisabled",
				false);
			$("#addMultiServiceLink").prop('disabled', false);

			$("#addCustomMarkLink").toggleClass("customButtonSmall", true);
			$("#addCustomMarkLink").toggleClass("customButtonSmallDisabled",
				false);
			$("#addCustomMarkLink").prop('disabled', false);
		} else {
			if (sessvars.state.visitState == servicePoint.visitState.CONFIRM_NEEDED) {
				//util.showModal("confirmCustomer");
				modalNavigationController.push($Qmatic.components.modal.confirmCustomer)
			} else if (sessvars.state.visitState == servicePoint.visitState.VISIT_IN_DISPLAY_QUEUE) {
				// display spinner with text stating that the visit is about to
				// be called
				// util.showModal("displayQueueSpinnerWindow");
				modalNavigationController.push($Qmatic.components.modal.visitInDisplayQueue)
				if (displayQueueTimeout > 0) {
					displayQueueTimeoutId = window
						.setTimeout(
						function () {
							if (sessvars.state.visitState == servicePoint.visitState.VISIT_IN_DISPLAY_QUEUE) {
								util
									.log('Timed out waiting for visit to be displayed, about to check user status.');
								sessvars.state = servicePoint
									.getState(spService
										.get("user/status"));
								sessvars.statusUpdated = new Date();
								servicePoint
									.updateWorkstationStatus(false);
							}
						}, displayQueueTimeout * 1000);
				}
			}
			$("#ticketNumber").html(sessvars.state.visit.ticketId);
			if (sessvars.state.visit.parameterMap != undefined) {
				if (sessvars.state.visit.parameterMap.custom1 != undefined) {
					// $("#notesEdit").val(
					// 		sessvars.state.visit.parameterMap.custom1);
					if (buttonNotesEnabled == true) {
						document.getElementById("notesMessage").innerHTML = sessvars.state.visit.parameterMap.custom1;
					}
				}
			}

			$("#waitingTimeCounter").html(
				util.formatIntoHHMMSS(sessvars.state.visit.waitingTime)); // createTime
			// -
			// callTime
			$("#callNextBtn").toggleClass("customButton", true);
			$("#callNextBtn").toggleClass("customButtonDisabled", false);
			$("#callNextBtn").prop('disabled', false);
			$("#walkDirectBtn").toggleClass("customButton", true);
			$("#walkDirectBtn").toggleClass("customButtonDisabled", false);
			$("#walkDirectBtn").prop('disabled', false);
			$("#endVisitBtn").toggleClass("customButton", true);
			$("#endVisitBtn").toggleClass("customButtonDisabled", false);
			$("#endVisitBtn").prop('disabled', false);
			$("#closeBtn").toggleClass("customButton", true);
			$("#closeBtn").toggleClass("customButtonDisabled", false);
			$("#closeBtn").prop('disabled', false);
			$("#transferBtn").toggleClass("customButtonSmall", true);
			$("#transferBtn").toggleClass("customButtonSmallDisabled", false);
			$("#transferBtn").prop('disabled', false);

			$("#parkBtn").toggleClass("customButtonSmall", true);
			$("#parkBtn").toggleClass("customButtonSmallDisabled", false);
			$("#parkBtn").prop('disabled', false);

			// $("#notesBtn").toggleClass("customButtonSmall", true);
			// $("#notesBtn").toggleClass("customButtonSmallDisabled", false);
			$("#notesMessage").prop('disabled', false);

			// is no-show allowed
			if (sessvars.state.visit.noshowAllowed) {
 				// $("#noShowBtn").toggleClass("customButtonSmallDisabled", false);
 				// $("#noShowBtn").toggleClass("customButtonSmall", true);
				$("#noShowBtn").prop('disabled', false);
			} else {
				// $("#noShowBtn").toggleClass("customButtonSmall", false);
			 	// $("#noShowBtn").toggleClass("customButtonSmallDisabled", true);
				$("#noShowBtn").prop('disabled', true);
			}
			// is recall allowed
			if (sessvars.state.visit.recallAllowed) {
				// $("#recallBtn").toggleClass("customButtonSmallDisabled", false);
				// $("#recallBtn").toggleClass("customButtonSmall", true);
				$("#recallBtn").prop('disabled', false);
			} else {
				// $("#recallBtn").toggleClass("customButtonSmallDisabled", true);
				// $("#recallBtn").toggleClass("customButtonSmall", false);
				$("#recallBtn").prop('disabled', true);
			}
			// is recycle allowed
			if (sessvars.state.visit.recycleAllowed) {
				// $("#reinsertBtn").toggleClass("customButtonSmall", true);
				// $("#reinsertBtn").toggleClass("customButtonSmallDisabled",
				// 		false);
				$("#reinsertBtn").prop('disabled', false);
			} else {
				// $("#reinsertBtn").toggleClass("customButtonSmall", false);
				// $("#reinsertBtn")
				// 		.toggleClass("customButtonSmallDisabled", true);
				$("#reinsertBtn").prop('disabled', true);
			}

			if ((sessvars.state.visit.currentVisitService.outcomeExists == true)) {
				$("#addOutcomeLink").toggleClass("customButtonSmall", true);
				$("#addOutcomeLink").toggleClass("customButtonSmallDisabled",
					false);
				$("#addOutcomeLink").prop('disabled', false);
			} else {
				$("#addOutcomeLink").toggleClass("customButtonSmall", false);
				$("#addOutcomeLink").toggleClass("customButtonSmallDisabled",
					true);
				$("#addOutcomeLink").prop('disabled', true);
			}
			if (sessvars.state.visit.currentVisitService.deliveredServiceExists == true) {
				$("#addDeliveredServiceLink").toggleClass("customButtonSmall",
					true);
				$("#addDeliveredServiceLink").toggleClass(
					"customButtonSmallDisabled", false);
				$("#addDeliveredServiceLink").prop('disabled', false);
			} else {
				$("#addDeliveredServiceLink").toggleClass("customButtonSmall",
					false);
				$("#addDeliveredServiceLink").toggleClass(
					"customButtonSmallDisabled", true);
				$("#addDeliveredServiceLink").prop('disabled', true);
			}

			$("#addMultiServiceLink").toggleClass("customButtonSmall", true);
			$("#addMultiServiceLink").toggleClass("customButtonSmallDisabled",
				false);
			$("#addMultiServiceLink").prop('disabled', false);

			$("#addCustomMarkLink").toggleClass("customButtonSmall", true);
			$("#addCustomMarkLink").toggleClass("customButtonSmallDisabled",
				false);
			$("#addCustomMarkLink").prop('disabled', false);
		}
		updateTop();
		updateService();

		if (trtUpdateNeeded) {
			updateTransactionTime();
		} else {
			trtUpdateNeeded = true;
		}

		if (journeyUpdateNeeded) {
			updateVerticalMessage();
		} else {
			journeyUpdateNeeded = true;
		}

		if (delServUpdateNeeded) {
			deliveredServices.updateDeliveredServices();
		} else {
			delServUpdateNeeded = true;
		}

		customMarks.updateCustomMarks()

		if (outcomeUpdateNeeded) {
			outcome.updateOutcomes();
		} else {
			outcomeUpdateNeeded = true;
		}


		if (!isRefresh) {
			if (queuesUpdateNeeded) {
				queues.updateQueues(false);
			} else {
				queuesUpdateNeeded = true;
			}

		}
		customer.updateCustomer();
		customer.updateCustomerModule();

		if (spPoolUpdateNeeded) {
			servicePointPool.updateServicePointPool(); // Todo: remove me
			servicePointPool.renderCounterPool();
		} else {
			spPoolUpdateNeeded = true;
		}

		if (userPoolUpdateNeeded) {
			userPool.updateUserPool(); // TODO: remove me
			userPool.renderUserPool();
		} else {
			userPoolUpdateNeeded = true;
		}
		resetLogoffCounter();
	};

	var updateTop = function () {
		var isDisabled = sessvars.state.servicePointState == servicePoint.servicePointState.OPEN
			&& sessvars.state.userState == servicePoint.userState.SERVING
			&& servicePoint.isOutcomeOrDeliveredServiceNeeded();
		$("#prioList").prop('disabled', isDisabled);
		$("#homeLink").toggleClass("linkDisabled", isDisabled);
		$("#homeImage").toggleClass("imgDisabled", isDisabled);
		$("#settingsLink")
			.toggleClass(
			"linkDisabled",
			isDisabled
			|| (typeof sessvars.singleSettingsOnly !== 'undefined'
				&& sessvars.singleSettingsOnly != null && sessvars.singleSettingsOnly == true));
		$("#logoutLink").toggleClass("linkDisabled", isDisabled);
	};

	// Resets the logout counter
	var resetLogoffCounter = function () {
		if (logoffTimer != null) {
			window.clearTimeout(logoffTimer);
		}
		if (typeof autoClose === 'undefined' || autoClose == null
			|| autoClose == 0) {
			return;
		}
		var lastUpdate = new Date();
		var now = new Date();
		if (typeof sessvars.statusUpdated !== 'undefined'
			&& sessvars.statusUpdated != null) {
			lastUpdate = sessvars.statusUpdated;
		}
		var timeSinceLastUpdate = now.getTime() - lastUpdate.getTime();
		if (timeSinceLastUpdate > 0) {
			timeSinceLastUpdate = 0;
		} else {
			timeSinceLastUpdate = timeSinceLastUpdate / 1000;
		}
		var timeUntilLogoff = (autoClose - timeSinceLastUpdate) * 1000;
		logoffTimer = window.setTimeout(function () {
			servicePoint.handleLogoutQES(true, true);
			window.location.href = "/logout.jsp";
		}, timeUntilLogoff);

	};

	// clean the GUI on refresh or when a button is pressed
	var clearOngoingVisit = function () {
		$("#ticketNumber").empty();
		$("#serviceId").empty();
		$("#multiServices").find("tr:gt(0)").remove();
		servicePoint.servicesLeft = false;
		$("#waitingTimeCounter").empty();
		if (trtUpdateNeeded) {
			$("#countTransactionTime").empty();
			$('#countTransactionTime').countdown('destroy');
		}
		$("#linkedCustomerField").empty();
		$("#outcome").empty();
		$("#verticalMessage").empty();
		$("#notesEdit").val('');
		document.getElementById("notesMessage").innerHTML = '';
		util.hideModal("displayQueueSpinnerWindow");
		$("#callNextBtn").toggleClass("customButton", true);
		$("#callNextBtn").toggleClass("customButtonDisabled", false);
		$("#callNextBtn").prop("disabled", false);

		$("#walkDirectBtn").toggleClass("customButton", true);
		$("#walkDirectBtn").toggleClass("customButtonDisabled", false);
		$("#walkDirectBtn").prop("disabled", false);

		$("#endVisitBtn").toggleClass("customButtonDisabled", true);
		$("#endVisitBtn").toggleClass("customButton", false);
		$("#endVisitBtn").prop("disabled", true);

		$("#addMultiServiceLink")
			.toggleClass("customButtonSmallDisabled", true);
		$("#addMultiServiceLink").toggleClass("customButtonSmall", false);
		$("#addMultiServiceLink").prop('disabled', true);

		if (sessvars.state.servicePointState == servicePoint.servicePointState.OPEN) {
			$("#closeBtn").toggleClass("customButton", true);
			$("#closeBtn").toggleClass("customButtonDisabled", false);
			$("#closeBtn").prop("disabled", false);
		} else {
			$("#closeBtn").toggleClass("customButton", false);
			$("#closeBtn").toggleClass("customButtonDisabled", true);
			$("#closeBtn").prop("disabled", true);
		}

		// $("#transferBtn").toggleClass("customButtonSmallDisabled", true);
		// $("#transferBtn").toggleClass("customButtonSmall", false);
		$("#transferBtn").prop("disabled", true);

		// $("#parkBtn").toggleClass("customButtonSmallDisabled", true);
		// $("#parkBtn").toggleClass("customButtonSmall", false);
		$("#parkBtn").prop("disabled", true);

		// $("#noShowBtn").toggleClass("customButtonSmallDisabled", true);
		// $("#noShowBtn").toggleClass("customButtonSmall", false);
		$("#noShowBtn").prop("disabled", true);

		// $("#notesBtn").toggleClass("customButtonSmallDisabled", true);
		// $("#notesBtn").toggleClass("customButtonSmall", false);
		$("#notesBtn").prop("disabled", true);

		// $("#recallBtn").toggleClass("customButtonSmallDisabled", true);
		// $("#recallBtn").toggleClass("customButtonSmall", false);
		$("#recallBtn").prop("disabled", true);

		// $("#reinsertBtn").toggleClass("customButtonSmallDisabled", true);
		// $("#reinsertBtn").toggleClass("customButtonSmall", false);
		$("#reinsertBtn").prop("disabled", true);

		$("#prioList").prop("disabled", false);

		$("#addOutcomeLink").toggleClass("customButtonSmall", false);
		$("#addOutcomeLink").toggleClass("customButtonSmallDisabled", true);
		$("#addOutcomeLink").prop('disabled', true);
		$("#addDeliveredServiceLink").toggleClass("customButtonSmall", false);
		$("#addDeliveredServiceLink").toggleClass("customButtonSmallDisabled",
			true);
		$("#addDeliveredServiceLink").prop('disabled', true);

		$("#addCustomMarkLink").toggleClass("customButtonSmall", false);
		$("#addCustomMarkLink").toggleClass("customButtonSmallDisabled", true);
		$("#addCustomMarkLink").prop('disabled', true);

		outcome.clearOutcome();

		deliveredServices.clearTable();
		customMarks.clearTable();
		$("#linkCustomerLink").toggleClass("linkCust customLinkDisabled", true);
		$("#linkCustomerLink").prop("disabled", true);
	};

	var updateService = function () {
		if (sessvars.state.userState == servicePoint.userState.SERVING) {
			var service = sessvars.state.visit.currentVisitService.serviceInternalName;
			$("#serviceId").html(service);
			if (moduleMultiServicesEnabled == true) {
				var len1 = sessvars.state.visit.unservedVisitServices.length;
				var len2 = sessvars.state.visit.servedVisitServices.length;
				var len = len1;
				if (len1 > 0) {
					servicePoint.servicesLeft = true;
				}
				if (len1 < len2) {
					len = len2;
				}

				$("#multiServices").find("tr:gt(0)").remove();
				// var sortedId = 0;
				// var sortedName='';
				for (i = 0; i < len; i++) {
					var s = '';
					if (i % 2 == 1) {
						s += '<tr class="even">';
					} else {
						s += '<tr class="odd">';
					}
					if (i < len1) {
						// returned list is not sorted correctly lets fix this
						/*
						 * var r = 0; for(j=0; j < len1; j++) { var t =
						 * parseInt(sessvars.state.visit.unservedVisitServices[j].id);
						 * if (r == 0) { r = t+1000; } if (t > sortedId && t <
						 * r) { r = t; sortedName =
						 * sessvars.state.visit.unservedVisitServices[j].serviceInternalName; } }
						 * sortedId = r; s += '<td align="center">'+
						 * sortedName + '</td>';
						 */
						s += '<td align="center">'
							+ sessvars.state.visit.unservedVisitServices[i].serviceInternalName
							+ '</td>';
					} else {
						s += '<td ></td>';
					}

					if (i < len2) {
						s += '<td class="servicedone" align="center">'
							+ sessvars.state.visit.servedVisitServices[i].serviceInternalName
							+ '</td>';
					} else {
						s += '<td ></td>';
					}

					s += '</tr>';
					$('#multiServices').append(s);
				}
			}
		}
	};

	var updateTransactionTime = function () {
		var timeRelativeToCallNext = -1;
		if (sessvars.state.userState == servicePoint.userState.SERVING) {
			if (sessvars.state.visitState == servicePoint.visitState.VISIT_IN_DISPLAY_QUEUE) {
				$("#countTransactionTime").empty().text(
					translate.msg("info.visit.not.called.yet"));
			} else {
				// Use the fields in the UserState to find out how long since
				// the ticket was called
				var now;
				if (sessvars.state.visit.timeSinceCalled != null
					&& sessvars.state.visit.waitingTime != null
					&& sessvars.statusUpdated != null) {
					now = new Date();
					timeRelativeToCallNext = sessvars.statusUpdated.getTime()
						- now.getTime();
					// Has the ticket has been called in the future?
					if (timeRelativeToCallNext > 0) {
						timeRelativeToCallNext = 0;
					} else {
						timeRelativeToCallNext = timeRelativeToCallNext / 1000;
					}
					// add (or subtract, since we're counting up) no of seconds
					// given from the server to the time spent in the client
					// since the status was retrieved
					timeRelativeToCallNext -= sessvars.state.visit.timeSinceCalled;
				}
			}
		} else {
			timeRelativeToCallNext = -1;
		}
		if (timeRelativeToCallNext != -1) {
			jQuery('#countTransactionTime').countdown({
				since: timeRelativeToCallNext,
				compact: true,
				format: 'HMS'
			});
		}
	};

	var htmlEncodeNewLines = function (text) {
		return text.replace(/\n/g, '<br />');
	};

	var updateVerticalMessage = function () {
		if (servicePoint.hasValidSettings()
			&& sessvars.state.userState == servicePoint.userState.SERVING
			&& typeof sessvars.state.visit.currentVisitService.serviceId !== 'undefined'
			&& sessvars.state.visit.currentVisitService.serviceId != null) {
			var params = {
				"branchId": parseInt(sessvars.branchId),
				"serviceId": sessvars.state.visit.currentVisitService.serviceId
			};
			var verticalMessage = spService.get("branches/" + sessvars.branchId
				+ "/services/"
				+ sessvars.state.visit.currentVisitService.serviceId
				+ "/journey");
			if (typeof verticalMessage !== 'undefined'
				&& verticalMessage != null
				&& typeof verticalMessage.workstationMessage !== 'undefined'
				&& verticalMessage.workstationMessage != null) {
				$('#verticalMessageRow').show();
				document.getElementById("verticalMessage").innerHTML = verticalMessage.workstationMessage;
			} else {
				$('#verticalMessageRow').hide();
			}
		} else {
			$('#verticalMessageRow').hide();
		}
	};

	// Update user name, workstation name, branch name and profile drop down box
	// in the UI
	var updateWorkstationSettings = function () {
		var user = spService.get("user");
		$("#userName").text(user.firstName + " " + user.lastName);

		var branch = $("#branch");
		var workstation = $("#workstation");
		var profile = $("#profile");
		var prioSel = $("#prioList");

		showProfiles(sessvars.branchId, sessvars.servicePointId, prioSel);

		branch.text(sessvars.branchName);
		workstation.text(sessvars.servicePointName);
		profile.text(sessvars.state.workProfileName);
		// Used to repaint in IE when values are appended
		profile.focus().blur();
		
		prioSel.prop('selectedIndex', $(
			"#prioList option[value=" + sessvars.workProfileId + "]")
			.index());
		prioSel.prop("disabled", false);
	};

	var doEndUserSession = function () {
		try {
			var params = servicePoint.createParams();
			sessvars.state = servicePoint.getState(spService.del("branches/"
				+ params.branchId + "/users/" + params.userName));
			sessvars.statusUpdated = new Date();
		} catch (ex) {
			util.showError(jQuery.i18n.prop('error.logout.workstation.failed')
				+ ": " + ex);
			return false;
		}
	};

	this.handleHome = function () {
		if (workstationOffline
			|| (servicePoint.hasValidSettings() && servicePoint
				.isOutcomeOrDeliveredServiceNeeded())) {
			return false;
		}
		workstationOffline = true;
		sessvars.$.clearMem();
	};

	this.handleLogoutQES = function (warn, force) {
		var isLogout = false;
		if (force) {
			servicePoint.forceCleanAndLogout();
			isLogout = true;
			return isLogout;
		}
		var hasValidSettings = servicePoint.hasValidSettings();
		// close workstation if settings have been applied
		if (!workstationOffline
			&& !servicePoint.isOutcomeOrDeliveredServiceNeeded()) {
			if (hasValidSettings) {
				var displayDialog = false;
				if (warn) {
					var warningMessage = "";
					var isServicePointPoolEmpty = servicePointPool.isEmpty();
					var isUserPoolEmpty = userPool.isEmpty();
					if (!isServicePointPoolEmpty && !isUserPoolEmpty) {
						displayDialog = true;
						warningMessage = translate
							.msg(
							"info.confirm.logout.visits.still.in.both.pools",
							[
								translate
									.msg("info.confirm.logout.service.point.pool"),
								translate
									.msg("info.confirm.logout.user.pool")]);
					} else if (!isServicePointPoolEmpty) {
						displayDialog = true;
						warningMessage = translate
							.msg(
							"info.confirm.logout.visits.still.in.pool",
							[translate
								.msg("info.confirm.logout.service.point.pool")]);
					} else if (!isUserPoolEmpty) {
						displayDialog = true;
						warningMessage = translate
							.msg(
							"info.confirm.logout.visits.still.in.pool",
							[translate
								.msg("info.confirm.logout.user.pool")]);
					}
				}
				if (displayDialog) {
					util.showModal("logoutWindow");
					$("#confirmLogoutMessage").html(warningMessage);
				} else {
					// check if workstation is open inside
					// endUserServicePointSession() call
					// servicePoint.endUserServicePointSession();

					// check if the close resulted in a matter code needed
					// result, in that case, don't logout
					if (servicePoint.isOutcomeOrDeliveredServiceNeeded()) {
						servicePoint.updateWorkstationStatus(false);
					} else {
						servicePoint.cleanAndLogout();
						isLogout = true;
					}
				}
			} else {
				// logout if no valid settings are set
				servicePoint.cleanAndLogout();
				isLogout = true;
			}
		}
		return isLogout;
	};

	this.cleanAndLogout = function () {
		if (sessvars.servicePointUnitId) {
			qevents.unsubscribe(util.asChannelStrWithUserName(sessvars.servicePointUnitId, sessvars.currentUser.userName));
		}
		sessvars.$.clearMem();
		spService.put("logout");
		workstationOffline = true;
	};

	this.forceCleanAndLogout = function () {
		if (sessvars.servicePointUnitId) {
			qevents.unsubscribe(util.asChannelStrWithUserName(sessvars.servicePointUnitId, sessvars.currentUser.userName));
		}
		sessvars.$.clearMem();
		$.ajax({
			type: "PUT",
			url: "/rest/servicepoint/logout;force=true;timeout=true",
			dataType: 'json',
			async: false,
			success: function (data) {

			},
			error: function (jqXHR, textStatus, errorThrown) {
				if (jqXHR.status == 503) {
					customer.customerDbOnline = false;
					util.showError(jQuery.i18n.prop('error.central.server.unavailable'));
					util.hideModal("customerSearchDiv");
				}
			}
		});
		workstationOffline = true;
	};
	/*
	 * Receive events from Jiql CometD style.
	 * 
	 * VISIT_CALL, in the case of store next
	 * {"M":"E","E":{"evnt":"VISIT_CALL","type":"DEVICE","ts":"2012-09-06T16:12:54.449","did":120106000001,
	 * "prm":{"queue":1,"servicePointName":"Web service point
	 * 1","ticket":"A001","servicePoint":1,"queueName":"Q1"}}}, on channel:
	 * /events/GBG/ServicePoint1
	 * 
	 * USER_SERVICE_POINT_SESSION_END, in the case of session ending (being
	 * kicked off)
	 * {"M":"E","E":{"evnt":"USER_SERVICE_POINT_SESSION_END","type":"DEVICE","ts":"2012-10-31T16:12:01.781+0100","did":220206000001,
	 * "prm":{"user":"test","servicePointId":"2"}}}, on channel:
	 * /events/BRA/ServicePoint2
	 * 
	 * 
	 */
	var receiveEvent = function (event) {
		var processedEvent;

		try {
			processedEvent = JSON.parse(event);
		} catch (err) {
			return;
		}
		if (moduleChatEnabled == true) {
			chat.receiveEvent(processedEvent);
		}

		if (typeof processedEvent.E === "undefined"
			|| typeof processedEvent.E.evnt === "undefined") {
			return;
		}
		switch (processedEvent.E.evnt) {
			case servicePoint.publicEvents.VISIT_CALL:
				// NEXT
				if (sessvars.state.userState == servicePoint.userState.IN_STORE_NEXT) {
					// if (window.console) console.log("Case is store next, event
					// is: " + processedEvent.E.evnt);
					modalNavigationController.popModal($Qmatic.components.modal.storeNext)
					// util.hideModal("waitingForCustomerDialogue");
					sessvars.state = servicePoint.getState(spService
						.get("user/status"));
					sessvars.statusUpdated = new Date();
					servicePoint.updateWorkstationStatus(false);
					break;
				}
				if (sessvars.state.visitState == servicePoint.visitState.VISIT_IN_DISPLAY_QUEUE) {
					util
						.log('About to handle a visit call event when in state VISIT_IN_DISPLAY_QUEUE');
					window.clearTimeout(displayQueueTimeoutId);
					//util.hideModal("displayQueueSpinnerWindow");
					modalNavigationController.popModal($Qmatic.components.modal.visitInDisplayQueue)
					sessvars.state = servicePoint.getState(spService
						.get("user/status"));
					sessvars.statusUpdated = new Date();

					if (processedEvent.E.prm.workProfile == undefined) {
						delServUpdateNeeded = false;
						outcomeUpdateNeeded = false;
						spPoolUpdateNeeded = false;
						userPoolUpdateNeeded = false;
						queuesUpdateNeeded = false;
						journeyUpdateNeeded = false;
						trtUpdateNeeded = false;
					}

					servicePoint.updateWorkstationStatus(false);
					break;
				}
				if (cfuForceSelection) {
					sessvars.cfuSelectionSet = false;
					servicePoint.updateWorkstationStatus();
				} else {
					sessvars.cfuSelectionSet = true;
				}
				break;
			case servicePoint.publicEvents.USER_SERVICE_POINT_SESSION_END:
				// Someone or something has caused us to log off this servicepoint,
				// could either be someone else stealing it or the current user
				// logging out somewhere else, or just a logout
				sessvars.$.clearMem();
				sessvars.cfuSelectionSet = true;
				// we can't call the logout service by ourselves, as it might be us
				// that have logged in somewhere else
				window.location.replace("/logout.jsp");
				break;
			case servicePoint.publicEvents.VISIT_TRANSFER_TO_SERVICE_POINT_POOL:
				sessvars.cfuSelectionSet = true;
				servicePointPool.updateServicePointPool(); // Todo: remove me
				servicePointPool.renderCounterPool();
				break;
			case servicePoint.publicEvents.VISIT_TRANSFER_TO_USER_POOL:
				sessvars.cfuSelectionSet = true;
				userPool.updateUserPool(); // Todo: remove me
				userPool.renderUserPool();
				break;
			case servicePoint.publicEvents.USER_SERVICE_POINT_WORK_PROFILE_SET:
				// If someone else (e.g. an administrator) sets the work profile for
				// the user, do some updates.
				if (typeof processedEvent.E.prm !== 'undefined'
					&& processedEvent.E.prm != null
					&& typeof processedEvent.E.prm.workProfileOrigId !== 'undefined'
					&& processedEvent.E.prm.workProfileOrigId != null) {
					var workProfileId = processedEvent.E.prm.workProfileOrigId;
					if (typeof sessvars.workProfileId !== "undefined") {
						// If work profile has changed, update state, set the new
						// workProfile
						// on the sessvars, change in UI and show notification
						// message
						if (sessvars.workProfileId != workProfileId) {
							var params = {};
							sessvars.state = servicePoint.getState(spService
								.get("user/status"));
							sessvars.statusUpdated = new Date();
							sessvars.workProfileId = workProfileId;
							updateWorkstationSettings();
							var profileSel = $('#prioList');
							sessvars.profileName = $("option:selected", profileSel)
								.text();
							util.showMessage(jQuery.i18n
								.prop('info.changed.settings.success.admin')
								+ ': ' + sessvars.profileName);
						}
					}
				}
				break;
			case servicePoint.publicEvents.CFU_SELECTION_DONE:
				util.showMessage(jQuery.i18n.prop('message.cfu.selected'));
				sessvars.cfuSelectionSet = true;
				servicePoint.updateWorkstationStatus();
				break;
			default:
				break;
		}
	};

	this.hasValidSettings = function (showMessages) {
		if (typeof sessvars.branchId === "undefined"
			|| sessvars.branchId == null) {
			if (showMessages) {
				// util.showError(translate.msg("error.no.branch"));
				$Qmatic.components.dropdown.branchSelection.onError(translate.msg("error.no.branch"))
			}
			return false;
		} else if (typeof sessvars.servicePointId === "undefined"
			|| sessvars.servicePointId == null) {
			if (showMessages) {
				// util.showError(translate.msg("error.no.workstation"));
				$Qmatic.components.dropdown.counterSelection.onError(translate.msg("error.no.workstation"))
			}
			return false;
		} else if (typeof sessvars.workProfileId === "undefined"
			|| sessvars.workProfileId == null) {
			if (showMessages) {
				// util.showError(translate.msg("error.no.profile"));
				$Qmatic.components.dropdown.profileSelection.onError(translate.msg("error.no.profile"))
			}
			return false;
		} else if (typeof sessvars.state.servicePointDeviceTypes === "undefined"
			|| sessvars.state.servicePointDeviceTypes == null
			|| sessvars.state.servicePointDeviceTypes.indexOf("SW_SERVICE_POINT") < 0) {
			if (showMessages) {
				// util.showError(translate.msg("error.wrong.deviceType"));
				$Qmatic.components.dropdown.counterSelection.onError(translate.msg("error.wrong.deviceType"))
			}
			return false;

		}
		return !workstationOffline;
	};

	var readServicePointSettingsFromWorkstation = function () {
		if (typeof sessvars.branchId === 'undefined'
			|| sessvars.branchId == null
			|| typeof sessvars.servicePointId === 'undefined'
			|| sessvars.servicePointId == null) {
			return;
		}
		var params = {};
		params.branchId = sessvars.branchId;
		params.servicePointId = sessvars.servicePointId;
		var userServicePoint = spService.get("branches/" + params.branchId
			+ "/servicePoints/" + params.servicePointId);
		// Parse settings for confirm needed and storeNext
		if (typeof userServicePoint !== 'undefined' && userServicePoint != null
			&& typeof userServicePoint.parameters !== 'undefined'
			&& userServicePoint.parameters != null) {
			var parameters = userServicePoint.parameters;
			if (typeof parameters.confirmNeeded !== 'undefined'
				&& parameters.confirmNeeded != null
				&& parameters.confirmNeeded == true) {
				confirmNeeded = true;
			} else {
				confirmNeeded = false;
			}
			if (typeof parameters.cfuForceSelection !== 'undefined'
				&& parameters.cfuForceSelection != null
				&& parameters.cfuForceSelection == true) {
				cfuForceSelection = true;
				if (sessvars.cfuSelectionSet == undefined
					|| sessvars.cfuSelectionSet == null) {
					sessvars.cfuSelectionSet = true;
				}
			} else {
				cfuForceSelection = false;
			}
			if (typeof parameters.storeNext !== 'undefined'
				&& parameters.storeNext != null
				&& parameters.storeNext == true) {
				storeNext = true;
			} else {
				storeNext = false;
			}
			if (typeof parameters.autoClose !== 'undefined'
				&& parameters.autoClose != null
				&& !isNaN(parseInt(parameters.autoClose))) {
				autoClose = parseInt(parameters.autoClose);
			} else {
				autoClose = 0;
			}
			if (typeof parameters.displayQueueTimeout !== 'undefined'
				&& parameters.displayQueueTimeout != null
				&& !isNaN(parseInt(parameters.displayQueueTimeout))) {
				displayQueueTimeout = parseInt(parameters.displayQueueTimeout);
			} else {
				displayQueueTimeout = -1;
			}
		}
	};

	this.storeSettingsInSession = function (sessvarsInfo) {
		sessvars.branchId = sessvarsInfo.branchId;
		if (typeof sessvarsInfo.branchName === 'undefined'
			|| sessvarsInfo.branchName == null) {
			var branch = spService.get("branches/" + sessvarsInfo.branchId);
			sessvars.branchName = branch.name;
		} else {
			sessvars.branchName = sessvarsInfo.branchName;
		}

		sessvars.servicePointId = sessvarsInfo.servicePointId;
		var params = {};
		params.branchId = sessvars.branchId;
		params.servicePointId = sessvars.servicePointId;
		var userServicePoint = spService.get("branches/" + params.branchId
			+ "/servicePoints/" + params.servicePointId);

		setUnitTypeModules(userServicePoint);

		sessvars.servicePointUnitId = typeof userServicePoint !== 'undefined'
			|| userServicePoint != null ? userServicePoint.unitId : "";
		sessvars.servicePointName = sessvarsInfo.servicePointName;

		sessvars.workProfileId = sessvarsInfo.workProfileId;
		sessvars.profileName = sessvarsInfo.profileName;
	};

	this.resetSettings = function () {
		sessvars.branchId = null;
		sessvars.branchName = null;
		sessvars.servicePointId = null;
		sessvars.servicePointUnitId = null;
		sessvars.servicePointName = null;
		sessvars.workProfileId = null;
		sessvars.profileName = null;
		sessvars.singleSettingsOnly = null;
	};

	var getSettings = function (branchSel, workstationSel, profileSel) {
		var settings = {};
		settings.branchId = parseInt(branchSel.val());
		settings.branchName = branchSel.children("option").filter(":selected")
			.text();

		settings.servicePointId = parseInt(workstationSel.val());
		settings.servicePointName = workstationSel.children("option").filter(
			":selected").text();

		settings.workProfileId = parseInt(profileSel.val());
		settings.profileName = profileSel.children("option")
			.filter(":selected").text();
		return settings;
	};

	/*
	 * Use sessvars stored settings to create the params object used by the
	 * RESTeasy generated JavaScript connector code.
	 */
	var hasValidDropboxSettings = function (branchSel, workstationSel,
		profileSel) {

		if (branchSel.val() == -1) {
			// util.showError(jQuery.i18n.prop("error.no.branch"));
			$Qmatic.components.dropdown.branchSelection.onError(jQuery.i18n.prop("error.no.branch"))
			return false;
		} else if (workstationSel.val() == -1) {
			// util.showError(jQuery.i18n.prop("error.no.workstation"));
			$Qmatic.components.dropdown.counterSelection.onError(jQuery.i18n.prop("error.no.workstation"))
			return false;
		} else if (profileSel.val() == -1) {
			// util.showError(jQuery.i18n.prop("error.no.profile"));
			$Qmatic.components.dropdown.profileSelection.onError(jQuery.i18n.prop("error.no.profile"))
			return false;
		}
		return true;
	};

	this.createParams = function () {
		var params = {};
		params.branchId = parseInt(sessvars.branchId);
		params.branchName = sessvars.branchName;

		params.servicePointId = parseInt(sessvars.servicePointId);
		params.servicePointName = sessvars.servicePointName;

		params.workProfileId = parseInt(sessvars.workProfileId);
		params.profileName = sessvars.profileName;

		if (typeof sessvars.currentUser === 'undefined'
			|| sessvars.currentUser == null) {
			sessvars.currentUser = spService.get("user");
		}
		if (typeof sessvars.currentUser !== 'undefined'
			&& sessvars.currentUser.hasOwnProperty("userName")) {
			params.userName = sessvars.currentUser.userName;
		}

		return params;
	};

	this.isOutcomeOrDeliveredServiceNeeded = function () {
		return sessvars.state.visitState == servicePoint.visitState.OUTCOME_NEEDED
			|| sessvars.state.visitState == servicePoint.visitState.DELIVERED_SERVICE_NEEDED
			|| sessvars.state.visitState == servicePoint.visitState.OUTCOME_OR_DELIVERED_SERVICE_NEEDED
			|| sessvars.state.visitState == servicePoint.visitState.OUTCOME_FOR_DELIVERED_SERVICE_NEEDED
			|| (cfuForceSelection && !sessvars.cfuSelectionSet);
	};

	this.isOutcomeOrDeliveredServiceAdded = function () {
		return sessvars.state.visit != null
			&& sessvars.state.visit.currentVisitService != null
			&& (sessvars.state.visit.currentVisitService.visitDeliveredServices != null || sessvars.state.visit.currentVisitService.visitOutcome != null)
			&& (!cfuForceSelection || sessvars.cfuSelectionSet);
	};

	this.hasDefinedOutcomeOrDeliveredService = function () {
		return sessvars.state.visit.currentVisitService.outcomeExists
			|| sessvars.state.visit.currentVisitService.deliveredServiceExists;
	};

	/**
	 * Wrap any call to callService that returns state with this method to avoid
	 * ending up in an undefined state.
	 * 
	 * @param returnValue
	 */
	this.getState = function (returnValue) {
		if (typeof returnValue === 'undefined' || returnValue == null || returnValue.length == 0) {
			returnValue = spService.get("user/status");
		}
		return returnValue;
	};

	// DWR status handler, needs to be overwritten since we dont use the same
	// html elements for error boxes as other modules
	this.cometDWSPollStatusHandler = function (status, message) {
		if (status) {
			try {
				setWorkstationOnline();
			} catch (e) {
			}
			// Reconnection was made

		} else {
			setWorkstationOffline();
		}
	};

	var setWorkstationOffline = function () {
		if (!workstationOffline) {
			var err = jQuery.i18n.prop('error.communication_error');
			util.showPermanentError(err);
			workstationOffline = true;
			// clear any ongoing vist
			clearOngoingVisit();
			// stop refreshing queues and clear queue list
			clearTimeout(sessvars.queueTimer);
			sessvars.queueTimerOn = false;
			queues.emptyQueues();
			servicePointPool.emptyPool();
			userPool.emptyPool();
			// disable call buttons
			$('#callButtons a').each(function () {
				$(this).addClass("customLinkDisabled").click(function (e) {
					e.preventDefault();
				});
				$(this).attr({
					"class": "customButtonDisabled",
					"disabled": true
				});
			});
			// disable visit buttons
			$('#ongoingVisitButtons a').each(function () {
				$(this).addClass("customLinkDisabled").click(function (e) {
					e.preventDefault();
				});
				$(this).attr({
					"class": "customButtonSmallDisabled",
					"disabled": true
				});
			});
			// disable home/settings/logout links
			$('.orch-userinfo a').each(function () {
				$(this).prop("disabled", true);
				$(this).toggleClass("linkDisabled", true);
			});
			$('.orch-actions a').each(function () {
				$(this).prop("disabled", true);
				$(this).toggleClass("imgDisabled", true);
			});

			document.getElementById("createCustomerLink").className = "newCust customLinkDisabled";
			document.getElementById("createCustomerLink").disabled = true;
			document.getElementById("editCustomerLink").className = "editCust customLinkDisabled";
			document.getElementById("editCustomerLink").disabled = true;
			document.getElementById("linkCustomerLink").className = "linkCust customLinkDisabled";
			document.getElementById("linkCustomerLink").disabled = true;
			document.getElementById("deleteCustomerLink").className = "deleteCust customLinkDisabled";
			document.getElementById("deleteCustomerLink").disabled = true;
			// disable settings / dropdown in menu
			$('#prioList').prop("disabled", true);
		}
	};

	var setWorkstationOnline = function () {
		if (workstationOffline) {
			util.hideError();
			workstationOffline = false;
			// try one resource, if we get anything but a HTTP code 200-399 here
			// redirect to the login screen
			// this small check is needed in the case our network drops towards
			// orchestra, but our session is still valid
			$
				.ajax({
					type: "GET",
					async: false,
					url: "css/style.css",
					error: function (data, status, xhr) {

						// always succeeds

					},
					success: function (data, status, xhr) {
						// in jQuery 1.7.0 ONLY xhr is a non-null object -
						// 1.8.3/1.9.0 receive a null object as a parameter
						if (xhr.status > 399 || xhr.status < 200
							|| xhr.status == 302) {
							// authentication error, send user to
							// login/start screen...probably not going to
							// end up here
							// form authentication means browsers will
							// handle the 302 transparently
							reloadOnReconnect();
						} else {
							// this is a huge hack to work around the fact
							// that web browsers handling redirect
							// transparently
							var isRedirect = false;
							try {
								$
									.each(
									$(xhr.responseText)
										.filter(
										function () {
											return this.nodeType == 8;
										}),
									function (index, element) {
										if (typeof element.textContent !== "undefined"
											&& element.textContent != null
											&& element.textContent
												.trim() == "Fixed navbar") {
											// found comment in
											// login page, note
											// that if that
											// comment is
											// removed, this
											// hack won't work
											// anymore
											isRedirect = true;
										}
									});
							} catch (ex) {
								// parsing failed, not a redirect
							}
							if (!isRedirect) {
								updateUI();
							} else {
								// not authenticated any longer, send user
								// to login page
								reloadOnReconnect();
							}
						}
					}
				});

			/*
			 * below is code thats very experimental designed to handle some
			 * SSO-specific implementations don't uncomment it as it's likely to
			 * break if orchestra is changed. Also, it doesn't actually work
			 * 100%.
			 *  // try to retrieve a protected resource // index.jspx should
			 * triger SPNEGO/SSO if its enabled var div =
			 * $(document.createElement("DIV")); div.load("/index.jspx",
			 * function(response, status, xhr) { // if we recieve a HTTP code in
			 * the 400 range or if the // html string returned contains
			 * "j_username" and "j_password" we need to authenticate if
			 * ((xhr.status > 399 && xhr.status < 500) ||
			 * ((response.indexOf("j_username", 0) != -1 &&
			 * response.indexOf("j_password", 0) != -1) &&
			 * response.indexOf("document.forms[0].j_username.value") == -1)) { //
			 * authentication error, send user to login/start screen
			 * window.location.href = "/"; } else if (xhr.status > 199 &&
			 * xhr.status < 400) { // normal http response code, this either
			 * means we're still logged in or // that some type of SSO-login has
			 * happened updateUI(); } });
			 */
		}
	};

	var reloadOnReconnect = function () {
		if (sessvars.servicePointUnitId) {
			qevents.unsubscribe(util.asChannelStr(sessvars.servicePointUnitId));
		}

		qevents.disconnect(function (disconnectReply) {
			util.log("Disconnect done. Reply from CometD: " + JSON.stringify(disconnectReply));
			sessvars.$.clearMem();
			window.location.reload();
		});

		// safeguard in case server doesn't reply
		window.setTimeout(function () {
			util.log("No response from server for disconnect request within 3 seconds, reloading anyway.");
			sessvars.$.clearMem();
			window.location.reload();
		}, 3000);
	};

	this.getWorkstationOffline = function () {
		return workstationOffline;
	};
};
