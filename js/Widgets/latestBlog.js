//! Latest Blogs Widget
//! version : 1.0.0
//! latestBlog.js
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
/*jslint regexp: true */
this.hl = this.hl || {};
(function (hl, document, $, navigator, window) {
    "use strict";
    var el,
        defaultSettings = {
            maxRecords: 3,
            communityKey: '',
            subjectLength: 50,
            contentLength: 160,
            moreUrl: '',
            maxDaysOld: 30,
            includeStaff: false,
            showLoginStatus: true,
            HLIAMKey: '',
            loginUrl: '',
            useBioBubble: false
        },
        settings = {},
        blogWidget = {
            onRpcSuccess: function (response) {
                var widgetWrapper,
                    recentMessage,
                    maxDays = settings.maxDaysOld,
                    blogs = JSON.parse(response.data),
                    blogSubject,
                    blogBody,
                    communityText,
                    limit = Math.min(settings.maxRecords, blogs.length),
                    j,
                    moreUrlMarkup = "",
                    emptyGuid = '00000000-0000-0000-0000-000000000000',
                    currentUserContactKey,
                    bioBubbleKeys = {},
                    allBioBubbleKeys,
                    i,
                    element = 'login-information-container',
                    widgetHTML = '<div class="border">' +
                         '<div class="container">' +
                         '<ul>';

                // determine if to include " in the past N days."
                if (!isNaN(maxDays) && maxDays !== null && maxDays !== '' && maxDays >= 1 && maxDays % 1 === 0) {
                    if (maxDays === 1) {
                        recentMessage = ' in the past ' + maxDays + ' day';
                    } else {
                        recentMessage = ' in the past ' + maxDays + ' days';
                    }
                } else {
                    recentMessage = '';
                }

                if (el.nextSibling !== null && el.nextSibling.nodeName.toLowerCase() === 'div') {
                    if (el.nextSibling.className !== 'hl-widget latest-blog') {
                        widgetWrapper = document.createElement('div');
                        widgetWrapper.setAttribute('class', 'hl-widget latest-blog');
                    } else {
                        widgetWrapper = el.nextSibling;
                        widgetWrapper.innerHTML = '';
                    }
                } else {
                    widgetWrapper = document.createElement('div');
                    widgetWrapper.setAttribute('class', 'hl-widget latest-blog');
                }

                for (j = 0; j < limit; j = j + 1) {
                    blogSubject = blogs[j].BlogTitle.length > settings.subjectLength ? blogs[j].BlogTitle.substr(0, settings.subjectLength) + '...' : blogs[j].BlogTitle;
                    blogBody = blogs[j].BlogText.length > settings.contentLength ? blogs[j].BlogText.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>?/gi, '').substr(0, settings.contentLength) + '...' : blogs[j].BlogText.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>?/gi, '');

                    // check if community information is present.
                    communityText = (blogs[j].Community !== null) ? '<div class="item-posted-in-container">' +
                        '<a href="' + blogs[j].Community.LinkToCommunity + '">' + blogs[j].Community.CommunityName + '</a>' +
                        '</div>' : '';

                    widgetHTML += '<li>' +
                        '<div class="item-header-container">' +
                        '<div class="item-image-container" biobubblekey="' + blogs[j].Author.ContactKey + '">' +
                        '<a href="' + blogs[j].Author.LinkToProfile + '">' +
                        '<img class="item-image" src="' + blogs[j].Author.PictureUrl + '" />' +
                        '</a>' +
                        '</div>' +
                        '<div class="item-title-container">' +
                        '<a title="' + blogs[j].Subject + '" href="' + blogs[j].LinkToReadBlog + '">' + blogSubject + '</a>' +
                        '</div>' +
                        '<div class="item-by-line-container">' +
                        '<span>By: </span><a href="' + blogs[j].Author.LinkToProfile + '" biobubblekey="' + blogs[j].Author.ContactKey + '">' + blogs[j].Author.DisplayName + '</a>' +
                        '<span>, ' + (new Date(blogs[j].PublishedOn)).toUTCString() + ' </span>' +
                        '</div>' +
                        communityText +
                        '</div>' +
                        '<div class="item-body-container">' + blogBody + '</div>' +
                        '</li>';
                }

                if (blogs.length === 0) {
                    widgetHTML += '<li>' +
                        '<div class="empty">No entries have been published' + recentMessage + '.</div>' +
                        '</li>';
                }

                if (settings.moreUrl !== "" && settings.moreUrl.length > 0 && blogs.length > 0) {
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

                if (settings.useBioBubble === 1 || settings.useBioBubble === '1') {
                    if (response.headers.CurrentContactKey !== undefined &&
                            response.headers.CurrentContactKey !== emptyGuid) {
                        currentUserContactKey = response.headers.CurrentContactKey;
                    } else {
                        currentUserContactKey = emptyGuid;
                    }

                    if ($ !== undefined || window.jQuery !== undefined) {
                        allBioBubbleKeys = $("[data-biobubblekey]");

                        allBioBubbleKeys.each(function () {
                            bioBubbleKeys[$(this).attr('data-biobubblekey')] = true; // get distinct list of keys
                        });

                        for (i in bioBubbleKeys) {
                            if (bioBubbleKeys.hasOwnProperty(i)) {
                                $('#' + 'bioBubbleShell' + i).hl_ui_bioBubble({
                                    displayContactKey: i,
                                    currentContactKey: currentUserContactKey,
                                    HLIAMKey: settings.HLIAMKey,
                                    eventTriggers: $('[data-biobubblekey="' + i + '"]')
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
                    if (el.nextSibling.className !== 'hl-widget latest-blog') {
                        widgetErrorMessage = document.createElement('div');
                        widgetErrorMessage.setAttribute('class', 'hl-widget latest-blog');
                    } else {
                        widgetErrorMessage = el.nextSibling;
                        widgetErrorMessage.innerHTML = '';
                    }
                } else {
                    widgetErrorMessage = document.createElement('div');
                    widgetErrorMessage.setAttribute('class', 'hl-widget latest-blog');
                }
                widgetErrorMessage.innerHTML = '<div class="border"><div class="container"><div class="error-message">Error: ' + JSON.parse(response.data.data).Message + '</div></div></div>';
                el.parentNode.insertBefore(widgetErrorMessage, el.nextSibling);
            },
            getLatestBlog: function () {
                var dataObj = {
                    'MaxRecords': settings.maxRecords,
                    'CommunityKeyFilter': settings.communityKeyFilter,
                    'IgnoreStaffBlogs': !settings.includeStaff, //Seriously? SERIOUSLY?
                    'MaxDaysOld': settings.maxDaysOld,
                    'CommunityKey': settings.communityKey
                },
                    rpc,
                    consumerRpcConfig = { remote: document.location.protocol + '//api.connectedcommunity.org/Scripts/easyXDM/cors/' },
                    consumerJsonRpcConfig = { remote: { request: {} } },
                    requestConfig = {
                        url: document.location.protocol + '//api.connectedcommunity.org/api/v2.0/Blogs/GetLatestEntries',
                        method: 'POST',
                        headers: {
                            'HLIAMKey': settings.HLIAMKey,
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        data: JSON.stringify(dataObj)
                    };
                if (hl.HLEasyXDM.easyXDM !== undefined) {
                    rpc = new hl.HLEasyXDM.easyXDM.Rpc(consumerRpcConfig, consumerJsonRpcConfig);
                    rpc.request(requestConfig, blogWidget.onRpcSuccess, blogWidget.onRpcFailure);
                }
            }

        };
    hl.latestBlog = function (element, s) {
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
                            hl.widgetInit(el, blogWidget.getLatestBlog);
                        });
                    } else {
                        commonElement.onload = function () {
                            settings = hl.extend({}, defaultSettings, s);
                            hl.widgetInit(el, blogWidget.getLatestBlog);
                        };
                    }
                }
            } else {
                commonElement.onload = function () {
                    settings = hl.extend({}, defaultSettings, s);
                    hl.widgetInit(el, blogWidget.getLatestBlog);
                };
            }
        } else {
            settings = hl.extend({}, defaultSettings, s);
            hl.widgetInit(el, blogWidget.getLatestBlog);
        }
    };
    return hl;
}(this.hl, document, window.jQuery || undefined, navigator, window));