var deliveredServices = new function () {

    var deliveredServicesTable;
    var selectDeliveredServiceTable;
    var SORTING = [[1, 'desc']];
    var dropdownFilter = null;

    function initFilter() {
        dropdownFilter = $("#deliveredServicesFilter");
    }

    function clearFilter() {
        util.clearSelect(dropdownFilter);
        dropdownFilter.trigger("chosen:updated");
    }

    function resetFilterSeleciton() {
        dropdownFilter.val('').trigger('chosen:updated');
    }

    this.addDeliveredServicePressed = function () {
        initFilter()
        clearFilter()
        deliveredServicesTable.fnAdjustColumnSizing();

        if (servicePoint.hasValidSettings() && sessvars.state.userState == servicePoint.userState.SERVING &&
            (sessvars.state.visit.currentVisitService.deliveredServiceExists == true)) {

            cardNavigationController.push($Qmatic.components.card.deliveredServicesCard)
            var t = new Date();
            var url = "branches/" + sessvars.branchId + "/services/" + sessvars.state.visit.currentVisitService.serviceId + "/deliverableServices?call=" + t;
            var dsResponse = spService.get(url, true);

            util.sortArrayCaseInsensitive(dsResponse, "name")
            util.populateSelect(dsResponse, dropdownFilter);

            dropdownFilter.trigger("chosen:updated");
            this.updateDeliveredServices();
        }
    };

    this.selectDeliveredService = function (dsId, dsName) {
        if (dsId != -1) {
            resetFilterSeleciton();
            deliveredServiceClicked(dsId, dsName);
            this.updateDeliveredServices();
        }
    }

    var deliveredServiceClicked = function (dsId, dsName) {
        if (servicePoint.hasValidSettings()) {
            var deliveredServicesParams = servicePoint.createParams();
            deliveredServicesParams.visitId = sessvars.state.visit.id;
            deliveredServicesParams.visitServiceId = sessvars.state.visit.currentVisitService.id;
            deliveredServicesParams.deliveredServiceId = dsId;
            var params = deliveredServicesParams;
            var postResponse = spService.post("branches/" + params.branchId + "/visits/" + params.visitId + "/services/" + params.visitServiceId + "/deliveredServices/" + params.deliveredServiceId);
            sessvars.state = servicePoint.getState(postResponse);
            sessvars.statusUpdated = new Date();
            if (sessvars.state.servicePointState == servicePoint.servicePointState.OPEN &&
                sessvars.state.userState == servicePoint.userState.SERVING) {
            }

            if (postResponse) {
                util.showMessage(jQuery.i18n
                    .prop('success.added.delivered.service') + " " + dsName);
                servicePoint.updateWorkstationStatus(false, true, true);
            } else {
                servicePoint.updateWorkstationStatus();
            }

        }
    };

    var removeDeliveredService = function (rowClicked, dsName) {
        if (servicePoint.hasValidSettings()) {
            var removeParams = servicePoint.createParams();
            removeParams.visitId = sessvars.state.visit.id;
            removeParams.visitDeliveredServiceId = deliveredServicesTable.fnGetData(rowClicked).id;
            var delResponse = spService.del("branches/"
                + removeParams.branchId + "/visits/"
                + removeParams.visitId + "/deliveredServices/"
                + removeParams.visitDeliveredServiceId);
            sessvars.state = servicePoint.getState(delResponse);
            if (delResponse) {
                customMarks.getUserStateWorkaround(true);
                util.showMessage(jQuery.i18n
                    .prop('success.removed.ds') + " " + dsName);
            } else {
                customMarks.getUserStateWorkaround();
            }
        }
    };

    this.updateDeliveredServices = function () {
        if (typeof deliveredServicesTable != 'undefined') {
            deliveredServicesTable.fnClearTable();
            if (sessvars.state.visit != null && sessvars.state.visit.currentVisitService.visitDeliveredServices != null) {
                if (sessvars.state.visit.currentVisitService.visitDeliveredServices.length > 0) {
                    deliveredServicesTable.fnAddData(sessvars.state.visit.currentVisitService.visitDeliveredServices);
                    deliveredServicesTable.fnAdjustColumnSizing();
                }
            }
        } else {
            var columns = [
/* D.serv. name */     {
                    // "sClass": "qm-table__first-column",
                    "mDataProp": "deliveredServiceName",
                    "sDefaultContent": null,
                    "bSortable": false,
                    "sWidth": "auto",
                    "sType": "qm-sort",
                    "bVisible": true
                },
/* D.serv. jiql id */  {
                    "bSearchable": false,
                    "bVisible": false,
                    "mDataProp": "id",
                    "sDefaultContent": null,
                    "bSortable": false,
                    "sType": "qm-sort"
                },
/* D.serv. orig id */  {
                    "bSearchable": false,
                    "bVisible": false,
                    "mDataProp": "deliveredServiceId",
                    "sDefaultContent": null,
                    "bSortable": false,
                    "sType": "qm-sort"
                },
/* D.serv. outcome */  {
                    // "sClass": "qm-table__middle-column",
                    "mDataProp": "visitOutcome",
                    "sDefaultContent": null,
                    "bSortable": false,
                    "sWidth": "auto",
                    "sType": "qm-sort",
                    "bVisible": true
                },
/* Delivered time */   {
                    // "sClass": "qm-table__last-column",
                    "mDataProp": "eventTime",
                    "sDefaultContent": null,
                    "bSortable": false,
                    "sWidth": "95px",
                    "sType": "qm-sort",
                    "createdCell": function (td, cellData, rowData, row, col) {

                        $(td).append(
                            "<span class=\"removeMarkBtn\" " + "title=\""
                            + jQuery.i18n.prop("action.remove.ds.click")
                            + "\"> " + '<button class="qm-action-btn qm-action-btn--only-icon">'
                            + '<i class="qm-action-btn__icon icon-close" aria-hidden="true"></i>'
                            + '<span class="sr-only">delete button</span>'
                            + '</button>' + "</span>");

                        $(td).find(".removeMarkBtn").click(function () {
                            
                            removeDeliveredService(row, rowData.deliveredServiceName);
                        });
                    },
                    "bVisible": true
                },
/* D.serv. out req. */ {
                    "bSearchable": false,
                    "bVisible": false,
                    "bSortable": false,
                    "mDataProp": "outcomeExists",
                    "sType": "qm-sort"
                }
            ];
            var headerCallback = function (nHead, aasData, iStart, iEnd, aiDisplay) {
                // if (nHead.getElementsByTagName('th')[0].innerHTML.length == 0) {
                    nHead.getElementsByTagName('th')[0].innerHTML = jQuery.i18n.prop('info.delivered.service.name');
                    nHead.getElementsByTagName('th')[1].innerHTML = jQuery.i18n.prop('info.delivered.service.outcome');
                    nHead.getElementsByTagName('th')[2].innerHTML = jQuery.i18n.prop('info.delivered.service.time');
                // }
            };
            var rowCallback = function (nRow, aData, iDisplayIndex) {
                var outcomeDataIndex = "visitOutcome";
                if (aData["outcomeExists"] == true || null != aData[outcomeDataIndex]) {
                    var html;
                    html = $('<select id="outcomeList_' + iDisplayIndex + '"' + '><option value="-1"></option></select>');
                    $("option[value='-1']", html).text(translate.msg("info.choose.outcome.for.delivered.service")).attr('disabled', 'disabled');
                    var params = servicePoint.createParams();
                    params.serviceId = sessvars.state.visit.currentVisitService.serviceId;
                    params.deliveredServiceId = aData["deliveredServiceId"];

                    var possibleOutcomes = spService.get("branches/" + params.branchId + "/services/" + params.serviceId + "/deliveredServices/" + params.deliveredServiceId + "/outcomes", true);
                    util.sortArrayCaseInsensitive(possibleOutcomes, "name");

                    $.each(possibleOutcomes, function (i, outcome) {
                        html.append($("<option></option>")
                            .prop("value", outcome.code)
                            .text(outcome.name))
                    });

                    if (null != aData[outcomeDataIndex]) {
                        html.val(aData[outcomeDataIndex].outcomeCode);
                    } else {
                        html.val("-1");
                        // $(html).parent().addClass("invalid");
                    }

                    html.change(function () {
                        var $self = $(this);
                        if ($self.val() != -1) {
                            var params = servicePoint.createParams();
                            params.visitId = sessvars.state.visit.id;
                            var nTr = $self.closest("tr").get(0);
                            var aData = deliveredServicesTable.fnGetData(nTr);
                            
                            var outcomeName = $self.find(":selected").text()
                            params.visitDeliveredServiceId = parseInt(aData["id"]);
                            params.outcomeCode = $self.val();
                            
                            sessvars.state = servicePoint.getState(spService.putCallback("branches/" + params.branchId + "/visits/" + params.visitId + "/deliveredServices/" + params.visitDeliveredServiceId + "/outcome/" + params.outcomeCode));
                            util.showMessage(translate.msg('info.ds.outcome.added', [outcomeName, aData.deliveredServiceName]), false);
                            
                            servicePoint.updateWorkstationStatus(false, true);
                            $self.prev('div').text(outcomeName);
                        }
                    });

                    $('td:eq(1)', nRow).html(html);
                    html.wrap("<div class='cross-browser-select " + ((!html.val() || html.val() == -1)  ? "invalid" : "") + "'></div>")
                    html.before($("<div class='native-like-select select-carrot-icon'>" + html.find(":selected").text() + "</div>")
                    );
                }
            };
            deliveredServicesTable = $('#deliveredServices').dataTable({
                "bDestroy": true,
                "oLanguage": {
                    "sEmptyTable": translate.msg("info.no.delivered.services"),
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
                "aaData": (sessvars.state.visit != null &&
                    sessvars.state.visit.currentVisitService != null &&
                    sessvars.state.visit.currentVisitService.visitDeliveredServices !== null ?
                    sessvars.state.visit.currentVisitService.visitDeliveredServices : null)
            });
            deliveredServicesTable.fnSort(SORTING);
            $(window).bind('resize', function () {
                deliveredServicesTable.fnAdjustColumnSizing();
            });
        }
    };

    this.clearTable = function () {
        util.clearTable(deliveredServicesTable);
    };

    this.getDataTable = function () {
        return deliveredServicesTable;
    }
};
