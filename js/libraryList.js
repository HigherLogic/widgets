//! Library List Widget
//! version : 1.0.0
//! libraryList.js
 //! Author: George Stocker
 //! Twitter: @gortok

/*
    The MIT License (MIT)

     Copyright (c) 2014 Higher Logic, LLC

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
*/

this.hl = this.hl || {};
(function (hl, document, navigator) {
    "use strict";
    var el,
        defaultSettings = {
            daysBack: 30,
            includeStaff: true,
            maxRecords: 10,
            libraryNameLength: 50,
            descriptionLength: 50,
            showDownloadCount: 1,
            moreUrlText: "More"
        },
        settings = {},
        libraryWidget = {
            onRpcSuccess: function (response) {
                var widgetWrapper,
                    emptyMessage = 'No Library documents found.',
                    documents = JSON.parse(response.data),
                    documentTitle,
                    description,
                    downloadsString,
                    downloadsText = '',
                    widgetHTML = '<div class="border">' +
                        '<div class="container">' +
                        '<ul>',
                    limit = Math.min(settings.maxRecords, documents.length),
                    k,
                    moreUrlMarkup = "",
                    element = 'login-information-container';

                if (el.nextSibling !== null && el.nextSibling.nodeName.toLowerCase() === 'div') {
                    if (el.nextSibling.className.toLowerCase() !== 'hl-widget library-list') {
                        widgetWrapper = document.createElement('div');
                        widgetWrapper.setAttribute('class', 'hl-widget library-list');
                    } else {
                        widgetWrapper = el.nextSibling;
                        widgetWrapper.innerHtml = '';
                    }
                } else {
                    widgetWrapper = document.createElement('div');
                    widgetWrapper.setAttribute('class', 'hl-widget library-list');
                }

                for (k = 0; k < limit; k = k + 1) {
                    documentTitle = documents[k].DocumentTitle > settings.titleLength ? documents[k].DocumentTitle.substr(0, settings.titleLength) + '...' : documents[k].DocumentTitle;
                    description = documents[k].Description > (settings.descriptionLength && settings.descriptionLength > 0) ? documents[k].Description.substr(0, settings.descriptionLength) + '...' : documents[k].Description;
                    if (settings.descriptionLength === 0 || settings.descriptionLength === '0') {
                        description = "";
                    }
                    downloadsString = (documents[k].DownloadCount === 1 || documents[k].DownloadCount === '1') ? ' download' : ' downloads';

                    if (settings.showDownloadCount === 1 || settings.showDownloadCount === '1') {
                        downloadsText = '(' + documents[k].DownloadCount + downloadsString + ')';
                    }
                    widgetHTML += '<li>' +
                        '<div class="item-header-container">' +
                        '<div class="item-title-container">' +
                        '<a title="' + documents[k].DocumentTitle + '" href="' + documents[k].LinkToLibraryDocument + '">' + documentTitle + '</a>' + downloadsText +
                        '</div>' +
                        '</div>' +
                        '<div class="item-body-container">' + description + '</div>' +
                        '</li>';
                }

                if (documents.length === 0) {
                    widgetHTML += '<li>' +
                        '<div class="empty">' + emptyMessage + '</div>' +
                        '</li>';
                }
                if (settings.moreUrl !== "" && settings.moreUrl.length > 0 && documents.length > 0) {
                    moreUrlMarkup = '<div class="footer-item-more"><a href="' + settings.moreUrl + '">' + settings.moreUrlText + '</a></div>';
                }
                widgetHTML += '</ul>' +
                    '<div class="footer-container">' +
                    moreUrlMarkup +
                    '</div>' +
                    '</div>';

                if (settings.showLoginStatus && settings.loginUrl.length > 0) {

                    widgetHTML += '<div id="login-information-container"></div>' +
                        '</div>';

                } else {
                    widgetHTML += '</div>';
                }

                widgetWrapper.innerHTML = widgetHTML;
                el.parentNode.insertBefore(widgetWrapper, el.nextSibling);

                if ((settings.showLoginStatus === '1' || settings.showLoginStatus === 1) && settings.loginUrl.length > 0) {
                    hl.whoAmI(element, { HLIAMKey: settings.HLIAMKey, domainLoginUrl: settings.loginUrl });
                }
            },
            onRpcFailure: function (response) {
                var widgetErrorMessage;
                if (el.nextSibling !== null && el.nexSibline.nodeName === 'DIV') {
                    if (el.nextSibling.className !== 'hl-widget library-list') {
                        widgetErrorMessage = document.createElement('div');
                        widgetErrorMessage.setAttribute('class', 'hl-widget library-list');
                    } else {
                        widgetErrorMessage = el.nextSibling;
                        widgetErrorMessage.innerHtml = '';
                    }
                } else {
                    widgetErrorMessage = document.createElement('div');
                    widgetErrorMessage.setAttribute('class', 'hl-widget library-list');
                }
                widgetErrorMessage.innerHTML = '<div class="border"><div class="container"><div class="error-message">Error: ' + JSON.parse(response.data.data).Message + '</div></div></div>';
                el.parentNode.insertBefore(widgetErrorMessage, el.nextSibling);
            },
            getLibraryDocuments: function () {
                var requestConfig = {
                    url: document.location.protocol + '//api.connectedcommunity.org/api/v2.0/ResourceLibrary/GetLibraryDocuments',
                    method: 'POST',
                    headers: {
                        'HLIAMKey': settings.HLIAMKey,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    data: JSON.stringify({
                        'DaysBack': settings.daysBack,
                        'LibraryKey': settings.libraryKey,
                        'IncludeStaff': settings.includeStaff,
                        'MaxRecords': settings.maxRecords
                    })
                },
                    rpc,
                    consumerRpcConfig = { remote: document.location.protocol + '//api.connectedcommunity.org/Scripts/easyXDM/cors/' },
                    consumerJsonRpcConfig = { remote: { request: {} } };

                if (hl.HLEasyXDM.easyXDM !== undefined) {
                    rpc = new hl.HLEasyXDM.easyXDM.Rpc(consumerRpcConfig, consumerJsonRpcConfig);
                    rpc.request(requestConfig, libraryWidget.onRpcSuccess, libraryWidget.onRpcFailure);
                }
            }
        };
    hl.libraryList = function (element, s) {
        var regEx = new RegExp('MSIE ([0-9]{1,}[0-9]{0,})'),
            uA = navigator.userAgent,
            commonElement = document.createElement('script');
        el = document.getElementById(element);

        if (hl.widgetInit === undefined) {
            commonElement.type = 'text/javascript';
            commonElement.src = document.location.protocol + '//api.connectedcommunity.org/widgetscripts/widgets/hlwidgetcommon.js';
            
            el.parentNode.insertBefore(commonElement, el);
            if (navigator.appName === 'Microsoft Internet Explorer') {
                if (regEx.exec(uA) !== null) {
                    if (parseFloat(RegExp.$1) < 9) {
                        commonElement.attachEvent('onreadystatechange', function () {
                            settings = hl.extend({}, defaultSettings, s);
                            hl.widgetInit(el, libraryWidget.getLibraryDocuments);
                        });
                    } else {
                        commonElement.onload = function () {
                            settings = hl.extend({}, defaultSettings, s);
                            hl.widgetInit(el, libraryWidget.getLibraryDocuments);
                        };
                    }
                }
            } else {
                commonElement.onload = function () {
                    settings = hl.extend({}, defaultSettings, s);
                    hl.widgetInit(el, libraryWidget.getLibraryDocuments);
                };
            }
        } else {
            settings = hl.extend({}, defaultSettings, s);
            hl.widgetInit(el, libraryWidget.getLibraryDocuments);
        }
    };
    return hl;
}(this.hl, document, navigator));
