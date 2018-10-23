var customMarks = new function () {

	// custom marks

	var markTypeId = 0;
	var customMarksTable;
	var selectCustomMarkTable;
	var customMarksParams;
	var multiMarkCounter;
	var multiMarkCounterIntial;
	var dropdownFilter = null;
	var markName = "";

	function initFilter() {
		if (!dropdownFilter)
			dropdownFilter = $Qmatic.components.dropdown.multiMarkSelection.get$Elem();
	}

	function clearFilter() {
		util.clearSelect(dropdownFilter);
		dropdownFilter.trigger("chosen:updated");
	}

	function resetFilterSeleciton() {
		dropdownFilter.val('').trigger('chosen:updated');
	}

	this.addCustomMarkPressed = function () {
		initFilter()
		clearFilter()
		customMarksTable.fnAdjustColumnSizing();

		if (servicePoint.hasValidSettings()
			&& sessvars.state.userState == servicePoint.userState.SERVING) {
			cardNavigationController.push($Qmatic.components.card.marksCard)
			if (typeof selectCustomMarkTable != 'undefined') {

			} else {
				// find the correct mark type id
				var params = servicePoint.createParams();
				params.branchId = sessvars.state.branchId;
				var markTypesArray = spService.get("branches/"
					+ params.branchId + "/markTypes", true);
				for (i = 0; i < markTypesArray.length; i++) {
					if (markTypesArray[i].name == customMarkTypeName) {
						markTypeId = markTypesArray[i].id;
					}
				}

				// marks of type according to setting in settings.js
				var t = new Date();
				var url = "branches/" + sessvars.branchId
					+ "/markTypes/" + markTypeId + "/marks?call=" + t;
				var marksResponse = spService.get(url, true)

				util.sortArrayCaseInsensitive(marksResponse, "name");

				util.populateSelect(marksResponse, dropdownFilter);
				dropdownFilter.trigger("chosen:updated");
			}
		}
	};

	this.showAddedMarksTable = function () {
		customMarksTable && customMarksTable.show();
	}

	this.hideAddedMarksTable = function () {
		customMarksTable && customMarksTable.hide();
	}

	this.customMarkClicked = function (id, numberOfMarks, name) {
		if (servicePoint.hasValidSettings()) {
			customMarksParams = servicePoint.createParams();
			customMarksParams.visitId = sessvars.state.visit.id;
			customMarksParams.servicePointId = sessvars.state.servicePointId;
			customMarksParams.markId = id;
			multiMarkCounter = parseInt(numberOfMarks);
			multiMarkCounterIntial = multiMarkCounter
			markName = name;
			if (multiMarks == true && multiMarkCounter > 1) {
				customMarks.addMultiMarks(null, markName);
			} else {
				var postResponse = spService
					.post("branches/" + customMarksParams.branchId
					+ "/servicePoints/"
					+ customMarksParams.servicePointId + "/visits/"
					+ customMarksParams.visitId + "/marks/"
					+ customMarksParams.markId);
				sessvars.state = servicePoint.getState(postResponse);
				
				if (postResponse) {
				customMarks.getUserStateWorkaround(true);
				util.showMessage(jQuery.i18n
					.prop('success.added.mark') + " " + markName);
				} else {
				customMarks.getUserStateWorkaround();
				}
			}
		}
	};

	this.addMultiMarks = function (val) {
		multiMarkCounter = multiMarkCounter - 1;
		if (multiMarkCounter > 0) {
			spService.postParse("branches/" + customMarksParams.branchId
				+ "/servicePoints/" + customMarksParams.servicePointId
				+ "/visits/" + customMarksParams.visitId + "/marks/"
				+ customMarksParams.markId, "customMarks.addMultiMarks");
		} else {
			sessvars.state = servicePoint.getState(spService.post("branches/"
				+ customMarksParams.branchId + "/servicePoints/"
				+ customMarksParams.servicePointId + "/visits/"
				+ customMarksParams.visitId + "/marks/"
				+ customMarksParams.markId));
			customMarks.getUserStateWorkaround(true);
			util.showMessage(jQuery.i18n
					.prop('success.added.mark') + " " + markName + " X " + multiMarkCounterIntial);
		}

		delServUpdateNeeded = true;
		outcomeUpdateNeeded = true;
	};

	var customMarkRemove = function (rowClicked, markName) {
		if (servicePoint.hasValidSettings()) {
			var removeParams = servicePoint.createParams();
			removeParams.visitId = sessvars.state.visit.id;
			removeParams.servicePointId = sessvars.state.servicePointId;
			removeParams.visitMarkId = customMarksTable.fnGetData(rowClicked).id;
			var delResponse = spService.del("branches/"
				+ removeParams.branchId + "/servicePoints/"
				+ removeParams.servicePointId + "/visits/"
				+ removeParams.visitId + "/marks/"
				+ removeParams.visitMarkId);
			sessvars.state = servicePoint.getState(delResponse);
			if (delResponse) {
			customMarks.getUserStateWorkaround(true);
			util.showMessage(jQuery.i18n
					.prop('success.removed.mark') + " " + markName);
			} else {
				customMarks.getUserStateWorkaround();
			}
		}
	};

	this.getUserStateWorkaround = function (blockMessages) {
		sessvars.state = servicePoint.getState(spService.get("user/status"));
		spPoolUpdateNeeded = false;
		userPoolUpdateNeeded = false;
		queuesUpdateNeeded = false;
		journeyUpdateNeeded = false;
		trtUpdateNeeded = false;
		sessvars.statusUpdated = new Date();
		servicePoint.updateWorkstationStatus(false, true, blockMessages);
	};

	this.updateCustomMarks = function () {
		if (typeof customMarksTable != 'undefined') {
			customMarksTable.fnClearTable();
			if (sessvars.state.visit != null
				&& sessvars.state.visit.visitMarks != null) {
				if (sessvars.state.visit.visitMarks.length > 0) {
					customMarksTable.fnAddData(sessvars.state.visit.visitMarks);
				}
			}
		} else {

			var columns = [
			/* D.serv. name */{
					"sClass": "firstColumn",
					"mDataProp": "markName",
					"sType": "qm-sort",
					"sDefaultContent": null,
					"bSortable": false,
					"sWidth": "auto"
				},
			/* D.serv. visit mark id */{
					"bSearchable": false,
					"bVisible": false,
					"mDataProp": "id",
					"sType": "qm-sort",
					"bSortable": false,
					"sDefaultContent": null
				},
			/* D.serv. orig id */{
					"bSearchable": false,
					"bVisible": false,
					"mDataProp": "markId",
					"sType": "qm-sort",
					"bSortable": false,
					"sDefaultContent": null
				},
			/* Delivered time */{
					"sClass": "middleColumn",
					"mDataProp": "eventTime",
					"mData": function (source, type, val) {
                        return source['eventTime'] ? util.formatHHMMToTimeConvention(source['eventTime']) : source['eventTime'];
                    },
					"sType": "qm-sort",
					"sDefaultContent": null,
					"sWidth": "auto",
					"bSortable": false,
					"createdCell": function (td, cellData, rowData, row, col) {

						$(td).append(
							"<span class=\"removeMarkBtn\" " + "title=\""
							+ jQuery.i18n.prop("action.remove.mark.click")
							+ "\"> " + '<button class="qm-action-btn qm-action-btn--only-icon">'
							+ '<i class="qm-action-btn__icon icon-close" aria-hidden="true"></i>'
							+ '<span class="sr-only">delete button</span>'
							+ '</button>' + "</span>");

						$(td).find(".removeMarkBtn").click(function () {
							customMarkRemove(row, rowData.markName);
						});
					}
				}, {
					"sClass": "lastColumn",
					"bSearchable": false,
					"mDataProp": "id",
					"bVisible": false,
					"bSortable": false,
					"sDefaultContent": ""
				}];

			customMarksTable = $('#customMarks')
				.dataTable(
				{
					"id": "cc",
					"bDestroy": true,
					"oLanguage": {
						"sEmptyTable": translate
							.msg("info.no.marks.added"),
						"sInfo": "",
						"sInfoEmpty": "",
						"sZeroRecords": ""
					},
					"bFilter": false,
					"fnRowCallback": null,
					"fnHeaderCallback": null,
					"bLengthChange": false,
					"bProcessing": true,
					"bPaginate": false,
					"aoColumns": columns,
					"sScrollX": "100%",
					"sScrollY": "100%",
					"bAutoWidth": false,
					"aaData": (sessvars.state.visit != null
						&& sessvars.state.visit.currentVisitService != null
						&& sessvars.state.visit.visitMarks !== null ? sessvars.state.visit.visitMarks
						: null)
				});
		}
		var sorting = [[1, 'desc']];
		customMarksTable.fnSort(sorting);
	};

	this.cancelAddCustomMarks = function () {
		util.hideModal("addCustomMarks");
	};

	this.hideAddCustomMarks = function () {
		util.hideModal("addCustomMarks");
	};

	this.clearTable = function () {
		util.clearTable(customMarksTable);
	};

	this.getDataTable = function () {
		return customMarksTable;
	}

};
