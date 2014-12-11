//! Upcoming Events Widget
//! version : 1.0.0
//! upcomingEvent.js
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
(function (hl, document, navigator) {
    "use strict";
    var el,
        defaultSettings = {
            titleLength: 50,
            viewCalendarUrl: '',
            addEventUrl: '',
            showLoginStatus: 0,
            loginUrl: '',
            maxRecords: 10,
            HLIAMKey: '',
            eventTypeName: '',
            communityKey: '',
            domainUrl: ''
        },
        settings = {},
        eventWidget = {
            onRpcSuccess: function (response) {
                var formatLocationString = function (townOrCity, stateProvinceCode, countryName) {
                    var retStr = '';
                    if (countryName !== '') {
                        retStr = countryName;
                        if (stateProvinceCode !== '') {
                            retStr = stateProvinceCode + ', ' + retStr;
                        }
                        if (!((countryName === 'United States' || countryName === 'Canada') && stateProvinceCode === '') && townOrCity !== '') {
                            retStr = townOrCity + ', ' + retStr;
                        }
                    }
                    return retStr;
                },
                    formatLocationStringFromAddress = function (address) {
                        if (address === null) {
                            return '';
                        }
                        return formatLocationString(address.TownOrCity, address.StateProvinceCode, address.CountryName);
                    },
                    widgetWrapper,
                    emptyMessage = 'No upcoming events found.',
                    events = JSON.parse(response.data),
                    eventTitle,
                    widgetHTML = '<div class="border">' +
                        '<div class="container">' +
                        '<ul>',
                    limit = Math.min(settings.maxRecords, events.length),
                    i,
                    viewCalendarUrlMarkup = "",
                    element = 'login-information-container';

                if (el.nextSibling !== null && el.nextSibling.nodeName.toLowerCase() === 'div') {
                    if (el.nextSibling.className !== 'hl-widget upcoming-event') {
                        widgetWrapper = document.createElement('div');
                        widgetWrapper.setAttribute('class', 'hl-widget upcoming-event');
                    } else {
                        widgetWrapper = el.nextSibling;
                        widgetWrapper.innerHTML = '';
                    }
                } else {
                    widgetWrapper = document.createElement('div');
                    widgetWrapper.setAttribute('class', 'hl-widget upcoming-event');
                }

                for (i = 0; i < limit; i = i + 1) {
                    eventTitle = events[i].EventTitle > settings.titleLength ? events[i].EventTitle.substr(0, settings.titleLength) + '...' : events[i].EventTitle;

                    widgetHTML += '<li>' +
                        '<div class="item-header-container">' +
                        '<div class="item-title-container">' +
                        '<a title="' + events[i].EventTitle + '" href="' + events[i].LinkToEventDetails + '">' + eventTitle + '</a>' +
                        '</div>' +
                        '<div class="item-date-line-container">' +
                        '<span>' + events[i].FormatedDateRangeLong + '</span>' +
                        '</div>' +
                        '</div>' +
                        '<div class="item-body-container">' + formatLocationStringFromAddress(events[i].Address) + '</div>' +
                        '</li>';
                }

                if (events.length === 0) {
                    widgetHTML += '<li>' +
                        '<div class="empty">' + emptyMessage + '</div>' +
                        '</li>';
                }

                if (settings.viewCalendarUrl !== "" && settings.viewCalendarUrl.length > 0 && events.length > 0) {
                    viewCalendarUrlMarkup = '<div class="footer-item-view-calendar"><a href="' + settings.viewCalendarUrl + '">View Calendar</a></div>';
                }

                widgetHTML += '</ul>' +
                    '<div class="footer-container">' +
                    viewCalendarUrlMarkup + '</div>' +
                    '</div>';


                if ((settings.showLoginStatus === 1 || settings.showLoginStatus === '1') && settings.loginUrl.length > 0) {

                    widgetHTML += '<div id="login-information-container"></div>' +
                        '</div>';
                } else {
                    widgetHTML += '</div>';
                }

                widgetWrapper.innerHTML = widgetHTML;
                el.parentNode.insertBefore(widgetWrapper, el.nextSibling);

                if ((settings.showLoginStatus === 1 || settings.showLoginStatus === '1') && settings.loginUrl.length > 0) {
                    hl.whoAmI(element, { HLIAMKey: settings.HLIAMKey, domainLoginUrl: settings.loginUrl });
                }
            },
            onRpcFailure: function (response) {
                var widgetErrorMessage;
                if (el.nextSibling !== null && el.nextSibling.nodeName.toLowerCase() === 'div') {
                    if (el.nextSibling.className !== 'hl-widget upcoming-event') {
                        widgetErrorMessage = document.createElement('div');
                        widgetErrorMessage.setAttribute('class', 'hl-widget upcoming-event');
                    } else {
                        widgetErrorMessage = el.nextSibling;
                        widgetErrorMessage.innerHTML = '';
                    }
                } else {
                    widgetErrorMessage = document.createElement('div');
                    widgetErrorMessage.setAttribute('class', 'hl-widget upcoming-event');
                }
                widgetErrorMessage.innerHTML = '<div class="border"><div class="container"><div class="error-message">Error: ' + JSON.parse(response.data.data).Message + '</div></div></div>';
                el.parentNode.insertBefore(widgetErrorMessage, el.nextSibling);
            },
            getUpcomingEvent: function () {

                var requestConfig = {
                    url: '//api.connectedcommunity.org/api/v2.0/Events/SearchEvents?maxRecords=' + settings.maxRecords,
                    method: 'POST',
                    headers: {
                        'HLIAMKey': settings.HLIAMKey,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    data: JSON.stringify({
                        'EventTypeName': decodeURIComponent(settings.eventTypeName),
                        'CommunityKey': settings.communityKey
                    })
                },
                    rpc,
                    consumerRpcConfig = { remote: document.location.protocol + '//api.connectedcommunity.org/Scripts/easyXDM/cors/' },
                    consumerJsonRpcConfig = { remote: { request: {} } };

                if (hl.HLEasyXDM.easyXDM !== undefined) {
                    rpc = new hl.HLEasyXDM.easyXDM.Rpc(consumerRpcConfig, consumerJsonRpcConfig);
                    rpc.request(requestConfig, eventWidget.onRpcSuccess, eventWidget.onRpcFailure);
                }
            }
        };
    hl.upcomingEvent = function (element, s) {
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
                            hl.widgetInit(el, eventWidget.getUpcomingEvent);
                        });
                    } else {
                        commonElement.onload = function () {
                            settings = hl.extend({}, defaultSettings, s);
                            hl.widgetInit(el, eventWidget.getUpcomingEvent);
                        };
                    }
                }
            } else {
                commonElement.onload = function () {
                    settings = hl.extend({}, defaultSettings, s);
                    hl.widgetInit(el, eventWidget.getUpcomingEvent);
                };
            }
        } else {
            settings = hl.extend({}, defaultSettings, s);
            hl.widgetInit(el, eventWidget.getUpcomingEvent);
        }
    };
    return hl;
}(this.hl, document, navigator));