

function addElement(){}

var oTPModal = {
    container: function(){
        return document.getElementsByClassName('tp-modal')
    },
    init: function(){
        $.getJSON(oTPInjector.env.urlWebResources + '/data/tpmodal/tpmodal.json', function(allModalsData){

            /* MACRO VARIABLES */

            // Filter Location Protocol
                secureToPlain = window.location.href.replace("https:","http:"),
                plainToSecure = window.location.href.replace("http:","https:");

            // Protocol Conditioning
            if(allModalsData[secureToPlain] != undefined || allModalsData[plainToSecure] != undefined || null){

                // Ternary Operator for Variable Conditioning
                (allModalsData[secureToPlain] != undefined) ? sectionToAppend = secureToPlain : sectionToAppend = plainToSecure;

                var sectionModals = allModalsData[sectionToAppend]['sectionModals'],
                modalCount = sectionModals.length;

                // Checking for total amount / Internal Iteration
                for (var i = 0; i < modalCount; i++){

                    var sectionModal = allModalsData[sectionToAppend]['sectionModals'][i];
                    $.ajax({
                        type: 'GET',
                        async: false,
                        url: oTPInjector.env.urlWebResources + '/data/tpmodal/' + sectionModal['url'],
                        success: function(singleModal){

                            /* MICRO VARIABLES */

                            // Live Date
                            var oNow = new Date(),
                                modalName = sectionModal['modalName'],
                                singleModalId = "#" + modalName,
                                modalSelector = `${singleModalId} .modal , ${singleModalId} .close`,
                                showingLimit = sectionModal['showingLimit'],
                                enabled = sectionModal['enabled'],
                                blocked = sectionModal['blocked'],

                            // Date Checkers
                                startDate = sectionModal['startDate'],
                                startHour = sectionModal['startHour'],
                                startModalDate = startDate + 'T' + startHour,
                                
								startModalDateSplited = startModalDate.split(/[^0-9]/),
								startModal = new Date (startModalDateSplited[0],startModalDateSplited[1]-1,startModalDateSplited[2],startModalDateSplited[3],startModalDateSplited[4],startModalDateSplited[5] ),
					            
								
								endDate = sectionModal['endDate'],
                                endHour = sectionModal['endHour'],
                                endModalDate = endDate + 'T' + endHour,
								
								endModalDateSplited = endModalDate.split(/[^0-9]/),
								endModal = new Date (endModalDateSplited[0],endModalDateSplited[1]-1,endModalDateSplited[2],endModalDateSplited[3],endModalDateSplited[4],endModalDateSplited[5] ),
								
								

                            // BTN Checkers
                                constructionBtnUnlock = sectionModal['constructionBtnUnlock'],
                                btnUnlockText = sectionModal['btnUnlockText'],
                                constructionBtnRedir = sectionModal['constructionBtnRedir'],
                                btnRedirText = sectionModal['btnRedirText'],
                                btnRedirHref = sectionModal['btnRedirHref'],
                                btnRedirButton = $(`<a href="${btnRedirHref}" class="btn btn-primary">${btnRedirText}</a>`),
                                btnUnlockButton = $(`<button class="btn btn-default" data-dismiss="modal">${btnUnlockText}</button>`),
                                oContainer = ("#" + modalName + " .modal-footer"),
                                oElement,
                                alertCounter = 1;
                                (localStorage[modalName] == 'blocked') ? autoOpen = false : autoOpen = sectionModal['autoOpen'];

                            // Date Conditioning
                            if(((startModal < oNow) && (endModal > oNow)) && enabled){

                                $('body').append(singleModal);

                                (constructionBtnRedir) ? $(oContainer).append(btnRedirButton) : null;
                                (constructionBtnUnlock) ? $(oContainer).append(btnUnlockButton) : null;
                                (autoOpen) ? $('#' + modalName).modal('show') : null;
                                if (blocked){
                                    $(`${modalSelector}`).hide();
                                    $(`#${modalName}`).on("shown.bs.modal", function(e) {
                                        $(this).off('keyup.dismiss.bs.modal');
                                        $(this).data('bs.modal').options.backdrop = 'static';
                                    });
                                }
                            }

                            // MaxLimit of Showings Counter
                            $(`#${modalName}`).on('hidden.bs.modal', function(e){

                                // If variable doesn't exist on LocalStorage; create it. If it does exist; conditionate it
                                if(localStorage.getItem(modalName)===null){
                                    localStorage.setItem(modalName, alertCounter)
                                } else {

                                    // Check for showingLimit or condition
                                    if(localStorage[modalName] == showingLimit || localStorage[modalName] == 'blocked'){
                                        $(`#${modalName}`).modal('hide').on('hidden.bs.modal', function(e){
                                            $(`[data-tpmodal=${modalName}`).attr('disabled', true);
                                            $(this).remove();                                        
                                        })
                                        localStorage[modalName] = "blocked";
                                    } else {
                                        alertCounter = localStorage[modalName];
                                        alertCounter++;
                                        localStorage[modalName] = alertCounter;
                                    }
                                }
                            })
                        }
                    })
                }
            }
        })
        // This script checks for duplicate close icons
        setInterval(function(){ 
            if (window.location.href.indexOf("tienda.personal.com.ar") > -1){

                // Recursive method for XPath functionality in jQuery
                function _x(STR_XPATH) {
                    var xresult = document.evaluate(STR_XPATH, document, null, XPathResult.ANY_TYPE, null);
                    var xnodes = [];
                    var xres;
                    while (xres = xresult.iterateNext()) {
                        xnodes.push(xres);
                    }
                    return xnodes;
                }

                var element = $(_x('//button/span/text()'));
                if(element.length > 0){ element[0].data = "" }
            }
        }, 100);
    }
}

oTPModal.init();
