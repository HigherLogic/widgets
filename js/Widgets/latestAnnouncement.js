//! Latest Announcements Widget
//! version : 1.0.0
//! latestAnnouncement.js
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
/*global moment */
this.hl = this.hl || {};
(function (hl, document, $, navigator) {
    "use strict";
    var el,
        defaultSettings = {
            daysBack: 30,
            includeStaff: false,
            maxRecords: 10,
            subjectLength: 50,
            contentLength: 160,
            showLoginStatus: 1,
            loginUrl: '',
            useBioBubble: 0,
            announcementTypeFilter: '',
            communityKey: '',
            micrositeGroupTypeRouteDesignKey: '',
            sortOrder: '',
            HLIAMKey: ''
        },
        settings = {},
        announcementWidget = {
            onRpcSuccess: function (response) {
                var widgetWrapper,
                    emptyMessage = 'No Announcements found.',
                    announcements = JSON.parse(response.data),
                    announcementSubject,
                    announcementBody,
                    widgetHTML = '<div class="border">' +
                        '<div class="container">' +
                        '<ul>',
                    limit = Math.min(settings.maxRecords, announcements.length),
                    i,
                    emptyGuid = '00000000-0000-0000-0000-000000000000',
                    currentUserContactKey,
                    bioBubbleKeys = {},
                    element = 'login-information-container';


                if (el.nextSibling !== null && el.nextSibling.nodeName.toLowerCase() === 'div') {
                    if (el.nextSibling.className !== 'hl-widget latest-announcement') {
                        widgetWrapper = document.createElement('div');
                        widgetWrapper.setAttribute('class', 'hl-widget latest-announcement');
                    } else {
                        widgetWrapper = el.nextSibling;
                        widgetWrapper.innerHTML = '';
                    }
                } else {
                    widgetWrapper = document.createElement('div');
                    widgetWrapper.setAttribute('class', 'hl-widget latest-announcement');
                }

                for (i = 0; i < limit; i = i + 1) {
                    announcementSubject = announcements[i].AnnouncementTitle > settings.subjectLength ? announcements[i].AnnouncementTitle.substr(0, settings.subjectLength) + '...' : announcements[i].AnnouncementTitle;
                    announcementBody = announcements[i].AnnouncementText > settings.contentLength ? announcements[i].AnnouncementText.substr(0, settings.contentLength) + '...' : announcements[i].AnnouncementText;

                    widgetHTML += '<li>' +
                        '<div class="item-header-container">' +
                        '<div class="item-image-container" biobubblekey="' + announcements[i].CreatedByContactKey + '">' +
                        '<a href="' + announcements[i].LinkToContactProfile + '">' +
                        '<img class="item-image" src="' + announcements[i].ContactSmallPictureUrl + '" />' +
                        '</a>' +
                        '</div>' +
                        '<div class="item-title-container">' +
                        '<span title="' + announcements[i].AnnouncementTitle + '">' + announcementSubject + '</span>' +
                        '</div>' +
                        '<div class="item-by-line-container">' +
                        '<span>By: </span><a href="' + announcements[i].LinkToContactProfile + '" biobubblekey="' + announcements[i].CreatedByContactKey + '">' + announcements[i].ContactDisplayName + '</a>' +
                        '<span>, ' + moment(announcements[i].CreatedOn).startOf('seconds').fromNow() + ' </span>' +
                        '</div>' +
                        '</div>' +
                        '<div class="item-body-container">' +
                        '<div class="item-body-text">' + announcementBody + '</div>' +
                        '<div class="item-body-link">' +
                        '<a href="' + announcements[i].LinkUrl + '">' + announcements[i].LinkText + '</a>' +
                        '</div>' +
                        '</div>' +
                        '</li>';
                }

                if (announcements.length === 0) {
                    widgetHTML += '<li>' +
                        '<div class="empty">' + emptyMessage + '</div>' +
                        '</li>';
                }

                widgetHTML += '</ul>' +
                    '<div class="footer-container">' +
                    '</div>' +
                    '</div>';

                if ((settings.showLoginStatus === 1 || settings.showLoginStatus === '1') && settings.loginUrl.length > 0) {

                    widgetHTML += '<div id="login-information-container"></div>' +
                        '</div>';

                } else {
                    widgetHTML += '</div>';
                }

                widgetWrapper.innerHTML = widgetHTML;
                el.parentNode.insertBefore(widgetWrapper, el.nextSibling);
                if ($ !== undefined || window.jQuery !== undefined) {
                    if (settings.useBioBubble === 1 || settings.useBioBubble === '1') {

                        if (response.headers.CurrentContactKey !== undefined &&
                                response.headers.CurrentContactKey !== emptyGuid) {
                            currentUserContactKey = response.headers.CurrentContactKey;
                        } else {
                            currentUserContactKey = emptyGuid;
                        }

                        //                    var $allBioBubbleKeys = $("[biobubblekey]");

                        $("[biobubblekey]").each(function () {
                            bioBubbleKeys[$(this).attr('biobubblekey')] = true; // get distinct list of keys
                        });

                        for (i in bioBubbleKeys) {
                            if (bioBubbleKeys.hasOwnProperty(i)) {
                                $('#' + 'bioBubbleShell' + i).hl_ui_bioBubble({
                                    displayContactKey: i,
                                    currentContactKey: currentUserContactKey,
                                    HLIAMKey: settings.HLIAMKey,
                                    eventTriggers: $('[biobubblekey="' + i + '"]')
                                });
                            }
                        }
                    }
                }

                if ((settings.showLoginStatus === 1 || settings.showLoginStatus === '1') && settings.loginUrl.length > 0) {
                    hl.whoAmI(element, { HLIAMKey: settings.HLIAMKey, domainLoginUrl: settings.loginUrl });
                }
            },
            onRpcFailure: function (response) {
                var widgetErrorMessage;
                if (el.nextSibling !== null && el.nextSibling.nodeName.toLowerCase() === 'div') {
                    if (el.nextSibling.className !== 'hl-widget latest-announcement') {
                        widgetErrorMessage = document.createElement('div');
                        widgetErrorMessage.setAttribute('class', 'hl-widget latest-announcement');
                    } else {
                        widgetErrorMessage = el.nextSibling;
                        widgetErrorMessage.innerHTML = '';
                    }
                } else {
                    widgetErrorMessage = document.createElement('div');
                    widgetErrorMessage.setAttribute('class', 'hl-widget latest-announcement');
                }
                widgetErrorMessage.innerHTML = '<div class="border"><div class="container"><div class="error-message">Error: ' + response.message.message + '</div></div></div>';
                el.parentNode.insertBefore(widgetErrorMessage, el.nextSibling);
            },
            getLatestAnnouncement: function () {
                var urlParams = [settings.announcementTypeFilter, settings.communityKey, settings.micrositeGroupTypeRouteDesignKey, settings.sortOrder, settings.maxRecords],
                    rpc,
                    consumerRpcConfig = { remote: document.location.protocol + '//api.connectedcommunity.org/Scripts/easyXDM/cors/' },
                    consumerJsonRpcConfig = { remote: { request: {} } },
                    buildUrlPath = function (params) {
                        var currentParam,
                            retStr = '?',
                            paramNames = ['announcementTypeFilter', 'communityKey', 'micrositeGroupTypeRouteDesignKey', 'sortOrder', 'maxResults'],
                            pIdx;

                        for (pIdx = 0; pIdx < params.length; pIdx = pIdx + 1) {
                            currentParam = params[pIdx];
                            if (currentParam !== undefined && currentParam !== '') {
                                if (retStr.charAt(retStr.length - 1) !== '?') {
                                    retStr += '&';
                                }
                                retStr += paramNames[pIdx] + '=' + currentParam;
                            }
                        }
                        return (retStr === '?') ? '' : retStr;
                    },
                    requestConfig = {
                        url: document.location.protocol + '//api.connectedcommunity.org/api/v2.0/Announcements/GetAnnouncements' + buildUrlPath(urlParams),
                        method: 'GET',
                        headers: {
                            'HLIAMKey': settings.HLIAMKey,
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        }
                    };
                if (hl.HLEasyXDM.easyXDM !== undefined) {
                    rpc = new hl.HLEasyXDM.easyXDM.Rpc(consumerRpcConfig, consumerJsonRpcConfig);
                    rpc.request(requestConfig, announcementWidget.onRpcSuccess, announcementWidget.onRpcFailure);
                }
            }
        };

    hl.latestAnnouncement = function (element, s) {
        var regEx = new RegExp('MSIE ([0-9]{1,}[0-9]{0,})'),
            uA = navigator.userAgent,
            commonElement = document.createElement('script');
        el = document.getElementById(element);

        if (hl.widgetInit === undefined) {
            commonElement.type = 'text/javascript';
            if (document.location.origin === 'http://localhost:56165') {
                commonElement.src = document.location.origin + '/widgetscripts/widgets/hlwidgetcommon.js';
            } else {
                commonElement.src = document.location.protocol + '//api.connectedcommunity.org/widgetscripts/widgets/hlwidgetcommon.js';
            }
            el.parentNode.insertBefore(commonElement, el);
            if (navigator.appName === 'Microsoft Internet Explorer') {
                if (regEx.exec(uA) !== null) {
                    if (parseFloat(RegExp.$1) < 9) {
                        commonElement.attachEvent('onreadystatechange', function () {
                            settings = hl.extend({}, defaultSettings, s);
                            hl.widgetInit(el, announcementWidget.getLatestAnnouncement);
                        });
                    } else {
                        commonElement.onload = function () {
                            settings = hl.extend({}, defaultSettings, s);
                            hl.widgetInit(el, announcementWidget.getLatestAnnouncement);
                        };
                    }
                }
            } else {
                commonElement.onload = function () {
                    settings = hl.extend({}, defaultSettings, s);
                    hl.widgetInit(el, announcementWidget.getLatestAnnouncement);
                };
            }
        } else {
            settings = hl.extend({}, defaultSettings, s);
            hl.widgetInit(el, announcementWidget.getLatestAnnouncement);
        }
    };
    return hl;
}(this.hl, document, window.jQuery || undefined, navigator));
