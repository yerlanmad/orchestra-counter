var customMarks = new function () {

	// custom marks

	var markTypeId = 0;
	var customMarksTable;
	var selectCustomMarkTable;
	var customMarksParams;
	var multiMarkCounter;
	var dropdownFilter = null;

	function initFilter() {
		if (!dropdownFilter)
			dropdownFilter = new window.$Qmatic.components.dropdown.AddMarksDropdownComponent('#marksFilter', {
				single_disable: false,
				allow_single_deselect: false,
				placeholder_text_single: jQuery.i18n.prop('info.card.marksCard.selectMark')
			}).get$Elem();
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
			//util.showModal("addCustomMarks");
			cardNavigationController.push($Qmatic.components.card.marksCard)
			if (typeof selectCustomMarkTable != 'undefined') {

			} else {
				// find the correct mark type id
				var params = servicePoint.createParams();
				params.branchId = sessvars.state.branchId;
				var markTypesArray = spService.get("branches/"
					+ params.branchId + "/markTypes");
				for (i = 0; i < markTypesArray.length; i++) {
					if (markTypesArray[i].name == customMarkTypeName) {
						markTypeId = markTypesArray[i].id;
					}
				}

				// marks of type according to setting in settings.js
				var t = new Date();
				var url = "branches/" + sessvars.branchId
					+ "/markTypes/" + markTypeId + "/marks?call=" + t;
				var marksResponse = spService.get(url)

				var marks = util.sortArrayCaseInsensitive(marksResponse, "name")

				util.populateSelect(marks, dropdownFilter);
				dropdownFilter.trigger("chosen:updated");
			}
		}
	};

	this.showAddedMarksTable = function () {
		customMarksTable.show();
	}

	this.hideAddedMarksTable = function () {
		customMarksTable.hide();
	}

	this.customMarkClicked = function (id, numberOfMarks) {
		if (servicePoint.hasValidSettings()) {
			customMarksParams = servicePoint.createParams();
			customMarksParams.visitId = sessvars.state.visit.id;
			customMarksParams.servicePointId = sessvars.state.servicePointId;
			customMarksParams.markId = id;
			multiMarkCounter = parseInt(numberOfMarks);
			if (multiMarks == true && multiMarkCounter > 1) {
				customMarks.addMultiMarks();
			} else {
				sessvars.state = servicePoint.getState(spService
					.post("branches/" + customMarksParams.branchId
					+ "/servicePoints/"
					+ customMarksParams.servicePointId + "/visits/"
					+ customMarksParams.visitId + "/marks/"
					+ customMarksParams.markId));
				// util.hideModal("addCustomMarks");
				// cardNavigationController.pop();
				customMarks.getUserStateWorkaround();
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
			// util.hideModal("addCustomMarks");
			// cardNavigationController.pop();
			customMarks.getUserStateWorkaround();
		}

		delServUpdateNeeded = true;
		outcomeUpdateNeeded = true;
	};

	var customMarkRemove = function (rowClicked) {
		if (servicePoint.hasValidSettings()) {
			var removeParams = servicePoint.createParams();
			removeParams.visitId = sessvars.state.visit.id;
			removeParams.servicePointId = sessvars.state.servicePointId;
			removeParams.visitMarkId = customMarksTable.fnGetData(rowClicked).id;
			sessvars.state = servicePoint.getState(spService.del("branches/"
				+ removeParams.branchId + "/servicePoints/"
				+ removeParams.servicePointId + "/visits/"
				+ removeParams.visitId + "/marks/"
				+ removeParams.visitMarkId));
			customMarks.getUserStateWorkaround();
		}
	};

	this.getUserStateWorkaround = function () {
		sessvars.state = servicePoint.getState(spService.get("user/status"));
		//delServUpdateNeeded = false;
		//outcomeUpdateNeeded = false;
		spPoolUpdateNeeded = false;
		userPoolUpdateNeeded = false;
		queuesUpdateNeeded = false;
		journeyUpdateNeeded = false;
		trtUpdateNeeded = false;
		sessvars.statusUpdated = new Date();
		servicePoint.updateWorkstationStatus(false, true);
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
					"sDefaultContent": null,
					"sWidth": "70%"
				},
			/* D.serv. visit mark id */{
					"bSearchable": false,
					"bVisible": false,
					"mDataProp": "id",
					"sDefaultContent": null
				},
			/* D.serv. orig id */{
					"bSearchable": false,
					"bVisible": false,
					"mDataProp": "markId",
					"sDefaultContent": null
				},
			/* Delivered time */{
					"sClass": "middleColumn",
					"mDataProp": "eventTime",
					"sDefaultContent": null,
					"sWidth": "30%",
					"createdCell": function (td, cellData, rowData, row, col) {

						$(td).append(
							"<span class=\"removeMarkBtn\" " + "title=\""
							+ jQuery.i18n.prop("action.remove.mark.click")
							+ "\"> " + '<button class="qm-action-btn qm-action-btn--only-icon">'
                             + '<i class="qm-action-btn__icon icon-close" aria-hidden="true"></i>'
                             + '<span class="sr-only">delete button</span>'
                             + '</button>' + "</span>");

						$(td).find(".removeMarkBtn").click(function () {
							customMarkRemove(row);
						});
					}
				}, {
					"sClass": "lastColumn",
					"bSearchable": false,
					"mDataProp": "id",
					"bVisible": false,
					"sDefaultContent": ""
				}];
			var headerCallback = function (nHead, aasData, iStart, iEnd,
				aiDisplay) {
				if (nHead.getElementsByTagName('th')[0].innerHTML.length == 0) {
					nHead.getElementsByTagName('th')[0].innerHTML = jQuery.i18n
						.prop('info.custom.mark.name');
					nHead.getElementsByTagName('th')[1].innerHTML = jQuery.i18n
						.prop('info.custom.mark.time');
					// nHead.getElementsByTagName('th')[2].innerHTML = jQuery.i18n
					// .prop('info.custom.mark.remove');
				}
			};
			var rowCallback = function (nRow, aData, iDisplayIndex) {
				// var visitMarkId = $('td:eq(1)', nRow).text();
				// $('td:eq(1)', nRow).html(
				// 		"<span class=\"removeMark\" " + "title=\""
				// 				+ jQuery.i18n.prop("action.remove.mark.click")
				// 				+ "\"> </span>");

				// $('td:eq(1) > span.removeMark', nRow).click(function() {
				// 	customMarkRemove(nRow);
				// });

				// $(nRow).find("td").append("HI")

				return nRow;
			};

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
					"fnRowCallback": rowCallback,
					"fnHeaderCallback": headerCallback,
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
			$(window).bind('resize', function () {
				//customMarksTable.fnAdjustColumnSizing();
			});
		}
		$(document).ready(function () {
			var sorting = [[3, 'desc'], [1, 'desc']];
			customMarksTable.fnSort(sorting);
		});
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