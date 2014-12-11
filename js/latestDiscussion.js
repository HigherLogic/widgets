//! Latest Discussion Widget
//! version : 1.0.0
//! latestDiscussion.js
//! Author: George Stocker
//! Twitter: @gortok
/*    
    The MIT License (MIT)
\
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
(function (hl, window, $, document) {
    "use strict";
    //Seems weird, right? Initial version of this widget allowed the hl.latestDiscussion(el, settings) syntax. 
    //Have to keep that syntax to not break backwards compatibility. Sigh.
    var el,
        settings = {},
        defaultSettings = {
            subjectLength: 50,
            contentLength: 160,
            moreUrl: '',
            postUrl: '',
            showLoginStatus: 0,
            loginUrl: '',
            includeStaff: true,
            useBioBubble: 0,
            discussionKey: ''
        },
        discussionWidget = {
            onRpcSuccess: function (response) {
                var widgetWrapper,
                    emptyMessage = 'No data found.',
                    discussions = JSON.parse(response.data),
                    discussionSubject,
                    discussionBody,
                    widgetHTML = '<div class="border">' +
                        '<div class="container">' +
                        '<ul>',
                    limit = Math.min(settings.maxToRetrieve, discussions.length),
                    k,
                    moreUrlMarkup = "",
                    emptyGuid = '00000000-0000-0000-0000-000000000000',
                    currentUserContactKey,
                    bKey,
                    element = 'login-information-container',
                    allBioBubbleKeys,
                    bioBubbleKeys = {};

                if (window.jQuery !== undefined && $ !== undefined) {
                    allBioBubbleKeys = $("[biobubblekey]");
                }

                if (el.nextSibling !== null && el.nextSibling.nodeName === 'DIV') {
                    if (el.nextSibling.className !== 'hl-widget latest-discussion') {
                        widgetWrapper = document.createElement('div');
                        widgetWrapper.setAttribute('class', 'hl-widget latest-discussion');
                    } else {
                        widgetWrapper = el.nextSibling;
                        widgetWrapper.innerHTML = '';
                    }
                } else {
                    widgetWrapper = document.createElement('div');
                    widgetWrapper.setAttribute('class', 'hl-widget latest-discussion');
                }

                for (k = 0; k < limit; k = k + 1) {
                    discussionSubject = (discussions[k].Subject.length > settings.subjectLength) ? discussions[k].Subject.substr(0, settings.subjectLength) + '...' : discussions[k].Subject;
                    discussionBody = (discussions[k].BodyWithoutMarkup.length > settings.contentLength) ? discussions[k].BodyWithoutMarkup.substr(0, settings.contentLength) + '...' : discussions[k].BodyWithoutMarkup;

                    widgetHTML += '<li>' +
                        '<div class="item-header-container">' +
                        '<div class="item-image-container" biobubblekey="' + discussions[k].Author.ContactKey + '">' +
                        '<a href="' + discussions[k].Author.LinkToProfile + '" class="user-image-container">' +
                        '<img class="item-image" src="' + discussions[k].Author.PictureUrl + '" />' +
                        '</a>' +
                        '</div>' +
                        '<div class="item-title-container">' +
                        '<a title="' + discussions[k].Subject + '" href="' + discussions[k].LinkToMessage + '">' + discussionSubject + '</a>' +
                        '</div>' +
                        '<div class="item-by-line-container">' +
                        '<span>By: </span><a href="' + discussions[k].Author.LinkToProfile + '" biobubblekey="' + discussions[k].Author.ContactKey + '">' + discussions[k].Author.DisplayName + '</a>' +
                        '<span>, ' + moment(discussions[k].DatePosted).startOf('seconds').fromNow() + ' </span>' +
                        '</div>' +
                        '<div class="item-posted-in-container">' +
                        '<span>Posted in: </span><a href="' + discussions[k].LinkToDiscussion + '">' + discussions[k].DiscussionName + '</a>' +
                        '</div>' +
                        '</div>' +
                        '<div class="item-body-container">' + discussionBody + '</div>' +
                        '</li>';
                }

                if (discussions.length === 0) {
                    widgetHTML += '<li>' +
                        '<div class="empty">' + emptyMessage + '</div>' +
                        '</li>';
                }

                //Only display More URL if we actually got discussions back.
                if (settings.moreUrl !== "" && settings.moreUrl.length > 0 && discussions.length > 0) {
                    moreUrlMarkup = '<div class="footer-item-more"><a href="' + settings.moreUrl + '">More</a></div>';
                }
                widgetHTML += '</ul>' +
                    '<div class="footer-container">' +
                    moreUrlMarkup +
                    '</div>' +
                    '</div>';

                if ((settings.showLoginStatus === '1' || settings.showLoginStatus === 1) && settings.loginUrl.length > 0) {
                    widgetHTML += '<div id="login-information-container"></div>' +
                        '</div>';

                } else {
                    widgetHTML += '</div>';
                }

                widgetWrapper.innerHTML = widgetHTML;
                el.parentNode.insertBefore(widgetWrapper, el.nextSibling);

                if (settings.useBioBubble === '1' || settings.useBioBubble === 1) {
                    if (response.headers.CurrentContactKey !== 'undefined' &&
                            response.headers.CurrentContactKey !== emptyGuid) {
                        currentUserContactKey = response.headers.CurrentContactKey;
                    } else {
                        currentUserContactKey = emptyGuid;
                    }

                    allBioBubbleKeys.each(function () {
                        bioBubbleKeys[$(this).attr('biobubblekey')] = true; // get distinct list of keys
                    });

                    for (bKey in bioBubbleKeys) {
                        if (bioBubbleKeys.hasOwnProperty(bKey)) {
                            $('#' + 'bioBubbleShell' + bKey).hl_ui_bioBubble({
                                displayContactKey: bKey,
                                currentContactKey: currentUserContactKey,
                                HLIAMKey: settings.HLIAMKey,
                                eventTriggers: $('[biobubblekey="' + bKey + '"]')
                            });
                        }
                    }
                }
                if ((settings.showLoginStatus === '1' || settings.showLoginStatus === 1) && settings.loginUrl.length > 0) {
                    hl.whoAmI(element, {
                        HLIAMKey: settings.HLIAMKey,
                        domainLoginUrl: settings.loginUrl
                    });
                }
            },
            onRpcFailure: function (response) {
                var widgetErrorMessage;
                if (el.nextSibling !== null && el.nextSibling.nodeName === 'DIV') {
                    if (el.nextSibling.className !== 'hl-widget latest-discussion') {
                        widgetErrorMessage = document.createElement('div');
                        widgetErrorMessage.setAttribute('class', 'hl-widget latest-discussion');
                    } else {
                        widgetErrorMessage = el.nextSibling;
                        widgetErrorMessage.innerHTML = '';
                    }
                } else {
                    widgetErrorMessage = document.createElement('div');
                    widgetErrorMessage.setAttribute('class', 'hl-widget latest-discussion');
                }
                widgetErrorMessage.innerHTML = '<div class="border"><div class="container"><div class="error-message">Error: ' + JSON.parse(response.data.data).Message + '</div></div></div>';
                el.parentNode.insertBefore(widgetErrorMessage, el.nextSibling);
            },
            getLatestDiscussion: function () {
                var urlParams = [settings.discussionKey, settings.maxToRetrieve, settings.includeStaff],
                    buildUrlPath = function (params) {
                        var currentParam,
                            retStr = '?',
                            paramNames = ['discussionKey', 'maxToRetrieve', 'includeStaff'],
                            pIdx;

                        for (pIdx = 0; pIdx < params.length; pIdx = pIdx + 1) {
                            currentParam = params[pIdx];
                            if (currentParam !== undefined && currentParam !== '') {
                                if (retStr.charAt(retStr.length - 1) !== '?') {
                                    retStr = retStr + '&';
                                }
                                retStr = retStr + paramNames[pIdx] + '=' + currentParam;
                            }
                        }
                        return (retStr === '?') ? '' : retStr;
                    },
                    requestConfig = {
                        url: document.location.protocol + '//api.connectedcommunity.org/api/v2.0/Discussions/GetDiscussionPosts' + buildUrlPath(urlParams),
                        method: 'GET',
                        headers: {
                            'HLIAMKey': settings.HLIAMKey,
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        }
                    },
                    rpc,
                    consumerRpcConfig = { remote: document.location.protocol + '//api.connectedcommunity.org/Scripts/easyXDM/cors/' },
                    consumerJsonRpcConfig = { remote: { request: {} } };

                if (hl.HLEasyXDM.easyXDM !== undefined) {
                    rpc = new hl.HLEasyXDM.easyXDM.Rpc(consumerRpcConfig, consumerJsonRpcConfig);
                    rpc.request(requestConfig, discussionWidget.onRpcSuccess, discussionWidget.onRpcFailure);
                }

            }
        };

    hl.latestDiscussion = function (element, s) {
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
                            hl.widgetInit(el, discussionWidget.getLatestDiscussion);
                        });
                    } else {

                        commonElement.onload = function () {
                            settings = hl.extend({}, defaultSettings, s);
                            hl.widgetInit(el, discussionWidget.getLatestDiscussion);
                        };
                    }
                }
            } else {
                commonElement.onload = function () {
                    settings = hl.extend({}, defaultSettings, s);
                    hl.widgetInit(el, discussionWidget.getLatestDiscussion);
                };
            }
        } else {
            settings = hl.extend({}, defaultSettings, s);
            hl.widgetInit(el, discussionWidget.getLatestDiscussion);
        }
    };
    return hl;
}(this.hl, window, window.jQuery || undefined, document, navigator));
