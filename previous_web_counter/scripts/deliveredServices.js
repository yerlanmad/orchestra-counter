var deliveredServices = new function () {

    var deliveredServicesTable;
    var selectDeliveredServiceTable;
    var SORTING = [[4, 'desc'], [1, 'desc']];
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
            var dsResponse = spService.get(url)
            var dsServices = util.sortArrayCaseInsensitive(dsResponse, "name")

            util.populateSelect(dsServices, dropdownFilter);
            dropdownFilter.trigger("chosen:updated");
        }
    };

    this.selectDeliveredService = function (dsId) {
        if (dsId != -1) {
            resetFilterSeleciton();
            deliveredServiceClicked(dsId);
            this.updateDeliveredServices();
        }
    }

    var deliveredServiceClicked = function (dsId) {
        if (servicePoint.hasValidSettings()) {
            var deliveredServicesParams = servicePoint.createParams();
            deliveredServicesParams.visitId = sessvars.state.visit.id;
            deliveredServicesParams.visitServiceId = sessvars.state.visit.currentVisitService.id;
            deliveredServicesParams.deliveredServiceId = dsId;
            var params = deliveredServicesParams;
            sessvars.state = servicePoint.getState(spService.post("branches/" + params.branchId + "/visits/" + params.visitId + "/services/" + params.visitServiceId + "/deliveredServices/" + params.deliveredServiceId));
            sessvars.statusUpdated = new Date();
            // util.hideModal("addDeliveredServices");
            if (sessvars.state.servicePointState == servicePoint.servicePointState.OPEN &&
                sessvars.state.userState == servicePoint.userState.SERVING) {
            }
            servicePoint.updateWorkstationStatus(false, true);
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
                    "sClass": "qm-table__first-column",
                    "mDataProp": "deliveredServiceName",
                    "sDefaultContent": null,
                    "sWidth": "33%"
                },
/* D.serv. jiql id */  {
                    "bSearchable": false,
                    "bVisible": false,
                    "mDataProp": "id",
                    "sDefaultContent": null
                },
/* D.serv. orig id */  {
                    "bSearchable": false,
                    "bVisible": false,
                    "mDataProp": "deliveredServiceId",
                    "sDefaultContent": null
                },
/* D.serv. outcome */  {
                    "sClass": "qm-table__middle-column",
                    "mDataProp": "visitOutcome",
                    "sDefaultContent": null,
                    "bSortable": false,
                    "sWidth": "45%"
                },
/* Delivered time */   {
                    "sClass": "qm-table__last-column",
                    "mDataProp": "eventTime",
                    "sDefaultContent": null,
                    "sWidth": "22%"
                },
/* D.serv. out req. */ {
                    "bSearchable": false,
                    "bVisible": false,
                    "mDataProp": "outcomeExists"
                }
            ];
            var headerCallback = function (nHead, aasData, iStart, iEnd, aiDisplay) {
                if (nHead.getElementsByTagName('th')[0].innerHTML.length == 0) {
                    //nHead.style.borderBottom = "1px solid #c0c0c0";
                    nHead.getElementsByTagName('th')[0].innerHTML = jQuery.i18n.prop('info.delivered.service.name');
                    nHead.getElementsByTagName('th')[1].innerHTML = jQuery.i18n.prop('info.delivered.service.outcome');
                    nHead.getElementsByTagName('th')[2].innerHTML = jQuery.i18n.prop('info.delivered.service.time');
                }
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
                    var possibleOutcomes = spService.get("branches/" + params.branchId + "/services/" + params.serviceId + "/deliveredServices/" + params.deliveredServiceId + "/outcomes");

                    $.each(possibleOutcomes, function (i, outcome) {
                        html.append($("<option></option>")
                            .prop("value", outcome.code)
                            .text(outcome.name))
                    });

                    if (null != aData[outcomeDataIndex]) {
                        html.val(aData[outcomeDataIndex].outcomeCode);
                    } else {
                        html.val("-1");
                    }

                    html.change(function () {
                        if ($(this).val() != -1) {
                            var params = servicePoint.createParams();
                            params.visitId = sessvars.state.visit.id;
                            var nTr = $(this).closest("tr").get(0);
                            var aData = deliveredServicesTable.fnGetData(nTr);
                            params.visitDeliveredServiceId = parseInt(aData["id"]);
                            params.outcomeCode = $(this).val();
                            sessvars.state = servicePoint.getState(spService.putCallback("branches/" + params.branchId + "/visits/" + params.visitId + "/deliveredServices/" + params.visitDeliveredServiceId + "/outcome/" + params.outcomeCode));
                            servicePoint.updateWorkstationStatus(false, true);
                            $(this).prev('div').text($(this).find(":selected").text());
                        }
                    });

                    $('td:eq(1)', nRow).html(html);
                    html.wrap("<div class='cross-browser-select'></div>")
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
            $(window).bind('resize', function () {
                deliveredServicesTable.fnAdjustColumnSizing();
            });
        }
        deliveredServicesTable.fnSort(SORTING);
    };

    this.cancelAddDeliveredServices = function () {
        util.hideModal("addDeliveredServices");
    };

    this.hideAddDeliveredServices = function () {
        util.hideModal("addDeliveredServices");
    };

    this.clearTable = function () {
        util.clearTable(deliveredServicesTable);
    };

    this.getDataTable = function () {
        return deliveredServicesTable;
    }
};
