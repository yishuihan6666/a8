

//  jsbuilder/wf/wf.js


var wf = {
    apiServer: function () {
        return wf.development ? "https://api-d.wf.pub" : "https://api.wf.pub";
    },
    snsServer: function () {
        return wf.development ? "https://sns-d.wf.pub" : "https://sns.wf.pub";
    },
    wfPubServer: function () {
        return wf.development ? "https://d.wf.pub" : "https://wf.pub";
    },
    oauthServer: function () {
        return wf.development ? "https://d.wf.pub" : "https://wf.pub";
    },
    comServer: function () {
        return wf.development ? "https://com-d.wf.pub" : "https://com.wf.pub";
    },
    snsOssServer: function () {
        return wf.development ? "https://sns-d-wf-pub.oss-cn-zhangjiakou.aliyuncs.com" : "https://snsimg.wf.pub";
    },
    accServer: function () {
        return wf.development ? "https://acc-d.wf.pub" : "https://acc.wf.pub";
    },
    weiboAppKey: function () {
        return wf.development ? "2298735495" : "3533591353";
    },
    appFalg: function () {
        return wf.development ? "azqa5j2a38k0" : "dmku1fwsz7wj";
    },
    // insideOrOutsideStatus:null,//站内站内标识设置
    getInsideOrOutsideStatus: function () {
        var host = window.location.host; //如果有iframe 取的就是iframe自己的

        //截取字符串
        var wfPubLen = host.search("wf.pub");
        if (wfPubLen == -1) {
            // 站外 或者 站内域名不是wf.pub
            return true;
        } else {
            return false;
        }
    },
    cookie: {
        get: function (name) {
            var cookieName = encodeURIComponent(name) + "=",
                cookieStart = document.cookie.indexOf(cookieName),
                cookieValue = null;
            if (cookieStart > -1) {
                var cookieEnd;
                if (cookieStart !== 0) {
                    //不是首项

                    if (document.cookie.indexOf("; " + cookieName) > -1) {
                        cookieStart = document.cookie.indexOf("; " + cookieName) + 2;
                        cookieEnd = document.cookie.indexOf(";", cookieStart);
                    } else {
                        return cookieValue;
                    }
                } else {
                    // 是首项
                    cookieEnd = document.cookie.indexOf(";", cookieStart);
                }
                if (cookieEnd == -1) {
                    cookieEnd = document.cookie.length;
                }
                cookieValue = decodeURIComponent(document.cookie.substring(cookieStart + cookieName.length, cookieEnd));
            }

            return cookieValue;
        },
        set: function (name, value, expires, path, domain, secure) {
            var cookieText = encodeURIComponent(name) + "=" + encodeURIComponent(value);
            if (expires instanceof Date) {
                cookieText += ";expires=" + expires.toUTCString();
            }
            if (path) {
                cookieText += ";path=" + path;
            }
            if (domain) {
                cookieText += ";domain=" + domain;
            }
            if (secure) {
                cookieText += ";secure";
            }
            document.cookie = cookieText;
        },
        clear: function (name, path, domain, secure) {
            this.set(name, "", new Date(0), path, domain, secure);
        },
        clearAll: function () {
            var keys = document.cookie.match(/[^ =;]+(?==)/g);
            if (keys) {
                for (var i = keys.length; i--; ) document.cookie = keys[i] + "=0;expires=" + new Date(0).toUTCString();
            }
        }
    },
    http: {
        post: function (req, data, success, err) {
            if (typeof req === "string") {
                post_by_string_param(req, data, success, err);
            } else if (typeof req === "object") {
                post_by_object_param(req, data, success);
            }

            function post_by_string_param(req, data, success, err) {
                var reqData = {
                    type: "POST",
                    crossDomain: true,
                    url: req,
                    data: JSON.stringify(data),
                    contentType: "application/json;charset=utf-8",
                    dataType: "json",
                    //tradional: true,
                    // xhrFields: {
                    //     withCredentials: true //携带cookie
                    // },

                    error: function (resObj, textStatus, errorThrown) {
                        if (err) {
                            try {
                                error = JSON.parse(resObj.responseText);
                                err(error);
                            } catch (ex) {
                                // console.log(resObj)
                                err({
                                    err_code: resObj.status,
                                    err_message: resObj.statusText
                                });
                            }
                        } else if (success) {
                            return success(data, JSON.parse(resObj.responseText));
                        }
                    },
                    success: function (data, textStatus, resObj) {
                        if (success && err) {
                            return success(data);
                        } else if (success) {
                            return success(data, JSON.parse(resObj.responseText));
                        }
                    }
                };
                if (wf.getInsideOrOutsideStatus()) {
                    //站外
                    var xCaToken = "";
                    var wfpub_token = wf.cookie.get("wfpub_token");

                    var sync_login_wfpub_token = wf.cookie.get("sync_login_wfpub_token");
                    var wfpub_third_app_token = wf.cookie.get("wfpub_third_app_token");

                    if (sync_login_wfpub_token) {
                        xCaToken = sync_login_wfpub_token;
                    } else if (wfpub_third_app_token) {
                        xCaToken = wfpub_third_app_token;
                    } else {
                        xCaToken = wfpub_token;
                    }

                    // xCaToken = sync_login_wfpub_token ? sync_login_wfpub_token : wfpub_token

                    if (xCaToken) {
                        reqData.headers = {
                            "x-ca-token": xCaToken
                        };
                    }
                } else {
                    //站内
                    reqData.xhrFields = {
                        withCredentials: true //携带cookie
                    };
                }
                $.ajax(reqData);
            }
            //参数为对象，方便参数扩展
            function post_by_object_param(req, success, err) {
                var reqData = {
                    type: "POST",
                    crossDomain: true,
                    url: req.url,
                    data: JSON.stringify(req.data),
                    headers: req.headers,
                    contentType: "application/json;charset=utf-8",
                    dataType: "json",
                    error: function (resObj, textStatus, errorThrown) {
                        if (err) {
                            try {
                                error = JSON.parse(resObj.responseText);
                                return err(error);
                            } catch (ex) {
                                // console.log(resObj)
                                return err({
                                    err_code: resObj.status,
                                    err_message: resObj.statusText
                                });
                            }
                        } else if (success) {
                            return success(data, JSON.parse(resObj.responseText));
                        }
                    },
                    success: function (data, textStatus, resObj) {
                        if (success && err) {
                            return success(data);
                        } else if (success) {
                            return success(data, JSON.parse(resObj.responseText));
                        }
                    }
                };
                if (wf.getInsideOrOutsideStatus()) {
                    //站外
                    var xCaToken = "";
                    var wfpub_token = wf.cookie.get("wfpub_token");
                    var sync_login_wfpub_token = wf.cookie.get("sync_login_wfpub_token");
                    var wfpub_third_app_token = wf.cookie.get("wfpub_third_app_token");

                    if (sync_login_wfpub_token) {
                        xCaToken = sync_login_wfpub_token;
                    } else if (wfpub_third_app_token) {
                        xCaToken = wfpub_third_app_token;
                    } else {
                        xCaToken = wfpub_token;
                    }
                    // xCaToken = sync_login_wfpub_token ? sync_login_wfpub_token : wfpub_token
                    if (xCaToken && (!req.headers || !req.headers["x-ca-token"])) {
                        reqData.headers["x-ca-token"] = xCaToken;
                    }
                } else {
                    //站内
                    reqData.xhrFields = {
                        withCredentials: true //携带cookie
                    };
                }
                $.ajax(reqData);
            }
        },
        // post: function (req, data, success, err) {
        //     var reqData = {
        //         type: 'POST',
        //         crossDomain: true,
        //         url: req,
        //         data: JSON.stringify(data),
        //         contentType: 'application/json;charset=utf-8',
        //         dataType: 'json',
        //         //tradional: true,
        //         // xhrFields: {
        //         //     withCredentials: true //携带cookie
        //         // },

        //         error: function(resObj, textStatus, errorThrown) {
        //             if (err) {
        //                 try {
        //                     error = JSON.parse(resObj.responseText)
        //                     err(error)
        //                 } catch (ex) {
        //                     // console.log(resObj)
        //                     err({
        //                         err_code: resObj.status,
        //                         err_message: resObj.statusText
        //                     })
        //                 }
        //             } else if (success) {
        //                 success(data, JSON.parse(resObj.responseText))
        //             }
        //         },
        //         success: function(data, textStatus, resObj) {
        //             if (success && err) {
        //                 success(data)
        //             } else if (success) {
        //                 success(data, JSON.parse(resObj.responseText))
        //             }
        //         }
        //     }
        //     if(wf.getInsideOrOutsideStatus()){

        //         //站外
        //         var wfpub_token = wf.cookie.get('wfpub_token')
        //         if(wfpub_token){
        //             reqData.headers={
        //                 'x-ca-token': wfpub_token
        //             }

        //         }

        //     }else{
        //         //站内
        //         reqData.xhrFields={
        //             withCredentials: true //携带cookie
        //         }
        //     }
        //     $.ajax(reqData)
        // },
        get: function (url, data, success, err) {
            var reqData = {
                type: "GET",
                crossDomain: true,
                url: url,
                data: data,
                // xhrFields: {
                //     withCredentials: true //携带cookie
                // },
                error: function (resObj, textStatus, errorThrown) {
                    if (err) {
                        try {
                            error = JSON.parse(resObj.responseText);
                            err(error);
                        } catch (ex) {
                            // console.log(resObj)
                            err({
                                err_code: resObj.status,
                                err_message: resObj.statusText
                            });
                        }
                    } else if (success) {
                        return success(JSON.parse(resObj.responseText));
                    }
                },
                success: function (data, textStatus, resObj) {
                    if (success && err) {
                        return success(data);
                    } else if (success) {
                        return success(data, JSON.parse(resObj.responseText));
                    }
                }
            };
            if (wf.getInsideOrOutsideStatus()) {
                //站外
                var xCaToken = "";
                var wfpub_token = wf.cookie.get("wfpub_token");

                var sync_login_wfpub_token = wf.cookie.get("sync_login_wfpub_token");
                var wfpub_third_app_token = wf.cookie.get("wfpub_third_app_token");

                if (sync_login_wfpub_token) {
                    xCaToken = sync_login_wfpub_token;
                } else if (wfpub_third_app_token) {
                    xCaToken = wfpub_third_app_token;
                } else {
                    xCaToken = wfpub_token;
                }
                // xCaToken = sync_login_wfpub_token ? sync_login_wfpub_token : wfpub_token

                if (xCaToken) {
                    reqData.headers = {
                        "x-ca-token": xCaToken
                    };
                }
            } else {
                //站内
                reqData.xhrFields = {
                    withCredentials: true //携带cookie
                };
            }

            $.ajax(reqData);
        }
    },
    timestamp: {
        toDate: function (timesTampStr) {
            if (typeof timesTampStr === "string") {
                timesTampStr = Number(timesTampStr);
                if (Number(timesTampStr).isNaN()) {
                    throw new Error("参数必须是number或可转化为number的字符串");
                }
            }
            if (typeof timesTampStr === "number") {
                var dateTime = new Date(timesTampStr);
                const createYear = dateTime.getFullYear();
                const createMonth = dateTime.getMonth() + 1 >= 10 ? dateTime.getMonth() + 1 : "0" + (dateTime.getMonth() + 1);
                const createDay = dateTime.getDate() >= 10 ? dateTime.getDate() : "0" + dateTime.getDate();
                const createHours = dateTime.getHours() >= 10 ? dateTime.getHours() : "0" + dateTime.getHours();
                const createMinutes = dateTime.getMinutes() >= 10 ? dateTime.getMinutes() : "0" + dateTime.getMinutes();
                const createSeconds = dateTime.getSeconds() >= 10 ? dateTime.getSeconds() : "0" + dateTime.getSeconds();
                let parsedTime = createYear + "-" + createMonth + "-" + createDay + " " + createHours + ":" + createMinutes + ":" + createSeconds;
                return parsedTime;
            } else {
                throw new Error("参数必须是number或可转化为number的字符串");
            }
        }
    },
    loginState: null,
    //isLogin方法：该方法方便“非wf.pub站点引用组件”时查看是否登录，使用单例模式仅发一次请求。调用时可以考虑能否优化不调用这个方法，因为后端服务一般能获取到是否登录。
    //【注意】：登录状态仅取决于第一次调用时用户的状态，故涉及到轮询的功能使用该方法会有问题，因为仅获取一次登录状态，后续调用获取到的是缓存
    isLogin: function () {
        var reqData = {
            type: "POST",
            crossDomain: true,
            url: wf.apiServer() + "/sns/user/isLogin",
            data: {},
            headers: {
                "X-Ca-AppKey": wf.appFalg()
            },
            async: false, //同步
            // xhrFields: {
            //     withCredentials: true //携带cookie
            // },
            success: function (data) {
                wf.loginState = data;
            }
        };

        if (wf.getInsideOrOutsideStatus()) {
            //站外
            var xCaToken = "";
            var wfpub_token = wf.cookie.get("wfpub_token");
            var sync_login_wfpub_token = wf.cookie.get("sync_login_wfpub_token");
            var wfpub_third_app_token = wf.cookie.get("wfpub_third_app_token");

            if (sync_login_wfpub_token) {
                xCaToken = sync_login_wfpub_token;
            } else if (wfpub_third_app_token) {
                xCaToken = wfpub_third_app_token;
            } else {
                xCaToken = wfpub_token;
            }
            // xCaToken = sync_login_wfpub_token ? sync_login_wfpub_token : wfpub_token
            if (xCaToken) {
                reqData.headers = {
                    "x-ca-token": xCaToken
                };
            }
        } else {
            //站内
            reqData.xhrFields = {
                withCredentials: true //携带cookie
            };
        }
        if (!wf.loginState) {
            $.ajax(reqData);
        }
        return wf.loginState;
    },
    userRecommendState: null,
    isUserRecommend: function () {
        var reqData = {
            type: "GET",
            crossDomain: true,
            url: wf.apiServer() + "/sns/is_follow",
            data: {},
            async: false, //同步
            // xhrFields: {
            //     withCredentials: true //携带cookie
            // },
            success: function (data) {
                wf.userRecommendState = data.isFollow;
            }
        };

        if (wf.getInsideOrOutsideStatus()) {
            //站外
            var xCaToken = "";
            var wfpub_token = wf.cookie.get("wfpub_token");
            var sync_login_wfpub_token = wf.cookie.get("sync_login_wfpub_token");
            // xCaToken = sync_login_wfpub_token ? sync_login_wfpub_token : wfpub_token
            var wfpub_third_app_token = wf.cookie.get("wfpub_third_app_token");

            if (sync_login_wfpub_token) {
                xCaToken = sync_login_wfpub_token;
            } else if (wfpub_third_app_token) {
                xCaToken = wfpub_third_app_token;
            } else {
                xCaToken = wfpub_token;
            }

            if (xCaToken) {
                reqData.headers = {
                    "x-ca-token": xCaToken
                };
            }
        } else {
            //站内
            reqData.xhrFields = {
                withCredentials: true //携带cookie
            };
        }
        if (!wf.UserRecommendState) {
            $.ajax(reqData);
        }
        return wf.UserRecommendState;
    },
    // 社区消息通知
    workOrderNotice: function (data) {
        var _this = this;
        if (data.notice)
            $.each(data.notice, function (i, item) {
                _this.http.post(
                    _this.apiServer() + "/sns/app_send_chat",
                    { targetUid: item.uid, content: item.content },
                    function (resData, response) {
                        //- console.log(resData);
                    },
                    function (error) {
                        console.error(error);
                    }
                );
            });
    },
    user: {}, //用户相关内容
    favorite: {}, //收藏夹相关
    comment: {}, //评论
    notify: {}, //消息通知
    emit: {} //专门用来传递组件与顶层业务逻辑通讯的数据
};
    
function mathJax() {
    window.MathJax = {
        startup: {
            ready: function () {
                // console.log('MathJax is loaded, but not yet initialized')
                MathJax.startup.defaultReady();
                // console.log('MathJax is initialized, and the initial typeset is queued')
            }
        },

        tex: {
            inlineMath: [
                ["$", "$"],
                ["\\(", "\\)"]
            ],
            displayMath: [
                ["$$", "$$"],
                ["\\[", "\\]"]
            ],
            processEscapes: true,
            tags: "ams",
            macros: {
                href: "{}"
            }
        },
        options: {
            ignoreHtmlClass: "tex2jax_ignore|dno",
            skipHtmlTags: ["script", "noscript", "style", "textarea", "pre", "code"]
        }
    };
}
//调第三方插件
function thirdPlugsFun() {
    //全部插件
    var third_all_plugs = [
        // {
        //     attr:'jquery-script',
        //     url:'https://cdn.wf.pub/jquery.js',
        // },
        // {
        //     id:'thinJs-css',
        //     rel:'stylesheet',
        //     url:'https://com.wf.pub/thin.css',
        // },

        {
            attr: "thin",
            url: "https://com.wf.pub/thin.js"
        },
        {
            attr: "dialog",
            url: wf.comServer() + "/dialog/dialog.js",
            css: wf.comServer() + "/dialog/dialog.css"
        },
        {
            attr: "MathJax",
            id: "mathJax-script",
            async: true,
            url: "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"
        },
        {
            attr: "mermaid",
            url: "https://cdn.jsdelivr.net/npm/mermaid@8.8.4/dist/mermaid.min.js"
        },
        {
            attr: "hljs",
            id: "highlight-script",
            // css: 'https://cdn.wf.pub/highlight_monokai_sublime.min.css',
            css: "https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@9.18.5/build/styles/default.min.css",
            url: "https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@9.18.5/build/highlight.min.js"
        },
        {
            attr: "marked",
            url: "https://cdn.jsdelivr.net/npm/marked@1.2.7/marked.min.js"
        },
        {
            attr: "d3",
            id: "d3-script",
            url: "https://cdn.wf.pub/d3.min.js"
            // url: 'https://cdn.jsdelivr.net/npm/d3@6.3.1/dist/d3.min.js',//IE 十一报错
        },
        {
            attr: "functionPlot",
            id: "plot-script",
            url: "https://cdn.wf.pub/function-plot.js"
            // url: 'https://cdn.jsdelivr.net/npm/function-plot@1.22.4/dist/function-plot.js',//IE 十一报错
        },
        {
            attr: "Viewer",
            id: "viewer-script",
            // url: 'https://com-d.wf.pub/viewer/viewer.min.js'
            url: "https://cdn.jsdelivr.net/npm/viewerjs@1.9.0/dist/viewer.min.js"
        },
        {
            attr: "viewer",
            id: "jquery-viewer-script",
            // url: 'https://com-d.wf.pub/viewer/jquery-viewer.min.js',
            url: "https://cdn.jsdelivr.net/npm/jquery-viewer@1.0.1/dist/jquery-viewer.min.js"
        },
        {
            // 页面二维码插件
            attr: "$.fn.qrcode",
            // url: 'https://com-d.wf.pub/qrcode/jquery.qrcode.min.js',
            url: "https://cdn.jsdelivr.net/npm/jquery.qrcode@1.0.3/jquery.qrcode.min.js"
        },
        {
            attr: "file-upload",
            id: "jquery-ui-widget-script",
            url: "https://com.wf.pub/fileupload/jquery.ui.widget.min.js"
        },
        {
            attr: "file-upload",
            id: "jquery-fileupload-script",
            url: "https://com.wf.pub/fileupload/jquery.fileupload.min.js"
        }
    ];
    //调用插件
    var transfer_plugs = [];

    third_all_plugs.forEach(function (item, i) {
        if (!window[item.attr]) {
            if (item.attr === "MathJax") {
                mathJax();
            }
            transfer_plugs.push(item);
        }
    });

    function createEleFun(item) {
        var createEle;
        if (item.css) {
            createEle = document.createElement("link");
            createEle.setAttribute("rel", "stylesheet");
            createEle.setAttribute("href", item.css);

            document.head.appendChild(createEle);
        }

        createEle = document.createElement("script");
        createEle.setAttribute("src", item.url);
        if (item.async) {
            createEle.setAttribute("async", item.async);
        }
        document.head.appendChild(createEle);

        return createEle;
    }
    //相当于遍历 transfer_plugs数组 ，不用$.each ，forEach 因为遍历是异步的，没走到onload，就开始新的循环了
    // (function plugsLoad(i) {
    function plugsLoad(i) {
        if (i == transfer_plugs.length) {
            hljs.initHighlightingOnLoad();

            return false;
        } else if (i == 0) {
            createEleFun(transfer_plugs[i]);
            plugsLoad(i + 1);
        } else {
            var createEle = createEleFun(transfer_plugs[i]);

            createEle.onload = function () {
                if (transfer_plugs[i].attr === "mermaid") {
                    if (window.mermaid) {
                        mermaid.initialize({ startOnLoad: true });
                    }
                }

                plugsLoad(i + 1);
            };
        }
    }
    plugsLoad(0);
}
    
thirdPlugsFun();

window.onload = function () {
    //同步登录检查
    wf.synclogin();

    if ($("wf-container").length > 0 && $("wf-container wf-sns").length > 0) {
        // 社区(先检查一遍有没有关注过的人，没有，弹用户推荐蒙版)
        wf.isUserRecommend();
        wf.sns.timeline.userRecommend();
    }
    wf.sns();
    //第三方评论
    $(document).comment();

    //收藏
    $(document).favorite();

    //悬浮卡片
    wf.user.postcard();
    //本地卡片
    $(document).render_usercard();
    //别人卡片
    $(document).render_other_usercard();

    // 话题详情
    wf.sns.topicDetail();

    //元数据搜索
    $(document).oaisubmit();

    //搜索结果页
    wf.search();

    // 推荐组件
    $(document).recommend();

    // 账务组件
    wf.acc();
};

$(document).ready(function () {
    let documentReferrer;
    if (wf.development) {
        documentReferrer = document.referrer.match(/[http|https]:\/\/d.wf.pub/);
    } else {
        documentReferrer = document.referrer.match(/[http|https]:\/\/wf.pub/);
    }

    let message = { message: { title: document.title, url: window.location.href }, messageAim: "history" };
    if (top !== self) {
        console.log("documentReferrer");
        console.log(documentReferrer);
        if (documentReferrer || document.referrer !== window.location.href) {
            window.parent.postMessage(message, wf.wfPubServer());
        } else {
            // console.log('no message')
        }
        (function (history) {
            var pushState = history.pushState;
            history.pushState = function (state, title, url) {
                if (typeof history.onpushstate == "function") {
                    history.onpushstate(state, title, url);
                }
                return pushState.apply(history, arguments);
            };
            history.replaceState = function (state, title, url) {
                if (typeof history.onreplacestate === "function") {
                    history.onreplacestate(state, title, url);
                }
            };
        })(window.history);
        history.onpushstate = function (state, title, url) {
            if (new RegExp("^" + window.location.protocol + "//" + window.location.hostname).test(url)) {
                message.message.url = url;
            } else {
                message.message.url = window.location.protocol + "//" + window.location.hostname + url;
            }

            window.parent.postMessage(message, wf.wfPubServer());
        };
        history.onreplacestate = function (state, title, url) {
            if (new RegExp("^" + window.location.protocol + "//" + window.location.hostname).test(url)) {
                message.message.url = url;
            } else {
                message.message.url = window.location.protocol + "//" + window.location.hostname + url;
            }
            window.parent.postMessage(message, wf.wfPubServer());
        };
    }
});

//兼容IE
Number.isInteger =
    Number.isInteger ||
    function (value) {
        return typeof value === "number" && isFinite(value) && Math.floor(value) === value;
    };
//兼容IE
if (typeof Object.assign != "function") {
    Object.assign = function (target) {
        "use strict";
        if (target == null) {
            throw new TypeError("Cannot convert undefined or null to object");
        }

        target = Object(target);
        for (var index = 1; index < arguments.length; index++) {
            var source = arguments[index];
            if (source != null) {
                for (var key in source) {
                    if (Object.prototype.hasOwnProperty.call(source, key)) {
                        target[key] = source[key];
                    }
                }
            }
        }
        return target;
    };
}


//  jsbuilder/wf/wf.pop.js

wf.pop = function(p) {
    let popmask
    // console.log(p);
    $(document.body).render({
        template: {
            'wf-pop': [function(a) { popmask = a.container }, //截获popmask
                {
                    'wf-popwindow': [
                        { 'wf-closeicon': 'x', click: close },
                        {
                            'wf-popbody': [
                                function(a) { a.container.close = close }, //将close函数附着到容器
                                {
                                    if: p.render !== undefined,
                                    then: p.render,
                                    else: p.template
                                }
                            ]
                        }
                    ],
                    style: p.style,
                    id: p.id,
                    class: p.class,
                    a: p.a,
                    width: p.width,
                    height: p.height
                }
            ]
        }
    })

    function close(para) {
        if (p.onclose) { p.onclose(para) }
        $(popmask).remove()
    }
}

//  jsbuilder/wf/wf.replace.js

wf.replace = {
    at: function (content) {
        //匹配@开头，空格或以下特殊字符结尾的字符串（包含@，不包含特殊字符）
        return content.replace(/@[a-zA-Z0-9_\u4e00-\u9fa5-_]+/g, function (word) {
            //word为匹配的内容 例如：@powerwanfang
            //在wf-user标签和跳转客观主页url中设置昵称需要去掉@
            let nickname = word.substring(1)
            return '<a class="replaceAt"  target="_blank" href="' + wf.wfPubServer() + '/u/' + nickname + '"><wf-user data-nickname=' + nickname + '>' + word + '</wf-user></a>'
        })
    },

    topic: function (content) {
        // 判断含不含有a标签的链接
        if(content.match(/<a[^>]+href=['"]([^'"]*)['"]>*/g)){
            // 按照</a>把字符串切分成数组
            let contentArr = content.split('</a>')
            let newContent
            // $.each 不用这个方法 是因为他是异步的
            // 遍历切分的数组contentArr
            for(var i=0;i<contentArr.length;i++){
                // 数组的每一项再按照'<a' 去切分新的数组，得到</a><a中间的内容
                let aBeforeArr =contentArr[i].split('<a')
                // 取新数组中的第一项,去匹配话题
                aBeforeArr[0].replace(/#[^\s|#]((?!#|(@[a-zA-Z0-9_\u4e00-\u9fa5-_])).)*#/g, function (match) {
                    // 替换话题标签
                    aBeforeArr[0]=aBeforeArr[0].replace(match, '<wf-topic>'.concat(match, '</wf-topic>'))
                   
                })
                // 按照<a 链接之前拆分的字符串  
                let newABeforeArr = aBeforeArr.join('<a')
                contentArr[i]= newABeforeArr

            }
            // 按照</a> 链接之前拆分的字符串 
            newContent = contentArr.join('</a>')     
            return newContent
        }else{
            
            return content.replace(/#[^\s|#]((?!#|(@[a-zA-Z0-9_\u4e00-\u9fa5-_])).)*#/g, function (match) {
                return ('<wf-topic>'.concat(match, '</wf-topic>'))
            })
        }
        
       
    },

    url: function (content) {
        return content.replace(/(http|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?/g, function (match) {
            return ('<a  href="'.concat(match, '" target="_blank" >', match, '</a>'))
        })
    },

    noscript: function (content) {

        content = content.replace(/</g, function (match) {
            return '&lt;'
        })
        content = content.replace(/>/g, function (match) {
            return '&gt;'
        })
        return content
    },

    dateDiff: function (dateTime) {

        dateTime = dateTime.replace(/-/g, '/') //兼容IE11
        dateTime = dateTime.substring(0, 19) //兼容IE11
        let publishTime = new Date(dateTime).getTime() / 1000,
            date = new Date(publishTime * 1000),
            Y = date.getFullYear(),
            M = date.getMonth() + 1,
            D = date.getDate(),
            H = date.getHours(),
            m = date.getMinutes(),
            s = date.getSeconds()
        //小于10的在前面补0
        if (M < 10) {
            M = '0' + M
        }
        if (D < 10) {
            D = '0' + D
        }
        if (H < 10) {
            H = '0' + H
        }
        if (m < 10) {
            m = '0' + m
        }
        if (s < 10) {
            s = '0' + s
        }

        return Y + '-' + M + '-' + D + ' ' + H + ':' + m + ':' + s
    },

    all: function (content,ele) {
      
        if (!content) return ''
        if (marked !== undefined) {
            var renderer = new marked.Renderer() //自定义marked renderder
            
            renderer.code = function (code, language) {
               
                if (language == 'functionPlot') {
                    return '<div class="functionPlot"><define>' + code + '</define><pre><code>' + hljs.highlightAuto(code).value + '</code></pre></div>'
                } else if (code.match(/^sequenceDiagram/) ||
                    code.match(/^graph/) ||
                    code.match(/^classDiagram/) ||
                    code.match(/^stateDiagram-v2/) ||
                    code.match(/^erDiagram/) ||
                    code.match(/^journey/) ||
                    code.match(/^gantt/) ||
                    code.match(/^gitGraph/) ||
                    code.match(/^pie/)) {
                    return '<div class="mermaid">' + code + '</div>'
                } else {
                    return false
                    // return '<pre><code>' + code + '</code></pre>';
                    // return '<pre><code>' + hljs.highlightAuto(code).value + '</code></pre>'
                }
            }

            //重写link,tokenizer已经替换过链接，这里直接返回即可
            renderer.link = function (href, title, text) {
                return '<a href="'+href+'" target="_blank">'+text+'</a>'
            }

            renderer.paragraph = function (text) {
                /* let aLinkRep = /<a.*?href="(.*?)".*?>(.*?)<\/a>/g;
                let codeLinkRep = /<code.*?>(.*?)<\/code>/g;
                let cleanText = text.replace(aLinkRep,'$$alink$$').replace(codeLinkRep,'$$codeLink$$');*/
                text = wf.replace.topic(text)
                text = wf.replace.at(text)
                return '<p>' + text + '</p>\n'
            }


            // 让marked兼容mathjax
            const tokenizer = {
                escape: function (src) { // 自定义 escape tokenizer
                    const match = src.match(/\$+([^\$]+?)\$+/)
                    if (match) { //判断是否是latex公式,
                        return {
                            type: 'escape',
                            raw: src,
                            text: src
                        }
                    } else
                        //如果不是返回false,会使用默认tokenizer
                        return false
                },
                url:function(src, mangle) {
                    let urlRep = /^(http|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?/
                    let cap = urlRep.exec(src)
                    if (cap) {
                        return {
                            type: 'link',
                            raw: cap[0],
                            text: cap[0],
                            href: cap[0],
                            tokens: [{
                                type: 'text',
                                raw: cap[0],
                                text: cap[0]
                            }]
                        }
                    }
                }
            }

            function highlight(code) {
                return hljs.highlightAuto(code).value
            }

            //暂时用不到walkTokens了
            /* //在markdown解析过程前使用walkTokens函数替换topic和at
             const walkTokens = (token) => {
                 //walkTokens函数随每个tokn一起调用，所以出现同一个token多次经过walkTokens函数
                //添加参数用于判断当前token是否调用过walkTokens函数
                //topic、at替换  code、escape、paragraph文本内容不需要替换
                if (!token.state && token.type == 'paragraph') {
                    if (token.text && token.text.length > 0) {
                        token.text = wf.replace.topic(token.text)
                        token.text = wf.replace.at(token.text)
                    }
                    token.state = 'handled'
                }
                //url替换
                if (!token.urlReplace && token.type == 'paragraph') {
                    if (token.text && token.text.length > 0) {
                        let match = token.raw.match(/(http|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?/)
                        if (match) {
                            token.text = token.text.replace(match[0], '<a href="' + match[0] + '" target="_blank">' + match[0] + '</a>')
                        }
                    }
                    token.urlReplace = 'urlReplaced'
                }

            }*/
            marked.use({
                //walkTokens,
                tokenizer: tokenizer,
                renderer: renderer,
                highlight: highlight,
                //防止xss攻击
                sanitize: true,
                targetBlank: true
            })
           
           
            
            content = marked(content)
        }


        
        return content
    }


}


//  jsbuilder/wf/acc/wf.acc.js

wf.acc = function (container) {
    /*
        定义标签下的所有可用视图。
        格式：
            视图名：渲染函数。
        使用方式：
            添加html标签，格式为
            <wf-acc view='[视图名]'></wf-acc>
        */
    let views = {
        //couponlist模块 要求data-* appid：应用id，必填  url：显示去使用按钮 点击跳转至url，不填则显示已领取
        couponlist: wf.acc.couponlist
    };

    $(function () {
        $("wf-acc", container).each(function (i, element) {
            console.log(element);
            let view = element.getAttribute("view") || element.getAttribute("data-view");
            let _emit = element.getAttribute("emit");
            if (views[view]) views[view](element, _emit);
            else console.log("render of view[".concat(view, "] not found!"));
        });
    });
};


//  jsbuilder/wf/acc/modules/wf.acc.couponModule.js

// couponMoudle({
//     appId: 获取券表关键参数,当前appid所属优惠券（数字，非必填）,
//     container: 优惠券列表渲染容器（必填）,
//     cb: 成功领取该优惠券后回调函数（必填）,
//     url: 是否显示去使用按钮（非必填， 默认为领取成功后显示已领取，填url为领取成功后跳转至url）
// });

var couponMoudle = function (data) {
    let openTime = new Date().toLocaleString("zh", { hour12: false, hourCycle: "h23" });
    let url = data.url;
    function renderCouponList() {
        new Promise((resolve, reject) => {
            wf.http.post(
                wf.apiServer() + "/acs/acs_coupon_rule_list",
                {
                    appId: data.appId,
                    openTime: openTime
                },
                function (res) {
                    resolve(res);
                },
                function (error) {
                    reject(error);
                }
            );
        })
            .then((result) => {
                $(data.container)
                    .empty()
                    .render({
                        data: result,
                        template: [
                            {
                                e: "ul",
                                a: {
                                    class: "couponList"
                                },
                                t: {
                                    e: "li",
                                    a: {
                                        class: "couponBox"
                                    },
                                    datapath: "dlist",
                                    t: [
                                        {
                                            e: "div",
                                            a: {
                                                class: "couponInfo"
                                            },
                                            t: [
                                                {
                                                    e: "p",
                                                    a: {
                                                        class: "info_title",
                                                        title: "[[package]]"
                                                    },
                                                    t: [
                                                        "<i>折扣券</i>",
                                                        {
                                                            if: function (p) {
                                                                if (p.data.package) {
                                                                    return true;
                                                                } else {
                                                                    return false;
                                                                }
                                                            },
                                                            then: {
                                                                e: "span",
                                                                t: function (r) {
                                                                    $(r.container).text(`适用于${r.data.package}`);
                                                                }
                                                            },
                                                            else: {
                                                                e: "span",
                                                                t: "适用于个人套餐"
                                                            }
                                                        }
                                                    ]
                                                },
                                                {
                                                    e: "p",
                                                    a: {
                                                        class: "info_period"
                                                    },
                                                    t: function (r) {
                                                        let norTime = function (input) {
                                                            input = input && input.replace(/-|\//g, ".");
                                                            return input;
                                                        };
                                                        $(r.container).text(`${norTime(r.data.startDate)} - ${norTime(r.data.endDate)}`);
                                                    }
                                                }
                                            ]
                                        },
                                        {
                                            e: "div",
                                            a: {
                                                class: "op"
                                            },
                                            t: [
                                                {
                                                    e: "div",
                                                    a: {
                                                        class: "offtip"
                                                    },
                                                    t: function (r) {
                                                        $(r.container).text(` ${Math.round(r.data.jdata.ratio * 1000) / 100} 折`);
                                                    }
                                                },
                                                {
                                                    if: function (p) {
                                                        return !p.data.collected;
                                                    },
                                                    then: {
                                                        if: function (p) {
                                                            return !p.data.remain;
                                                        },
                                                        then: { div: "已领完" },
                                                        else: {
                                                            e: "div",
                                                            a: {
                                                                class: "pickbtn"
                                                            },
                                                            t: "立即领取",
                                                            click: function (r) {
                                                                Object.prototype.toString.call(data.cb) === "[object Function]"
                                                                    ? data.cb(couponGet(r.org_data, r.sender))
                                                                    : alert("回调函数不能为空！");
                                                            }
                                                        }
                                                    },
                                                    else: {
                                                        if: function (p) {
                                                            return p.data.used
                                                        },
                                                        then: {
                                                            div: "已使用"
                                                        },
                                                        else: {
                                                            if: function () {
                                                                return url;
                                                            },
                                                            then: {
                                                                e: "div",
                                                                a: {
                                                                    class: "pickbtn"
                                                                },
                                                                t: "去使用",
                                                                click: function (r) {
                                                                    window.location.href =
                                                                    wf.accServer().concat(
                                                                        "/pay/v2/acsentry?appid=",
                                                                        encodeURIComponent(data.appId),
                                                                        "&return_url=",
                                                                        encodeURIComponent(url)
                                                                    )
                                                                }
                                                            },
                                                            else: {
                                                                div: "已领取"
                                                            }
                                                        }
                                                    }
                                                }
                                            ]
                                        }
                                    ]
                                }
                            }
                        ]
                    });
            })
            .catch((error) => {
                console.log(error);
            });
    }

    //优惠券领取
    function couponGet(org_data, element) {
        return new Promise((resolve, reject) => {
            let _data = org_data;
            _data.channel = "站内应用";
            wf.http.post(
                wf.apiServer() + "/acs/acs_coupon_get",
                _data,
                function (result) {
                    if (result.code) {
                        reject({
                            status: 99,
                            message: result.msg
                        });
                    } else {
                        resolve({
                            status: 0,
                            message: result
                        });
                        if (url) {
                            $(element)
                                .removeClass("pickbtn")
                                .empty()
                                .render({
                                    template: {
                                        e: "form",
                                        style: {
                                            display: "inline-block"
                                        },
                                        a: {
                                            action: wf.accServer() + "/acspayentry",
                                            method: "post"
                                        },
                                        t: [
                                            {
                                                e: "input",
                                                a: {
                                                    type: "hidden",
                                                    name: "appDetails",
                                                    value: data.appId
                                                }
                                            },
                                            {
                                                e: "input",
                                                a: {
                                                    type: "hidden",
                                                    name: "return_url",
                                                    value: url
                                                }
                                            },
                                            {
                                                e: "input",
                                                style: {
                                                    height: "initial"
                                                },
                                                a: {
                                                    class: "pickbtn",
                                                    type: "button",
                                                    value: "去使用"
                                                },
                                                click: function(r) {
                                                    window.event.stopPropagation();
                                                    $(r.sender).parents("form").submit();
                                                }
                                            }
                                        ]
                                    }
                                });
                        } else {
                            $(element)
                                .removeClass("pickbtn")
                                .empty()
                                .render({
                                    template: {
                                        div: "已领取",
                                        click: function (r) {
                                            window.event.stopPropagation();
                                        }
                                    }
                                });
                        }
                    }
                },
                function (e) {
                    reject({
                        status: 99,
                        message: e
                    });
                }
            );
        });
    }
    renderCouponList();

};


//  jsbuilder/wf/acc/modules/wf.acc.couponlist.js

wf.acc.couponlist = function (element, emit) {
    let appId = element.getAttribute("data-appid");
    let url = element.getAttribute("data-url");
    let couponData = {
        appId: appId,
        url: url,
        container: element,
        cb: function (pres) {
            pres.then(
                (res) => {
                    let validDay = res.message.jdata && res.message.jdata.validDay;
                    dialog.success(validDay ? "领取成功！\n请在".concat(validDay, "天内使用") : "领取成功！");
                    if (emit) {
                        wf.emit[emit] && wf.emit[emit](res);
                    }
                },
                (err) => {
                    if (emit) {
                        wf.emit[emit] && wf.emit[emit](res);
                    }
                    if (!wf.cookie.get("uid")) {
                        var return_url = window.location.pathname;
                        window.location.href = wf.wfPubServer() + "/login?redirectUri=" + return_url;
                    } else {
                        dialog.fail(err.message.err_message);
                        console.log(err);
                    }
                }
            );
        }
    };
    couponMoudle(couponData);
};


//  jsbuilder/wf/acc/modules/wf.acc.packagelist.js

wf.acc.packagelist = function(element) {
    $(element).render({
        template: [{
                e: 'message-list',
                class: 'message-list',
                t: function(e) {
                    var messageListEle = $(e.container)

                    loaddata(messageListEle)

                }

            },

        ]
    })

}

//  jsbuilder/wf/acc/workorderCreator/wf.acc.workorderCreator.js

wf.acc.workorderCreator = function(param) {
    poplayer({
        header: '新建工单', // e.org_data.caseType,
        width: '600px',
        height: '600px',
        template: [{
            form: [{
                    fieldset: [
                        { legend: '申请类型' },
                        {
                            e: 'label',
                            t: param.docType
                        }
                    ]
                },
                {
                    fieldset: [{ legend: '申请信息' }, {
                        e: 'div',
                        id: 'apply-body',
                        t: function(e) {
                            var p = {
                                container: $('#apply-body'),
                                data: {
                                    docType: param.docType
                                }
                            };
                            wf.workOrder.creator.option(p);
                        }
                    }]
                },
                {
                    footerbar: [
                        { button: '确定', click: submit },
                        {
                            button: '取消',
                            click: function(e) {
                                $(e.sender).closest('popmask').remove();
                            }
                        }
                    ]
                }
            ],
            id: 'form_create'
        }]
    });

    function submit(ebtn) {
        var data = $('#form_create').serializeObject();
        wf.http.post('/api/order_create', data, function(resData, response) {
            if (!response.code && !response.err_code) {
                // 社区私信通知
                wf.workOrder.common.notice(resData);
                wf.workOrder.common.email(resData);
                // 短信通知
                // wf.workOrder.common.SMSSend({ caseId: e.org_data.caseId, caseType: e.org_data.caseType, mobile: e.org_data.contact, opinion: data.opinion });
                alert('工单提交成功!');
                $(ebtn.sender).closest('popmask').remove();
                var p = {
                    container: $('workorder-body')[0],
                    data: {
                        docType: $("[name='doctype']").val(),
                        status: $("[name='status']").val(),
                        result: $("[name='result']").val()
                    }
                };
                if (behavior === 'organization' && returnUrl) {
                    window.location.href = returnUrl;
                }
                if ($('wf-workorder').attr('view') == 'admin') {
                    wf.workOrder.admin.orderRender(p);
                    wf.workOrder.admin.orderDetail(e);
                } else if ($('wf-workorder').attr('view') == 'user') {
                    wf.workOrder.user.orderRender(p);
                    wf.workOrder.user.orderDetail(e);
                }
            } else {
                alert('订单信息提交失败,' + (!!response.sqlMessage ? response.sqlMessage : response.err_message));
                $(ebtn.sender).closest('popmask').remove();
            }
        });
    }

    wf.acc.workorderCreator.option = function(e) {
        var docType = e.data.docType;
        switch (e.data.docType) {
            case '机构购买申请单':
                $(e.container).parent().render({
                    data: e.data,
                    template: [
                        { span: '机构名称' },
                        { input: 'name', id: 'name', a: { type: 'text' } },
                        '<br />',
                        { span: '证件类型' },
                        { input: 'IDType', id: 'IDType', a: { type: 'text' } },
                        '<br />', // 营业执照、税务登记证、组织机构代码证
                        { span: '证件号码' },
                        { input: 'IDNo', id: 'IDNo', a: { type: 'text' } },
                        '<br />',
                        { span: '地址' },
                        { input: 'address', id: 'address', a: { type: 'text' } },
                        '<br />',
                        { span: '联系方式' },
                        { input: 'contract', id: 'contract', a: { type: 'text' } },
                        '<br />',
                        { span: '说明备注' },
                        '<br />',
                        { textarea: 'memo' }
                    ]
                });
                break;
            default:
                break;
        }


    };
}

//  jsbuilder/wf/acc/workorderCreator/modules/wf.acc.workorderCreator.customerIP.js

wf.acc.workorderCreator.customerIP = function(param) {
    var limit = 2;
    // 本机IP
    var hostIp;
    $.getScript('https://pv.sohu.com/cityjson?ie=utf-8', function(data) {
        //localIP = returnCitySN["cip"];
        hostIp = returnCitySN.cip;
    });
    // 加载购买列表
    wf.http.post(wf.apiServer() + '/acs/acs_customer_info', {},
        function(data) {
            if (data.res && data.res.level) {
                if (data.res.level == 1) {
                    limit = 8;
                } else if (data.res.level == 2) {
                    limit = 4;
                } else {
                    limit = 2;
                }

                poplayer({
                    header: '个人配置-机构IP配置', // e.org_data.caseType,
                    width: '600px',
                    height: '600px',
                    template: [{
                        form: [{
                                fieldset: [
                                    { legend: '类型' },
                                    {
                                        e: 'h3',
                                        t: "机构用户IP配置" // param.docType
                                    }
                                ]
                            }, {
                                div: function(param) {
                                    param.ips = data.ips;
                                    renderIpConfig(param);
                                },
                                class: 'ipConfigContainer'
                            },
                            {
                                e: 'div',
                                t: [{
                                        e: 'f1',
                                        t: [{
                                                label: '本机IP'
                                            },
                                            {
                                                e: 'span',
                                                t: hostIp
                                            }
                                        ]
                                    },
                                    {
                                        e: 'a',
                                        a: {
                                            href: 'javascript:;',
                                            title: '作为参考，本机IP只为其中一条链路的IP，若您的网络有多条IP链路，请视情况添加多个IP。'
                                        },
                                        t: '<svg t="1611738644479" class="icon" style="vertical-align:-3px" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2063" width="16" height="16"><path d="M511.6 63.6c-247.4 0-448 200.6-448 448s200.6 448 448 448 448-200.6 448-448-200.6-448-448-448zM508.7 825c-36.5 0-66.1-29-66.1-64.8 0-35.7 29.6-64.8 66.1-64.8 36.5 0 66.1 29.1 66.1 64.8 0 35.9-29.5 64.8-66.1 64.8z m177.5-366.5c-13 20.4-40.4 48.1-82.7 83.2-21.8 18.2-35.5 32.8-40.7 43.9-5.2 11-7.7 30.8-7.2 59.3h-94.1l-0.4-24.7c0-30.5 5-55.6 15.1-75.2s30.3-41.8 60.5-66.3c30.1-24.6 48.3-40.7 54.1-48.3 9.1-12 13.7-25.3 13.7-39.7 0-20.1-8.1-37.3-24.2-51.7-16.1-14.3-37.9-21.5-65.2-21.5-26.4 0-48.4 7.5-66.1 22.4-17.7 15-33 47.9-36.5 68.3-3.4 19.3-96.2 27.4-95-11.6 1.1-39 21.4-81.4 56.2-112.1 34.8-30.7 80.6-46.1 137.1-46.1 59.5 0 106.8 15.6 142.1 46.7 35.2 31 52.7 67.2 52.7 108.5 0 22.9-6.5 44.6-19.4 64.9z m0 0" p-id="2064" fill="#76a8e4"></path></svg>'
                                    }
                                ]
                            },
                            {
                                e: 'div',
                                class: 'popFooter',
                                t: [{
                                        e: 'button',
                                        t: '确定',
                                        click: function(e) {
                                            var ipConfigItem = $('.ipConfigItem');
                                            var ips = [];
                                            var ip, subnetMask;
                                            var flag = false;
                                            $.each(ipConfigItem, function(i, ele) {
                                                ip = $(ele).find("input[name='IP']").val();
                                                subnetMask = $(ele).find("input[name='subnetMask']").val();
                                                if (ip === '') {
                                                    flag = false;
                                                } else {
                                                    var ipObj = {
                                                        ip: ip,
                                                        subnetMask: subnetMask,
                                                        networkAddr: getNetworkBroadcastAddr(subnetMask, ip)[0]
                                                    };
                                                    ips.push(ipObj);
                                                    flag = true;
                                                }
                                            });
                                            if (flag) {
                                                wf.http.post(wf.apiServer() + '/acs/acs_customer_ip_config', { ips: ips },
                                                    function(data) {
                                                        alert("IP配置成功");
                                                        $(e.sender).closest('popmask').remove();
                                                    },
                                                    function(error) {
                                                        console.log(error);
                                                        alert(error.err_message);
                                                    }
                                                );
                                            } else {
                                                alert('IP地址不能为空！');
                                            }
                                        }
                                    },
                                    {
                                        e: 'button',
                                        t: '取消',
                                        click: function(e) {
                                            $(e.sender).closest('popmask').remove();
                                        }
                                    }
                                ]
                            }
                        ],
                        id: 'form_create'
                    }]
                });
            } else {
                alert("不是机构用户不能进行此操作");
            }
        },
        function(error) {
            console.log(error);
        }
    );


    // 渲染初始IP配置项
    function renderIpConfig(param) {
        if (param.ips && param.ips.length > 0) {
            $.each(param.ips, function(i, ele) {
                $(param.container).render({
                    data: ele,
                    template: {
                        div: [{
                                e: 'f1',
                                t: [{
                                        label: 'IP地址' + (i + 1) + ' *'
                                    },
                                    {
                                        e: 'input',
                                        a: {
                                            name: 'IP',
                                            value: '[[ip]]'
                                        }
                                    }
                                ]
                            },
                            {
                                e: 'f1',
                                t: [{
                                        label: '子网掩码'
                                    },
                                    {
                                        e: 'input',
                                        a: {
                                            name: 'subnetMask',
                                            value: '[[subnetMask]]'
                                        }
                                    }
                                ]
                            },
                            {
                                e: 'button',
                                t: '+',
                                style: {
                                    height: '16px',
                                    color: '#fff',
                                    width: '16px',
                                    padding: '0',
                                    'border-radius': '50%',
                                    'background-color': '#81c5ba',
                                    margin: '0 5px 0 0',
                                    cursor: 'pointer'
                                },
                                click: function() {
                                    if ($('.ipConfigItem').length + 1 <= limit) {
                                        renderIpConfigItem(param.container, 'sub');
                                    } else {
                                        alert('超出机构等级限制IP条目！');
                                    }
                                }
                            },
                            {
                                e: 'button',
                                t: '-',
                                style: {
                                    height: '16px',
                                    color: '#fff',
                                    width: '16px',
                                    padding: '0',
                                    'border-radius': '50%',
                                    'background-color': '#81c5ba',
                                    margin: '0 5px 0 0',
                                    cursor: 'pointer',
                                    'line-height': '14px'
                                },
                                click: function(param) {
                                    if ($('.ipConfigItem').length != 1) {
                                        $(param.sender).parent().remove();
                                    } else {
                                        alert('不能删除最后一条');
                                    }
                                }
                            }
                        ],
                        class: 'ipConfigItem'
                    }
                });
            });
        } else {
            renderIpConfigItem(param.container, 'add');
        }
    }

    // 渲染新加IP配置子项
    function renderIpConfigItem(container) {
        var num = $('.ipConfigItem').length;
        $(container).render({
            template: {
                div: [{
                        e: 'f1',
                        t: [{
                                label: 'IP地址' + (num + 1) + ' *'
                            },
                            {
                                e: 'input',
                                a: {
                                    name: 'IP'
                                }
                            }
                        ]
                    },
                    {
                        e: 'f1',
                        t: [{
                                label: '子网掩码'
                            },
                            {
                                e: 'input',
                                a: {
                                    name: 'subnetMask'
                                }
                            }
                        ]
                    },
                    {
                        e: 'button',
                        t: '+',
                        style: {
                            height: '16px',
                            color: '#fff',
                            width: '16px',
                            padding: '0',
                            'border-radius': '50%',
                            'background-color': '#81c5ba',
                            margin: '0 5px 0 0',
                            cursor: 'pointer'
                        },
                        click: function() {
                            if ($('.ipConfigItem').length + 1 <= limit) {
                                renderIpConfigItem(container, 'sub');
                            } else {
                                alert('超出机构等级限制IP条目！');
                            }
                        }
                    },
                    {
                        e: 'button',
                        t: '-',
                        style: {
                            height: '16px',
                            color: '#fff',
                            width: '16px',
                            padding: '0',
                            'border-radius': '50%',
                            'background-color': '#81c5ba',
                            margin: '0 5px 0 0',
                            cursor: 'pointer',
                            'line-height': '14px'
                        },
                        click: function(param) {
                            if ($('.ipConfigItem').length != 1) {
                                $(param.sender).parent().remove();
                            } else {
                                alert('不能删除最后一条');
                            }
                        }
                    }
                ],
                class: 'ipConfigItem'
            }
        });
    }

    /***　　把IP地址转换成二进制格式*　　@param string  ip  待转换的IP的地址*/
    function ipToBinary(ip) {
        if (ip_reg.test(ip)) {
            var ip_str = '',
                ip_arr = ip.split('.');

            for (var i = 0; i < 4; i++) {
                curr_num = ip_arr[i];
                number_bin = parseInt(curr_num);
                number_bin = number_bin.toString(2);
                count = 8 - number_bin.length;
                for (var j = 0; j < count; j++) {
                    number_bin = '0' + number_bin;
                }
                ip_str += number_bin;
            }
            return ip_str;
        }

        return '';
    }

    /***　　把二进制格式转换成IP地址*　　@param string  binary  待转换的二进制　　*/
    function binaryToIp(binary) {
        if (binary.length == 32) {
            a = parseInt(binary.substr(0, 8), 2);
            b = parseInt(binary.substr(8, 8), 2);
            c = parseInt(binary.substr(16, 8), 2);
            d = parseInt(binary.slice(-8), 2);

            return a + '.' + b + '.' + c + '.' + d;
        }
        return '';
    }
    // 验证IP的正则
    var ip_reg = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

    // 验证子网掩码的正则
    var mask_reg = /^(254|252|248|240|224|192|128|0)\.0\.0\.0|255\.(254|252|248|240|224|192|128|0)\.0\.0|255\.255\.(254|252|248|240|224|192|128|0)\.0|255\.255\.255\.(254|252|248|240|224|192|128|0)$/;

    /***　　根据子网掩码和网关计算网络地址和广播地址*　　@param string  mask  子网掩码*　　@param string  gateway 网关*/
    function getNetworkBroadcastAddr(mask, ip) {
        var networkBroadcast = [];
        var networkAddr = '';

        var maskArr = mask.split('.');
        var ipArr = ip.split('.');

        // 计算IP的网络地址 与(&)运算
        if (mask === '') {
            networkBroadcast.push(ip);
        } else {
            for (var i = 0; i < 4; i++) {
                var number1 = parseInt(maskArr[i]);
                var number2 = parseInt(ipArr[i]);
                networkAddr += number1 & number2;
                if (i < 3) {
                    networkAddr += '.';
                }
            }
            networkBroadcast.push(networkAddr);
        }

        // 计算广播地址
        // 子掩码后面有几个0，就去掉IP地址后几位再补1
        var maskBinary = ipToBinary(mask);
        var gatewayBinary = ipToBinary(ip);

        var maskZero = maskBinary.split(0).length - 1;
        var oneNumber = new Array(maskZero + 1).join('1'); // IP地址后位补1
        var gatewayHouWeiBuYi = gatewayBinary.slice(0, -maskZero) + oneNumber;

        networkBroadcast.push(binaryToIp(gatewayHouWeiBuYi));

        return networkBroadcast;
    }

}

//  jsbuilder/wf/comment/wf.comment.js

$.fn.extend({
    comment: function() {
        $('wf-comment', this).each(function(i, element) {
            wf.comment(element)
        })
    }
})

wf.comment = function(element) {
    var thirdCommentsType = true //第三方评论标识
   
    $(element).empty()
    let data = {
        appKey:element.getAttribute('app_key') || element.getAttribute('data-app_key'),//用于公司内部,由于网关就不好解决暂时，暂时用于查询appinfo信息
        audioUrl:element.getAttribute('audio_url') || element.getAttribute('data-audio_url') ,
        periodicalIdentity:element.getAttribute('periodical_identity') || element.getAttribute('data-periodical_identity') ,
        loginUrl:element.getAttribute('loginurl') || element.getAttribute('data-loginurl'),
        icon: element.getAttribute('icon') || element.getAttribute('data-icon') ,
        iconHref: element.getAttribute('icon_href') || element.getAttribute('data-icon_href'),
        videoTitle: element.getAttribute('video_title') || element.getAttribute('data-video_title'),
        videoPoster: element.getAttribute('video_poster') || element.getAttribute('data-video_poster'),
        videoUrl: element.getAttribute('video_url') || element.getAttribute('data-video_url') || $('video').attr('src') || $('video source').attr('src'),
        thirdCommentsType: thirdCommentsType, //第三方评论标识
        title: element.getAttribute('title') || element.getAttribute('data-title') || document.title,
        url: element.getAttribute('url') || element.getAttribute('data-url') || ((top === self) ? window.location.href : document.referrer),
        description: element.getAttribute('description') || element.getAttribute('data-description') || $('meta[name=description]').attr('content')
    }

    function initRender(data) {
        
        // console.log(wf.loginState)
        // console.log(data.loginUrl)
        // if(data.loginUrl){
           
        //     var wfpub_token = wf.cookie.get('wfpub_token')
        //     console.log('888')
        //     console.log(wfpub_token)
        //     // wf.isLogin(false, wfpub_token)
        //     wf.isLogin(false,wfpub_token)
        // }else{
        //     //站内应用
        //     wf.isLogin(true)
        // }
        // if(wf.loginState && wf.loginState.uid){
        //     //登录
        //     data.uid = wf.loginState.uid
            
            
        // }

        wf.isLogin()
        if(wf.loginState &&wf.loginState.uid){
            
            //登录
            data.uid = wf.loginState.uid
        }
        renderComment(data)
    }
 
    initRender(data)
    
    

    function renderComment(data) {
        //登录
        $(element).empty().render({
            data: data,
            template: {
                e: 'wf-sns',
                t: [
                    function(e) {
                       
                        if (e.data.uid) {
                            wf.sns.messageSender(e)
                        } else {
                            unlogin(e.container, data)
                        }
                    },
                    {
                        e: 'message-list',
                        class: 'message-list',
                        t: function(Ele) {
                            
                            var messageListEle = $(Ele.container)
                            renderCommentList(messageListEle )
                        }
                    },
                    {
                        e: 'wf-button',
                        a: {
                            id: 'more',
                            'fromId': '[[minId]]'
                        },
                       
                        t: '点击加载更多...',
                        click:function(Ele){
                            var messageListEle = $(Ele.sender).siblings('message-list.message-list')
                            renderCommentList(messageListEle)
                        }
                        
                    }
                ]
            }
        })
    }

    function unlogin(container, data) {
        
        $(container).render({
            data: data,
            template: {
                e: 'wf-no-login',
                t: [{
                    e: 'wf-span',
                    t: '您当前未登录！'
                },
                {

                    e: 'a',
                    a: {
                      
                        href: function(e) {
                            let url = e.data.url ? e.data.url : window.location.href
                            if(e.data.loginUrl){
                                //存在走别人的
                                // return 'http://my.test.wanfangdata.com.cn/auth/user/alllogin.do?service=http%3A%2F%2Ftest.wanfangdata.com.cn%2Findex'
                                return e.data.loginUrl
                            }else{
                                //不存在就走新平台的
                                url = wf.getRelativeUrl()
                                url = encodeURIComponent(url)
                                return wf.oauthServer() + '/login?redirectUri=' + url
                            }
                            
                            
                        },
                        target:'_blank'
                    },
                    t: '去登录',
                   
                }
                ]
            }
        })
    }
    function renderCommentList(messageListEle) {
        var moreEle = messageListEle.siblings('wf-button')
        
        var reqData ={

            fromId: moreEle.attr('fromId'),
            url: data.url,
        }
        if(data.periodicalIdentity){
            let periodicalIdentity = eval('(' + data.periodicalIdentity + ')')
            reqData.periodicalIdentity = periodicalIdentity 
        }

        wf.http.post(wf.apiServer() + '/sns/wf_comment',reqData,
            function(data) {
                
                    // 添加第三方标识数据
                    data.thirdCommentsType = thirdCommentsType
                    // 获取收藏数据，渲染内容
                    wf.sns.timeline.getFavouriteData(data,renderMessageList,messageListEle)     
              
               
            },
            function(err) {
                console.log({ err: err })
            }
        )
    }

    function renderMessageList(messageListEle,data){
        messageListEle.render({
            data: data.messages,
   
            template: function(e) {
                e.thirdCommentsType = thirdCommentsType
               
                wf.sns.timeline.message(e)
            }
        })
        // 加载更多逻辑处理
                
        wf.sns.timeline.loadmore(messageListEle,data)
    }
}





//  jsbuilder/wf/comment/modules/wf.comment.message.js

//暂时没用到
wf.comment.message = function (callback) {
    return function (p) {
        $(p.container).render({
            data: p.data,
            template: {
                // e:'',
                // class: 'message-detail',
                'message-detail': [{
                    'wf-user': {
                        img: '[[user/avatarUrl]]',
                        class: 'avatar-img'
                    },
                    class: 'avatar',
                    a: { 'data-nickname': 'user/nickname' }
                },
                {
                    div: [
                        { 'wf-user': '[[user/nickname]]', a: { 'data-nickname': '[[user/nickname]]' } },
                        {
                            if: p.data.user.type !== '个人',
                            then: { 'wf-user-tag': '[[user/type]]' },
                        },
                        { span: '[[createTime]]', class: 'remark' },
                        function (e) {
                            return '<wf-article>' + wf.replace.at(e.data.content) + '</wf-article>'
                        },
                        { 'span': '(转发[[forwardCount]])' }, '|', { 'span': '(评论[[commentCount]])' }, { 'button': '回复' },
                        {
                            if: 'imageId',
                            then: wf.sns.timeline.imagepart
                        },
                        {
                            if: p.data.comments.comments.length > 0,
                            then: {
                                'div': {
                                    div: [{
                                        'wf-user': {
                                            img: '[[user/avatarUrl]]',
                                            class: 'avatar-img'
                                        },
                                        class: 'avatar',
                                        a: { 'data-nickname': 'user/nickname' }
                                    }, {
                                        div: [
                                            { 'wf-user': '[[user/nickname]]', a: { 'data-nickname': '[[user/nickname]]' } },
                                            {
                                                if: p.data.user.type !== '个人',
                                                then: { 'wf-user-tag': '[[user/type]]' },
                                            },
                                            { div: '[[createTime]]', class: 'remark' },
                                            { div: '[[content]]' },
                                            { div: '回复([[replyCount]])' },
                                            { button: '回复' }
                                        ]
                                    }],
                                    datapath: 'comments/comments'
                                }
                            }
                        }
                        // { button: "测试回调函数", click: callback }
                    ],
                    class: 'message-body',
                },
                ]
            }
        })



    }
}

//  jsbuilder/wf/favorite/fav.js

// //收藏信息
$.fn.extend({
    favorite: function() {
        $('wf-favourite', this).each(function(i, element) { // 注意this，这里是是在selector指定的节点下查找wf-favourite元素进行渲染。注意jquery each 参数
            var _this = $(this)
            var title = _this.attr('title') || _this.data('title') || document.title
            var url = _this.attr('url') || _this.data('url') || window.location.href
            var defaultUrl = wf.oauthServer() + '/login?redirectUri=' + encodeURIComponent('/' + url.split('/').slice(3).join('/'))
            var login_url =  _this.attr('loginurl') || _this.data('loginurl') || defaultUrl

            let api_url = wf.cookie.get('token') ? wf.apiServer() + '/favourite/user_statistic' : wf.apiServer() + '/favourite/statistic' // 注意三元表达式
            let user_api_url = wf.apiServer() + '/favourite/statistic'

            let message_id = _this.attr('messageId') || _this.data('messageId');

            //发送ajax
            wf.http.post(
                api_url, {
                    url: url
                },
                function(data) {
                    renderCollect($(element), data)
                },
                function() {
                    wf.http.post(
                        user_api_url, {
                            url: url
                        },
                        function(data) {
                            renderCollect($(element), data)
                        }
                    )
                }
            )

            function click(data) {
                let favourite_url = data.state === '已收藏' ? wf.apiServer() + '/favourite/delete' : wf.apiServer() + '/favourite/add'
                wf.http.post(
                    favourite_url, {
                        title: title,
                        url: url,
                        messageId:message_id
                    },
                    function(data) {
                        // console.log('操作成功！')
                        renderCollect($(element), data)
                    },
                    function(err) {
                        if (err.data !== undefined && err.data.err_message) {
                            dialog.fail(err.data.err_message)
                        } else if (err.err_code == 40002 && (err.sub_code == 'isv.missing-token' || err.sub_code == 'isv.invalid-token')) {
                            // console.log('token过期，请重新登陆')
                            window.open(login_url)
                            // window.location.href = login_url //暂时本窗口进行跳转，登陆完返回跳转前页面
                        } else {
                            // console.log(JSON.stringify(err))
                            dialog.fail('收藏失败！')
                        }
                    }
                )
            }

            //渲染内容
            function renderCollect(ele, data) {
                ele.empty().render({ //注意这里是element
                    // data: data,
                    template: {
                        e: 'wf-favourite-statistic',
                        t: [{
                            e: 'img',
                            style:{
                                "vertical-align": "middle"
                            },
                            a:{
                                src: (data.state === '已收藏') ? wf.comServer() + '/img/o-star.png' : wf.comServer() + '/img/g-star.png'
                            }

                        },
                        // {
                        //     e: 'span',
                        //     t: '收藏状态：'
                        // },
                        // {
                        //     e: 'span',
                        //     a: {
                        //         id: 'state'
                        //     },
                        //     t: (data.state === '已收藏') ? '是' : '否'
                        // },
                        // {
                        //     e: 'span',
                        //     t: '&nbsp;&nbsp;收藏量：'
                        // },
                        {
                            e: 'span',
                            t: (data.collect_num === undefined) ? '(0)' : '('+data.collect_num+')'
                        }
                        ],
                        click: function() {
                            click(data)
                        }
                    }
                })
            }
        })
    }
})

// 把它放在wf.js中
// $(function() {
//     $(document).favorite()
// })

//  jsbuilder/wf/notify/wf.notify.changeNum..js

wf.notify.changeNum = function(numEle) {
    if( numEle.length>0){
           
        let oldTotalCount = $('wf-sns-notify notify-total-number').data('num')
        let newTotalCount = (parseInt(oldTotalCount) - parseInt( numEle.data('num')))
        $('wf-sns-notify notify-total-number').data('num',newTotalCount)
        if(newTotalCount>99){
            newTotalCount = '99+'
        }else{
            newTotalCount = newTotalCount +''
        }
        $('wf-sns-notify notify-total-number').text(newTotalCount)
        
        if(parseInt($('wf-sns-notify notify-total-number').data('num'))>0){

            $('wf-sns-notify notify-total-number').show()
        }else{
            $('wf-sns-notify notify-total-number').hide()
        }
        numEle.remove()
        
    }
    
}

//  jsbuilder/wf/notify/wf.sns.notify.js

$.fn.extend({
    notify: function () {
        $('wf-sns-notify', this).each(function (i, element) {
            unreadMessage(element)
            setInterval(function () {
                unreadMessage(element)
            }, 1000 * 60)

            function unreadMessage(element) {
                var headers = {}
                
                headers['X-Ca-AppKey'] = wf.appFalg()
                wf.http.post(
                    {
                        url: wf.apiServer() + '/sns/notify_count',
                        data: {},
                        headers:headers,
                    },
                    function (data) {
                        if (!data) {
                            return
                        }
                        $(element).empty().render({
                            data: data,
                            event: {
                                mouseleave: function () {
                                    $(element).children('.fa-caret-up').css('display', 'none')
                                    $(element).children('notify-detail-ul').css('display', 'none')
                                }
                            },
                            template: [
                                {
                                    e:'a',
                                    a:{
                                        id:'sns',
                                        href:'/'
                                    },
                                    t:[
                                        {
                                            e: 'i',
                                            class:'fa fa-comments',
                                        },
                                       
                                    ],
                                    event: {
                                        mouseover: function (e) {
                                            $(e.sender).siblings('notify-detail-ul').css('display', 'block')
                                            $(e.sender).siblings('.fa-caret-up').css('display', 'block')
                                        }
                                    }

                                },
                                {
                                    e: 'notify-total-number',
                                    a:{
                                        'data-num':function(e){
                                            return e.data.totalCount

                                        }

                                    },
                                    t: function (e) {
                                        if (e.data.totalCount) {
                                            let num = e.data.totalCount
                                            if (e.data.totalCount > 99) {
                                                num = '99+'
                                            }
                                            return num
                                        } else {
                                            $(e.container).css('display', 'none')
                                        }
                                    }
                                },
                                // {
                                //     e: 'i',
                                   
                                //     class:'fa fa-caret-up',
                                // },
                                {
                                    e: 'notify-detail-ul',
                                    style: {
                                        display: 'none',
                                        
                                    },
                                    t: [
                                        {
                                            e: 'notify-detail-li',
                                            t: {
                                                e: 'a',
                                                a:{
                                                    href:'/'
                                                },
                                                style: {
                                                    cursor: 'pointer'
                                                },
                                                t: '社区'
                                            }
                                        },
                                        {
                                            e: 'notify-detail-li',
                                            t: {
                                                e: 'a',
                                                style: {
                                                    cursor: 'pointer'
                                                },
                                                click: renderAtNotify,
                                                t: function (e) {
                                                    if (e.data.messageUnreadCount) {
                                                        let num = e.data.messageUnreadCount
                                                        if (e.data.messageUnreadCount > 99) {
                                                            num = '99+'
                                                        }

                                                        return '@我的   ' + '<notify-number class="messageUnreadCount" data-num='+e.data.messageUnreadCount +'>' + num + '</notify-number>'
                                                    } else {
                                                        return '@我的'
                                                    }
                                                }
                                            }
                                        },
                                        {
                                            e: 'notify-detail-li',
                                            t: {
                                                e: 'a',
                                                style: {
                                                    cursor: 'pointer'
                                                },
                                                click: renderAtCommentNotify,
                                                t: function (e) {
                                                    if (e.data.commentUnreadCount) {
                                                        let num = e.data.commentUnreadCount
                                                        if (e.data.commentUnreadCount > 99) {
                                                            num = '99+'
                                                        }
                                                        return '@我的评论   ' + '<notify-number class="commentUnreadCount" data-num='+e.data.commentUnreadCount +'>' + num + '</notify-number>'
                                                    } else {
                                                        return '@我的评论'
                                                    }
                                                }
                                            }
                                        },
                                        {
                                            e: 'notify-detail-li',
                                            t: {
                                                e: 'a',
                                                style: {
                                                    cursor: 'pointer'
                                                },
                                                click: renderCommentReceivedNotify,
                                                t: function (e) {
                                                    if (e.data.commentReceivedCount) {
                                                        let num = e.data.commentReceivedCount
                                                        if (e.data.commentReceivedCount > 99) {
                                                            num = '99+'
                                                        }
                                                        return '收到的评论   ' + '<notify-number class="commentReceivedCount" data-num='+e.data.commentReceivedCount +'>' + num + '</notify-number>'
                                                    } else {
                                                        return '收到的评论'
                                                    }
                                                }
                                            }
                                        },
                                        {
                                            e: 'notify-detail-li',
                                            t: {
                                                e: 'a',
                                                style: {
                                                    cursor: 'pointer'
                                                },
                                                click: renderPraisedNotify,
                                                t: function (e) {
                                                    if (e.data.messagePraisedCount) {
                                                        let num = e.data.messagePraisedCount
                                                        if (e.data.messagePraisedCount > 99) {
                                                            num = '99+'
                                                        }
                                                        return '收到的赞' + '<notify-number class="messagePraisedCount" data-num='+e.data.messagePraisedCount+'>' + num + '</notify-number>'
                                                    } else {
                                                        return '收到的赞'
                                                    }
                                                }
                                            }
                                        },
                                        {
                                            e: 'notify-detail-li',
                                            t: {
                                                e: 'a',
                                                style: {
                                                    cursor: 'pointer'
                                                },
                                                click: renderChatNotify,
                                                t: function (e) {
                                                    if (e.data.chatUnreadCount) {
                                                        let num = e.data.chatUnreadCount
                                                        if (e.data.chatUnreadCount > 99) {
                                                            num = '99+'
                                                        }
                                                        return '私信   ' + '<notify-number class="chatUnreadCount" data-num='+e.data.chatUnreadCount+'>' + num + '</notify-number>'
                                                    } else {
                                                        return '私信'
                                                    }
                                                }
                                            }
                                        }
                                    ]
                                },
                            ],
                        })

                    },
                    function (error) {
                        console.log(error)
                    })
            }

            function renderAtNotify(e) {
                window.open(wf.wfPubServer() + '/#message/at')
                hanldeData(e)
                
            }


            function renderAtCommentNotify(e) {
                window.open(wf.wfPubServer() + '/#comments/at')
                hanldeData(e)
              
                
            }

            function renderCommentReceivedNotify(e) {
                window.open(wf.wfPubServer() + '/#comments/received')
                hanldeData(e)
            }

            function renderChatNotify(e) {
                window.open(wf.wfPubServer() + '/#chat/all')
                hanldeData(e)
                
            }

            function renderPraisedNotify(e) {
                window.open(wf.wfPubServer() + '/#praise/receive')
                hanldeData(e)
            }

            function hanldeData (e){
                let numEle = $(e.sender).find('notify-number')
                wf.notify.changeNum(numEle)
                setTimeout(function () {
                    unreadMessage(element)
                }, 1000)
    
            }
    
        })




       
    }
})

$(document).on('mouseleave', 'wf-sns-notify', function () {
    $(this).children('notify-detail-ul').css('display', 'none')
    $(this).children('.fa-caret-up').css('display', 'none')
})

$(function () {
    $(document).notify()
})




//  jsbuilder/wf/oad/oaisubmit.js

$.fn.extend({
    oaisubmit: function () {
        $('wf-oad-submit', this).each(function (i, element) {
            wf.oadSubmit(element)
        })
    }
})

wf.oadSubmit = function (element) {
    $(element).empty()
    let queryData = {
        appId: element.getAttribute("app_id")
    }
    renderOadSubmit(queryData);

    function renderOadSubmit (data) {
        $(element).empty().render({
            data: data,
            template: {
                div: [
                    {
                        fieldset: [
                            { f2: { span: data.appId, name: 'appId' }, title: 'appId:', style: { 'margin-bottom': '7px' } },
                            {
                                f2: { input: '', name: 'name', style: { width: 'calc(100% - 97px)' } },
                                title: '数据源名称:',
                                style: { 'margin-bottom': '7px' }
                            },
                            {
                                f2: { input: '', name: 'baseUrl', style: { width: 'calc(100% - 97px)' } },
                                title: '数据源URL:',
                                style: { 'margin-bottom': '7px' }
                            },
                            {
                                f2: {
                                    e: 'select',
                                    name: "protocal",
                                    style: { width: 'calc(100% - 97px)' },
                                    t: [
                                        { option: 'OAI-PMH2.0', value: 'OAI-PMH2.0' },
                                        { option: 'JsonPMH1.0', value: 'JsonPMH1.0' },
                                    ],
                                }, title: '协议:',
                                style: { 'margin-bottom': '7px' }
                            },
                            { button: 'submit', id: 'submitBtn', click: oaisubmitBtn }
                        ],
                        title: '添加数据源:'
                    },
                    {
                        table: [
                            {
                                thead: [{
                                    tr: [
                                        { th: '名称' },
                                        { th: '收录数量' },
                                        { th: '最早' },
                                        { th: '最新' },
                                        { th: 'OAI-PMH状态' },
                                        { th: '信息' },
                                        { th: '操作' },
                                    ]
                                }]

                            }, {
                                tbody: function () {
                                    getList(queryData);
                                },
                                class: 'oaiList'
                            },]
                    },
                    {
                        div: '',
                        class: 'page',


                    }
                ],

            }

        });
    }


    function oaisubmitBtn (p) {
        if (!$.trim(p.new_data.baseUrl) || !$.trim(p.new_data.name)) {
            dialog.fail("数据源URL 或 数据源名称不能为空！")
            return;
        }
        $(p.sender).attr('disabled', true);
        var data = {};
        data = Object.assign(p.new_data, p.org_data)
        wf.http.get(wf.apiServer() + '/wfmetadata/repository_wfpub_submit', data, function (data) {
            if (data) {
                $(p.sender).attr('disabled', false);
                $(p.sender).siblings('f2').find("input[name='baseUrl']").val('');
                $(p.sender).siblings('f2').find("input[name='name']").val('');
                getList(queryData);
            }
        }, function (error) {
            console.log(error)
        })
    }
    function getList (queryData) {
        wf.http.get(
            wf.apiServer() + '/wfmetadata/repository_wfpub_search', queryData, function (r) {
                $('.oaiList').empty().render({
                    data: r.respositoryList,
                    template: [{
                        tr: [
                            { td: { a: '[[baseUrl]]', t: '[[name]]', attr: { target: '_blank' } }, width: 200 },
                            { td: '[[capacity]]' },
                            {
                                td: function (e) {
                                    if (e.data.last_identify_time) {
                                        return e.data.last_identify_time.substr(0, e.data.last_identify_time.length - 7)
                                    }

                                }
                            },
                            {
                                td: function (e) {
                                    if (e.data.last_fetch_time) {
                                        return e.data.last_fetch_time.substr(0, e.data.last_fetch_time.length - 7)
                                    }

                                }
                            },
                            {
                                td: function (e) {
                                    switch (e.data.bot_status) {
                                        case 'error':
                                            return '抓取错误'
                                        case 'ready':
                                            return '准备抓取'
                                        case 'OK':
                                            return '抓取完成'
                                        case 'fetching':
                                            return ' 抓取中'
                                        case 'examine':
                                            return '准备审核'
                                        case 'examineing':
                                            return '审核中'
                                        case 'examineFalse':
                                            return '审核失败'
                                    }
                                }
                            },
                            {
                                td: '[[examineMessage]]',
                                width: 192,
                            },
                            {
                                td: [

                                    {
                                        e: 'm-wf-button',
                                        t: (r.respositoryList) ? '重新审核/抓取' : '',
                                        style: {
                                            'cursor': 'pointer',
                                            'margin-right': '20px'
                                        },
                                        click: resetOadSubmit

                                    },
                                    {
                                        e: 'm-wf-button',
                                        t: (r.respositoryList) ? '修改' : '',
                                        style: {
                                            'cursor': 'pointer'
                                        },
                                        click: updateOadSubmit
                                    },
                                    {
                                        fieldset: [

                                            {
                                                f2: { input: '', name: 'update_name', style: { width: 'calc(100% - 97px)' }, value: '[[name]]' },
                                                title: '数据源名称:',
                                                style: { 'margin-bottom': '7px', 'display': 'block' }
                                            },

                                            {
                                                f2: { input: '', name: 'update_baseUrl', style: { width: 'calc(100% - 97px)' }, value: '[[baseUrl]]' },
                                                title: '数据源URL:',
                                                style: { 'margin-bottom': '7px' }
                                            },
                                            {
                                                f2: {
                                                    e: 'select',
                                                    id: 'sel',
                                                    name: "update_protocal",
                                                    style: { width: 'calc(100% - 97px)' },
                                                    t: [
                                                        { option: 'OAI-PMH2.0', value: 'OAI-PMH2.0', },
                                                        { option: 'JsonPMH1.0', value: 'JsonPMH1.0' },
                                                    ],
                                                }, title: '协议:',
                                                style: { 'margin-bottom': '7px'}
                                            },
                                            { button: 'submit', id: 'submitUpdateBtn', click: oaisubmitUpdateBtn }
                                        ],
                                        class: 'updatePop',
                                        title: '数据源修改:',
                                        style: {
                                            'display': 'none',
                                            'position': 'absolute',
                                            'left': '-216%',
                                            'width': '410px',
                                            'z-index': '999',
                                            'background': '#fff'
                                        }

                                    },

                                ],
                                style: { 'position': 'relative' }
                            },

                        ],

                    }]
                }),
                    $('.page').empty().render({
                        data: r,
                        template:
                            (r.pageCount) ? function (d) {
                                pageFun(d, function (page) {
                                    queryData.page = page;
                                    getList(queryData)
                                })
                            } : "暂无数据"
                    })
            }
        )
    }
    function pageFun (r, callback) {
        $(r.container).empty().render({
            data: r.data,
            template: (r.data.pageCount) ? {
                e: "pager",
                t: [
                    "共[[pageCount]]页",
                    {
                        e: "button",
                        t: function (d) {
                            $(d.container).text('上一页')
                            if (d.data.page === 1) {
                                $(d.container).addClass("disable");
                            }
                        },
                        click: function (d) {
                            var page = d.org_data.page;
                            if (page > 1) {
                                callback(page - 1);
                            }
                        }
                    },
                    {
                        e: 'select',
                        a: { name: 'select_page' },
                        t: function (d) {
                            var pageArr = [];
                            if (d.data.pageCount > 0) {
                                for (var i = 0; i < d.data.pageCount; i++) {
                                    pageArr.push({ page: "第" + (i + 1) + "页" });
                                }
                                $(d.container).render({
                                    data: pageArr,
                                    e: '',
                                    template: [{
                                        e: 'option',
                                        value: "[[page]]",
                                        t: function (r) {
                                            $(r.container).text(r.data.page);
                                            if (r.data.page == "第" + (d.data.page) + "页") {
                                                $(r.container).attr({ selected: "selected" });
                                            }
                                        }
                                    },]
                                });
                            }
                        },
                        event: {
                            change: function (d) {
                                var page = parseInt($(d.sender).val().substr(1, $(d.sender).val().length - 2));
                                callback(page)
                            }
                        }
                    },
                    {
                        e: "button",
                        t: function (d) {
                            $(d.container).text('下一页')
                            if (d.data.page === d.data.pageCount || !d.data.pageCount) {
                                $(d.container).addClass("disable")
                            }
                        },
                        click: function (d) {
                            var page = d.org_data.page;
                            if (page < d.org_data.pageCount) {
                                callback(page + 1);
                            }
                        }
                    }
                ],
                style: { "margin-bottom": "30px", "vertical-align": "middle", "color": "black" }
            } : ""
        })
    }

    function resetOadSubmit (e) {
        var data = {
            repository: e.org_data.repository,
            appId: element.getAttribute("app_id")
        }
        wf.http.get(
            wf.apiServer() + '/wfmetadata/repository_wfpub_reset', data,
            function (res) {  getList(queryData); },
            function (err) {
                if (err.err_message) {

                    dialog.fail(err.err_message);

                }
            })
    }
    function updateOadSubmit (e) {
        $(".updatePop").hide();
        $(e.sender).siblings("fieldset").toggle();
        $(e.sender).siblings("fieldset").find('#sel').val(e.org_data.protocal);
    }
    //修改
    function oaisubmitUpdateBtn (e) {
        if (!$.trim(e.new_data.update_baseUrl) || !$.trim(e.new_data.update_name)) {
            dialog.fail("数据源URL 或 数据源名称不能为空！")
            return;
        }
        var data = {
            repository: e.org_data.repository,
            appId: element.getAttribute("app_id"),
            baseUrl: e.new_data.update_baseUrl,
            name: e.new_data.update_name,
            protocal: e.new_data.update_protocal
        }
        dialog.sendDialog({
            title:'<span style="color:red">请谨慎操作</span>',
            content:'<p>确认修改此条数据源吗？</p>',
            button:['取消','确定']
        },function(){

        },function(){
            wf.http.get(
                wf.apiServer() + '/wfmetadata/repository_wfpub_update', data,
                function (res) { 
                    // console.log('test'+JSON.stringify(res))
                    dialog.success(res.state)
                    getList(queryData); },
                function (err) {
                    if (err.err_message) {
                        dialog.fail(err.err_message);
                    }
                })
        })
    }
}















//  jsbuilder/wf/recommend/wf.recommend.js

$.fn.extend({
    recommend: function() {
        $('wf-recommend', this).each(function(i, element) {
            wf.recommend(element)
        })
    }
})

wf.recommend = function(element) {
    $(element).empty()
    init()
    function init() {
        $(element).empty().render({
            data: {},
            template:[
                {
                    e:"wf-recommend-apps",
                    t:function(e){
                        // 应用推荐
                        getAPPRecommend(e.container)
                        
                    }
                },
                {
                    e:'wf-recommend-message',
                    t:function(e){
                        // 帖子推荐
                        getMessageRecommend(e.container)
                    }
                }
            ]
        })
    }
    function  getAPPRecommend(ele){
        wf.http.get(
            wf.apiServer() + "/sns/app_recommend",
            {},
            function(data) {
                $(ele).render({
                    data: data,
                    template:[
                        {
                            e:"wf-p",
                            a:{
                                class:"recommend_apps_header"
                            },
                            t:"每周应用推荐"
                        },
                        {
                            e:"wf-p",
                            a:{
                                class:"recommend_apps_content"
                            },
                            t:[
                                {
                                    e:"wf-recommend-app",
                                    datapath:'apps',
                                    t:[
                                        {
                                            e: "a",
                                            a: { href: wf.wfPubServer() +"/[[indexUrl]]" },
                                            t: {
                                                if: function(p) { return p.data.logoUrl ? true : false },
                                                then: {
                                                    e: "image",
                                                    style: {
                                                        'background-image': 'url([[logoUrl]])'
                                                    }
                                                },
                                                else: {
                                                    e: "no-img",
                                                    t: "[[appName]]"
                                                }
                                            }
                                        },
                                        {
                                            e:"wf-p",
                                            
                                            t:[
                                                {
                                                    e: 'a',
                                                    t: {
                                                        e: "wf-span", 
                                                        class:"des",
                                                        t: "[[appName]]" 
                                                    },
                                                    a: { 
                                                        href: wf.wfPubServer() +"/apps/[[indexUrl]]",
                                                        title: "查看简介" 
                                                    }
                                                },
                                                

                                            ]
                                        },
                                        {
                                            e: "wf-user",
                                            a: { 'data-nickname': "[[developer]]" },
                                            t: { 
                                                e: "a",
                                                
                                                a: {
                                                    class:"name",
                                                    href: wf.wfPubServer() + "/u/[[developer]]" 
                                                }, 
                                                t: "@[[developer]]" 
                                                
                                            }
                                        }
                                    ]

                                },
                                
                                
                            ]
                        }  
                    ]
                })
            },
            function(err){
                console.log(err)

            }
        )
    }
    function getMessageRecommend (ele){
        wf.http.get(
            wf.apiServer() + "/sns/message_recommend",
            {},
            function(data) {
                $(ele).render({
                    data: {},
                    template: {
                                e:"wf-p",
                                a:{
                                    class:"recommend_message_header"
                                },
                                t:"每周帖子推荐"
                        }
                })
                $(ele).render({
                    data: data.messages,
                    template:[
                        {
                            e:"message-detail",
                            datapath:"messages",
                            t:[
                                {
                                    e: 'wf-user',
                                    a: {
                                        class: 'avatar',
                                        'data-nickname': '[[user/nickname]]',
                                    },
                                    t: [
                                        {
                                            e: 'img',
                                            a: {
                                                src: '[[user/avatarUrl]]',
                                                class: 'avatar-img'
                                            }
                                        }
                                    ],
                                    click: function (e) {
                                        window.open(wf.wfPubServer() + '/u/' + e.org_data.user.nickname)
                                    }
                                },
                                {
                                    'message-body': [
                                        {
                                            e: 'wf-user',
                                            a: {
                                                class: 'author nickname',
                                                'data-nickname': '[[user/nickname]]'
                                            },
                                            t: '[[user/nickname]]',
                                            click: function (e) {
                                                window.open(wf.wfPubServer() + '/u/' + e.org_data.user.nickname)
                                            }
                                        },
                                        {
                                            e: 'create-time',
                                            t: function (e) {
                                                return wf.replace.dateDiff(e.data.createTime)
                                            },
                                            click: function (e) {
                                                var url = wf.wfPubServer() + '/m/' + e.org_data.messageId
                                                window.open(url)
                                            }
                                        },
                                        // 渲染精选标识
                                        {
                                            e: 'excellent-badge',
                                            t: renderExcellentImgStrategy
                                        },
                                        {
                                            e:'wf-p',
                                            class:'content',
                                            t:[
                                                {
                                                    if:function(e){
                                                        if(e.data.content.length>20){
                                                            return true
                                                        }else{
                                                            return false
                                                        }
                                                    },
                                                    then:[
                                                        {
                                                            e:"wf-span",
                                                            // style:{
                                                            //     'width':'240px',
                                                            //     'overflow': 'hidden',
                                                            //     'text-overflow':'ellipsis',
                                                            //     'white-space': 'nowrap',
                                                            // },
                                                            t:'[[content]]'
                                                          
                                                        },
                                                        {
                                                            e:"wf-button",
                                                            
                                                            t:'阅读全文',
                                                            click:function(e){
                                                                window.open( wf.wfPubServer() + '/m/' + e.org_data.messageId)
                                                            }

                                                        }
                                                    ],
                                                    else:{
                                                        e:"wf-span",
                                                        t:'[[content]]'
                                                    }
                                                },
                                                
                                                
                                                
                                            ]

                                        }
                                        ]
                                }
                            ]
                        }
                    ]
                })
            },
            function(err){
                console.log(err)
            }
        )
    }
}


//  jsbuilder/wf/search/wf.search.js

wf.search = function () {
    //搜索框-跳转开放搜索
    $('wf-search-bar').each(function (i, element) {
        wf.search.searchBar(element)
    })

    //搜索组件
    $('wf-search-input').each(function (i, element) {
        wf.search.searchBox(element)
    })
    $('wf-search-result').each(function (i, element) {
        wf.search.searchResult(element)
    })
}
wf.search.searchBar = function (element) {
    $('wf-search-bar').empty().render({
        template: {
            'wf-search-box': [
                {
                    e: 'select',
                    t: [
                        {
                            e: 'option',
                            value: 'all',
                            t: '全部'
                        },
                        {
                            e: 'option',
                            value: 'title',
                            t: '标题'
                        },
                        {
                            e: 'option',
                            value: 'description',
                            t: '摘要'
                        },
                        {
                            e: 'option',
                            value: 'author',
                            t: '作者'
                        },
                        {
                            e: 'option',
                            value: 'year',
                            t: '年份'
                        },
                        {
                            e: 'option',
                            value: 'keyword',
                            t: '关键词'
                        }
                    ]
                },
                {
                    e: 'input',
                    event: {
                        'keydown': function (p) {
                            if (p.event.code == 'Enter' || p.event.code == 'NumpadEnter') {
                                let keyword = $(p.sender)[0].value
                                if (keyword && keyword.trim()) {
                                    window.open(wf.wfPubServer() + '/s?q=' + encodeURIComponent(keyword.trim()) + '&op=' + $(p.sender).siblings()[0].value)
                                }
                            }
                        }
                    }
                },
                {
                    e: 'button',
                    t: '全站搜索',
                    click: function (p) {
                        let keyword = $(p.sender).siblings()[1].value
                        if (keyword && keyword.trim()) {
                            window.open(wf.wfPubServer() + '/s?q=' + encodeURIComponent(keyword.trim()) + '&op=' + $(p.sender).siblings()[0].value)
                        }
                    }
                },
                {
                    e: 'button',
                    t: '应用搜索',
                    click: function (p) {
                        let keyword = $(p.sender).siblings()[1].value
                        let appId = element.getAttribute('data-appId')
                        if (keyword && keyword.trim() && appId) {
                            window.open(wf.wfPubServer() + '/s?q=' + encodeURIComponent(keyword.trim()) + '&op=' + $(p.sender).siblings()[0].value + '&appId=' + appId)
                        }
                    }
                }
            ]
        }
    })
}

wf.search.searchBox = function (element) {
    let targetURL = element.getAttribute('data-url')
    let appId = element.getAttribute('data-appid')
    $('wf-search-input').empty().render({
        template: {
            'wf-search-box': [
                {
                    e: 'select',
                    t: [
                        {
                            e: 'option',
                            value: 'all',
                            t: '全部'
                        },
                        {
                            e: 'option',
                            value: 'title',
                            t: '标题'
                        },
                        {
                            e: 'option',
                            value: 'description',
                            t: '摘要'
                        },
                        {
                            e: 'option',
                            value: 'author',
                            t: '作者'
                        },
                        {
                            e: 'option',
                            value: 'year',
                            t: '年份'
                        },
                        {
                            e: 'option',
                            value: 'keyword',
                            t: '关键词'
                        }
                    ]
                },
                {
                    e: 'input',
                    value: element.getAttribute('data-keyword') || '',
                    event: {
                        'keydown': function (p) {
                            if (p.event.code == 'Enter' || p.event.code == 'NumpadEnter') {
                                let keyword = $(p.sender)[0].value
                                if (keyword && keyword.trim()) {
                                    if (targetURL) {
                                        window.open(targetURL + '?keyword=' + encodeURIComponent(keyword.trim()) + '&searchField=' + $(p.sender).siblings()[0].value)
                                    } else if (appId) {
                                        let tab = $('wf-search-tab').children('tab').find('.active')[0].dataset.type || 'all'
                                        $('wf-search-result').each(function (i, element) {
                                            wf.search.searchResult('', {
                                                appId: appId,
                                                q: keyword.trim(),
                                                searchField: $(p.sender).siblings()[0].value,
                                                searchType: tab,
                                                tabs: element.getAttribute('data-tabs'),
                                                clusteringFields: element.getAttribute('data-clusteringFields'),
                                            })
                                        })
                                    }
                                }
                            }
                        }
                    }
                },
                {
                    e: 'button',
                    t: '搜索',
                    click: function (p) {
                        let keyword = $(p.sender).siblings()[1].value
                        if (keyword && keyword.trim()) {
                            if (targetURL) {
                                window.open(targetURL + '?keyword=' + encodeURIComponent(keyword.trim()) + '&searchField=' + $(p.sender).siblings()[0].value)
                            } else if (appId) {
                                let tab = $('wf-search-tab').children('tab').find('.active')[0].dataset.type || 'all'
                                $('wf-search-result').each(function (i, element) {
                                    wf.search.searchResult('', {
                                        appId: appId,
                                        q: keyword.trim(),
                                        searchField: $(p.sender).siblings()[0].value,
                                        searchType: tab,
                                        tabs: element.getAttribute('data-tabs'),
                                        clusteringFields: element.getAttribute('data-clusteringFields'),
                                    })
                                })
                            }
                        }
                    }
                }
            ]
        }
    })
    let searchField = element.getAttribute('data-field') || 'all'
    if (searchField) {
        //检索字段回显
        let options = $('wf-search-input option')
        options.each(function () {
            if (searchField == $(this)[0].value) {
                $(this)[0].selected = true
            }
        })
    }
}

wf.search.searchResult = function (element, queryData) {
    if (element) {
        queryData = {
            appId: element.getAttribute('data-appid'),
            q: element.getAttribute('data-keyword'),
            searchField: element.getAttribute('data-field') || 'all',
            searchType: 'all',
            tabs: element.getAttribute('data-tabs'),
            clusteringFields: element.getAttribute('data-clusteringFields'),
            pageNum: 1
        }
    } else {
        queryData.pageNum = 1
        if (!queryData.searchType) {
            queryData.searchType = 'all'
        }
    }
    if (queryData.appId && !isNaN(queryData.appId) && queryData.q) {
        $('wf-search-result').empty()
        if (queryData.tabs) {
            let tabArr = getTab(queryData.tabs)
            if (tabArr && tabArr.length > 1) {
                //当导航栏只有"全部"时，则无需展示
                $('wf-search-result').render({
                    template: {
                        'wf-search-tab': {
                            e: 'tab',
                            t: tabArr
                        }
                    }
                })
                $('tab-nav', element).each(function () {
                    if (queryData.searchType == $(this)[0].dataset.type) {
                        $(this).addClass('active')
                    }
                })
                $('tab-nav', element).click(function () {
                    wf.search.searchResult('', {
                        appId: queryData.appId,
                        q: queryData.q,
                        searchField: queryData.searchField,
                        searchType: $(this)[0].dataset.type,
                        tabs: queryData.tabs,
                        clusteringFields: queryData.clusteringFields
                    })
                })
            }
        }
        $('wf-search-result').render({
            template: [
                {
                    'wf-search-aside': {
                        nav: [
                            {
                                if: function () {
                                    return queryData.clusteringFields && queryData.clusteringFields.indexOf('year') != -1
                                },
                                then: {
                                    e: 'dl',
                                    id: 'left-navigation-year'
                                }
                            },
                            {
                                if: function () {
                                    return queryData.clusteringFields && queryData.clusteringFields.indexOf('clc') != -1
                                },
                                then: {
                                    e: 'dl',
                                    id: 'left-navigation-clc'
                                }
                            },
                            {
                                if: function () {
                                    return queryData.clusteringFields && queryData.clusteringFields.indexOf('keyword') != -1
                                },
                                then: {
                                    e: 'dl',
                                    id: 'left-navigation-keyword'
                                }
                            }
                        ]
                    }
                },
                {
                    e: 'wf-search-main',
                }
            ]
        })

        wf.search.searchMain(queryData)

        if (queryData.clusteringFields && queryData.clusteringFields.indexOf('year') != -1) {
            searchClustering(queryData, {name: '年份', key: 'year'})
        }
        if (queryData.clusteringFields && queryData.clusteringFields.indexOf('clc') != -1) {
            searchClustering(queryData, {name: '分类号', key: 'clc'})
        }
        if (queryData.clusteringFields && queryData.clusteringFields.indexOf('keyword') != -1) {
            searchClustering(queryData, {name: '关键词', key: 'keyword'})
        }
    }
}

wf.search.searchMain = function (queryData) {
    wf.http.post(wf.apiServer() + '/search/s/data', queryData, (data) => {
        window.scrollBy(0, -10000)
        if (data && data.hits && data.hits.length > 0) {
            for (let hit of data.hits) {
                let highlight = hit.highlight && hit.highlight['JMETA.creator.name'] ? hit.highlight['JMETA.creator.name'][0] : ''
                let jmeta = hit.JMETA
                let authorArr = []
                for (let item in jmeta) {
                    if (item == 'creator') {
                        for (let creator of jmeta[item]) {
                            if (creator.name == highlight.replace(new RegExp('<strong>', 'g'), '').replace(new RegExp('</strong>', 'g'), '')) {
                                creator.name = highlight
                            }
                            authorArr.push(creator)
                        }
                    }
                }
                hit.authorArr = authorArr
            }

            let pagingArr = []
            $('wf-search-main').empty().render({
                data: data,
                template: [
                    {
                        'counter': [
                            {
                                span: '共'
                            },
                            {
                                strong: '[[total]]'
                            },
                            {
                                span: '条结果'
                            }
                        ]
                    },
                    {
                        'result': [
                            {
                                if: (p) => {
                                    return p.data.otherq
                                },
                                then: {
                                    e: 'search-filter-list',
                                    t: [
                                        {
                                            div: '限定条件：'
                                        },
                                        {
                                            e: 'search-filter-item',
                                            data: data.otherqName,
                                            t: [
                                                {
                                                    e: 'span',
                                                    t: [
                                                        '[[analysis]]',
                                                        {
                                                            e: 'search-filter-del',
                                                            a: {
                                                                original: '[[original]]'
                                                            },
                                                            click: function (p) {
                                                                let otherqArr = []
                                                                for (let item of queryData.otherq) {
                                                                    let otherqDel = encodeURIComponent(p.org_data.original)
                                                                    if (item != otherqDel) {
                                                                        otherqArr.push(item)
                                                                    }
                                                                }
                                                                if (otherqArr.length > 0) {
                                                                    queryData.otherq = otherqArr
                                                                } else {
                                                                    delete queryData.otherq
                                                                }
                                                                wf.search.searchResult('', queryData)
                                                            }
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            },
                            {
                                e: 'article',
                                datapath: 'hits',
                                t: {
                                    switch: '[[dataType]]',
                                    case: {
                                        'JMETA_DC': [
                                            //标题
                                            {
                                                if: function (p) {
                                                    return (p.data.highlight && p.data.highlight['JMETA.title.text']) || p.data.JMETA.title.length > 0
                                                },
                                                then: {
                                                    h1: {
                                                        e: 'a',
                                                        a: {
                                                            href: function (p) {
                                                                let url = 'javascript:void(0);'
                                                                let sourceArr = p.data.JMETA.identifier
                                                                if (sourceArr && sourceArr[0]) {
                                                                    let identifier = encodeURIComponent(sourceArr[0].text)
                                                                    if (p.data.isOA && p.data.isOA == 'oa') {
                                                                        url = wf.wfPubServer() + '/oad/articleIdentifier/' + identifier
                                                                    } else if (p.data.docType == 'wf_article') {
                                                                        url = wf.wfPubServer() + '/perios/article:' + identifier
                                                                    } else {
                                                                        url = sourceArr[0].url
                                                                    }
                                                                }
                                                                return url
                                                            },
                                                            target: '_blank'
                                                        },
                                                        t: function (p) {
                                                            let highlightTitle = (p.data.highlight && p.data.highlight['JMETA.title.text']) ? p.data.highlight['JMETA.title.text'] : ''
                                                            let titleFirst = ''
                                                            let titleSecond = ''
                                                            for (let title of p.data.JMETA.title) {
                                                                if (p.data.docType == 'wf_article') {
                                                                    if (title.type == 'articleTitle') {
                                                                        titleFirst = title.text
                                                                    } else if (title.type == 'enTitle') {
                                                                        titleSecond = title.text
                                                                    }
                                                                } else {
                                                                    if (title.lang == 'zh') {
                                                                        titleFirst = title.text
                                                                    } else if (title.lang == 'en') {
                                                                        titleSecond = title.text
                                                                    }
                                                                }
                                                            }
                                                            if (highlightTitle) {
                                                                for (let light of highlightTitle) {
                                                                    let highlight = light.replace(new RegExp('<strong>', 'g'), '').replace(new RegExp('</strong>', 'g'), '')
                                                                    if (titleFirst == highlight) {
                                                                        titleFirst = light
                                                                    }
                                                                    if (titleSecond == highlight) {
                                                                        titleSecond = titleFirst
                                                                        titleFirst = light
                                                                    }
                                                                }
                                                            }
                                                            if (titleFirst) {
                                                                return titleFirst + ' ' + titleSecond
                                                            } else {
                                                                return titleSecond
                                                            }
                                                        },
                                                        click: function (e) {
                                                            let url = e.sender.attributes.href.value
                                                            if (url && url != 'javascript:void(0);') {
                                                                window.open(url)
                                                                $(e.sender).css('color', '#771caa')
                                                            }
                                                        }
                                                    }
                                                }
                                            },
                                            //其他信息
                                            {
                                                'doc-info': {
                                                    'doc-details': [
                                                        //作者
                                                        {
                                                            if: (p) => {
                                                                return p.data.JMETA.creator.length > 0
                                                            },
                                                            then: {
                                                                e: 'author',
                                                                datapath: 'authorArr',
                                                                t: '[[name]]'
                                                            }
                                                        },
                                                        //来源
                                                        {
                                                            if: (p) => {
                                                                return p.data.JMETA.contributor.length > 0
                                                            },
                                                            then: {
                                                                e: 'source',
                                                                t: {
                                                                    e: 'a',
                                                                    a: {
                                                                        href: function (p) {
                                                                            let href = 'javascript:void(0);'
                                                                            for (let item of p.data.JMETA.contributor) {
                                                                                if (item.id && item.type == 'perioInfo') {
                                                                                    href = wf.wfPubServer() + '/perios/qcode:' + encodeURIComponent(item.id)
                                                                                }
                                                                            }
                                                                            return href
                                                                        },
                                                                        target: '_blank'
                                                                    },
                                                                    t: function (p) {
                                                                        let sourceName
                                                                        for (let item of p.data.JMETA.contributor) {
                                                                            if (item.type == 'perioInfo') {
                                                                                sourceName = '《' + item.name + '》'
                                                                            }
                                                                        }
                                                                        return sourceName
                                                                    }
                                                                }
                                                            }
                                                        },
                                                        //摘要
                                                        {
                                                            if: (p) => {
                                                                return p.data.highlight && p.data.highlight['JMETA.description.text']
                                                            },
                                                            then: {
                                                                e: 'p',
                                                                a: {
                                                                    class: 'summary'
                                                                },
                                                                t: function (p) {
                                                                    let description = p.data.highlight['JMETA.description.text'][0].trim()
                                                                    let replaceDescription = description.replace(new RegExp('<strong>', 'g'), 'wf_highlight_tag_strong_begin').replace(new RegExp('</strong>', 'g'), 'wf_highlight_tag_strong_end')
                                                                    $(p.container).html(replaceDescription)
                                                                    $(p.container).html(function () {
                                                                        return $(this).text().replace(new RegExp('wf_highlight_tag_strong_begin', 'g'), '<strong>').replace(new RegExp('wf_highlight_tag_strong_end', 'g'), '</strong>')
                                                                    })
                                                                }
                                                            },
                                                            else: {
                                                                if: (p) => {
                                                                    return p.data.JMETA.description.length > 0
                                                                },
                                                                then: {
                                                                    e: 'p',
                                                                    a: {
                                                                        class: 'summary'
                                                                    },
                                                                    t: function (p) {
                                                                        return p.data.JMETA.description[0].text.trim()
                                                                    }
                                                                }
                                                            }
                                                        },
                                                        //时间
                                                        {
                                                            if: (p) => {
                                                                return p.data.JMETA.date.length > 0
                                                            },
                                                            then: {
                                                                'time': function (p) {
                                                                    let templateTime
                                                                    for (let item of p.data.JMETA.date) {
                                                                        if (item.type == 'pubdate') {
                                                                            templateTime = item.text.length > 4 ? item.text.substring(0, 10) : item.text
                                                                            break
                                                                        }
                                                                    }
                                                                    return templateTime
                                                                }
                                                            }
                                                        }
                                                    ]
                                                }
                                            }
                                        ],
                                        'JMETA_JOURNAL': [
                                            //标题
                                            {
                                                if: function (p) {
                                                    return (p.data.highlight && p.data.highlight['JMETA.title.text']) || p.data.JMETA.title.length > 0
                                                },
                                                then: {
                                                    h1: {
                                                        e: 'a',
                                                        a: {
                                                            href: function (p) {
                                                                let url = 'javascript:void(0);'
                                                                let sourceArr = p.data.JMETA.identifier
                                                                if (sourceArr && sourceArr[0]) {
                                                                    let identifier = encodeURIComponent(sourceArr[0].text)
                                                                    if (p.data.isOA && p.data.isOA == 'oa') {
                                                                        url = wf.wfPubServer() + '/oad/articleIdentifier/' + identifier
                                                                    } else if (p.data.docType == 'wf_journal') {
                                                                        url = wf.wfPubServer() + '/perios/qcode:' + identifier
                                                                    } else {
                                                                        url = sourceArr[0].url
                                                                    }
                                                                }
                                                                return url
                                                            },
                                                            target: '_blank'
                                                        },
                                                        t: function (p) {
                                                            let highlightTitle = (p.data.highlight && p.data.highlight['JMETA.title.text']) ? p.data.highlight['JMETA.title.text'][0] : ''
                                                            let titleFirst = ''
                                                            let titleSecond = ''
                                                            for (let title of p.data.JMETA.title) {
                                                                if (p.data.docType == 'wf_journal') {
                                                                    if (title.type == 'perioTitle') {
                                                                        titleFirst = title.text
                                                                    } else if (title.type == 'transTitle') {
                                                                        titleSecond = title.text
                                                                    }
                                                                } else {
                                                                    if (title.lang == 'zh') {
                                                                        titleFirst = title.text
                                                                    } else if (title.lang == 'en') {
                                                                        titleSecond = title.text
                                                                    }
                                                                }
                                                            }
                                                            if (highlightTitle) {
                                                                let highlight = highlightTitle.replace(new RegExp('<strong>', 'g'), '').replace(new RegExp('</strong>', 'g'), '')
                                                                if (titleFirst == highlight) {
                                                                    titleFirst = highlightTitle
                                                                }
                                                                if (titleSecond == highlight) {
                                                                    titleSecond = titleFirst
                                                                    titleFirst = highlightTitle
                                                                }
                                                            }
                                                            if (titleFirst) {
                                                                return titleFirst + ' ' + titleSecond
                                                            } else {
                                                                return titleSecond
                                                            }
                                                        },
                                                        click: function (e) {
                                                            let url = e.sender.attributes.href.value
                                                            if (url && url != 'javascript:void(0);') {
                                                                window.open(url)
                                                                $(e.sender).css('color', '#771caa')
                                                            }
                                                        }
                                                    }
                                                }
                                            },
                                            //其他信息
                                            {
                                                'doc-info': {
                                                    if: (p) => {
                                                        return p.data.JMETA.identifier[0] && p.data.JMETA.identifier[0].imgUrl
                                                    },
                                                    then: [
                                                        {
                                                            'figure': {
                                                                e: 'img',
                                                                a: {
                                                                    src: function (p) {
                                                                        return p.data.JMETA.identifier[0].imgUrl
                                                                    },
                                                                    title: function (p) {
                                                                        return p.data.JMETA.title[0].text
                                                                    },
                                                                    onError: 'this.src="' + wf.comServer() + '/img/search/perioDefaultImg.jpg"'
                                                                },
                                                                click: function (p) {
                                                                    let titleElement = $(p.sender).parents().siblings('h1').find('a')
                                                                    let docUrl = $(titleElement)[0].attributes.href.value
                                                                    if (docUrl && docUrl != 'javascript:void(0);') {
                                                                        window.open(docUrl)
                                                                        $(titleElement).css('color', '#771caa')
                                                                    }

                                                                }
                                                            }
                                                        },
                                                        {
                                                            'doc-other': [
                                                                //出版单位
                                                                {
                                                                    if: (p) => {
                                                                        return p.data.JMETA.publisher.length > 0
                                                                    },
                                                                    then: {
                                                                        e: 'doc-author',
                                                                        datapath: 'JMETA',
                                                                        t: {
                                                                            e: 'author',
                                                                            datapath: 'publisher',
                                                                            t: '[[hostunitName]]'
                                                                        }
                                                                    }
                                                                },
                                                                //摘要
                                                                {
                                                                    if: (p) => {
                                                                        return p.data.highlight && p.data.highlight['JMETA.description.text']
                                                                    },
                                                                    then: {
                                                                        e: 'p',
                                                                        a: {
                                                                            class: 'summary'
                                                                        },
                                                                        t: function (p) {
                                                                            let description = p.data.highlight['JMETA.description.text'][0].trim()
                                                                            let replaceDescription = description.replace(new RegExp('<strong>', 'g'), 'wf_highlight_tag_strong_begin').replace(new RegExp('</strong>', 'g'), 'wf_highlight_tag_strong_end')
                                                                            $(p.container).html(replaceDescription)
                                                                            $(p.container).html(function () {
                                                                                return $(this).text().replace(new RegExp('wf_highlight_tag_strong_begin', 'g'), '<strong>').replace(new RegExp('wf_highlight_tag_strong_end', 'g'), '</strong>')
                                                                            })
                                                                        }
                                                                    },
                                                                    else: {
                                                                        if: (p) => {
                                                                            return p.data.JMETA.description.length > 0
                                                                        },
                                                                        then: {
                                                                            e: 'p',
                                                                            a: {
                                                                                class: 'summary'
                                                                            },
                                                                            t: function (p) {
                                                                                return p.data.JMETA.description[0].text.trim()
                                                                            }
                                                                        }
                                                                    }
                                                                },
                                                                //时间
                                                                {
                                                                    if: (p) => {
                                                                        return p.data.JMETA.date.length > 0
                                                                    },
                                                                    then: {
                                                                        'time': function (p) {
                                                                            let templateTime
                                                                            for (let item of p.data.JMETA.date) {
                                                                                if (item.type == 'pubdate') {
                                                                                    templateTime = item.text.length > 4 ? item.text.substring(0, 10) : item.text
                                                                                    break
                                                                                }
                                                                            }
                                                                            return templateTime
                                                                        }
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    ],
                                                    else: {
                                                        'doc-info': {
                                                            'doc-details': [
                                                                //出版单位
                                                                {
                                                                    if: (p) => {
                                                                        return p.data.JMETA.publisher.length > 0
                                                                    },
                                                                    then: {
                                                                        e: 'doc-author',
                                                                        datapath: 'JMETA',
                                                                        t: {
                                                                            e: 'author',
                                                                            datapath: 'publisher',
                                                                            t: '[[hostunitName]]'
                                                                        }
                                                                    }
                                                                },
                                                                //摘要
                                                                {
                                                                    if: (p) => {
                                                                        return p.data.highlight && p.data.highlight['JMETA.description.text']
                                                                    },
                                                                    then: {
                                                                        e: 'p',
                                                                        a: {
                                                                            class: 'summary'
                                                                        },
                                                                        t: function (p) {
                                                                            let description = p.data.highlight['JMETA.description.text'][0].trim()
                                                                            let replaceDescription = description.replace(new RegExp('<strong>', 'g'), 'wf_highlight_tag_strong_begin').replace(new RegExp('</strong>', 'g'), 'wf_highlight_tag_strong_end')
                                                                            $(p.container).html(replaceDescription)
                                                                            $(p.container).html(function () {
                                                                                return $(this).text().replace(new RegExp('wf_highlight_tag_strong_begin', 'g'), '<strong>').replace(new RegExp('wf_highlight_tag_strong_end', 'g'), '</strong>')
                                                                            })
                                                                        }
                                                                    },
                                                                    else: {
                                                                        if: (p) => {
                                                                            return p.data.JMETA.description.length > 0
                                                                        },
                                                                        then: {
                                                                            e: 'p',
                                                                            a: {
                                                                                class: 'summary'
                                                                            },
                                                                            t: function (p) {
                                                                                return p.data.JMETA.description[0].text.trim()
                                                                            }
                                                                        }
                                                                    }
                                                                },
                                                                //时间
                                                                {
                                                                    if: (p) => {
                                                                        return p.data.JMETA.date.length > 0
                                                                    },
                                                                    then: {
                                                                        'time': function (p) {
                                                                            let templateTime
                                                                            for (let item of p.data.JMETA.date) {
                                                                                if (item.type == 'pubdate') {
                                                                                    templateTime = item.text.length > 4 ? item.text.substring(0, 10) : item.text
                                                                                    break
                                                                                }
                                                                            }
                                                                            return templateTime
                                                                        }
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    }
                                                }
                                            }
                                        ],
                                        'JMETA_BOOK': [],
                                        'JMETA_APP': []
                                    }
                                }
                            }
                        ]
                    },
                    {
                        'pager': {
                            if: function (p) {
                                return p.data.maxPage > 1
                            },
                            then: {
                                e: 'span',
                                t: [
                                    {
                                        if: (p) => {
                                            return p.data.pageNum != 1
                                        },
                                        then: {
                                            e: 'a',
                                            a: {
                                                class: 'turnPage',
                                                page: 1,
                                            },
                                            t: '首页'
                                        }
                                    },
                                    {
                                        if: (p) => {
                                            return p.data.pageNum > 1
                                        },
                                        then: {
                                            e: 'a',
                                            a: {
                                                class: 'turnPage',
                                                page: (Number(data.pageNum) - 1),
                                            },
                                            t: '上一页'
                                        }
                                    },
                                    {
                                        if: (p) => {
                                            let isShow = false
                                            let nowPage = Number(p.data.pageNum)
                                            let maxPage = Number(p.data.maxPage)
                                            if (nowPage <= maxPage) {
                                                isShow = true
                                                let begin = nowPage - 5 >= 0 ? nowPage - 3 : 1
                                                let end = Number(begin) + 6 <= maxPage ? Number(begin) + 6 : maxPage
                                                if (maxPage > 6 && maxPage - nowPage < 3) {
                                                    end = maxPage
                                                    begin = end - 6
                                                }
                                                while (begin <= end) {
                                                    let pageObj = {
                                                        e: 'a',
                                                        a: {
                                                            class: 'turnPage',
                                                            page: begin,
                                                        },
                                                        t: begin + ''
                                                    }
                                                    if (begin == nowPage) {
                                                        pageObj.a.style = 'color:darkorange'
                                                    }
                                                    pagingArr.push(pageObj)
                                                    begin++
                                                }
                                            }
                                            return isShow
                                        },
                                        then: pagingArr
                                    },
                                    {
                                        if: (p) => {
                                            return p.data.pageNum < p.data.maxPage
                                        },
                                        then: [{
                                            e: 'a',
                                            a: {
                                                class: 'turnPage',
                                                page: (Number(data.pageNum) + 1),
                                            },
                                            t: '下一页',
                                        }]
                                    }
                                ]
                            }
                        }
                    }
                ]
            })
            $('.turnPage').click(function () {
                queryData.pageNum = $(this).attr('page')
                wf.search.searchMain(queryData)
            })
        } else {
            $('wf-search-main').empty().render({
                e: 'h1',
                t: '抱歉，没有找到与 “ ' + queryData.q + '” 相关的结果'
            })
        }
    }, (err) => {
        console.log(err)
    })

}

function searchClustering(queryData, clusteringParam) {
    wf.http.post(wf.apiServer() + '/search/s/clustering', {
        q: queryData.q,
        appId: queryData.appId,
        searchType: queryData.searchType,
        searchField: queryData.searchField,
        otherq: queryData.otherq,
        clusteringField: clusteringParam.key,
    }, (data) => {
        let leftId = 'left-navigation-' + clusteringParam.key
        if (data && data.buckets && data.buckets.length > 0) {
            $('#' + leftId).empty().render({
                template: [
                    {
                        dt: clusteringParam.name
                    },
                    {
                        foreach: data.buckets,
                        t: {
                            dd: [
                                {
                                    e: 'left-key',
                                    a: {
                                        title: function (p) {
                                            if (clusteringParam.key == 'year') {
                                                return p.data.key_as_string
                                            } else {
                                                return p.data.key
                                            }
                                        }
                                    },
                                    t: function (p) {
                                        if (clusteringParam.key == 'year') {
                                            return p.data.key_as_string
                                        } else {
                                            return p.data.key
                                        }
                                    },
                                    click: function (p) {
                                        let otherq = []
                                        if (clusteringParam.key == 'year') {
                                            otherq.push(encodeURIComponent(clusteringParam.key + ':' + p.org_data.key_as_string))
                                        } else if (clusteringParam.key == 'clc') {
                                            otherq.push(encodeURIComponent(clusteringParam.key + ':' + p.org_data.clc))
                                        } else {
                                            otherq.push(encodeURIComponent(clusteringParam.key + ':' + p.org_data.key))
                                        }
                                        if (queryData.otherq) {
                                            otherq.push.apply(otherq, queryData.otherq)
                                        }
                                        wf.search.searchResult('', {
                                            q: queryData.q,
                                            appId: queryData.appId,
                                            searchType: queryData.searchType,
                                            searchField: queryData.searchField,
                                            otherq: otherq,
                                            tabs: queryData.tabs,
                                            clusteringFields: queryData.clusteringFields
                                        })
                                    }
                                },
                                {
                                    e: 'left-count',
                                    t: '([[doc_count]])'
                                }
                            ]
                        }
                    }
                ]
            })
        } else {
            $('#' + leftId).empty()
        }
    }, (err) => {
        console.log(err)
    })
}

function getTab(tabs) {
    let tabArr = [{
        e: 'tab-nav',
        a: {
            'data-type': 'all'
        },
        t: '全部'
    }]
    if (tabs.indexOf('journal') != -1) {
        tabArr.push({
            e: 'tab-nav',
            a: {
                'data-type': 'journal'
            },
            t: '期刊'
        })
    }
    if (tabs.indexOf('article') != -1) {
        tabArr.push({
            e: 'tab-nav',
            a: {
                'data-type': 'article'
            },
            t: '文献'
        })
    }
    if (tabs.indexOf('book') != -1) {
        tabArr.push({
            e: 'tab-nav',
            a: {
                'data-type': 'book'
            },
            t: '图书'
        })
    }
    if (tabs.indexOf('app') != -1) {
        tabArr.push({
            e: 'tab-nav',
            a: {
                'data-type': 'app'
            },
            t: '应用'
        })
    }
    return tabArr
}



//  jsbuilder/wf/sns/wf.atHelper.js

/*

用法：

{textarea:'id',event:wf.atHelper()}

注意：
    at定位计算采用绝对位置定位方式进行计算，引用者的@文本框父级元素需要定位 ,style="position: relative; display: block;",
    wf-textarea标签定义name属性名：wf_message_content，用于获取文本内容
    wf-textarea标签增加css样式 white-space:pre，保留标签
*/

wf.atHelper = function() {
    let xxx //如果要添加共享变量，放在这里。
    let atPosit = 0//光标在文本字符串的位置
    let cursorPosition = 0//光标当前位置
    let typing = true
    let curAreaValue = ''
    let insertBeforeValue = ''
    let mouseBefore = ''
    let mouseAfter = ''
    let timer = null
    let element

    // 返回一组事件处理函数。

    return {
        'compositionstart':function (p) {
            typing = false
        },
        'compositionend':function (p) {
            typing = true
        },
        'click':function (p) {
            toShake(p)
        },
        'keydown':function (p) {
            if (p.event.code == 'Digit2' && p.event.shiftKey) {
                //创建关注人列表div
                createFollow(p);
                toShake(p)
            }
            // 37   Left（左箭头）
            // 38	Up（上箭头）
            // 39	Right（右箭头）
            // 40	Down（下箭头）
            // 上下箭头选择pulldown中数据，文本游标不变
            if ((p.event.keyCode == 38 || p.event.keyCode == 40) && ($('wf-pulldown.wf-atwho-view').length > 0)) {
                //阻止默认事件
                p.event.preventDefault();
                if ($('wf-pulldown.wf-atwho-view')[0].childNodes.length > 1){
                    // 获取当前pulldown行
                    let id = $('wf-li.wf-li-select').attr("id");
                    element = $("wf-li#"+id);
                    element.removeClass("wf-li-select");
                    if (p.event.keyCode == 38 && element.prev().length===0 ){
                        element = element.siblings(":last");
                        element.addClass("wf-li-select")

                    }else if (p.event.keyCode == 40 && element.next().length===0 ){
                        element = element.siblings(":first");
                        element.addClass("wf-li-select")

                    }else if (p.event.keyCode == 38){
                        element = element.prev();
                        element.addClass("wf-li-select")
                    }else if(p.event.keyCode == 40){
                        element = element.next();
                        element.addClass("wf-li-select")
                    }
                }
            }
            // 回车输入当前选择项，文本游标不变
            if (p.event.keyCode == 13 && ($('wf-pulldown.wf-atwho-view').length > 0)) {
                p.event.preventDefault();
                let name = $('wf-li.wf-li-select').text();
                insertAtCursor(p,name)
            }
            if ((p.event.keyCode == 37 || p.event.keyCode == 39)){
                toShake(p)
            }
            //Esc关注列表消失
            if (p.event.keyCode == 27) {
                $('wf-pulldown.wf-atwho-view').remove()
            }

        },
        'input': function(p) {
            // console.log(p)
            setTimeout(function() {
                if(typing) {
                    toShake(p)
                }
            },0)

        },
        'focus': function(p) {
            // console.log(p)
        },
        'focusout': function(p) {
            // console.log(p)
        }
    }
    //...其他事件。

    function toShake(p) {
        
       
        clearTimeout(timer)
        timer = setTimeout(function(){
            handleEle(p)
            
        },200)
        
    }

    function createFollow(p) {
        $('wf-pulldown.wf-atwho-view').remove()
        $(p.sender.parentNode).render({
            template:{
                e:'wf-pulldown',
                style:{
                    'visibility':'hidden'
                },
                class:'wf-atwho-view'
                // e:'wf-atwho',
                // a:{
                //     class:'wf-atwho-view'
                // },
                // style:{
                //     position:'absolute'
                // },
                // t:[
                //     {e:'wf-pulldown',class:'wf-atwho-ul'}
                // ]
            }
        })

    }

    // 创建镜像内容，复制样式
    function mirror(p) {
        let str1 = curAreaValue.substring(0,cursorPosition)
        let str2 = mouseAfter
        var escape = function(text) {
            return text.replace(/<|>|`|"|&/g, '?').replace(/\r\n|\r|\n/g, '<br>')
        }
        let heightPadding = ($(p.sender).innerHeight()- $(p.sender).height())/2
        let widthPadding = ($(p.sender).innerWidth()-$(p.sender).width())/2
        $('.wf-textarea-mirror').remove()
        $(p.sender.parentNode).render({
            template:{
                e:'wf-textarea-mirror',
                a:{
                    class:'wf-textarea-mirror'
                },
                style:{
                    position:'absolute',
                    margin: '10px',
                    top:'0',
                    left:'0',
                    'text-align':'left',
                    width:p.sender.offsetWidth+'px',
                    height:p.sender.offsetHeight+'px',
                    padding: heightPadding + widthPadding+'px',
                    'z-index':-1,
                    'overflow-y':'auto',
                    'font-size': 13+'px',
                    'font-family':'Serif',
                    'word-break': 'break-all'
                },
                t:[
                    escape(str1),
                    '<wf-cursor id="wf-cursor">|</wf-cursor>'
                ],


            }
        })
        let div = $(p.sender.parentNode).find('.wf-textarea-mirror')[0]
        div.scrollTop = div.scrollHeight
    }
    //渲染关注人列表
    function followingUserList(keyword,p) {
        mirror(p)
        setTimeout(function() {
            createFollow(p)
            let x = $('#wf-cursor').position()
            $('.wf-atwho-view').css({
                top:x.top,
                left:x.left+15
            })
            wf.http.get(wf.apiServer()+'/sns/at_list',{keyword:keyword},
                function (data) {
                    
                    if (data.users.length > 0){

                        $(p.sender).siblings('.wf-atwho-view').css('visibility','visible')
                        
                        $('.wf-atwho-view').empty().render({
                            data: data,
                            template: [
                                {
                                    foreach: data.users,
                                    t: {
                                        e: 'wf-li',
                                        a:{
                                            id:'[[rowNumber]]'
                                        },
                                        t: '[[nickname]]',
                                        event:{
                                            click:function (e) {
                                                //插入数据到文本框光标处
                                                insertAtCursor(p,e.org_data.nickname)
                                            },
                                            mouseover:function (e) {
                                                $(e.sender).siblings('.wf-li-select').removeClass("wf-li-select");
                                                element = $(e.sender);
                                                element.addClass("wf-li-select")

                                            }
                                        }

                                    }

                                }
                            ]
                        })
                        //默认选择第一行
                        if ($('wf-li.wf-li-select').length === 0){
                            $('wf-li#1').addClass('wf-li-select')
                        }
                    }else {
                        $('wf-pulldown.wf-atwho-view').remove()
                        $('.wf-textarea-mirror').remove()
                    }


                },
                function (err) {

                }
            )
        },100)
       
    }
    //输入框获取光标
    function getPosition (element) {
        //----可编辑文本框
        // var caretOffset = 0;
        // var doc = element.ownerDocument || element.document;
        // var win = doc.defaultView || doc.parentWindow;
        // var sel;
        // if (typeof win.getSelection != "undefined") {//谷歌、火狐
        //     sel = win.getSelection();
        //     if (sel.rangeCount > 0) {//选中的区域
        //         var range = win.getSelection().getRangeAt(0);
        //         var preCaretRange = range.cloneRange();//克隆一个选中区域
        //         preCaretRange.selectNodeContents(element);//设置选中区域的节点内容为当前节点
        //         preCaretRange.setEnd(range.endContainer, range.endOffset);  //重置选中区域的结束位置
        //         caretOffset = preCaretRange.toString().length;
        //     }
        // } else if ((sel = doc.selection) && sel.type != "Control") {//IE
        //     var textRange = sel.createRange();
        //     var preCaretTextRange = doc.body.createTextRange();
        //     preCaretTextRange.moveToElementText(element);
        //     preCaretTextRange.setEndPoint("EndToEnd", textRange);
        //     caretOffset = preCaretTextRange.text.length;
        // }
        // return caretOffset;
        //-----textarea文本框
        let cursorPos = 0
        if (document.selection) {//IE
            var selectRange = document.selection.createRange()
            selectRange.moveStart('character', -element.value.length)
            cursorPos = selectRange.text.length
        } else if (element.selectionStart || element.selectionStart == '0') {
            cursorPos = element.selectionStart
        }
        return cursorPos
    }
    //插入关注人到文本域
    function insertAtCursor(p,name) {
        //---可编辑文本框
        /*let txt = $(p.sender);
        // txt.focus();
        let nickname = e.org_data.user.nickname+" ";
        txt.text(insertBeforeValue+nickname+mouseAfter.replace(' ',''));
        atPosit+=nickname.length;
        setCaretPosition($(p.sender)[0],atPosit+1)*/
        //----textarea文本框
        let txt = $(p.sender)[0]
        txt.focus()
        let nickname = name+' '
        txt.value = insertBeforeValue+nickname+mouseAfter.replace(' ','')
        atPosit+=nickname.length
        setCaretPosition($(p.sender)[0],atPosit+1)
        $('wf-pulldown.wf-atwho-view').remove()
        $('.wf-textarea-mirror').remove()
    }
    // 设置光标位置
    function setCaretPosition(element, pos){
        //---可编辑文本框
        /*var range, selection;
        if (document.createRange)//Firefox, Chrome, Opera, Safari, IE 9+
        {
            range = document.createRange();//创建一个选中区域
            range.selectNodeContents(element);//选中节点的内容
            if (element.innerHTML.length > 0) {
                range.setStart(element.childNodes[0], pos); //设置光标起始为指定位置
            }
            range.collapse(true);       //设置选中区域为一个点
            selection = window.getSelection();//获取当前选中区域
            selection.removeAllRanges();//移出所有的选中范围
            selection.addRange(range);//添加新建的范围
        } else if (document.selection) {//IE 8 and lower
            range = document.body.createTextRange();
            range.moveToElementText(element);
            range.collapse(false);
            range.select();
        }*/
        //----textarea文本框
        if (element.setSelectionRange) {
            // IE Support
            element.focus()
            element.setSelectionRange(pos, pos)
        } else if (element.createTextRange) {
            // Firefox support
            var range = element.createTextRange()
            range.collapse(true)
            range.moveEnd('character', pos)
            range.moveStart('character', pos)
            range.select()
        }
    }
    //处理文本
    function handleEle(p) {
        // console.log('9999')
        //实时光标位置
        cursorPosition = getPosition($(p.sender)[0])
        //开始分割---------------------
        curAreaValue = p.new_data.wf_message_content
        //开始判断
        // console.log(curAreaValue.charAt(cursorPosition-1) )
        // if (curAreaValue.charAt(cursorPosition-1) === ' '){//光标前如果是空格则不查找关注人
        //     $('wf-atwho.wf-atwho-view').remove();
        //     return;
        // }
        //分割光标和前面@
        mouseBefore = curAreaValue.substring(0,cursorPosition)
        mouseAfter = curAreaValue.substring(cursorPosition)
        atPosit = mouseBefore.lastIndexOf('@')
        if (mouseBefore.length<=0 || mouseBefore.substring(atPosit).indexOf(' ')!= -1 || atPosit == -1){
            $('wf-pulldown.wf-atwho-view').remove()
            $('.wf-textarea-mirror').remove()
            return
        }
        if (mouseBefore.lastIndexOf('@') >= 0){//光标前字符串中存在@符号,截取之间字符当作关键字进行关注人查询
            insertBeforeValue = mouseBefore.substring(0,atPosit+1)
            //获取@之后的字符串当作关键字进行查询
            let keyWord = mouseBefore.substring(atPosit+1)
            //发送请求渲染页面

            followingUserList(keyWord,p)
        }


    }

}
$(document).mouseup(function(e){
    var targetObj = $(' .wf-atwho-view ')   // 设置目标区域
    if(!targetObj.is(e.target) && targetObj.has(e.target).length === 0){
        $('wf-pulldown.wf-atwho-view').remove()
        $('.wf-textarea-mirror').remove()
    }
})

//  jsbuilder/wf/sns/wf.sns.backToTop.js

// 返回顶部
$.fn.extend({
   backToTop: function() {
        $('wf-back-to-top', this).each(function(i, element) {
            wf.backToTop(element)
        })
    }
})
wf.backToTop = function(element) {
    $(element).empty()
    $(element).render({
        data:{},
        template: {
            e:"wf-button",
            a:{
                class:'back_to_top'
            },
            t:{
                e:"img",
                a:{
                   src:wf.comServer()+'/img/set-top.png'
                }

            },
            event:{
                click:function(e){
                    var speed =200;
                    
                    var overflow = $('wf-container').css('overflow-y')
                    overflow = (overflow === 'auto' || overflow === 'scroll') ? true : false
                    if(overflow){
                        // wf.pub
                        $('wf-container').animate({scrollTop: 0}, speed);
                    }else{
                        // sns
                        $('html').animate({scrollTop: 0}, speed);
                    }
                    
                    return false;
                },
                mouseover:function(e){
                    $(e.sender).find('img').attr('src',wf.comServer()+'/img/h-set-top.png')

                },
                mouseout:function(e){
                    $(e.sender).find('img').attr('src',wf.comServer()+'/img/set-top.png')
                },
            }
           
          
        }
    })

}

//  jsbuilder/wf/sns/wf.sns.js

wf.sns = function(container) {
    /*
    定义 wf-sns标签下的所有可用视图。
    格式：
        视图名：渲染函数。
    使用方式：
        添加html标签，格式为
        <wf-sns view='[视图名]'></wf-sns>
    */

   
    let views = {
        'public': wf.sns.public,
        'my': wf.sns.my,
        'my/messages': wf.sns.timeline,
        'my/comments': wf.sns.comment,
        'my/chat': wf.sns.chat,
        'chatroom': wf.sns.chat.room,
        'my/fans': wf.sns.fans,
        'my/follow': wf.sns.follow,
        'my/praise':wf.sns.praise,
        'topic': wf.sns.topic,
        'topics': wf.sns.topics,
        'relate': wf.sns.relate,
        'user': wf.sns.user,
        'user/fans': wf.sns.fans,
        'user/follow': wf.sns.follow,
        'user/messages': wf.sns.timeline,
        'user/comments': wf.sns.comment,
        'message': wf.sns.message,
        'my/rank': wf.sns.rank,
    }

    $('wf-sns', container).each(function(i, element) {
        let view = element.getAttribute('view') || element.getAttribute('data-view')
        if (views[view]) views[view](element, view)
        else console.log('render of view['.concat(view, '] not found!'))
    })

    // 社区每日登录
    if($('wf-container wf-sns', container).length>0){
        // 获取当前社区登录cookie
        var curCookie =  wf.cookie.get('sns_first_login_uid')
        // 获取当前时间
        var date = new Date()
        var year= date.getFullYear()
        var month = date.getMonth()+1
        var day = date.getDate()
        // var endtime = year +'/'+ month+'/'+day+', 10:20:59'
        var endtime = year +'/'+ month+'/'+day+', 23:59:59'
        // 过期时间格式
        var expires =  new Date(endtime)
        // 获取当前登录的uid
        var curUid = wf.cookie.get('uid')
        var sns_first_login_name = 'sns_first_login_uid'
        var sns_first_login_value = []
        var sns_first_login_value_str=''
        var path = '/'
        
        var domain = document.domain
        if(domain.indexOf('wf.pub')!==-1){
            domain = '.wf.pub'
        }else{
            domain = '.wanfangdata.com.cn'
        }
        var secure = true
       
     
        if(!curCookie){
            sns_first_login_value.push(curUid)
            sns_first_login_value_str = sns_first_login_value.join(',')
            // 设置cookie
            wf.cookie.set(sns_first_login_name,sns_first_login_value_str, expires, path, domain, secure)
            // 每日登录请求
            user_firstLogin()
            
        }else{
            sns_first_login_value = wf.cookie.get(sns_first_login_name).split(',')
            var falg = sns_first_login_value.indexOf(curUid)
            if(falg=== -1){
                sns_first_login_value.push(curUid)
                sns_first_login_value_str = sns_first_login_value.join(',')
                // 不存在 重新设置 sns_first_login_name 的值
                wf.cookie.set(sns_first_login_name,sns_first_login_value_str, expires, path, domain, secure)
                // 每日登录请求
                user_firstLogin()
            }


        }
    }
    // 发送每日登录的请求
    function user_firstLogin(){
        
        wf.http.post(wf.apiServer()+'/sns/user_first_login_day',
            {},
            function(res) {
                console.log(res)   
            },
            function(err){
                console.log(err)
            }
        )
    }
}

// wf.sns.views = {}


//  jsbuilder/wf/sns/wf.sns.lazyload.js

// 懒加载函数共6个参数
// loadFun 必传 要懒加载渲染的内容函数
// loadingType 必传 懒加载只发一次请求的标识
// nextRecord  必传 懒加载下一个记录的条数 如果小于等于0 说明没有内容，不用在发请求请求数据
// dynamicScroll 必传 动态的滚动条蜷曲的高度
// fromId 必传 从那条数据开始查找
// otherData 选传 其他数据

wf.sns.lazyload = function (loadFun,loadingType,nextRecord ,dynamicScroll,fromId,otherData) {
    var timer = null 
   
    //懒加载
    // var maxHeight= $('wf-contanier').css('max-height') === 'none' ? false : true
    var overflow = $('wf-container').css('overflow-y')
    overflow = (overflow === 'auto' || overflow === 'scroll') ? true : false
    var scollContainer = $(window)  //默认监听窗口滚动条
    // if(overflow && maxHeight) {
    if(overflow){
        
        // 说明 是wf.pub 新社区 
        scollContainer = $('wf-container')
        var scollContainerMaxHeight = 900 // 设置scollContainer元素的默认最大高度
        var wfLayoutHeight = 0 //wf-layout容器高度
        var wfUserheader = 0   //wf-userheader容器高度
        var calcScollContainerHeight = 0  //计算得出来scollContainer的最大容器高度
        if($('wf-layout').length>0){
            wfLayoutHeight = $('wf-layout').height()
     
        }
        if($('wf-userheader').length>0){
            wfUserheader= $('wf-userheader').height()
        }
        calcScollContainerHeight = wfLayoutHeight - wfUserheader
        if(calcScollContainerHeight && calcScollContainerHeight>0){
            scollContainerMaxHeight = calcScollContainerHeight
        }
        scollContainer.css('max-height',scollContainerMaxHeight) 
    }
   
    scollContainer.unbind('scroll')
    scollContainer.scroll(function () {
        
        var scrollTop = $(this).scrollTop()
        var scollContainerHeight = $(this).height()
        var scrollHeight = 0
        var judgScrollToBottom //对于判断是在wf.pub 还是在 wanfangdata.com.cn/sns/
        // var scrollHeightHalf = parseInt(parseInt(scrollHeight/100)*1) 
        // if(overflow && maxHeight){
        if(overflow){
            // 在 wf.pub
            scrollHeight =  $(this)[0].scrollHeight
            // console.log( parseInt(scrollHeight),parseInt(scrollTop),parseInt(scollContainerHeight))
            judgScrollToBottom = parseInt(scrollHeight) - parseInt(scrollTop) - parseInt(scollContainerHeight) <= 20

            // 每周推荐

            // 获取wf-recommend 的高度
            // 获取滚动条滚动的高度 scrollTop
            // 如果滚动条滚动的高度大于wf-recommend 的高度,给wf-recommend 设置固定定位，反正取消定位
            let wfRecommendEle = scollContainer.find('wf-recommend')
            let wfRecommendEleHeight = wfRecommendEle.outerHeight(true)
            if(scrollTop>wfRecommendEleHeight){
                // wf-commend 固定定位
                wfRecommendEle.addClass('sticky')

            }else{
                wfRecommendEle.removeClass('sticky')
            }
            

        }else{
            // 在 wanfangdata.com.cn/sns/老社区
            scrollHeight = $(document).height()
            judgScrollToBottom = parseInt(scrollHeight) - parseInt(scrollTop) - parseInt(scollContainerHeight) <= 180
        }
        if(scollContainer){
            if( scollContainer.scrollTop()>0){
                $('wf-back-to-top').show();

            }else{
                $('wf-back-to-top').hide();
            }
           
        }
        if(dynamicScroll <=  scrollTop ){
           
            //向下
            if(!loadingType){
                
               

                if (judgScrollToBottom  && nextRecord>0) {
                // if(scrollTop + scollContainerHeight >= scrollHeightHalf  && nextRecord>0){
                    loadingType = true
                    // let fromId = $('wf-button#more').attr('fromId')
                    setTimeout(function() {
                        timer = null
                        if(otherData){
                            loadFun(otherData,fromId)
                     
                        
                        }else{
                          
                            loadFun(fromId)
                        }
                    },500)
                    
                    
                }
            }
        }
        setTimeout(function() {
            dynamicScroll = scrollTop 
        }, 0)



        

    })
   
}

//  jsbuilder/wf/sns/wf.sns.message.js

wf.sns.message = function(element) {
    let messageId = element.getAttribute('messageId')

    wf.http.get(
        wf.apiServer() + '/sns/message', { messageId: messageId },
        function(data) {
            // 整合点赞数据                
            if(data.praiseMessages && data.message){
                var isPraiseFlag = -1
                if(data.message.messageId){
                    isPraiseFlag = data.praiseMessages.indexOf(data.message.messageId)
                    
                    if(isPraiseFlag !== -1){
                        data.message.praiseType = '已点赞'
                        // 重置默认状态
                        isPraiseFlag = -1
                    }
                }
                if(data.message.forwardMessage){
                        
                    isPraiseFlag = data.praiseMessages.indexOf(data.message.forwardMessage.messageId)
                    if(isPraiseFlag !== -1){
                        data.message.forwardMessage.praiseType = '已点赞'
                        // 重置默认状态
                        isPraiseFlag = -1
                    }
                }     
            }  
            if (data.message) {
                // 获取收藏数据，渲染内容
                var urlArr = []
                urlArr.push({ url: wf.wfPubServer() +'/m/'+data.message.messageId})
                if(data.message.forwardMessage){
                    if(data.message.forwardMessage.messageId){
                        urlArr.push({ url: wf.wfPubServer() +'/m/'+data.message.forwardMessage.messageId})
                    }

                }
                
                wf.http.post(wf.apiServer() + '/favourite/statistic_mul',urlArr,
                    function(result) {
                        // 把收藏数据 装到 帖子信息里面
                        $.each(result, function (j, item) {
                            var favUrl =  result[j].url
                            var favUrlMesId =  parseInt(favUrl.split('/m/')[1])
                            if(data.message.messageId === favUrlMesId ){
                                data.message.favourite = result[j]
                            }
                            if(data.message.forwardMessage){
                                if(data.message.forwardMessage.messageId){
                                    if(data.message.forwardMessage.messageId === favUrlMesId){
                                        data.message.forwardMessage.favourite = result[j]
                                    }
                                        
                                }

                            }
                        })
                        //添加loginUid节点 用于判断是否是当前用户 
                        if(data.user){
                            data.message.loginUid = data.user.uid
                            data.message.loginUserRole = data.user.role
                            if (data.message.forwardMessage) {
                                data.message.forwardMessage.loginUid = data.user.uid
                                
                            }
                        }
                        $.each(data.message.commentList, function(i, item) {
                            item.loginUid = data.user ? data.user.uid : null
                        })
                        //  渲染列表   
                        render_message(data.message)
                        
                    },function(err){
                        console.log(err)
                    }
                )
               
            } else {
                render_deleted(data)
            }
        },
        function(err) { 
            console.log(err) 
        }
    )

    function render_deleted(data) {
        $(element).render({
            data: data,
            template: '帖子已被删除,messageId=[[messageId]]'
        })
    }

    function render_message(message) {
       
        
        $(element).render({
            data: message,
            template: wf.sns.timeline.message({ 
                container:element,
                data:message,
                opendetail: false 
            })
        })
    }
}

//  jsbuilder/wf/sns/wf.sns.my.js

wf.sns.my = function(element) {
    let path = element.getAttribute('path')
    if (path) {
        let pa = path.split('/')
    }

    $(element).render({
        template: [
            wf.sns.messageSender,
            {
                tab: {
                    nav: {
                        '帖子': { hashpath: '#messages', click:  messages},
                        '评论': { hashpath: '#comments', click: comments },
                        '话题': { hashpath: '#topics', click: topics },
                        '聊天': { hashpath: '#chat', click: chat },
                        '粉丝': { hashpath: '#fans', click: fans },
                        '关注': { hashpath: '#following', click: following },
                        '排行':{ hashpath: '#rank', click: rank},
                        '赞':{ hashpath: '#praise', click: praise}
                    },
                    default: 1
                }
            },
            { e: 'sns-container' },
            {
                e:"wf-back-to-top",
                t:function(){
                    $(document).backToTop()
                }

            }
        ]
    })

    //messages()

    function messages() {
        $('sns-container', element).empty().render({
            template: { e: 'wf-sns', a: { view: 'my/messages' } }
        })
        wf.sns(element)
    }

    function comments() {
        $('sns-container', element).empty().render({
            template: { e: 'wf-sns', a: { view: 'my/comments' } }
        })
        wf.sns(element)
    }

    function topics() {
        $('sns-container', element).empty().render({
            template: { e: 'wf-sns', a: { view: 'topics' } }
        })
        wf.sns(element)
    }

    function chat() {
        $('sns-container', element).empty().render({
            template: { e: 'wf-sns', a: { view: 'my/chat' } }
        })
        wf.sns(element)
    }


    function fans() {
        $('sns-container', element).empty().render({
            template: { e: 'wf-sns', a: { view: 'my/fans' } }
        })
        wf.sns(element)
    }

    function following() {
        $('sns-container', element).empty().render({
            template: { e: 'wf-sns', a: { view: 'my/follow' } }
        })
        wf.sns(element)
    }
    function rank() {
        $('sns-container', element).empty().render({
            template: { e: 'wf-sns', a: { view: 'my/rank' } }
        })
        wf.sns(element)
    }
    function praise() {
        $('sns-container', element).empty().render({
            template: { e: 'wf-sns', a: { view: 'my/praise' } }
        })
        wf.sns(element)
    }
}

//  jsbuilder/wf/sns/wf.sns.public.js

wf.sns.public = function(element) {
    var loadingType = false // 懒加载只发一次请求的标识
    var nextRecord = 0 // 懒加载下一个记录的条数
    var dynamicScroll = 0 //动态的滚动条蜷曲的高度
    render()

    function render() {
        $(element).render({
            template: [
                {
                    e: "message-top-list",
                },
                {
                    e:'message-list',
                    class: 'message-list',
                },
                {
                    'wf-button': '<i class="fa fa-spin fa-spinner"></i>正在加载内容,请稍后...',
                    id: 'more',
                },
                {
                    e:"wf-back-to-top",
                    t:function(){
                        $(document).backToTop()
                    }

                }

                ]
            })
        loaddata()
    }

    function loaddata(fromId) {
        let button_more = $('wf-button#more')
        wf.http.get(wf.apiServer() + '/sns/message_public', {
            fromId: fromId
        },
        function(data) {
            if(data.topMessages){  
                // 获取收藏数据，渲染内容 
                 wf.sns.timeline.getFavouriteData(data,renderMessageTopList,$("message-top-list", element),'yes')
            }
            // 获取收藏数据，渲染内容 
            wf.sns.timeline.getFavouriteData(data,renderMessageList,$("message-list", element))
            button_more.attr('fromId', data.minId)
            button_more.attr('disable', false)
            loadingType = false
            nextRecord =data.nextRecord
            // 懒加载
            wf.sns.lazyload(loaddata,loadingType,nextRecord,dynamicScroll,data.minId)
        },
        function(error) {
            console.log(error)
            button_more.attr('disable', false)
        })
    }
    // 渲染列表
    function renderMessageList(messageListEle,data) {
        if(data.messages){
            messageListEle.render({
                data: data.messages,
                template: { e: 'message', t: wf.sns.timeline.message }
            })
        }
       

        // 加载更多逻辑处理
                
        wf.sns.timeline.loadmore(messageListEle,data)
    }
    function renderMessageTopList(renEle,data){
       
        renEle.render({
            data:{},
            template:[
                {
                    e:'set-top-tag',
                    t:'置顶'
                }
            ] 
        });
        renEle.render({
            data:data.topMessages,
            template:[
                { e: "message", t: wf.sns.timeline.message }
            ] 
        });
    }
}

//  jsbuilder/wf/sns/wf.sns.relate.js

wf.sns.relate = function (element) {
    $(element).render({
        template: [{
            tab: {
                nav: {
                    '粉丝': fans,
                    '关注': follow
                },
                default: 1
            }
        }, { e: 'sns-container' }]
    })

    fans()

    function fans() {
        $('sns-container', element).empty().render({
            template: { e: 'wf-sns', a: { view: "my/fans" } }
        })
        wf.sns(element)
    }

    function follow() {
        $('sns-container', element).empty().render({
            template: { e: 'wf-sns', a: { view: "my/follow" } }
        })
        wf.sns(element)
    }
}

//  jsbuilder/wf/sns/wf.sns.topic.js

wf.sns.topic = function(element) {
    let thirdCommentsType = false // 话题不走第三方评论的帖子的呈现形式
    let topic = element.getAttribute('topic')
    initRender()
    function initRender () {
        var data= {}
        wf.isLogin()
        if(wf.loginState && wf.loginState.uid){
            //登录
            data.uid = wf.loginState.uid
        }
        render(data)
       
    }


    function render(data) {
        $(element).render({
            data:data,
            template: [
                function(e) {
                    if (e.data.uid) {
                       
                        wf.sns.messageSender( {
                            container:e.container,
                            data:{
                                topicType: true// topicType用判断是话题组合发帖还是帖子的发贴功能
                            }
                 
                        })
                    } else {
                        unlogin(e.container, data)

                    }

                },
                {
                    e:'message-top-list',
                },
                {
                    e:'message-list',
                    t:function(e){
                        var messageListEle = $(e.container)
                        loaddata(messageListEle)

                    }
                },
                {
                    'wf-button': '点击加载更多...', 
                    
                    id: 'more',
                    click: more
                   
                }
            ]
        })
    }


    function more(p) {
        let fromId = p.sender.getAttribute('fromId')
        var messageListEle = $(p.sender).siblings('message-list')
        loaddata(messageListEle,fromId)
    }

    function loaddata(messageListEle,fromId) {
        let messageTopListEle = messageListEle.siblings('message-top-list')
        let button_more = messageListEle.siblings('wf-button#more')
        wf.http.get(wf.apiServer() + '/sns/message_topic', {
            fromId: fromId,
            topic: topic
        },
        function(data) {
            button_more.attr('fromId', data.minId)
            data.view = 'topic'
            data.topicName = topic
            // 获取收藏数据，渲染内容
            if(data.topMessages){
                
                // 获取收藏数据，渲染内容 
                wf.sns.timeline.getFavouriteData(data,renderMessageTopList,messageTopListEle,'yes')
            }
            
            wf.sns.timeline.getFavouriteData(data,render_messagelist,messageListEle)
           
            button_more.attr('disable', false)
        },
        function(error) {
            console.log(error)
            button_more.attr('disable', false)
        })
    }

    function unlogin(container, data) {
        
        $(container).render({
            data: data,
            template: {
                e: 'wf-no-login',
                t: [{
                    e: 'wf-span',
                    t: '您当前未登录！'
                },
                {

                    e: 'a',
                    a: {
                        href: function() {
                            let url = wf.getRelativeUrl()
                            return wf.oauthServer() + '/login?redirectUri=' +  encodeURIComponent(url)
                         
                        },
                        target:'_blank'
                    },
                    t: '去登录',
                   
                }
                ]
            }
        })
    }
    // 渲染列表
    function render_messagelist(messageListEle,data) {
        // //把当前登录用户信息存在每个message里面
        // $.each(data.messages, function(i, item) {
        //     if(data.user){
        //         item.loginUid = data.user.uid
        //         item.loginUserRole = data.user.role
        //         if (item.forwardMessage) {
        //             item.forwardMessage.loginUid = data.user.uid
        //         }
        //         if(item.thirdMessage){
        //             item.thirdMessage.loginUid = data.user.uid
        //         }
    
        //     }
           
            

        // })
        messageListEle.render({
            data: data.messages,
            template: {
                e: 'message', 
                t: function(e){
                    e.thirdCommentsType = thirdCommentsType
                    wf.sns.timeline.message(e)
                }
            }
        })

        //加载更多..判断
        
        wf.sns.timeline.loadmore(messageListEle,data)

    }
    // 渲染置顶列表
    function renderMessageTopList(renEle,data){
      
        renEle.render({
            data:{},
            template:[
                {
                    e:'set-top-tag',
                    t:'置顶'
                }
            ] 
        });
      
        renEle.render({
            data:data.topMessages,
            template:[
                { e: "message", t: wf.sns.timeline.message }
            ] 
        });
    }
}


//  jsbuilder/wf/sns/wf.sns.topicDetail.js

wf.sns.topicDetail =function(){
    
    $(document).on('click', 'wf-topic', function(e) {
        let topic = e.currentTarget.innerHTML
        wf.pop({
            width: '790px',
            template: [{
                'wf-p': { 'h': '话题：' + topic },
                style: { position: 'sticky', height: '50px', top: 0 }
            }, {
                'wf-topic-detial': { 'wf-sns': '', a: { view: 'topic', topic: topic } },
                style: {
                    'display':'block',
                    'height': 'calc(100% - 50px)',
                    overflow: 'auto'
                }
            },

            function(p) {
                wf.sns(p.container)
            }
            ]
        })
    })
    
      
}

//  jsbuilder/wf/sns/wf.sns.topics.js

wf.sns.topics = function(element) {
    var loadingType = false // 懒加载只发一次请求的标识
    var nextRecord = 0 // 懒加载下一个记录的条数
    var dynamicScroll = 0 //动态的滚动条蜷曲的高度
    var batchSize = 55  //请求一页返回的条数
    render()

    function render() {
        $(element).render({
            template: [
               
                {
                    e:'wf-topic-list',
                    
                },
                {
                    'wf-button': '<i class="fa fa-spin fa-spinner"></i>正在加载内容,请稍后...', 
                    id: 'more',
                    class:'inline_block',
                    // click: more,
                    

                }
            ]
        }) 
        var wfTopicListEle =  $(element).find('wf-topic-list')
        loaddata(wfTopicListEle)
      
    }
   
    // function more(p) {
    //     let fromId = p.sender.getAttribute('fromId')
        
    //     var wfTopicListEle = $(p.sender).siblings('wf-topic-list')
    //     loaddata(wfTopicListEle,fromId)
    // }

    function loaddata(wfTopicListEle,fromId) {

        let button_more = wfTopicListEle.siblings('wf-button#more')
        wf.http.get(wf.apiServer() + '/sns/topics', {
            fromRow: fromId,
            batchSize: batchSize
        },
        function(data) {
            button_more.attr('fromId', data.lastRow)
            button_more.hide()
            if(data.topics){
                render_topics(wfTopicListEle,data)
            }
            button_more.attr('disable', false)
            loadingType = false
            nextRecord =data.nextRecord
            // 懒加载
            wf.sns.lazyload(loaddata,loadingType,nextRecord,dynamicScroll,data.lastRow,wfTopicListEle)

        },
        function(error) {
            console.log(error)
            button_more.attr('disable', false)
        })
    }


    // 渲染列表
    function render_topics(wfTopicListEle,data) {
        //把当前登录用户信息存在每个message里面
        wfTopicListEle.render({
            data: data.topics,
            template: {
                'wf-topic-wrap': [
                    { 'wf-topic': '[[topic]]' }, '([[messageCount]])'] 
            }
        })
        

        //正在加载内容 判断
        wf.sns.timeline.loadmore(wfTopicListEle,data)

    }


}

//  jsbuilder/wf/sns/wf.sns.user.js

wf.sns.user = function(element) {
    $(element).render({
        template: [{
            tab: {
                nav: {
                    '帖子': { hashpath: '#messages', click: user_messages },
                    '评论': { hashpath: '#comments', click: user_comments },
                    '粉丝': { hashpath: '#fans', click: user_fans },
                    '关注': { hashpath: '#following', click: user_following },

                },
                default: 1
            }
        }, { e: 'sns-container' },
        {
            e:"wf-back-to-top",
            t:function(){
                $(document).backToTop()
            }

        }
        ]
    })

    function user_messages() {
        $('sns-container', element).empty().render({
            // template: { e: "wf-timeline", a: { nickname: element.getAttribute('nickname') } }
            template: {
                e: 'wf-sns',
                a: {
                    view: 'user/messages',
                    nickname: element.getAttribute('nickname'),//wf.pub客观页
                    union_id: element.getAttribute('union_id'),//老社区客观页
                }
                
            }
        })
        wf.sns(element)
    }

    function user_comments() {
        $('sns-container', element).empty().render({
            template: {
                e: 'wf-sns',
                a: {
                    view: 'user/comments',
                    nickname: element.getAttribute('nickname'),//wf.pub客观页
                    union_id:element.getAttribute('union_id')//老社区客观页
                }
               
            }
        })
        wf.sns(element)
    }

    function user_fans() {
        $('sns-container', element).empty().render({
            template: {
                e: 'wf-sns', 
                a: {
                    view: 'user/fans',
                    nickname: element.getAttribute('nickname'),//wf.pub客观页
                    union_id:element.getAttribute('union_id')//老社区客观页
                } 
               
            }
        })
        wf.sns(element)
    }

    function user_following() {
        $('sns-container', element).empty().render({
            template: { 
                e: 'wf-sns', 
                a: { 
                    view: 'user/follow',
                    nickname: element.getAttribute('nickname'),//wf.pub客观页
                    union_id:element.getAttribute('union_id')//老社区客观页
                } 
            }
        })
        wf.sns(element)
    }
}

//  jsbuilder/wf/sns/wf.sns.chat/wf.sns.chat.js

wf.sns.chat = function (element) {
    var loadingType = false // 懒加载只发一次请求的标识
    var nextRecord = 0 // 懒加载下一个记录的条数
    var dynamicScroll = 0 //动态的滚动条蜷曲的高度
    var batchSize =  25 //请求一页返回的条数

    let apies = {
        all: wf.apiServer() + '/sns/chat_room_all',
        my: wf.apiServer() + '/sns/chat_room_my',
        delete: wf.apiServer() + '/sns/chat_room_delete'
    }
    render()
   
    function render() {
        $(element).empty().render({
            template: [{
                tab: {
                    nav: {
                        '所有聊天': {hashpath: '#chat/all', click: getAllChat},
                        '我发起的': {hashpath: '#chat/my', click: getMyChat}
                    },
                    default: 1,
                    class: 'l2'
                }
            }, {
                e: 'wf-chat-room',
                id: 'chat_room_list'
            }, {
                'wf-button': '<i class="fa fa-spin fa-spinner"></i>正在加载内容,请稍后...',
                id: 'more',
                class:'chat_room_more ',
                // click: more
            }]
        })
    }

    // function more(e) {
    //     let fromId = e.sender.getAttribute('fromId')
    //     getChatRoomData(fromId)
    // }

    function getAllChat() {
        $('#chat_room_list', element).empty().attr('view', 'all')
        $('.chat_room_more', element).show()
        $('.chat_room_more', element).removeAttr('fromId')
        getChatRoomData()
    }

    function getMyChat() {
        $('#chat_room_list', element).empty().attr('view', 'my')
        $('.chat_room_more', element).show()
        $('.chat_room_more', element).removeAttr('fromId')
        getChatRoomData()
    }

    function getChatRoomData(fromId) {
        let view = $('#chat_room_list', element).attr('view')
        wf.http.get(
            apies[view], 
            {
                fromTime:fromId,
                random: Math.random(),
                batchSize: batchSize
            },
            function (data) {
                
                if (data.minTime) {
                    let button_more = $('.chat_room_more', element)
                    button_more.attr('fromId', data.minTime)
                    button_more.hide()
                    chatRoomRender(data.chatRoom)
                    
                    // // 加载更多逻辑处理 
                  
                    var chatRoomList =  $('#chat_room_list')

                    var dataRes = data
                    data.messages = data.chatRoom
                   
                    wf.sns.timeline.loadmore(chatRoomList,dataRes)
                    loadingType = false
                    nextRecord =data.nextRecord
                    // 懒加载
                    wf.sns.lazyload(getChatRoomData,loadingType,nextRecord,dynamicScroll,data.minTime)
                }else{
                    $('.chat_room_more', element).hide()
                }
            },
            function (error) {
                $('.chat_room_more', element).hide()
            })
    }

    function chatRoomRender(data) {
        $('#chat_room_list', element).render({
            data: data,
            template: {
                e: 'wf-chat-room-info',
                t: [{
                    e: 'wf-chat-room-title',
                    t: [
                        {
                            e: 'wf-h3',
                            t: '[[roomTitle]]'
                        },
                        ' <wf-user class=\'author\' data-nickname="[[user/nickname]]" >@[[user/nickname]]</wf-user>',
                        {
                            if: function (p) {
                                return (p.data.user.type !== '个人')
                            },
                            then: '<wf-user-tag>[[user/type]]</wf-user-tad>',
                        }, ' ', {
                            e: 'create-time',
                            t: function (e) {
                                return wf.replace.dateDiff(e.data.createTime)
                            }
                        },
                        {
                            if: function (p) {
                                return (p.data.unreadNum > 0)
                            },
                            then: {
                                e: 'wf-chat-room-unread',
                                id: 'chat_room_unread'
                            }
                        }
                    ]
                }, {
                    if: function (e) {
                        return e.data.jdata.lastMessage
                    },
                    then: {
                        e: 'wf-chat-room-last',
                        t: [
                            '<wf-user class=\'author\' data-nickname="[[lastMessageUser/nickname]]" >[[lastMessageUser/nickname]]</wf-user>',
                            {
                                if: function (p) {
                                    return (p.data.jdata.lastMessage.user.type !== '个人')
                                },
                                then: '<wf-user-tag>[[jdata/lastMessage/user/type]]</wf-user-tad>',
                            },
                            '：', {
                                e: 'wf-chat-room-last-message',
                                t: '[[jdata/lastMessage/content]] '
                            },
                            {
                                if: function (e) {
                                    return e.data.jdata.lastMessage.createTime
                                },
                                then: {
                                    e: 'create-time',
                                    t: function (e) {
                                        return wf.replace.dateDiff(e.data.jdata.lastMessage.createTime)
                                    }
                                }

                            }
                        ]
                    }
                }
                ],
                event: {
                    click: openChatRoom
                }
            }
        })
    }

    function deleteSign(e) {
        let isExist = $(e.sender).nextAll('.chat_room_delete').length
        if (isExist < 1) {
            $(e.sender).parent().render({
                template: {
                    e: 'wf-span',
                    style: {
                        'margin-left': '20px',
                        'margin-right': '5px'
                    },
                    id: 'chat_room_delete',
                    t: '✕',
                    click: deleteChatRoom
                }
            })
        }
        $(e.sender).parent().parent().siblings().find('#chat_room_delete').remove()
    }

    function deleteChatRoom(e) {
        dialog.sendDialog({
            title:'删除或退出该群聊',
            content:'您确定要删除或退出该群聊吗？',
            button:['取消','确定'],
            },
            function(){

            },
            function(){
                let roomId = $(e.sender).parent().attr('roomId')
                wf.http.get(apies.delete, {roomId: roomId,},
                    function (data) {
                        if (data.deleteMessage) {
                            dialog.fail(data.deleteMessage)
                            render()
                        } else {
                            dialog.fail('删除失败！')
    
                        }
                    },
                    function (err) {
                        console.log(err)
                    })
            }
        )
       
    }

    function openChatRoom(e) {
        $(e.sender).nextAll('#chat_room_unread').remove()
        wf.pop({
            template: [{
                e: 'wf-sns',
                a: {
                    view: 'chatroom',
                    roomId: e.org_data.roomId,
                    creater: e.org_data.createUid
                },
                width: '100%',
                height: '100%'
            }, function (p) {
                wf.sns(p.container)
            }],
            onclose: render // 利用onclose回调接口刷新一下列表.
        })
    }

}


//  jsbuilder/wf/sns/wf.sns.chat/wf.sns.chat.room.js

wf.sns.chat.room = function (element) {
    let apiUrl = wf.apiServer() + '/sns'
    let roomId = parseInt(element.getAttribute('roomId'))
    let creater = parseInt(element.getAttribute('creater'))
    let queryflag = false
    let maxId, minId

    chatRoomRender()

    enterEvent()

    NewMessage()
    //滚动到底部
    $('#chat_message_list', element).animate({scrollTop: $('#chat_message_list', element).prop('scrollHeight')}, 200)

    function chatRoomRender() {
        $(element).render({
            template: {
                'wf-chat-message': [
                    {
                        'wf-chat-message-list': {
                            'wf-button': '更早的消息',
                            id: 'history',
                            style: {
                                width: '280px',
                                'text-align': 'center',
                                'margin': '0 auto',
                                display: 'block'
                            },
                            click: historyMessage
                        },
                        id: 'chat_message_list',
                        style: {
                            overFlow: 'auto ',
                            height: '85%',
                            width: '100%',
                            display: 'block'
                        },
                        timer: {
                            interval: 5000, do: function () {
                                NewMessage()
                            }
                        } //5秒轮询一次
                    },
                    {
                        e: 'wf-chat-message-send',
                        style: {position: 'relative', bottom: '-10px', width: '100%', display: 'block'},
                        t: [{
                            'wf-button': '群聊成员',
                            style: {
                                'text-align': 'center'
                            },
                            width: '90px',
                            click: showUserList
                        },
                        /*{
                            e: 'wf-chat-message-file',
                            t: [{
                                'wf-button': '发送图片',
                                style: {
                                    'text-align': 'center'
                                },
                                width: '90px',
                                click: function () {
                                    dialog.fail('暂不开放')
                                    //$('#wf-chat-message-upload').click()
                                }
                            },
                            {
                                e: 'input',
                                a: {
                                    type: 'file',
                                    accept: 'image/!*',
                                    name: 'wf-chat-message-upload',
                                    id: 'wf-chat-message-upload'
                                },
                                style:{
                                    display:'none'
                                },
                                event: {
                                    change: function(e) {
                                        uploadFile(e)
                                    }
                                }
                            }
                            ]
                        },*/
                        {
                            e: 'textarea',
                            name: 'wf_message_content',
                            id: 'wf_message_content',
                            style: {
                                resize: 'none',
                                'margin-bottom': '5px',
                                'margin-top': '5px',
                                'word-break': 'break-all'
                            },
                            a: {
                                'placeholder': '聊起来吧~'
                            },
                            event: wf.atHelper()
                        },
                        {
                            'wf-button': '发送',
                            click: submitMessage,
                            style: {
                                'text-align': 'center',
                                float: 'right'
                            }
                        }
                        ]
                    }
                ],
                id: 'chat_message',
                style: {'padding': '20px 20px', height: '100%', display: 'block'}
            }
        })
    }

    //获取最新消息
    function NewMessage(isSendMessage) {
        if (!queryflag || isSendMessage) { //防止重入；
            queryflag = true
            wf.http.get(
                apiUrl + '/chat_message', {roomId: roomId, afterId: maxId, random: Math.random()},
                function (data) {
                    if (data.maxId) maxId = data.maxId
                    if (!minId && data.minId) minId = data.minId
                    queryflag = false //允许进入
                    if (data.chatMessage) {
                        $('#chat_message_list', element).render({
                            data: data,
                            template: messageTemplate
                        })
                    }
                },
                function (error) {
                    console.log(error)
                    queryflag = false //允许进入
                }
            )
        }
    }

    //获取历史消息
    function historyMessage() {
        wf.http.get(
            apiUrl + '/chat_message', {roomId: roomId, beforeId: minId},
            function (data) {
                if (data.minId) minId = data.minId
                let frag = document.createDocumentFragment() //先创建一个fragment
                $(frag).render({ //渲染到fragment中
                    data: data,
                    template: messageTemplate
                })
                $('wf-button#history').after(frag) //将fragment添加到history button后面。
            },
            function (error) {
                console.log(error)
            }
        )
    }

    function messageTemplate(p) {
        $(p.container).render({
            data: p.data.chatMessage,
            template: {
                e: 'wf-chat-message-info',
                style: {
                    clear: 'both',
                    display: 'block'
                },
                t: {
                    if: (function (e) {
                        return e.data.content_type == 'tips'
                    }),
                    then: {
                        e: 'wf-chat-message-tips',
                        style: {
                            'color': '#A9A9A9',
                            'text-align': 'center',
                            display: 'block'
                        },
                        t: '[[content]]'
                    },
                    else: {
                        if: (function (e) {
                            return e.data.uid == p.data.nowUid
                        }),
                        then: {
                            e: 'wf-chat-message-body',
                            style: {
                                display: 'block',
                            },
                            t: [{
                                e: 'wf-chat-message-user',
                                style: {
                                    float: 'right'
                                },
                                t: [
                                    '：',
                                    {
                                        if: function (p) {
                                            return (p.data.user.type !== '个人')
                                        },
                                        then: '<wf-user-tag>[[user/type]]</wf-user-tad>',
                                    },
                                    '<wf-user class=\'author\' data-nickname="[[user/nickname]]" >[[user/nickname]]</wf-user>'
                                ]
                            }, {
                                e: 'wf-chat-message-content',
                                style: {
                                    float: 'right',
                                    'max-width': '350px',
                                    'white-space': 'pre-wrap',
                                    'word-break': 'break-all',
                                    'line-height':'20px'
                                },
                                t: function (e) {
                                    return wf.replace.at(e.data.content)
                                }
                            }, {
                                e: 'create-time',
                                class: 'remark',
                                style: {
                                    clear: 'both',
                                    display: 'block',
                                    float: 'right'
                                },
                                t: function (e) {
                                    return wf.replace.dateDiff(e.data.createTime)
                                }
                            }]
                        },
                        else: {
                            e: 'wf-chat-message-body',
                            style: {
                                display: 'block',
                            },
                            t: [{
                                e: 'wf-chat-message-user',
                                style: {
                                    float: 'left'
                                },
                                t: [
                                    '<wf-user class=\'author\' data-nickname="[[user/nickname]]" >[[user/nickname]]</wf-user>',
                                    {
                                        if: function (p) {
                                            return (p.data.user.type !== '个人')
                                        },
                                        then: '<wf-user-tag>[[user/type]]</wf-user-tad>',
                                    },
                                    '：'
                                ]
                            }, {
                                e: 'wf-chat-message-content',
                                style: {
                                    float: 'left',
                                    width: '350px',
                                    'white-space': 'pre-wrap',
                                    'word-break': 'break-all',
                                    'line-height':'20px'
                                },
                                t: function (e) {
                                    return wf.replace.at(e.data.content)
                                }
                            }, {
                                e: 'create-time',
                                class: 'remark',
                                style: {
                                    display: 'block',
                                    clear: 'both'
                                },
                                t: function (e) {
                                    return wf.replace.dateDiff(e.data.createTime)
                                }
                            }]
                        }
                    }
                }
            }
        })
    }

    //发送群聊消息
    function submitMessage(e) {
        let content = e.new_data ? $.trim(e.new_data.wf_message_content) : $.trim(e.target.value)
        if (content) {
            content = e.new_data ? e.new_data.wf_message_content : e.target.value
            wf.http.post(apiUrl + '/chat_message_send',
                {
                    roomId: roomId,
                    content: content
                },
                function (data) {
                    if (data.insertStatus == '200') {
                        $('#wf_message_content').val('')
                        //滚动到底部
                        $('#chat_message_list').animate({scrollTop: $('#chat_message_list').prop('scrollHeight')}, 200)
                        NewMessage(true) //马上刷新一下消息列表
                    } else {
                        dialog.fail('回复失败！')
                    }
                },
                function (err) {
                    wf.error(err)
                })
        }
    }

    //获取群聊成员
    function showUserList() {
        wf.http.get(apiUrl + '/chat_user',
            {
                roomId: roomId,
                random: Math.random()
            },
            function (data) {
                getUserList(data)
            },
            function (error) {
                console.log(error)
            })
    }

    function getUserList(data) {
        poplayer({
            header: '群聊成员',
            width: 600,
            height: 400,
            data: data,
            template: {
                e: 'wf-chat-member',
                id: 'chat_member',
                style: {
                    font: '13px Arial, sans-serif'
                },
                t: [
                    {
                        e: 'wf-chat-member-action',
                        t: [
                            {
                                e: 'input',
                                id: 'chat_member_action',
                                a: {
                                    type: 'checkbox'
                                },
                                event: {
                                    mouseup: function (e) {
                                        if (e.sender.checked) {
                                            $('.chat_member_check').prop('checked', false)
                                        } else {
                                            $('.chat_member_check').prop('checked', true)
                                        }
                                    }
                                }
                            },
                            '&nbsp;全选'
                            ,
                            {
                                'wf-button': '将ta请出群聊',
                                style: {
                                    'margin-left': '40px'
                                },
                                click: function () {
                                    let userStr = []
                                    $('#chat_member_list').find(':checkbox').each(
                                        function () {
                                            if ($(this).prop('checked')) {
                                                userStr.push($(this).val())
                                            }
                                        }
                                    )
                                    if (userStr.toString()) {
                                        if (data.nowUid == creater) {
                                            deleteUser(roomId, userStr.toString())
                                        } else {
                                            dialog.fail('仅群聊发起人有权请出群员!')
                                        }
                                    }
                                }
                            },
                        ]
                    },
                    {
                        e: 'wf-chat_member-list',
                        id: 'chat_member_list',
                        t: function () {
                            userTemplate(data)
                        }
                    }
                ]
            },
            onclose: function () {
                NewMessage()
            }
        })
    }

    function userTemplate(data) {
        $('#chat_member_list').empty().render({
            data: data.chat_member,
            template: {
                e: 'wf-chat-member-body',
                style: {
                    display: 'block',
                    'margin-bottom': '5px'
                },
                datapath: 'chat_member',
                t: {
                    if: function (e) {
                        return (e.data.uid != creater)
                    },
                    then: [{
                        e: 'input',
                        class: 'chat_member_check',
                        a: {
                            type: 'checkbox',
                            name: 'member_check',
                            value: '[[user/nickname]]'
                        }
                    }, '&nbsp;[[user/nickname]]'
                    ],
                    else: [
                        {
                            e: 'input',
                            a: {
                                type: 'checkbox',
                                name: 'member_creater',
                                value: '[[user/nickname]]',
                                disabled: 'disabled'
                            }
                        },
                        '&nbsp;[[user/nickname]]&nbsp;',
                        {
                            e: 'wf-chat-label',
                            style: {
                                color: '#ff8c00'
                            },
                            t: '发起人'
                        }
                    ]
                }
            }
        })
    }

    //删除群聊内成员
    function deleteUser(roomId, userNameStr) {
        wf.http.get(apiUrl + '/chat_user_out',
            {
                roomId: roomId,
                userNameStr: userNameStr,
                random: Math.random()
            },
            function (data) {
                if (data.deleteStatus == '200') {
                    dialog.success('请出群员成功！')
                    wf.http.get(apiUrl + '/chat_user',
                        {
                            roomId: roomId,
                            random: Math.random()
                        },
                        function (data) {
                            userTemplate(data)
                        },
                        function (error) {
                            console.log(error)
                        })
                }
            },
            function (error) {
                console.log(error)
            })

    }

    //输入框回车事件
    function enterEvent() {
        $('#wf_message_content', element).bind('keydown', function (e) {
            if (e.ctrlKey && e.keyCode == 13) {
                //设置换行
                let pos = e.target.selectionStart
                $('#wf_message_content').val(e.target.value.substring(0, pos) + '\n' + e.target.value.substring(pos))
                e.target.selectionStart = pos + 1
                e.target.selectionEnd = pos + 1
            } else if (e.keyCode == 13) {
                e.preventDefault()
                submitMessage(e)
            }
        })
    }

    //图片上传
    function uploadFile(e){
        /*var files = e.sender.files
        if(files){
            if (files[0].type != 'image/png' && files[0].type != 'image/jpeg' && files[0].type != 'image/gif') {
                return dialog.fail('发送的图片格式不正确')
            }
            var formdata = new FormData()
            formdata.append('file', files[0])
            $.ajax({
                url: wf.snsServer() + '/message/uploadImage',
                type: 'POST',
                data: formdata,
                dataType: 'json',
                contentType: false,
                processData: false,
                xhrFields: {
                    withCredentials: true //携带cookie
                },
                success: function(res) {
                    console.log(res)
                    //dialog.fail(res.url + '?x-oss-process=image/resize,m_fill,h_100,w_100,limit_0')

                },
                error: function(data) {
                    console.log(data)
                }
            })
        }*/
    }
}


//  jsbuilder/wf/sns/wf.sns.chat/wf.sns.chat.sender.js

wf.sns.chat.sender = function (e) {
    let targetId = e.org_data.user.uid
    poplayer({
        header: '发送私信',
        width: 600,
        height: 400,
        template: {
            e: 'wf-chat-send',
            t: [
                {
                    e: 'textarea',
                    id: 'chat_message',
                    name: 'chat_message',
                    a: {
                        'placeholder': '请输入要发送的内容'
                    },
                    style: {
                        width: '70%',
                        'margin-bottom': '7px',
                        'word-break': 'break-all'
                    }
                },
                {
                    'wf-button': '发送',
                    click: function (e) {
                       
                        sendPrivateLetter(e.new_data.chat_message)
                    }
                }
            ]
        }
    })

    function sendPrivateLetter(content) {
        if (content) {
            wf.http.post(wf.apiServer() + '/sns/chat_room',
                {
                    targetUid: targetId,
                    content: content
                },
                function (data) {
                    $('#chat_message').val('')
                    if (data.insertStatus == '200') {
                        dialog.success('发送成功')
                    }
                },
                function (err) {
                    wf.error(err)
                }
            )
        }else{
            dialog.fail('私信，内容不能为空！')

        }
    }

    $('#chat_message').bind('keydown', function (e) {
        if (e.keyCode == 13) {
            e.preventDefault()
            sendPrivateLetter(e.target.value)
        }
    })
}

//  jsbuilder/wf/sns/wf.sns.comment/wf.sns.comment.js

wf.sns.comment = function (element) {

    //获取当前显示那个视图
    let defaultView = $(element).find('tab-nav.active').text()
    $(element).empty()
    let apies = {
        received: wf.apiServer() + '/sns/comment_received',
        at: wf.apiServer() + '/sns/comment_at',
        my: wf.apiServer() + '/sns/comment_my',
        user: wf.apiServer() + '/sns/user_comment'
    }
    // wf.pub 客观页
    let nickname = element.getAttribute('nickname')
    // 老社区 客观页
    let unionId = element.getAttribute('union_id')

    var loadingType = false // 懒加载只发一次请求的标识
    var nextRecord = 0 // 懒加载下一个记录的条数
    var dynamicScroll = 0 //动态的滚动条蜷曲的高度
    let setTimer // 定义定时器
    render()
    

    function render () {
        if (nickname || unionId) {
            $(element).render({
                template: [
                    { 
                        e: 'message-list',
                        class: '',  
                        a: { nickname: nickname },

                    },
                    {
                        e: 'wf-button',
                        id: 'more',
                        t: '<i class="fa fa-spin fa-spinner"></i>正在加载内容,请稍后...',
                        // click: more
                    }
                ]
            })
            user()
        } else {

            $(element).render({
                template: [{
                    tab: {
                        nav: {
                            '收到的': { hashpath: '#comments/received', click: received },
                            '@我': { hashpath: '#comments/at', click: at },
                            '我发出的': { hashpath: '#comments/my', click: my }
                        },
                        default: 1,
                        class: 'l2'
                    }
                }, { e: 'message-list' },
                {
                    e: 'wf-button',
                    id: 'more',
                    t: '<i class="fa fa-spin fa-spinner"></i>正在加载内容,请稍后...',
                    // click: more
                }
                ]
            })
        }
    }
    function received () {
        clearTimeout(setTimer);
        $('message-list', element).empty().attr('view', 'received')
        $('wf-button#more', element).show()
        $('wf-button#more', element).removeAttr('fromId')
        loaddata()
        // 取消通知数量
        let numEle = $('wf-sns-notify').find('notify-number.commentReceivedCount')
        wf.notify.changeNum(numEle)
    }
    function at () {
        clearTimeout(setTimer);
        $('message-list', element).empty().attr('view', 'at')
        $('wf-button#more', element).show()
        $('wf-button#more', element).removeAttr('fromId')
        loaddata()
         // 取消通知数量
         let numEle = $('wf-sns-notify').find('notify-number.commentUnreadCount')
         wf.notify.changeNum(numEle)
      
    }

    function my () {
        clearTimeout(setTimer);
        $('message-list', element).empty().attr('view', 'my')
        $('wf-button#more', element).show()
        $('wf-button#more', element).removeAttr('fromId')
        loaddata()
      

    }

    function user () {
        clearTimeout(setTimer);
        $('message-list', element).empty().attr('view', 'user')
        $('wf-button#more', element).removeAttr('fromId')
        $('wf-button#more', element).show()
        loaddata()
    }

    // function more (p) {
    //     let fromId = p.sender.getAttribute('fromId')
    //     console.log({ p: p, fromId: fromId })
    //     loaddata(fromId)
    // }


    function loaddata (fromId) {
        let view = $('message-list', element).attr('view')

        let button_more = $('wf-button#more', element)
        let reqData = {
            fromId: fromId
        }
        if(nickname){
            reqData.nickname = nickname
        }

        if(unionId){
            reqData.unionId = unionId    
        }

        wf.http.get(
            apies[view],
            reqData,
            function (data) {
                
                
                $.each(data.comments, function (i, item) {
                    item.loginUid = data.uid
                })
                button_more.attr('fromId', data.minId)
                button_more.attr('disable', false)
                button_more.hide()
                render_commentlist(data)
                loadingType = false
                nextRecord =data.nextRecord
                wf.sns.lazyload(loaddata,loadingType,nextRecord,dynamicScroll,data.minId)
            },
            function (error) {
                console.log(error)
                button_more.hide()
                button_more.attr('disable', false)
            })
    }

    // 渲染列表
    function render_commentlist (data) {
        if(data.comments  && data.comments.length>0){
            // $('message-list', element).render({
            //     data: data.comments,
            //     template: {
            //         if: data.comments != null,
            //         then: {
            //             e: 'message',
            //             t: wf.sns.comment.message
            //         }
            //     }
            // })
          
            getCommentArr(0)//开始调用渲染帖子信息
            //加载更多... 判断显示隐藏
            var messageListEle =  $('message-list', element)
            // 构造数据格式
            data.messages = data.comments
            // 调用函数loadmore
            wf.sns.timeline.loadmore(messageListEle,data)
            // 渲染帖子信息
            function  getCommentArr(i) {
            　　var commentsArr= data.comments
        　　　　 if ( i < commentsArr.length ) { 　
                    $('message-list', element).render({
                        data:commentsArr[i],
                        template: { e: "message", t: wf.sns.comment.message }
                    });
                    setTimer = setTimeout(function(){ 
                        i++;
                        getCommentArr(i)
                    }, 10);
            　　}
            }
        }else{
            $('message-list', element).render({
                data: {},
                template:'<wf-p class="nodata">暂无数据</wf-p>'
            })
        }
       

        
    }
}

//  jsbuilder/wf/sns/wf.sns.comment/modules/wf.sns.comment.message.js

wf.sns.comment.message = function (p) {
    if (p.container) render(p) // 如果调用参数存在container属性，则是由thin直接调用，直接执行渲染。
    else {
        return render
    } // 否则，则是参数设置调用，返回渲染函数。

    function render(p) {
        let template_menu = {
            e: 'wf-pulldown',
            t: [
                {
                    if: function(e){

                        if(e.data.user){
                            if(e.data.user.uid === e.data.loginUid){
                                return true
                            }else{
                                return false
                            }


                        }else{
                            return false
                        }

                    },
                    then: {
                        e: 'a',
                        t: '删除',
                        click: function (e) {
                            let reMoveEle = $(e.sender).parents('message-detail')
                            wf.sns.timeline.deleteComment(e, reMoveEle)
                        }
                    }
                },
                {e: 'a', t: '投诉'}
            ],
            closeon: 'click'
        }
        if(p.data){
            if(p.data.reply){
                // 回复 XXX 的评论，点评论跳转帖子详情页
                p.data.reply.messageId = p.data.messageId
            }
        }

        // 评论暂时不支持图片和视频
        function commentTemplate(e){
           if(e.data.reply ==null){
            noDataTemplate(e,'评论已被删除')
           }else{
                $(e.container).render({
                    data:e.data.reply,
                    template:{
                        e: 'wf-reply',
                        t: [
                            '回复<wf-user data-nickname=\'[[user/nickname]]\'>@[[user/nickname]]</wf-user>的' +
                            '<a target="_blank" href='+ wf.wfPubServer()+'/m/[[messageId]] >评论</a>：',
                            function(e){
                                wf.sns.timeline.getArticleRenderTemplate(e)
                            },
                           

                            
                            
                            
                        ]
                    }
                })
           
           }

            

        }
        function messageTemplate(e){
            $(e.container).render({
                data:e.data,
                template:{
                    e: 'wf-replay',
                    t: [
                        '回复<wf-user data-nickname=\'[[message/user/nickname]]\'>@[[message/user/nickname]]</wf-user>的' +
                        '<a target="_blank" href='+ wf.wfPubServer()+'/m/[[message/messageId]]>帖子</a>：',
                        function(e){
                           
                            if (e.data.message && e.data.message.content !== null) {
                                // 构造数据
                                e.data.content = e.data.message.content
                                wf.sns.timeline.getArticleRenderTemplate(e)
                            }
                            
                        },
                        {
                            if: function(e){
                                if(e.data.message){
                                    if(e.data.message.imageId && e.data.message.imageId.length>0 ){
                                        return true
                                    }else{
                                        return false
                                    }
        
                                }else{
                                    return false
                                }
        
                            },
                            then: function(e){
                                if(e.data.message){
                                    e.data = e.data.message //构造数据结构
                                    wf.sns.timeline.imagepart(e)
                                }
                                
                            }
                        },
                        {
                            if: function(e){
                                if(e.data.message){
                                    if(e.data.message.video ){
                                        return true
                                    }else{
                                        return false
                                    }
        
                                }else{
                                    return false
                                }
        
                            },
                            then: {
                                video: '',
                                a: {
                                    src: wf.snsOssServer()+'/'+'[[message/video/id]]',
                                    controls: 'controls',
                                    poster:function (e) {
                                        if (e.data.message.video.poster){
                                            return e.data.message.video.poster
                                        }else {
                                            return wf.snsOssServer()+'/'+e.data.message.video.id+'?x-oss-process=video/snapshot,t_1000,f_jpg,w_800,h_400'
                                        }
                                    }
                                },
                                style: {
                                    width: '100%'
                                }
                            }
                        }
                    ]
                }

            })

        }
        function noDataTemplate(e,des){
            $(e.container).render({
                data:{},
                template:{
                    e: 'wf-reply',
                    a:{
                        class:'nodata'
                    },
                    t:des
                   
                }

            })

        }
        

        
        
        $(p.container).render({
            data: p.data,
            template: {
                e: 'message-detail',

                t: [
                    // '<wf-user class=\'avatar\' data-nickname=[[user/nickname]]><img src=\'[[user/avatarUrl]]\' class=\'avatar-img\'></wf-user>',
                    {
                        e: 'wf-user',
                        a: {
                            'data-nickname': '[[user/nickname]]',
                            class: 'avatar'
                        },
                        t: [
                            {
                                e: 'img',
                                a: {
                                    src: '[[user/avatarUrl]]',
                                    class: 'avatar-img'
                                }
                            },
                            // {
                            //     e: 'img',
                               
                            //     a: {
                                
                            //         class:'img_v',
        
                            //         src: function() {
                            //             return  wf.comServer()+'/img/v.png'
                            //         }
                            //     }
                            // },
                        ],
                        click: function (e) {

                            window.open(wf.wfPubServer() + '/u/' + e.org_data.user.nickname)
                        }
                    },
                    {
                        e: 'message-body',
                        t: [
                            {
                                e: 'wf-pulldown-font',
                                click: template_menu
                            },
                            {
                                e: 'wf-user',
                                a: {
                                    class: 'author',
                                    'data-nickname': '[[user/nickname]]'
                                },
                                t: '[[user/nickname]]',
                                click: function (e) {

                                    window.open(wf.wfPubServer() + '/u/' + e.org_data.user.nickname)
                                }

                            },
                            // '<wf-user class=\'author\' data-nickname=[[user/nickname]] >[[user/nickname]]</wf-user>',
                            function(e){
                                
                                e.data = e.data.user ? e.data.user : {}
                                wf.user.renderBadge(e)

                            },
                            {
                                e: 'create-time',
                                t: function (e) {
                                    return wf.replace.dateDiff(e.data.createTime)
                                }
                            },
                            function(e){
                                wf.sns.timeline.getArticleRenderTemplate(e)
                            },
                           
                            // function (e) {
                            //     if (e.data && e.data.content !== null) {
                            //         //@替换标签

                            //         wf.sns.timeline.wfArticle(e)

                            //     }
                            //     // 调用mermaid渲染图
                            //     mermaid.init(undefined, $('div.mermaid', e.container))
                            //     // 调用MathJax渲染公式
                            //     MathJax.typeset([e.container])
                            //     wf.functionPlot(e.container)
                            // },
                            {
                                if: 'replyRealId',
                                then:function(e){
                                    if(e.data.reply){
                                        commentTemplate(e)
                                    }else{
                                        noDataTemplate(e,'评论已被删除')

                                    }
                                  
                                },
                                else: function(e){
                                    
                                    if(e.data.message){
                                      messageTemplate(e)
                                    }else{
                                      
                                      noDataTemplate(e,'帖子已被删除')

                                    }
                                    
                                }
                               
                            },

                        ]
                    },
                    {
                        e: 'message-handle',
                        t: [
                            {
                              if:function(e){ 
                                // 第一种情况：评论的帖子，如果message为空 帖子已删除
                                // 第二种情况：回复的评论，replyId不为空并且reply为空  评论已删除
                                if(e.data.replyId){
                                    // 回复
                                    return  (e.data.reply ==null)  ? true :false
                                }else{
                                    return  e.data.message == null  ? true :false
                                }
                              },
                              else:{
                                e: 'wf-button',
                                a: {
                                    class: 'commentButton msgComment',
                                },
                                t: '回复([[replyCount]])',
                                click: function (e) {
                                    // 清空其他兄弟元素回复内容
                                    $(e.sender).parents('message').siblings('message').find('message-handle-list').empty()
                                    var renderEle = $(e.sender).parent('message-handle').siblings('message-handle-list')
                                    if (e.org_data.message && e.org_data.message.messageId) {
                                        e.org_data.commentCount = e.org_data.message.commentCount
                                        e.org_data.messageId = e.org_data.message.messageId
                                        if (renderEle.find('.commentFiledset').length > 0) {
                                            // renderEle.empty()
                                            $("message-handle-list ").empty()
                                        } else {
                                            $(e.sender).addClass('wf-disable')
                                            // 传入回复评论标识
                                            e.isreply = true
                                            wf.sns.timeline.commentMessage(e, renderEle)
                                        }
                                    } else {
                                        dialog.fail('该帖子已被删除！')
                                    }
                                }
                              }
                            }
                        ]
                    },
                    {
                        e: 'message-handle-list',
                    }
                ]
            }
        })
    }

}


//  jsbuilder/wf/sns/wf.sns.fans/wf.sns.fans.js

wf.sns.fans = function (element) {
    var loadingType = false // 懒加载只发一次请求的标识
    var nextRecord = 0 // 懒加载下一个记录的条数
    var dynamicScroll = 0 //动态的滚动条蜷曲的高度
    var batchSize = 20//请求一页返回的条数


    $(element).empty().render({
        template: [
            {
                e: 'attention-list',
                t: function (e) {
                    let requireData = {
                        batchSize:batchSize
                    }
                    // wf.pub的客观页
                    let nickname = $(e.container).closest('wf-sns').attr('nickname')
                    // 老社区的客观页
                    let unionId = $(e.container).closest('wf-sns').attr('union_id')
                    if (nickname) {
                        requireData.nickname = nickname
                    }
                    if(unionId) {
                        requireData.unionId = unionId
                    }

                    getData(e, requireData)


                }

            },
            {
                e: 'wf-button',
                a:{
                    id: 'more',
                    class:'inline_block'
                },
                t: '<i class="fa fa-spin fa-spinner"></i>正在加载内容,请稍后...',

            }
        ]
    })

    function getData (e, requireData) {
        var lazyEle = e  // 懒加载传入的参数
        wf.http.get(wf.apiServer() + '/sns/fans_user_list',
            requireData,
            function (data) {
                let loginUid = data.loginUid
                var button_more = $(e.container).siblings('wf-button#more')
                button_more.hide()
                if (data.users.length<=0 ) {
                    $(e.container).text('您还没有粉丝哦~')
                    return
                }
                button_more.attr('fromId', data.minId)
                button_more.attr('disable', false)
                
                $(e.container).render({
                    data: data.users,
                    template: {
                        e: 'attention-item',
                        t: {
                            if: function (e) {
                                return e.data.user ? true : false
                            },
                            then: [
                                {
                                    e: 'user-wrap',
                                    t: [
                                       
                                        {
                                            e:'wf-span',
                                            a:{
                                                class: 'wf_span_img'
                                            },
                                            t:[
                                                {
                                                    e: 'img',
                                                    a: {
                                                        src: '[[user/avatarUrl]]',
                                                        class: 'avatar-img'
                                                    },
                                                    click: function (e) {
                                                        window.open(wf.wfPubServer() + '/u/' + e.org_data.user.nickname)
                                                      
                                                    }
        
                                                },
                                                
                                            ]
                                        },
                                        {
                                            e: 'wf-span',
                                            t: '[[user/nickname]]',
                                            click: function (e) {
                                                window.open(wf.wfPubServer() + '/u/' + e.org_data.user.nickname)
                                            }
                                        },
                                        function(e){
                                           
                                            e.data = e.data.user ? e.data.user : {}
                                            wf.user.renderBadge(e)
                    
                                        },


                                    ]
                                },
                                {
                                    if: function (e) {
                                        return e.data.user.uid != loginUid ? true : false
                                    },
                                    then: {
                                        e: 'wf-button',
                                        t: function (e) {
                                            return getEachFollow(e.data.followStatus)
                                        },
                                        event: {
                                            mouseenter: function (e) {
                                                if (e.org_data.followStatus == 1 || e.org_data.followStatus == 2) {
                                                    $(e.sender).text('取消关注')
                                                } else {
                                                    $(e.sender).text('+关注')
                                                }
                                            },
                                            mouseleave: function (e) {
                                                if (e.org_data.followStatus == 0) {
                                                    $(e.sender).text('+关注')
                                                } else if (e.org_data.followStatus == 1) {
                                                    $(e.sender).text('已关注')
                                                } else if (e.org_data.followStatus == 2) {
                                                    $(e.sender).text('互相关注')
                                                }

                                            },
                                            click: function (e) {
                                                if (!loginUid) {
                                                    let url = wf.getRelativeUrl()
                                                    window.location.href = wf.oauthServer() + '/login?redirectUri=' +encodeURIComponent(url)
                                                    
                                                } else {
                                                    if (e.org_data.followStatus == 1 || e.org_data.followStatus == 2) {
                                                        //取消关注
                                                        cancelFollow(e)
                                                    } else {
                                                        //关注
                                                        follow(e)
                                                    }
                                                }
                                            }
                                        }

                                    }

                                },
                                // {
                                //     if:function(e){
                                //         // if(requireData.uid===undefined){
                                //         //     //说明是当前登录用户
                                //         //     requireData.uid = loginUid
                                //         // }
                                //         // console.log(e)
                                //         return  e.data.user.uid != loginUid ? true :false
                                //     },
                                //     then:{
                                //         e: 'wf-button',
                                //         t: '删除粉丝',
                                //         click: deleteFans
                                //     },
                                // },
                                {
                                    if: function (e) {
                                        return e.data.user.uid != loginUid ? true : false
                                    },
                                    then: {
                                        e: 'wf-button',
                                        t: '私信',
                                        click: function (e) {
                                            if (!loginUid) {
                                                let url = wf.getRelativeUrl()
                                                window.location.href = wf.oauthServer() + '/login?redirectUri=' + encodeURIComponent(url)
                                                
                                            } else {
                                                wf.sns.chat.sender(e)
                                            }
                                        }
                                    }
                                }

                            ]
                        }
                    }
                })

                // 加载更多判断显示隐藏
                var attentionListEle = $(e.container)
                wf.sns.timeline.loadmore(attentionListEle,data)
                // 懒加载功能
                loadingType = false
                nextRecord =data.nextRecord

                let lazyRequireData = {
                    batchSize:batchSize
                }
                // wf.pub的客观页
                let nickname = $(e.container).closest('wf-sns').attr('nickname')
                // 老社区的客观页
                let unionId = $(e.container).closest('wf-sns').attr('union_id')
                if (nickname) {
                    lazyRequireData.nickname = nickname
                }
                if(unionId) {
                    lazyRequireData.unionId = unionId
                }
                if(data.minId){
                    lazyRequireData.fromId = data.minId
                }
                wf.sns.lazyload(getData,loadingType,nextRecord,dynamicScroll,lazyRequireData, lazyEle)
            },
            function (error) {
                $(e.container).siblings('wf-button#more').hide()
            })
    }



    function getEachFollow (followStatus) {
        let followText
        if (followStatus == 0) {
            followText = '+关注'
        } else if (followStatus == 1) {
            followText = '已关注'
        } else if (followStatus == 2) {
            followText = '互相关注'
        }
        return followText
    }
    //删除粉丝
    function deleteFans (e) {
        dialog.sendDialog({
            title:'删除粉丝',
            content:'您确定删除该粉丝吗？',
            button:['取消','确定'],
            },
            function(){

            },
            function(){
                wf.http.post(wf.apiServer() + '/sns/fans_user_delete', { uid: e.org_data.user.uid },
                function (data) {
                    if (data) {
                        // $(e.sender).parent('attention-item').remove()
                        if ($('attention-list attention-item').length == 0) {
                            $('attention-list').text('您还没有粉丝哦~~')
                        }
                    }
                },
                function (err) {
                    wf.error(err)
                })
            }
        )
        
    }
    //发送取消关注的请求 
    var cancelFollow = function (e) {
        wf.http.post(
            wf.apiServer() + '/sns/follow_cancel', {
                targetUid: e.org_data.user.uid
            },
            function (resData) {
                e.org_data.followStatus = resData.followStatus
                $(e.sender).text('+关注')
            },
            function (err) {
                wf.error(err)
            }
        )
    }
    //发送关注的请求 
    function follow (e) {
        wf.http.post(wf.apiServer() + '/sns/follow_add',
            { targetUid: e.org_data.user.uid },
            function (data) {
                e.org_data.followStatus = data.followStatus
                $(e.sender).text('取消关注')

            },
            function (err) {
                wf.error(err)
            }
        )
    }
}

//  jsbuilder/wf/sns/wf.sns.follow/wf.sns.follow.js

wf.sns.follow = function (element) {
    var loadingType = false // 懒加载只发一次请求的标识
    var nextRecord = 0 // 懒加载下一个记录的条数
    var dynamicScroll = 0 //动态的滚动条蜷曲的高度
    var batchSize = 20 //请求一页返回的条数

    $(element).empty().render({
        template: [
            {
                e: 'attention-list',
                t: function (e) {
                    let requireData = {
                        batchSize:batchSize
                    }
                    // wf.pub的客观页
                    let nickname = $(e.container).closest('wf-sns').attr('nickname')
                    // 老社区的客观页
                    let unionId = $(e.container).closest('wf-sns').attr('union_id')
                    if (nickname) {
                        requireData.nickname = nickname
                    }
                    if(unionId) {
                        requireData.unionId = unionId
                    }
                    getData(e, requireData)


                }
            },
            {
                e: 'wf-button',
                a:{
                    id: 'more',
                    class:'inline_block'
                },
                t: '<i class="fa fa-spin fa-spinner"></i>正在加载内容,请稍后...',

            }
        ]
    })

    function getData (e, requireData) {
        var lazyEle = e  // 懒加载传入的参数
        wf.http.get(wf.apiServer() + '/sns/follow_user_list',
            requireData,
            function (data) {
                $(e.container).siblings('wf-button#more').hide()
                let loginUid = data.loginUid
                if (!data.users) {
                    $(e.container).text('您还没有关注任何人哦~')
                    return
                }
                $(e.container).render({
                    data: data.users,
                    template: {
                        e: 'attention-item',
                        t: {
                            if: function (e) {
                                return e.data.user ? true : false
                            },
                            then: [
                                {
                                    e: 'user-wrap',
                                    t: [
                                        {
                                            e:'wf-span',
                                            a:{
                                                class: 'wf_span_img'
                                            },
                                            t:[
                                                {
                                                    e: 'img',
                                                    a: {
                                                        src: '[[user/avatarUrl]]',
                                                        class: 'avatar-img'
                                                    },
                                                    click: function (e) {
                                                        window.open(wf.wfPubServer() + '/u/' + e.org_data.user.nickname)
                                                     
                                                    }
        
                                                },
                                            ]
                                        },
                                        {
                                            e: 'wf-span',
                                            t: '[[user/nickname]]',
                                            click: function (e) {
                                                window.open(wf.wfPubServer() + '/u/' + e.org_data.user.nickname)
                                            }
                                        },
                                        function(e){
                                           
                                            e.data = e.data.user ? e.data.user : {}
                                            wf.user.renderBadge(e)
                    
                                        },
                                    ]
                                },
                                {
                                    if: function (e) {
                                        return e.data.user.uid != loginUid ? true : false
                                    },
                                    then: {
                                        e: 'wf-button',
                                        t: function (e) {
                                            return getEachFollow(e.data.followStatus)
                                        },
                                        event: {
                                            mouseenter: function (e) {
                                                if (e.org_data.followStatus == 1 || e.org_data.followStatus == 2) {
                                                    $(e.sender).text('取消关注')
                                                } else {
                                                    $(e.sender).text('+关注')
                                                }
                                            },
                                            mouseleave: function (e) {
                                                if (e.org_data.followStatus == 0) {
                                                    $(e.sender).text('+关注')
                                                } else if (e.org_data.followStatus == 1) {
                                                    $(e.sender).text('已关注')
                                                } else if (e.org_data.followStatus == 2) {
                                                    $(e.sender).text('互相关注')
                                                }

                                            },
                                            click: function (e) {
                                                if (!loginUid) {
                                                    let url = wf.getRelativeUrl()
                                                    window.location.href = wf.oauthServer() + '/login?redirectUri=' + encodeURIComponent(url)
                                                } else {
                                                    if (e.org_data.followStatus == 1 || e.org_data.followStatus == 2) {
                                                        //取消关注
                                                        cancelFollowRequestFun(e)
                                                    } else {
                                                        //关注
                                                        follow(e)
                                                    }
                                                }
                                            }
                                        }
                                    }
                                },
                                {
                                    if: function (e) {
                                        return e.data.user.uid != loginUid ? true : false
                                    },
                                    then: {
                                        e: 'wf-button',
                                        t: '私信',
                                        click: function (e) {
                                            if (!loginUid) {
                                                let url = wf.getRelativeUrl()
                                                window.location.href = wf.oauthServer() + '/login?redirectUri=' + encodeURIComponent(url)
                                            } else {
                                                wf.sns.chat.sender(e)
                                            }
                                        }
                                    }
                                }


                            ]
                        }
                    }
                })

                // 加载更多判断显示隐藏
                var attentionListEle = $(e.container)
                wf.sns.timeline.loadmore(attentionListEle,data)
                // 懒加载功能
                loadingType = false
                nextRecord =data.nextRecord
 
                let lazyRequireData = {
                    batchSize:batchSize
                }
                // wf.pub的客观页
                let nickname = $(e.container).closest('wf-sns').attr('nickname')
                // 老社区的客观页
                let unionId = $(e.container).closest('wf-sns').attr('union_id')
                if (nickname) {
                    lazyRequireData.nickname = nickname
                }
                if(unionId) {
                    lazyRequireData.unionId = unionId
                }
                if(data.minId){
                    lazyRequireData.fromId = data.minId
                }
                wf.sns.lazyload(getData,loadingType,nextRecord,dynamicScroll,lazyRequireData, lazyEle)
            },
            function(){
                $(e.container).siblings('wf-button#more').hide()
            }
        )
    }

    function getEachFollow (followStatus) {
        let followText
        if (followStatus == 0) {
            followText = '+关注'
        } else if (followStatus == 1) {
            followText = '已关注'
        } else if (followStatus == 2) {
            followText = '互相关注'
        }
        return followText
    }
    //发送取消关注的请求 
    var cancelFollowRequestFun = function (e) {
        wf.http.post(
            wf.apiServer() + '/sns/follow_cancel', {
                targetUid: e.org_data.user.uid
            },
            function (resData) {
                e.org_data.followStatus = resData.followStatus
                $(e.sender).text('+关注')
            },
            function (err) {
                wf.error(err)
            }
        )
    }

    function follow (e) {
        wf.http.post(wf.apiServer() + '/sns/follow_add',
            { targetUid: e.org_data.user.uid },
            function (data) {
                e.org_data.followStatus = data.followStatus
                $(e.sender).text('取消关注')
            },
            function (err) {
                wf.error(err)
            }
        )
    }
}

//  jsbuilder/wf/sns/wf.sns.praise/wf.sns.praise.js

wf.sns.praise =function(element){
    
    var loadingType = false // 懒加载只发一次请求的标识
    var nextRecord = 0 // 懒加载下一个记录的条数
    var dynamicScroll = 0 //动态的滚动条蜷曲的高度
    var batchSize = 20//请求一页返回的条数
    $(element).empty().render({
        template:[{
            tab: {
                nav: {
                    '赞': {
                        hashpath: '#praise/add',
                        click: function(e){
                            var wfPraiseList 
                            if(e){
                                wfPraiseList = $(e.sender).parent('tab').siblings('.wf-praise-list')
                            }else{
                                wfPraiseList = $(element).find('.wf-praise-list')
                            }
                            wfPraiseList.empty()
                            wfPraiseList.siblings('wf-button#more').show()
                            let reaData={}
                            myPraise(wfPraiseList,reaData)
                        }
                    },
                    '收到的赞': {
                        hashpath: '#praise/receive',
                        click: function(e){

                            var wfPraiseList 
                            if(e){
                                wfPraiseList = $(e.sender).parent('tab').siblings('.wf-praise-list')
                            }else{
                                wfPraiseList = $(element).find('.wf-praise-list')
                            }
                            wfPraiseList.empty()
                            wfPraiseList.siblings('wf-button#more').show()
                            let reaData={}
                            receivePraise(wfPraiseList,reaData)
                        }
                    },
                },
                default: 1,
                class: 'l2'
            }
        },
    
        {
            e:'message-list',
            class:'wf-praise-list',
        },
        {
            e: 'wf-button',
            id: 'more',

            t: '<i class="fa fa-spin fa-spinner"></i>正在加载内容,请稍后...',

        }
        ]
    })
    function myPraise(wfPraiseList,reaData){
      
        wf.http.get(
            wf.apiServer() + '/sns/message_my_praise',
            reaData,
            function (res) {
                wfPraiseList.siblings('wf-button#more').hide()
                if(!res.messages || res.messages.length<=0){
                  
                    // messages 数据为空
                    return wfPraiseList.empty().render({
                        data:{},
                        template:'<wf-p>您目前还没有给别人点过赞！</wf-p>'
                    })
                }

                

                // 获取收藏数据，渲染内容
                wf.sns.timeline.getFavouriteData(res,renderMyPraise,wfPraiseList)
               
                // 懒加载功能
                loadingType = false
                nextRecord =res.nextRecord
                let lazyRequireData = {
                    batchSize:batchSize
                }
                if(res.minId){
                    lazyRequireData.fromId = res.minId
                }
                // 调用懒加载函数
                wf.sns.lazyload(myPraise,loadingType,nextRecord,dynamicScroll,lazyRequireData, wfPraiseList) 
                 
            },
            function (err) {
                wfPraiseList.siblings('wf-button#more').hide()
            })
    }
    function receivePraise(wfPraiseList,reaData){
        wf.http.get(
            wf.apiServer() + '/sns/message_praise_receive',
            reaData,
            function (res) {
                var button_more = wfPraiseList.siblings('wf-button#more')
                button_more.hide()
                if(!res.praiseList || res.praiseList.length <=0 ){
                   
                    return wfPraiseList.empty().render({
                        data:{},
                        template:'<wf-p>目前还没有收到的赞!</wf-p>'
                    })
                }
                
                button_more.attr('fromId', res.minId)
                button_more.attr('disable', false)
 
                renderReceivePraise(wfPraiseList,res)

                // 加载更多判断显示隐藏
                wf.sns.timeline.loadmore(wfPraiseList,res)
                // 懒加载功能
                loadingType = false
                nextRecord =res.nextRecord
 
                let lazyRequireData = {
                    batchSize:batchSize
                }
                if(res.minId){
                    lazyRequireData.fromId = res.minId
                }
                
                wf.sns.lazyload(receivePraise,loadingType,nextRecord,dynamicScroll,lazyRequireData, wfPraiseList) 
            },
            function (err) {
                wfPraiseList.siblings('wf-button#more').hide()
            })
         // 取消通知数量
         let numEle = $('wf-sns-notify').find('notify-number.messagePraisedCount')
         wf.notify.changeNum(numEle)

    }
    function renderReceivePraise(wfPraiseList,res){
        wfPraiseList.render({
            data:res.praiseList,
            template:[
                {
                    e:'wf-praise-item',
                    t:[
                        // '<wf-user class=\'avatar\' data-nickname=[[user/nickname]]><img src=\'[[user/avatarUrl]]\' class=\'avatar-img\'></wf-user>',
                        {
                            e:'wf-user',
                            a:{
                                class:'avatar',
                                'data-nickname':'[[user/nickname]]',
                               
                            },
                            t:[
                                {
                                    e:'img',
                                    a:{
                                        src:'[[user/avatarUrl]]',
                                        class:'avatar-img'
                                    }
    
                                },
                                // {
                                //     e: 'img',
                                   
                                //     a: {
                                    
                                //         class:'img_v',

                                //         src: function() {
                                //             return  wf.comServer()+'/img/v.png'
                                //         }
                                //     }
                                // },
                            ],
                            click:function(e){
                               
                                window.open(wf.wfPubServer()+'/u/'+e.org_data.user.nickname)
                            }
                            

                        },
                        {
                            e: 'praise-item-content',
                            t: [
                                '<wf-user class=\'author\' data-nickname=[[user/nickname]] >[[user/nickname]]</wf-user>',
                                function(e){
                                    
                                    e.data = e.data.user ? e.data.user : {}
                                    wf.user.renderBadge(e)
            
                                },
                                {
                                    e: 'create-time',
                                    t: function (e) {
                                        return wf.replace.dateDiff(e.data.createTime)
                                    }
                                },
                                {
                                    e:'praise-prompt',
                                    t:function(e) {
                                        return '赞了你的'+'<a target="_blank" href='+wf.wfPubServer()+'/m/'+e.data.message.messageId+ '>帖子:</a>'
                                    }
                                },
                                {
                                    e:'praise-message-content',
                                    t:[ 
                                        // function (e) {
                                        //     if (e.data.message && e.data.message.content !== null) {
                                        //     //@替换标签
                                        //         e.data.content = e.data.message.content
                                        //         wf.sns.timeline.wfArticle(e)
                  
                                        //     }
                                        //     // 调用mermaid渲染图
                                        //     mermaid.init(undefined, $('div.mermaid', e.container))
                                        //     // 调用MathJax渲染公式
                                        //     MathJax.typeset([e.container])
                                        //     wf.functionPlot(e.container)
                                        // },
                                        function(e){
                                            if (e.data.message && e.data.message.content !== null) {
                                                // 构造数据
                                                e.data.content = e.data.message.content
                        
                                                wf.sns.timeline.getArticleRenderTemplate(e)
                        
                                            }
                                        },
                                        {
                                            if: function(e){
                                                if(e.data.message){
                                                    if(e.data.message.imageId && e.data.message.imageId.length>0 ){
                                                        return true
                                                    }else{
                                                        return false
                                                    }

                                                }else{
                                                    return false
                                                }

                                            },
                                            then: function(e){
                                                if(e.data.message){
                                                    e.data = e.data.message //构造数据结构
                                                    wf.sns.timeline.imagepart(e)
                                                }
                                                
                                            }
                                        },
                                        {
                                            if: function(e){
                                                if(e.data.message){
                                                    if(e.data.message.video ){
                                                        return true
                                                    }else{
                                                        return false
                                                    }

                                                }else{
                                                    return false
                                                }

                                            },
                                            then: {
                                                video: '',
                                                a: {
                                                    src: wf.snsOssServer()+'/'+'[[message/video/id]]',
                                                    controls: 'controls',
                                                    poster:function (e) {
                                                        if (e.data.message.video.poster){
                                                            return e.data.message.video.poster
                                                        }else {
                                                            return wf.snsOssServer()+'/'+e.data.message.video.id+'?x-oss-process=video/snapshot,t_1000,f_jpg,w_800,h_400'
                                                        }
                                                    }
                                                },
                                                style: {
                                                    width: '100%'
                                                }
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
          
        })
    }

    function renderMyPraise(wfPraiseList,res){
        wfPraiseList.render({
            data:res.messages,
            template: { e: 'message', t: wf.sns.timeline.message }
            
        
        })
        
        // 加载更多判断显示隐藏
        wf.sns.timeline.loadmore(wfPraiseList,res)
    }
}

//  jsbuilder/wf/sns/wf.sns.rank/wf.sns.rank.js

wf.sns.rank =function(element){
    let apies = {
        fans: wf.apiServer() + '/statistic/fans_rank',
        message: wf.apiServer() + '/statistic/send_message_rank',
        praise: wf.apiServer() + '/statistic/praise_message_rank',
        readnum: wf.apiServer() + '/statistic/read_message_rank',
        interact: wf.apiServer() + '/statistic/mix_message_rank'
    }
    var p={
        fans: {
            dataPathName:'fansinfo',
            rankCountName:'fansCount',
            dataInterpretation:'新增粉丝量',
            rankName:'粉丝榜',
        },
        message: {
            dataPathName:'otherinfo',
            rankCountName:'messageCount',
            dataInterpretation:'发帖量',
            rankName:'发帖榜',
        },
        praise:{
            dataPathName:'praiseinfo',
            rankCountName:'praiseCount',
            dataInterpretation:'被点赞量',
            rankName:'获赞榜',
        },
        readnum: {
            dataPathName:'otherinfo',
            rankCountName:'readCount',
            dataInterpretation:'被阅读量',
            rankName:'阅读榜',
        },
        interact: {
            dataPathName:'otherinfo',
            rankCountName:'mixCount',
            dataInterpretation:'被转发+评论量',
            rankName:'互动榜',
        }
    };
    $(element).empty().render({
        template:[{
            tab: {
                nav: {
                    '粉丝榜': {hashpath: '#rank/fans',click: function(){getFansRank()}},
                    '发帖榜': {hashpath: '#rank/message',click: function(){getMessageRank()}},
                    '获赞榜': {hashpath: '#rank/praise',click: function(){getPraiseRank()}},
                    // '阅读榜': {hashpath: '#rank/readnum',click: function(){getReadnumRank()}},
                    // '互动榜': {hashpath: '#rank/interact',click: function(){getInteractRank()}}
                },
                default: 1,
                class: 'l2'
            }
        },
        {
            e:'wf-rank-list',
            id:'wf-rank-list',
        }]
    })
    function getFansRank(){
        $('#wf-rank-list', element).empty().attr('view', 'fans')
        renderRank()
    } 
    function getMessageRank(){
        $('#wf-rank-list', element).empty().attr('view', 'message')
        renderRank()
    }    
    function getPraiseRank(){
        $('#wf-rank-list', element).empty().attr('view', 'praise')
        renderRank()
    }  
    function getReadnumRank(){
        $('#wf-rank-list', element).empty().attr('view', 'readnum')    
        renderRank()
    }
    function getInteractRank(){
        $('#wf-rank-list', element).empty().attr('view', 'interact')
        renderRank()
    }

    function getRankData(){
        let view = $('#wf-rank-list', element).attr('view')
        let timeView = $('rank-list-div-l', element).attr('view')
        // console.log('view:',view)
        // console.log('timeView:',timeView)
        if(timeView=='yesterday'){
            wf.http.post(apies[view], {queryType:1}, function (data) {
                // console.log('日榜data:',data)
                // console.log('data.fansinfo:',data.fansinfo)
                // console.log('dataPathName:',p[view].dataPathName)
                // console.log('data[p[view].dataPathName]:',data[p[view].dataPathName])
                // console.log('--------')
                var rankTimeData={
                    RankListDivTitle:'日榜',
                    ele:'rank-list-div-l'
                }
                if(!data[p[view].dataPathName]||data[p[view].dataPathName]==null||data[p[view].dataPathName]==''){
                    $('rank-list-div-l').text('此榜单周期暂无数据哦~')
                    $("wf-button#more", element).hide(); 
                    return
                }else{
                    renderRankListDiv(p[view],data,rankTimeData)
                }
                
            })
        }else if(timeView=='week'){
            wf.http.post(apies[view], {queryType:2}, function (data) {
                // console.log('周榜data:',data)
                // console.log('dataPathName:',p[view].dataPathName)
                // console.log('data[p[view].dataPathName]:',data[p[view].dataPathName])
                // console.log('data.fansinfo:',data.fansinfo)
                // console.log('--------')
                var rankTimeData={
                    RankListDivTitle:'周榜',
                    ele:'rank-list-div-l'
                }
                if(!data[p[view].dataPathName]||data[p[view].dataPathName]==null||data[p[view].dataPathName]==''){
                    $('rank-list-div-l').text('此榜单周期暂无数据哦~')
                    $("wf-button#more", element).hide(); 
                    return
                }else{
                    renderRankListDiv(p[view],data,rankTimeData)
                }
            })
        }else{
            wf.http.post(apies[view], {}, function (data) {
                // console.log('粉丝榜data:',data)
                // console.log('--------')
                var rankTimeData={
                    RankListDivTitle:'总榜',
                    ele:'rank-list-div-l'
                }
                if(!data[p[view].dataPathName]||data[p[view].dataPathName]==null||data[p[view].dataPathName]==''){
                    $('rank-list-div-l').text('此榜单周期暂无数据哦~')
                    $("wf-button#more", element).hide(); 
                    return
                }else{
                    renderRankListDiv(p[view],data,rankTimeData)
                }
            })
        }
    }
    function renderRank(){
        let view = $('#wf-rank-list', element).attr('view')
        // console.log('view2:',view)
        $('#wf-rank-list').render({
            data: {},
            template: [
                {
                    tab: {
                        nav: {
                            '日榜': {hashpath: '#rank/'+view+'/yesterday',click: function(){
                                $('rank-list-div-l', element).empty().attr('view', 'yesterday')
                                $("wf-button#more", element).show(); 
                                getRankData()
                            }},
                            
                            '周榜': {hashpath: '#rank/'+view+'/week',click: function(){
                                $('rank-list-div-l', element).empty().attr('view', 'week')
                                $("wf-button#more", element).show(); 
                                getRankData()
                            }},
                            // '总榜': {hashpath: '#rank/'+view+'/all',click: function(){
                            //     $('rank-list-div-l', element).empty().attr('view', 'all')
                            //     getRankData()
                            // }}
                        },
                        default: 1,
                        class: 'l2'
                    }
                },
                {
                    'wf-button': '<i class="fa fa-spin fa-spinner"></i>正在加载内容,请稍后...', 
                    id: 'more',
                    class:'inline_block',
                    // click: more,
                },
                {
                    e:'rank-list-div-container',
                    t:[
                        {
                            e:'rank-list-div-l',
                            class:'rank-list-div div-box',
                        },
                        // {
                        //     e:'rank-list-div-c',
                        //     class:'rank-list-div',
                        // },
                        {
                            e:'rank-list-div-r',
                            class:'rank-list-div div-box',
                            t:[{
                                e:'wf-article',
                                t:[{
                                    e:'wf-h3',
                                    t:'1.榜单周期:',
                                },{
                                    e:'ul',
                                    t:[{
                                        e:'li',
                                        t:'日榜：统计周期为昨日0:00至24:00，统计昨日一天的数据。每日0:00生成昨日榜。',
                                    },{
                                        e:'li',
                                        t:'周榜：统计周期为每周一0:00至周日24:00，然后进入下周的计分周期。每周一0:00生成上周的周榜。',
                                    },
                                    // {
                                    //     e:'li',
                                    //     t:'总榜：统计周期为社区上线后至今，实时生成总榜。',
                                    // }
                                ]
                                },{
                                    e:'wf-h3',
                                    t:'2.排名规则：',
                                },{
                                    e:'ul',
                                    t:[{
                                        e:'li',
                                        t:'粉丝榜：平台依据账号在榜单周期内的新增粉丝数量进行排名。',
                                    },{
                                        e:'li',
                                        t:'发帖榜：平台依据账号在榜单周期内所发帖子的数量进行排名。',
                                    },{
                                        e:'li',
                                        t:'获赞榜：平台依据账号所发帖子在榜单周期内获赞的总数进行排名。',
                                    },
                                    // {
                                    //     e:'li',
                                    //     t:'阅读榜：平台依据账号所发帖子在榜单周期内被阅读的次数进行排名。',
                                    // },
                                    // {
                                    //     e:'li',
                                    //     t:'互动榜：平台依据账号所发帖子在榜单周期内被评论和被转发的总数进行排名。',
                                    // }
                                ]
                                }]
                            }]
                            
                        }
                    ]
                },
                
            ]
        })
    }

    function renderRankListDiv(p,data,rankTimeData){
        // console.log('renderRankListDiv-ele:',ele)
        // console.log('renderRankListDiv-p:',p)
        // console.log('renderRankListDiv-data:',data)
        $(rankTimeData.ele).render({
            data: data,
            template: [
                // {
                //     e:'wf-h3',
                //     t:rankTimeData.RankListDivTitle,
                // },
                {
                    e: 'rank-item-container',
                    t: {
                        if: function (e) {
                            return e.data.userinfo ? true : false
                        },
                        then: [{
                        e:'rank-item-div',
                        // datapath: 'fansinfo',
                        datapath:p.dataPathName,
                        t: [{
                            // if: function (e) {
                            //     return e.data.userinfo ? true : false
                            // },
                            // then: [{
                                e: 'rank-item',
                                t: [
                                    {
                                        e:'wf-span',
                                        class:'rowNumber',
                                        t:'[[rowNumber]]'
                                    },
                                    // 头像带浮窗
                                    {
                                        e:'wf-user',
                                        a: {
                                            'data-nickname': '[[userinfo/nickname]]',
                                            class: 'avatar'
                                        },
                                        t: {
                                            e: 'img',
                                            a: {
                                                src: '[[userinfo/avatarUrl]]',
                                                class: 'avatar-img'
                                            },
                                            click: function (e) {
                                                window.location.href = wf.wfPubServer() + '/u/' + e.org_data.userinfo.nickname 
                                            }
                                        }
                                    },
                                    {
                                        e:'wf-span',
                                        a: {
                                            'data-nickname': '[[userinfo/nickname]]',
                                            class: 'avatar overhidden1 rank-nickname'
                                        },
                                        click: function (e) {
                                            window.location.href = wf.wfPubServer() + '/u/' + e.org_data.userinfo.nickname
                                        },
                                        t: '[[userinfo/nickname]]'
                                    },
                                    function(e){
                                        e.data = e.data.userinfo ? e.data.userinfo : {}
                                        wf.user.renderBadge(e)
        
                                    },
                                    // 头像不带浮窗
                                    // {
                                    //     e: 'user-wrap',
                                    //     t: [
                                    //         {
                                    //             e: 'img',
                                    //             a: {
                                    //                 src: '[[userinfo/avatarUrl]]',
                                    //                 class: 'avatar-img'
                                    //             },
                                    //             click: function (e) {
                                    //                 window.location.href = wf.wfPubServer() + '/u/' + e.org_data.userinfo.nickname
                                    //             }

                                    //         },
                                    //         {
                                    //             e: 'wf-span',
                                    //             t: '[[userinfo/nickname]]',
                                    //             click: function (e) {
                                    //                 window.location.href = wf.wfPubServer() + '/u/' + e.org_data.userinfo.nickname 
                                    //             }
                                    //         }

                                    //     ]
                                    // },
                                    {
                                        e:'wf-rank-div',
                                        class:'rankCount-div',
                                        t:[{
                                            e:'wf-span',
                                            class:'rankCountName',
                                            t:'[['+p.rankCountName+']]'
                                        },{
                                            e:'wf-span',
                                            class:'dataInterpretation summary',
                                            t:p.dataInterpretation
                                        }]
                                    },
                                ]
                            // }]
                        }]
                        }]
                    }   
                },
            ]
        })
        $("wf-button#more", element).hide(); 
    }
}

//  jsbuilder/wf/sns/wf.sns.timeline/wf.sns.timeline.js

wf.sns.timeline = function(element) {
    
    //获取当前显示那个视图
    let defaultView = $(element).find('tab-nav.active').text()
    $(element).empty();
    
    let apies = {
        public: wf.apiServer() + "/sns/message_public",
        follow: wf.apiServer() + "/sns/message_follow",
        at: wf.apiServer() + "/sns/message_at",
        my: wf.apiServer() + "/sns/message_my",
        // myPraise: wf.apiServer() + "/sns/message_my_praise",
        // praiseMy: wf.apiServer() + "/sns/message_praise_receive",
        user: wf.apiServer() + "/sns/user_message",
        all: wf.apiServer() + "/sns/message_all",
        excellentMessages: wf.apiServer() + "/sns/excellent_message_all",
    }
    // wf.pub的客观页
    let nickname = element.getAttribute('nickname');
    //  老社区的客观页
    let unionId = element.getAttribute('union_id');

    var loadingType = false // 懒加载只发一次请求的标识
    var nextRecord = 0 // 懒加载下一个记录的条数
    var dynamicScroll = 0 //动态的滚动条蜷曲的高度
    let setTimer // 定义定时器


    render();
    
    
    
    
    
    function render() {
        if (nickname || unionId) {
            $(element).render({
                template: [
                    {
                        
                        e: "message-list"
                    },
                    {
                        e: "wf-button",
                        id: "more",
                        t: '<i class="fa fa-spin fa-spinner"></i>正在加载内容,请稍后...',
                        // click: more
                    }
                ]
            });
            user();
        } else {
            $(element).render({
                template: [{
                        tab: {
                            nav: {

                            
                                "推荐 <wf-span class='hot'><img src=https://com.wf.pub/img/hot.png></img></wf-span>": { class:'hot',hashpath: "#message/pubic", click: public },
                                
                                "关注": { hashpath: "#message/follow", click: follow },
                                "@我": { hashpath: "#message/at", click: at },
                                "我发出": { hashpath: "#message/my", click: my },
                                // "赞": { hashpath: "#message/myPraise", click: myPraise },
                                // "收到的赞": { hashpath: "#message/praiseMy", click: praiseMy },
                                "所有": { hashpath: "#message/all", click: all },
                                '精选': { hashpath: "#message/excellent", click: fetchExcellentMessages }
                            },
                            default: 2,
                            class: "l2",
                        }
                    },
                    {
                        e: "message-top-list",
                        
                    },
                    {
                        e: "message-list",
                    },
                    {
                        e: "wf-button",
                        id: "more",
                        // t: "正在加载内容,请稍后...",
                        // t:'<i class="fa fa-spin fa-spinner"></i>正在加载内容,请稍后...'
                        t:'<i class="fa fa-spin fa-spinner"></i>正在加载内容,请稍后...'
                        // click: more
                        // fa-spinner
                    }
                ]
            });
            
        }
       
    }

    function follow() {
        clearTimeout(setTimer);
        $("message-list", element).empty().attr('view', "follow");
        $("message-top-list", element).empty().hide()
        $("wf-button#more", element).show(); 
        $("wf-button#more", element).removeAttr('fromId');
        loaddata();
    }

    function public() {
        clearTimeout(setTimer);
        $("message-top-list", element).empty().hide()
        $("message-list", element).empty().attr('view', "public");
        $("wf-button#more", element).show(); 
        $("wf-button#more", element).removeAttr('fromId');
        
        loaddata();
    }

    function at() {
        clearTimeout(setTimer);
        $("message-top-list", element).empty().hide()
        $("message-list", element).empty().attr('view', "at");
        $("wf-button#more", element).show(); 
        $("wf-button#more", element).removeAttr('fromId');
        loaddata();
        // 取消通知数量
        let numEle = $('wf-sns-notify').find('notify-number.messageUnreadCount')
        wf.notify.changeNum(numEle)
        
    }

    function my() {
        clearTimeout(setTimer);
        $("message-top-list", element).empty().hide()
        $("message-list", element).empty().attr('view', "my");
        $("wf-button#more", element).show(); 
        $("wf-button#more", element).removeAttr('fromId');
        loaddata();
    }
    function all() {
        clearTimeout(setTimer);
        $("message-top-list", element).empty().hide()
        $("message-list", element).empty().attr('view', "all");
        $("wf-button#more", element).show(); 
        $("wf-button#more", element).removeAttr('fromId');
        loaddata();
    }

    function user() {
        clearTimeout(setTimer);
        $("message-top-list", element).empty().hide()
        $("message-list", element).empty().attr('view', "user");
        $("wf-button#more", element).show(); 
        $("wf-button#more", element).removeAttr('fromId');
        loaddata();
    }

    // function more(p) {
    //     let fromId = p.sender.getAttribute('fromId');
    //     loaddata(fromId);
    // }
    function loaddata(fromId) {
        let view = $("message-list", element).attr('view');
        let button_more = $("wf-button#more", element);
        let reqData = {
            fromId: fromId,
        }
        if(unionId){
            reqData.unionId = unionId
        }
        if(nickname){
            reqData.nickname = nickname
        }
        
        wf.http.get(apies[view],reqData,
            function(data) {
                
                data.view = view //用于区分tab用不用包含置顶
            
                if(data.topMessages){
                   
                    // 获取收藏数据，渲染内容 
                     wf.sns.timeline.getFavouriteData(data,renderMessageTopList,$("message-top-list", element),'yes')
                }
                
                // 获取收藏数据，渲染内容 
                wf.sns.timeline.getFavouriteData(data,render_messagelist,$("message-list", element))
                button_more.attr('fromId', data.minId)
                button_more.attr('disable', false)
                loadingType = false
                nextRecord =data.nextRecord
                // 懒加载
                wf.sns.lazyload(loaddata,loadingType,nextRecord,dynamicScroll,data.minId)
                
            },
            function(error) {
                button_more.hide()
                button_more.attr('disable', false);
                
            })
    }
    // 渲染列表
    function render_messagelist(renEle,data) {
        if (data.messages) { //加判断因为数据为null 渲染会出错
            getMessagesArr(0)//开始调用渲染帖子信息
            $("wf-button#more", element).hide(); 
            // 加载更多判断显示隐藏
            wf.sns.timeline.loadmore(renEle,data)
        }
        // 渲染帖子信息
        function getMessagesArr(i) {
        　　var messagesArr=data.messages
    　　　　if ( i < messagesArr.length ) { 　
                renEle.render({
                    data:messagesArr[i],
                    template: { e: "message", t: wf.sns.timeline.message }
                });
                setTimer = setTimeout(function(){ 
                    i++;
                    getMessagesArr(i)
                }, 0);
        　　}
        }
    }
    function renderMessageTopList(renEle,data){
       
        renEle.render({
            data:{},
            template:[
                {
                    e:'set-top-tag',
                    t:'置顶'
                }
            ] 
        });
        renEle.render({
            data:data.topMessages,
            template:[
                { e: "message", t: wf.sns.timeline.message }
            ] 
        });
    }

    function fetchExcellentMessages() {
        // 清除定时器 
        clearTimeout(setTimer);
        switchToExcellentMessageTag()
        showUpTheLoading()
        clearPageNo()
        requestAndRenderExcellentMessages()

        function switchToExcellentMessageTag() {
            $('message-list', element).empty().attr('view', 'excellentMessages')
        }
        function showUpTheLoading() {
            $('wf-button#more', element).show()
        }
        function clearPageNo() {
            $('wf-button#more', element).removeAttr('nextPageNo')
        }
    }

    function requestAndRenderExcellentMessages(pageNo) {
        const queryParameter = {
            pageNo: pageNo,
        }

        const apiName = getApiName();
        wf.http.get(apies[apiName],queryParameter,
            function(data) {
                renderCurrentPageMessages(data)
                savePagingData(data.nextPageNo)
                prepareNextPageRequest(data.nextRecord, data.nextPageNo)

                function renderCurrentPageMessages(data) {
                    wf.sns.timeline.getFavouriteData(data, render_messagelist, $('message-list', element))
                }

                function savePagingData(nextPageNo) {
                    const pagingElement = selectPagingElement()
                    pagingElement.attr('nextPageNo', nextPageNo)
                    pagingElement.attr('disable', false)
                }

                function prepareNextPageRequest(nextPageSize, nextPageNo) {
                    wf.sns.lazyload(requestAndRenderExcellentMessages, false, nextPageSize, dynamicScroll, nextPageNo)
                }

            },
            function(error) {
                const pagingElement = selectPagingElement()
                pagingElement.attr('disable', false);
            })

        function selectPagingElement() {
            return $('wf-button#more', element)
        }
        function getApiName() {
            return $('message-list', element).attr('view')
        }
    }
}

//  jsbuilder/wf/sns/wf.sns.timeline/modules/wf.sns.messagesender.js

wf.sns.messageSender = function (p) {
    let timer = null

    let allData = p
    let thirdCommentsType = false //thirdCommentsType用判断是第三方评论还是帖子的发贴功能
    if (p.data.thirdCommentsType) {
        thirdCommentsType = p.data.thirdCommentsType

    }
    let topicType = false // topicType用判断是话题组合发帖还是帖子的发贴功能
    if (p.data.topicType) {
        topicType = p.data.topicType
    }
    let imageButton
    let videoButton
    let uid
    let imageFileUpload
    let videoFileUpload
    $(p.container).render({
        template: [
            {
                e: 'wf-messagesender',
                t: [{
                    e: 'textarea',
                    class: 'image-dropzone  video-dropzone',
                    a: {
                        name: 'wf_message_content',
                        id: 'wf-message-content'
                    },
                    t: function (e) {
                        // 请求来源于编辑帖子?
                        if (isAlterOperation()) {
                            return getThisMessageContent()
                        }
                        // 判断是不是话题页面的发帖
                        let topicVal = $(e.container).parents('wf-sns').attr('topic') || $(e.container).parents('wf-sns').attr('data-topic')
                        if (topicType && topicVal) {
                            $(e.container).val(topicVal)
                        }else if (!thirdCommentsType){
                            uid = wf.cookie.get('uid')
                            //获取草稿
                            $(e.container).val(localStorage.getItem('publish_draft_'+uid))
                        }

                        function getThisMessageContent() {
                            return p.data.org_data.content.split('//@')[0]
                        }
                    },
                    event: [
                        wf.atHelper(),
                        {
                            'input':function (e) {
                                if ((topicType && topicVal)||thirdCommentsType) {
                                    return
                                }
                                //添加草稿
                                if (uid){
                                    localStorage.setItem('publish_draft_'+uid,e.new_data.wf_message_content)
                                }
                            }
                        }
                    ]

                },
                {
                    e: 'wf-messagesender-img',
                    t: [
                        {
                            'input': '', a: {
                                id: 'image-file-upload', type: 'file', name: 'files[]',
                                style: 'display:none', multiple: 'multiple', accept: 'image/*'
                            }
                        },
                        {
                            'input': '',
                            a: {
                                id: 'video-file-upload',
                                type: 'file',
                                name: 'files[]',
                                style: 'display:none',
                                accept: 'video/*'
                            }
                        },
                        {
                            e: 'wf-button',
                            a: {
                                class: 'imgBtn'
                            },
                            t: '图片',
                            click: function (e) {
                                // console.log(e)
                                uploadImage(e)

                            }


                            // click: uploadImage

                        },
                        {
                            e: 'upload-image-container',
                            class:'image-dropzone',
                            style: {
                                top: function () { if (isAlterOperation()) return '110px' }
                            },
                            t: [
                                {
                                    e: 'h4',
                                    t: ['本地上传',
                                        {
                                            'i': 'x',
                                            click: function (e) {
                                                shutDownUploadImage($(e.sender).parents('upload-image-container'))
                                            }
                                            // click: shutDownUploadImage
                                        }]
                                },
                                {'upload-img-num': ''},
                                {
                                    e: 'ul',
                                    class: 'upload-img-list',
                                    a: {
                                        style: 'position: relative'
                                    },
                                    t: {
                                        'li': '+',
                                        class: 'upload-img-list-button',
                                        // click: uploadMoreImage,
                                        click: function (e) {
                                            uploadMoreImage(e)
                                        },
                                        a: {
                                            style: 'position: relative; z-index: 1;'
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            'upload-video-container': ''
                        }
                    ]
                },
                {
                    if: function (e) { return !isAlterOperation() },
                    then: {
                        'wf-button': ['视频', function (a) {
                            videoButton = a.container
                        }],
                        // click: uploadVideo
                        click: function (e) {
                            uploadVideo(e)
                        }
                    }
                },
                {'wf-button': '编辑', click: openeditor},
                {
                    e: 'wf-button',
                    a: {
                        class: 'message_send'
                    },
                    t: function () { return isAlterOperation() ? '提交' : '发送' },
                    // click: messageSend
                    click: function (e) {
                        // 按钮禁用
                        $(e.sender).addClass('wf-disable')
                        setTimeout(function () {
                            timer = null
                            if (isAlterOperation()) {
                                new wf.sns.MessageEditor(p.data.org_data, e.new_data).edit()
                                setTimeout(function () { $('popmask').remove() }, 500)
                                return
                            }
                            messageSend(e)
                        }, 300)


                    }
                },
                ],
                style: {
                    position: 'relative',
                    display: 'block'
                }
            }]
    })
    // 支持图片拖拽
    ImageFileUploadFun($(p.container).find('#image-file-upload'))
    //  支持视频拖拽
    videoFileUploadFileUpload($(p.container).find('#video-file-upload'))


    function openeditor(p) {
        wf.editor({
            content: p.new_data.wf_message_content,
            onclose: function (callbackdata) {
                // console.log({ callbackdata });  //不兼容ie
            },
            onsubmit: function (content) {

                $(p.sender).siblings('textarea').val(content)

            },
            messageSenderEle:true
        })
    }

    function messageSend(e) {
        let wfMessagesenderImg = $(e.sender).siblings('wf-messagesender-img')
        let uploadImageContainer = wfMessagesenderImg.find('upload-image-container')
        let uploadImgListItem = uploadImageContainer.find('.upload-img-list-item')
        let uploadImgListItemImg = uploadImgListItem.find('img')
        let uploadVideoContainer = uploadImageContainer.siblings('upload-video-container')
        let messageContent = $.trim(e.new_data.wf_message_content)

        if (messageContent == '') {
            //解禁禁用
            $(e.sender).removeClass('wf-disable')
            return  dialog.fail('发送消息失败,请输入内容')
        }
        //图片数组
        let imgArr = []

        uploadImgListItemImg.each(function (index, ele) {
            imgArr.push($(ele).attr('id'))
        })
        //视频

        let videoId = uploadVideoContainer.find('img').attr('name')
        // $('upload-video-container img').attr('name')


        // let videoPoster = $('upload-video-container img').attr('url')
        let videoPoster = uploadVideoContainer.find('img').attr('url')


        if (thirdCommentsType) {
            let commentData = {
                content: messageContent,
                url: allData.data.url,
                title: allData.data.title,
                description: allData.data.description,
                imageIds: imgArr,
                videoId: videoId,
                videoPoster: videoPoster
               
            }
            if (allData.data.periodicalIdentity) {
                let periodicalIdentity = eval('(' + allData.data.periodicalIdentity + ')')
                commentData.periodicalIdentity = periodicalIdentity
            }
            if (allData.data.icon !== '' && allData.data.icon !== null && allData.data.icon !== undefined) {
                commentData.iconUrl = allData.data.icon
            }
            if (allData.data.iconHref !== '' && allData.data.iconHref !== null && allData.data.iconHref !== undefined) {
                commentData.iconHref = allData.data.iconHref
            }
            if (allData.data.videoTitle !== '' && allData.data.videoTitle !== null && allData.data.videoTitle !== undefined) {
                commentData.videoTitle = allData.data.videoTitle
            }
            if (allData.data.videoUrl !== '' && allData.data.videoUrl !== null && allData.data.videoUrl !== undefined) {
                commentData.videoUrl = allData.data.videoUrl
            }
            if (allData.data.videoPoster !== '' && allData.data.videoPoster !== null && allData.data.videoPoster !== undefined) {
                commentData.videoPoster = allData.data.videoPoster
            }
            if (allData.data.audioUrl !== '' && allData.data.audioUrl !== null && allData.data.audioUrl !== undefined) {
                commentData.audioUrl = allData.data.audioUrl
            }
            
            //第三方评论
            commentSendPost(e, commentData)

        } else {
            //帖子发帖
            messageSendPost(e,
                {
                    content: messageContent,
                    imageIds: imgArr,
                    videoId: videoId,
                    videoPoster: videoPoster
                }
            )
        }


    }

    function messageSendPost(e, data) {
        wf.http.post(
            wf.apiServer() + '/sns/message_send', data,
            function (res) {
                //解禁禁用
                dialog.success('发送成功')
                $(e.sender).removeClass('wf-disable')
                if (res.data) {
                    //未登录
                    if (res.data.err_code === 404 && res.data.err_message === 'not login') {
                        let url = wf.getRelativeUrl()
                        window.location.href = wf.oauthServer() + '/login?redirectUri=' + encodeURIComponent(url)
                    }

                } else {
                    messageSendView(e, res)
                }
            },
            function (err) {
                //解禁禁用
                $(e.sender).removeClass('wf-disable')
                wf.error(err)
            }
        )
    }

    function commentSendPost(e, data) {
        let headers = {}
        if(allData.data.appKey){
            headers['X-Ca-AppKey'] =  allData.data.appKey
        }
        wf.http.post(
            {
                url:wf.apiServer() + '/sns/message_send',
                data:data,
                headers:headers,
            },
            function (res) {
                dialog.success('发送成功')
                //解禁禁用
                $(e.sender).removeClass('wf-disable')

                if (res.data) {
                    //未登录
                    if (res.data.err_code === 404 && res.data.err_message === 'not login') {
                        let url = wf.getRelativeUrl()
                        window.location.href = wf.oauthServer() + '/login?redirectUri=' + encodeURIComponent(url)

                    }

                } else {

                    var messageListEle = $(e.sender).parents('wf-comment').find('wf-sns').find('message-list')
                    var blockMessageHtml = '<message-detail></message-detail>'
                    commentOrTopicSendView(e, res, messageListEle, blockMessageHtml)

                }

            },
            function (err) {
                //解禁禁用
                $(e.sender).removeClass('wf-disable')
                wf.error(err)
            }
        )

    }

    function messageSendView(e, res) {


        if (!topicType) { //判断是不是话题页面的发帖
            //正常的发帖
            // 要出高亮的类名
            var wfSNSTabNavELe = $(e.sender).parents('wf-messagesender').siblings('tab').find('tab-nav')
            wfSNSTabNavELe.removeClass('active')
            $('sns-container').find('tab-nav').removeClass('active')

            $.each(wfSNSTabNavELe, function (i, item) {
                // 给帖子加上类名
                if ($(item).text() === '帖子') {
                    $(item).addClass('active')
                }

            })
            // 显示页面
            var wfContainerEle = $(e.sender).parents('wf-messagesender').siblings('sns-container').find('wf-sns')[0]

            wf.sns.timeline(wfContainerEle)
            $(e.sender).siblings('#wf-message-content').val('')
            //删除草稿
            localStorage.removeItem('publish_draft_'+uid)

            shutDownUploadImage($(e.sender).siblings('wf-messagesender-img').find('upload-image-container'))
            shutDownUploadVideo($(e.sender).siblings('wf-messagesender-img').find('upload-video-container'))

        } else {

            //发话题
            var messageListEle = $(e.sender).parents('wf-messagesender').siblings('message-list')
            var blockMessageHtml = '<message></message>'
            var topicVal = $(e.sender).parents('wf-sns').attr('topic') || $(e.sender).parents('wf-sns').attr('data-topic')
            commentOrTopicSendView(e, res, messageListEle, blockMessageHtml, topicVal)
        }
    }

    function commentOrTopicSendView(e, res, messageListEle, blockMessageHtml, topicVal) {
        res.message.loginUid  =  res.user.uid
        res.message.loginUserRole =  res.user.role
        if (res.message.forwardMessage) {
            res.message.forwardMessage.loginUid = res.uid
        }

        // var messageListEle = $(e.sender).parents('wf-comment').find('wf-sns').find('message-list')
        var blockMessageContainer
        //渲染装message的空盒子
        // var blockMessageHtml = '<message-detail></message-detail>'
        if(messageListEle.find('wf-p.nodata').length>0){
            messageListEle.find('wf-p.nodata').remove()
        }
        if (messageListEle.children().length > 0) {
            blockMessageContainer = messageListEle.children(':first')
            blockMessageContainer.before(blockMessageHtml)
        } else {
            messageListEle.append(blockMessageHtml)
        }
        blockMessageContainer = messageListEle.children(':first')
        if (topicType) {
            // thirdCommentsType  = true
            //在渲染更新帖子
            wf.sns.timeline.message({
                container: blockMessageContainer,
                data: res.message,
                thirdCommentsType: false// 不走第三方评论，贴子的呈现形式
            })

        } else {
            //在渲染更新帖子
            wf.sns.timeline.message({
                container: blockMessageContainer,
                data: res.message,
                thirdCommentsType: thirdCommentsType//第三方评论
            })

        }

        if (topicVal) {
            messageListEle.siblings('wf-messagesender').find('#wf-message-content').val(topicVal)
        } else {
            messageListEle.siblings('wf-messagesender').find('#wf-message-content').val('')
        }


        shutDownUploadImage(messageListEle.siblings('wf-messagesender').find('upload-image-container'))
        shutDownUploadVideo(messageListEle.siblings('wf-messagesender').find('upload-video-container'))
    }

    //用于图片点击按钮
    function uploadImage(e) {
        let imgBtn = $(e.sender)
        let imageFileUploadEle = imgBtn.siblings('#image-file-upload')
        let uploadImageContainer = imgBtn.siblings('upload-image-container')
        let uploadVideoContainer = uploadImageContainer.siblings('upload-video-container')
        let uploadImgListItem = uploadImageContainer.find('.upload-img-list-item')
        let imageNum = uploadImgListItem.length
        if (imageNum >= 1) {
            //已弹出上传图片容器，图片按钮不可点
            return
        }
        if (uploadVideoContainer.css('display') === 'block') {
            return
        }

        imageFileUploadEle.click()
        ImageFileUploadFun(imageFileUploadEle)
    }

    //用于图片容器内添加更多图片
    function uploadMoreImage(e) {

        let imgBtnAdd = $(e.sender)
        let uploadImageContainer = imgBtnAdd.parents('upload-image-container')
        // let uploadVideoContainer = uploadImageContainer.siblings('upload-video-container')
        let uploadImgListItem = uploadImageContainer.find('.upload-img-list-item')
        let imageFileUploadEle = uploadImageContainer.siblings('#image-file-upload')
        let imageNum = uploadImgListItem.length
        if (imageNum >= 9) {
            //已上传9张图片
            return
        }

        imageFileUploadEle.click()
        ImageFileUploadFun(imageFileUploadEle)

    }


    //关闭上传图片窗口
    function shutDownUploadImage(uploadImgContainerEle) {
        //清除已上传图片
        uploadImgContainerEle.find('.upload-img-list-item').remove()
        uploadImgContainerEle.css('display', 'none')
        //上传视频可用
        $(p.container).find('#video-file-upload').fileupload('enable')
        //若存在正在上传的图片 终止上传
        if (imageFileUpload) {
            imageFileUpload.abort()
        }
    }


    //关闭上传视频窗口
    function shutDownUploadVideo(uploadVideoContainerEle) {
        //清除已上传图片
        uploadVideoContainerEle.empty()
        uploadVideoContainerEle.css('display', 'none')
        //上传图片可用
        $(p.container).find('#image-file-upload').fileupload('enable')
        //若存在正在上传的视频 终止上传
        if (videoFileUpload) {
            videoFileUpload.abort()
        }
    }


    //删除上传的图片
    function deleteImage(e, uploadImageContainer) {
        $(e.sender).parent().remove()
        let uploadImgNum = uploadImageContainer.find('upload-img-num')
        let imageNum = uploadImageContainer.find('.upload-img-list-item').length
        uploadImgNum.text('共' + imageNum + '张，还能上传' + (9 - imageNum) + '张')

    }

    function uploadVideo(e) {

        let videoBtn = $(e.sender)
        let uploadVideoContainer = videoBtn.siblings('wf-messagesender-img').find('upload-video-container')
        let uploadImageContainer = uploadVideoContainer.siblings('upload-image-container')
        let videoFileUploadEle = uploadVideoContainer.siblings('#video-file-upload')

        if (uploadVideoContainer.css('display') === 'block') {
            return
        }
        let imageNum = uploadImageContainer.find('.upload-img-list-item').length
        if (imageNum >= 1) {
            //已上传图片，不能上传视频
            return
        }
        videoFileUploadEle.click()
        videoFileUploadFileUpload(videoFileUploadEle)
    }


    function ImageFileUploadFun(imageFileUploadEle) {

        let uploadImageContainer = imageFileUploadEle.siblings('upload-image-container')
        let uploadImgListButton = uploadImageContainer.find('.upload-img-list-button')
        let uploadImgNum = uploadImageContainer.find('upload-img-num')

        wf.sns.renderImagesContainerWithImages = function (uploadImgListButton, images) {
            images.forEach(function (image) {
                uploadImgListButton.before('<li class="upload-img-list-item"></li>')
                uploadImgListButton.prev().render([
                    {
                        e: 'img',
                        a: {
                            src: image.url + '?x-oss-process=image/resize,m_fill,h_84,w_84,limit_0',
                            id: image.name
                        }
                    },
                    {
                        'b': 'x',
                        //  click: deleteImage
                        click: function (e) {
                            deleteImage(e, $(e.sender).parents('upload-image-container'))
                        }
                    },
                    '<i></i>'
                ])
                let imageNum = uploadImageContainer.find('.upload-img-list-item').length
                uploadImgNum.text('共' + imageNum + '张，还能上传' + (9 - imageNum) + '张')
            })
        }

        wf.sns.renderVideosContainerWithImages = function (uploadVideoContainer, videoUrl, videoName) {
            uploadVideoContainer.find('.upload-schedule wf-p').text('视频上传成功！')
            uploadVideoContainer.render([
                {
                    'h4': '封面：'
                },
                {
                    e: 'img',
                    a: {
                        src: videoUrl + '?x-oss-process=video/snapshot,t_1000,f_jpg,w_160,h_90',
                        name: videoName
                    },
                    click: setVideoPoster
                },
                {
                    'h4': '点击封面图片可重新设置封面'
                }
            ])
        }


        imageFileUploadEle.fileupload({
            //支持拖拽上传
            dropZone: $(p.container).find('.image-dropzone'),
            'url': wf.snsServer() + '/message/uploadImage',
            xhrFields: {
                withCredentials: true
            },
            //按顺序上传
            sequentialUploads: true,
            //多个文件一起上传
            singleFileUploads: false,
            add: function (event, data) {
                let imageNum = uploadImageContainer.find('.upload-img-list-item').length
                let acceptFileTypes = /^gif|jpe?g|png$/i
                for (let i = 0; i < data.originalFiles.length; i++) {
                    let item = data.originalFiles[i]
                    let name = item.name
                    let index = name.lastIndexOf('.') + 1
                    let fileType = name.substring(index, name.length)
                    if (!acceptFileTypes.test(fileType)) {
                        return
                    }
                    //文件大小判断
                    if (item.size > (20 * 1024 * 1024)) {
                        dialog.fail('请上传小于20M的图片')
                        return
                    }
                    if (imageNum + 1 > 9) {
                        dialog.fail('最多上传9张图片')
                        return
                    }
                    imageNum++
                }
                //赋值 用于中止上传
                imageFileUpload = data.submit()
                //显示图片容器
                uploadImageContainer.css('display', 'block')
                //禁用上传视频
                $(p.container).find('#video-file-upload').fileupload('disable')
            },
            //每个文件之前会调用，未来可能会用到
            // submit:function (event, data) {
            //     console.log(data)
            // },
            done: function (event, data) {
                wf.sns.renderImagesContainerWithImages(uploadImgListButton, data.result.fileList)
            }
        })
    }


    function videoFileUploadFileUpload(videoFileUploadEle) {
        let uploadVideoContainer = videoFileUploadEle.siblings('upload-video-container')
        videoFileUploadEle.fileupload({
            //支持拖拽上传
            dropZone: $(p.container).find('.video-dropzone'),
            singleFileUploads: false,
            'url': wf.snsServer() + '/message/uploadVideo',
            xhrFields: {
                withCredentials: true
            },
            add: function (event, data) {

                let acceptFileTypes = /^3gp|flv|rmvb|mp4|wmv|avi|mkv|wav$/i
                let name = data.originalFiles[0]['name']
                let index = name.lastIndexOf('.') + 1
                let fileType = name.substring(index, name.length)
                if (!acceptFileTypes.test(fileType)) {
                    return
                }
                if (uploadVideoContainer.css('display') === 'block') {
                    return
                }
                videoFileUpload = data.submit()
                uploadVideoContainer.empty().render(
                    [
                        {
                            e: 'h4', class: 'upload-schedule',
                            t: [{'wf-p': '正在上传...'}, {
                                'i': 'x',
                                click: function (e) {
                                    shutDownUploadVideo($(e.sender).parents('upload-video-container'))
                                }

                            }]
                        }
                    ])
                uploadVideoContainer.css('display', 'block')
                //禁用上传图片
                $(p.container).find('#image-file-upload').fileupload('disable')
            },
            done: function (event, data) {
                // $('.upload-schedule wf-p').text('视频上传成功！')
                wf.sns.renderVideosContainerWithImages(uploadVideoContainer, data.result.url, data.result.name)
            },
            progressall: function (e, data) {
                let progress = parseInt(data.loaded / data.total * 100, 10)
                uploadVideoContainer.find('.upload-schedule wf-p').text('正在上传中，已上传：' + progress + '%')

            }
        })
    }


    function setVideoPoster(e) {

        let videoFileUploadEle = $(e.sender).parents('upload-video-container').siblings('#video-file-upload')
        videoFileUploadEle.attr('accept', 'image/*')
        videoFileUploadEle.fileupload({
            'url': wf.snsServer() + '/message/uploadVideoPoster',
            xhrFields: {
                withCredentials: true
            },
            formData: {name: $(e.sender).attr('name')},
            acceptFileTypes: /(\.|\/)(jpe?g|png)$/i,
            add: function (event, data) {
                // var acceptFileTypes = /^3gp|flv|rmvb|mp4|wmv|avi|mkv|wav$/i
                // acceptFileTypes = /^gif|jpe?g|png$/i
                var acceptFileTypes = /^jpe?g|png$/i
                var name = data.originalFiles[0]['name']
                var index = name.lastIndexOf('.') + 1
                var fileType = name.substring(index, name.length)
                if (!acceptFileTypes.test(fileType)) {
                    dialog.fail('请上传jpg、jpeg或png格式的文件')
                    return
                }
                data.submit()
            },
            done: function (event, data) {

                $(e.sender).attr('src', data.result.url + '?x-oss-process=image/resize,m_fill,h_90,w_160,limit_0')
                $(e.sender).attr('url', data.result.url)

            }
        })
        videoFileUploadEle.click()
        videoFileUploadEle.attr('accept', 'video/*')
    }
    function isAlterOperation() {
        return new wf.sns.MessageEditor(null, null).isAlterOperation(p.data.requestSource)
    }
}


//  jsbuilder/wf/sns/wf.sns.timeline/modules/wf.sns.timeline.clickCancelSetTop.js

/**
 * e:传入的数据
 */
 wf.sns.timeline.clickCancelSetTop= function (e) {
    let messageTopListEle =$(e.sender).parents('message-top-list')
    let messageListEle = messageTopListEle.siblings('message-list')
    let type
    if(e.org_data.view ==='topic'){
        type = 2
    }
    if(e.org_data.view ==='public'){
        type = 1
       
    }

    wf.http.post(
        wf.apiServer()  + '/sns/message_top_delete',
        {
            messageId : e.org_data.messageId,
            type: type,
            topic: e.org_data.topic
        },
        function(res) {
            dialog.success('移除置顶成功')
            wf.sns.timeline.loadsetTopMessage(e,messageListEle,messageTopListEle)
        },
        function(err){
            wf.error(err)
        }
    )
    
}

//  jsbuilder/wf/sns/wf.sns.timeline/modules/wf.sns.timeline.clickFavourite.js

/**
 * e:传入的数据
 */
wf.sns.timeline.clickFavourite = function (e) {
    let _sender = $(e.sender)
    let title = ''
    if(e.org_data.content){
        if(e.org_data.content.length>40){
            title =e.org_data.content
            title = title.substring(0,40)+'...'

        }else{
            title = e.org_data.content
        }

    }
    var apiUrl =  _sender.data('isfav') === '未收藏' ? wf.apiServer() + '/favourite/add' : wf.apiServer()  + '/favourite/delete'
    wf.http.post(apiUrl,
        {
            title:title,
            url: e.org_data.favourite ? e.org_data.favourite.url : wf.wfPubServer() +'/m/'+ e.org_data.messageId,
            messageId: e.org_data.messageId
        },
        function(result) {
            // 按钮禁用
            $(e.sender).removeClass('wf-disable')
          
            if(result.state === '已收藏') {
                dialog.success('收藏成功!')
                _sender.data('isfav','已收藏')
             
                _sender.find('img').attr('src',wf.comServer()+'/img/o-star.png')
             
                _sender.find('.fav-num').text('收藏('+result.collect_num+')')
              

            }else{
                dialog.success('取消收藏成功!')
                _sender.data('isfav','未收藏')
                _sender.find('img').attr('src',wf.comServer()+'/img/g-star.png')
                _sender.find('.fav-num').text('收藏('+result.collect_num+')')
            }
                
        },
        function(err){
            if(err.err_code ===  40002 ){
                let url = wf.getRelativeUrl()
                window.location.href = wf.oauthServer() + '/login?redirectUri=' + encodeURIComponent(url)
            }else{
                wf.error(err)
                }


          
        }
    )
}


//  jsbuilder/wf/sns/wf.sns.timeline/modules/wf.sns.timeline.clickPraise.js

/**
 * e:传入的数据
 */
wf.sns.timeline.clickPraise = function (e) {
    var apiUrl = $(e.sender).data('ispraise') === '未点赞' ? wf.apiServer() + '/sns/message_praise_add' : wf.apiServer()  + '/sns/message_praise_cancel'
    wf.http.post(apiUrl,
        {
            messageId : e.org_data.messageId
        },
        function(res) {
            // 按钮解禁
            $(e.sender).removeClass('wf-disable')

            if($(e.sender).data('ispraise') === '未点赞') {
                dialog.success('点赞成功!')
                $(e.sender).data('ispraise','已点赞')
                $(e.sender).find('img').attr('src',wf.comServer()+'/img/o-praise.png')
                // 获取点赞数量
                let praiseCount = $(e.sender).data('praisenum')
                praiseCount =  praiseCount + 1
                // 更新点赞数据
                $(e.sender).find('.praiseCount').text('赞('+ praiseCount+')')
                // 更新点赞自定义数据
                $(e.sender).data('praisenum',praiseCount)
            }else{
                dialog.success('取消点赞成功!')
                $(e.sender).data('ispraise','未点赞')
                $(e.sender).find('img').attr('src',wf.comServer()+'/img/g-praise.png')
                // 获取点赞数量
                let praiseCount = $(e.sender).data('praisenum')
                if (praiseCount>0){
                    praiseCount = parseInt(praiseCount -1)
                    // 更新点赞数据
                    $(e.sender).find('.praiseCount').text('赞('+ praiseCount+')')
                    // 更新点赞自定义数据
                    $(e.sender).data('praisenum',praiseCount)
                }
              
            }
        
         
         
                
        },
        function(err){
            if(err.err_code ===  40002 ){
                let url = wf.getRelativeUrl()
                window.location.href =  wf.oauthServer() + '/login?redirectUri=' +  encodeURIComponent(url)
            }else{
                wf.error(err)
            }


          
        }
    )
}


//  jsbuilder/wf/sns/wf.sns.timeline/modules/wf.sns.timeline.clickSetTop.js

/**
 * e:传入的数据
 */
 wf.sns.timeline.clickSetTop= function (e) {
     console.log(e)
    let messageListEle = $(e.sender).parents('message-list')
    let messageTopListEle = messageListEle.siblings('message-top-list')
    let type
    if(e.org_data.view ==='topic'){
        type = 2
    }
    if(e.org_data.view ==='public'){
        type = 1
       
    }
    wf.http.post(wf.apiServer() + '/sns/message_top_add',
        {
            messageId : e.org_data.messageId,
            type:type,
            topic: e.org_data.topic

        },
        function(res) {
            // 按钮解禁
            dialog.success('成功置顶')
         
            // 刷新页面
            wf.sns.timeline.loadsetTopMessage(e,messageListEle,messageTopListEle)
                   
                
        },
        function(err){
             wf.error(err)


          
        }
    )
}

//  jsbuilder/wf/sns/wf.sns.timeline/modules/wf.sns.timeline.comment.js

/**
 * p:传入的数据
 * renderEle：渲染节点
 */
wf.sns.timeline.commentMessage = function (p, renderEle) {
    //获取评论列表 
    var sendMessageCommentList = {}
    if(p.isreply){
        // 说明是回复评论
        sendMessageCommentList.commentId = p.org_data.commentId
    }else{
        // 说明是帖子评论
        sendMessageCommentList.messageId = p.org_data.messageId
    }
    wf.http.get(
        wf.apiServer() + '/sns/message_comment_list',
        sendMessageCommentList,
        function (res) {

            // 按钮解禁
            $(p.sender).removeClass('wf-disable')

            p.org_data.loginUid = res.uid
            p.org_data.commentList = res.comments
            p.org_data.minId = res.minId
            p.org_data.nextRecord = res.nextRecord
            renderComment(p, renderEle)

            // 加载更多逻辑处理 

            var messageListWrap = renderEle.find('message-list-wrap')
            var data = res
            data.messages =  res.comments
            wf.sns.timeline.loadmore(messageListWrap,data)

        },
        function (err) {
            console.log(err)
        }
    )

    const checkBoxId = 'forwards-after-commenting-'
    const nestedCheckBoxId = 'forwards-after-commenting-nested-'
    function renderComment (p, renderEle) {
        renderEle.empty().render({
            data: p.org_data,
            template: [{
                e: 'fieldset',
                a: {
                    'messageid': '[[messageId]]',
                    class: 'commentFiledset'
                },
                style: {
                    position: 'relative',
                    display: 'block'
                },
                t: [
                    {
                        e: 'legend',
                        t:function(){
                            let num
                            if(p.isreply){
                            // 说明是回复评论
                                num =  p.org_data.replyCount
                            }else{
                                num =  p.org_data.commentCount
                            }
                            return  p.org_data.commentList ? '当前已有<wf-span class="relayNum">'+num+'</wf-span>条评论' : '当前已有<wf-span class="relayNum">0</wf-span>条评论'

                        }

                    },
                    {
                        e: 'textarea-wrap',
                        t:
                    {
                        if: p.org_data.loginUid,
                        then: [
                            {
                                e: 'textarea',
                                a: {
                                    name: 'wf_message_content',
                                    
                                    placeholder:function(e){
                                        
                                        if(p.isreply){
                                            return '回复@'+e.data.user.nickname

                                        }else{
                                            return '请输入您的评论~'
                                        }
                                       

                                    }
                                },
                                event: wf.atHelper(),
                            },
                            {
                                e: 'message-handle',
                                t: [
                                    {
                                        e: 'input',
                                        a: {
                                            id: checkBoxId + p.org_data.messageId,
                                            type: 'checkbox'
                                        },
                                    },
                                    {
                                        e: 'label',
                                        a: {
                                            for: checkBoxId + p.org_data.messageId,
                                            style: 'text-align: center'
                                        },
                                        t: '同时转发'
                                    },
                                    {'wf-button': '编辑', click: openeditor},
                                    {
                                        e: 'wf-button',
                                        a: {
                                            datacomment: '',
                                        },
                                        t: '评论',
                                        click: function (e) {
                                            e.parents = $(e.sender).parents('fieldset')
                                            var messageId = $(e.sender).parents('fieldset').attr('messageid')
                                            // 按钮禁用
                                            $(e.sender).addClass('wf-disable')
                                            commentSubmit(e, messageId)
                                        }
                                    }
                                ]
                            }
                        ],
                        else: [
                            {
                                e: 'wf-no-login',
                                t: [
                                    {
                                        e: 'wf-span',
                                        t: '您当前未登录！'
                                    },
                                    {
                                        e: 'a',

                                        a: {
                                            href:function(e){

                                                //没登录
                                                let url
                                                // if(e.data.thirdMessage){
                                                //     url = e.data.thirdMessage.url ? e.data.thirdMessage.url :  window.loaction.href

                                                // }else{
                                                //     url =  window.loaction.href
                                                // }
                                                url = wf.getRelativeUrl()
                                                url = encodeURIComponent(url)


                                                return wf.oauthServer() + '/login?redirectUri=' + url
                                            }

                                        },
                                        t: '去登录',
                                    }
                                ]
                            }
                        ]
                    }
                    },
                    {
                        e: 'message-list-wrap',
                        t: [{
                            e: 'message-detail',
                            a: {
                                class: 'comment'
                            },
                            datapath: 'commentList',
                            t: [
                                function (e) {
                                    e.uid = p.org_data.loginUid
                                    renderCommentList(e, true)
                                }
                            ]
                        }]
                    },
                    {
                        e: 'wf-button',
                        a: {
                            'fromId': '[[minId]]',
                            'disable': 'false',
                            id:'more'

                        },
                        class: 'comment-more',
                        t: '点击加载更多...',
                        click: more
                    },
                ]
            }]
        })


    }


    function commentSubmit (e) {
        if (!$.trim(e.new_data.wf_message_content)) {
            //解禁禁用
            $(e.sender).removeClass('wf-disable')

            dialog.fail('评论内容不能为空哦~')
            return
        }
        var data, commentEle
        commentEle = $(e.sender).parents('fieldset').find('message-list-wrap')
        data = {
            messageId: e.org_data.messageId,
            content: e.new_data.wf_message_content,
        }

        if(p.isreply){
            // 说明是回复评论

            data.replyId = e.org_data.commentId
            data.content = '回复@'+e.org_data.user.nickname+':'+  data.content
        }
        wf.http.post(
            wf.apiServer() + '/sns/comment_send',
            data,
            function (result) {
                //解禁禁用
                dialog.success('评论成功!')
                $(e.sender).removeClass('wf-disable')
                $(e.sender).parents('message-handle').siblings('textarea').val('')
                var reqdata = {

                }

                if(p.isreply){
                    // 说明是回复评论

                    reqdata.commentId = result.replyId
                }else{
                    reqdata.messageId =  result.messageId
                }
                wf.http.get(
                    wf.apiServer() + '/sns/message_comment_list',
                    reqdata,
                    function (res) {
                        commentEle.empty().render({
                            data: res.comments,
                            template: [{
                                e: 'message-detail',
                                a: {
                                    class: 'comment'
                                },
                                t: [
                                    function (e) {
                                        e.uid = p.org_data.loginUid
                                        renderCommentList(e, true)
                                    }
                                ]
                            }]
                        })
                        changeCommentNum(e)

                        const wantToRelayingAfterCommenting = $('#' + checkBoxId + e.org_data.messageId).prop('checked')
                        if (wantToRelayingAfterCommenting) {
                            // e.new_data.wf_message_content = e.new_data.wf_message_content
                            //     + '//@' + e.org_data.user.nickname
                            //     + ':' + e.org_data.content
                            new wf.sns.timeline.CommentAndRelay(e, true).relay()
                        }

                        // 加载更多逻辑处理 
                        var data = res
                        data.messages =  res.comments
                        wf.sns.timeline.loadmore(commentEle,data)


                    },
                    function (err) {
                        console.log(err)
                    }
                )
            },
            function (err) {
                //解禁禁用
                $(e.sender).removeClass('wf-disable')
                wf.error(err)

            }
        )
    }

    function commentInSubmit (e, currentMessage) {
        if (!$.trim(e.new_data.wf_message_content)) {
            //解禁禁用
            $(e.sender).removeClass('wf-disable')
            dialog.fail('评论内容不能为空哦~~')
            return
        }
        var data
        if (e.org_data.commentId) {
            // commentEle = $(e.sender).parents('message-list-wrap')
            data = {
                messageId: e.org_data.messageId,
                content: '回复@'+e.org_data.user.nickname+':'+ e.new_data.wf_message_content,
                replyId: e.org_data.commentId
            }
        }
        wf.http.post(
            wf.apiServer() + '/sns/comment_send',
            data,
            function (resData) {
                //解禁禁用
                dialog.success('评论成功!')
                $(e.sender).removeClass('wf-disable')



                clickAfterCommentList(e, resData)
                changeCommentNum(e)

                // 评论后转发
                const wantToRelayingAfterCommenting = $('#' + nestedCheckBoxId + e.org_data.messageId).prop('checked')

                if (wantToRelayingAfterCommenting) {
                    // 注意: 以下操作中修改了变量e中属性 e.new_data.wf_message_content.
                    const comment = e.new_data.wf_message_content
                    const nickname = e.org_data.user.nickname
                    const colon = ':'
                    e.new_data.wf_message_content = getReplyTemplate(nickname) + comment
                        + '//@' + nickname + colon +  e.org_data.content
                        + '//@' + currentMessage.org_data.user.nickname + colon + currentMessage.org_data.content
                    new wf.sns.timeline.CommentAndRelay(e, false).relay()
                }
                function getReplyTemplate(nickname) {
                    if (!nickname) {
                        return ''
                    }
                    const colon = ':'
                    return '回复@' + nickname + colon
                }

                $(e.sender).parents('comment-from').remove()
            },
            function (err) {
                //解禁禁用
                $(e.sender).removeClass('wf-disable')
                wf.error(err)
            }
        )
    }


    //渲染评论列表
    function renderCommentList (e, typeIn) {

        $(e.container).render({
            data: e.data,
            template: [
                wf.sns.timeline.getAvatarImgSmallRenderTemplate(),
                {
                    e: 'message-body',
                    t: [
                        wf.sns.timeline.getNicknameRenderTemplate(),
                        
                        function(e){

                            e.data = e.data.user ? e.data.user : {}
                            wf.user.renderBadge(e)

                        },
                        {
                            e: 'create-time',
                            t: function (e) {
                                return  wf.replace.dateDiff(e.data.createTime)
                            }
                        },
                        function (e) {
                            wf.sns.timeline.getArticleRenderTemplate(e)
                        },
                        {
                            e: 'message-handle',
                            t: [{
                                if: function (e) {
                                    return e.data.user.uid === p.org_data.loginUid
                                },
                                then: {
                                    e: 'wf-button',
                                    class:'deleteStyleBtn',
                                    t: [
                                        {
                                            e: 'img',
                                            a: {
                                                src: function (e) {
                                                    return wf.comServer() + '/img/delete.png'
                                                }
                                            }

                                        },
                                        {
                                            e: 'wf-span',
                                            t:'删除'

                                        }
                                    ],
                                    click: function (e) {
                                        var reMoveEle = $(e.sender).closest('message-detail')
                                        wf.sns.timeline.deleteComment(e, reMoveEle)
                                    }
                                }
                            },
                            {
                                if: p.org_data.loginUid,
                                then: {
                                    e: 'wf-button',
                                    class:"commentStyleBtn",
                                    t: [
                                        {
                                            e: 'img',
                                            a: {
                                                src: function (e) {
                                                    return wf.comServer() + '/img/comment.png'
                                                }
                                            }

                                        },
                                        {
                                            e: 'wf-span',
                                            a: {
                                                class: 'commentBtnNum',
                                            },
                                            t:'评论'

                                        }
                                    ],
                                    click: function (e) {
                                        commentListSubmit(e, p)
                                    }
                                }
                            }
                            ]
                        },
                        {
                            if: (typeIn && e.data.replys !== null),
                            then: {
                                e: 'comment-list-in',
                                t: [
                                    function (e) {
                                        renderCommnetListIn(e)
                                    }
                                ]
                            }
                        }
                    ]
                },
            ]
        })


    }

    function renderCommnetListIn (e) {
        $(e.container).empty().render({
            data: e.data.replys,
            template: {
                e: 'message-detail',
                t: [
                    function (e) {
                        e.uid = p.org_data.loginUid
                        renderCommentList(e, false)
                    }
                ]
            }
        })
    }


    //改变评论的次数
    function changeCommentNum (e) {
        //里面评论列表的次数
        let relayNumEle = $(e.parents).find('.relayNum')
        let oldNum = parseInt(relayNumEle.text())
        let newNum = oldNum + 1
        relayNumEle.text(newNum)
        //外层数量改变
        let commentButtonEle = $(e.parents).parents('message-handle-list').siblings('message-handle').find('.commentBtn')
       
        let commentButtonNumEle = commentButtonEle.find('.commentBtnNum')
        commentButtonNumEle.text('评论(' + newNum + ')')
    }

    //评论列表中的评论提交
    function commentListSubmit (e, currentMessage) {
        //点击评论渲染评论内容排他操作，只出现一个评论框 
        var messageDetailEle = $(e.sender).parents('message-detail')
        var siblingsCommentFrom = messageDetailEle.siblings('message-detail').find('comment-from')
        siblingsCommentFrom.remove()
        var commentMessage = $(e.sender).parents('message-handle')
        var commentListIn = commentMessage.siblings('comment-list-in')
        if(commentListIn.length>0){
            commentListIn.find('comment-from').remove()
        }else{
            commentListIn = commentMessage.parents('comment-list-in')
            commentListIn.siblings('message-handle').find('comment-from').remove()
        }

        var commentFrom = commentMessage.find('comment-from')
        if (commentFrom.length > 0) {
            commentFrom.remove()
        } else {
            commentMessage.render({
                data: e.org_data,
                template: {
                    e: 'comment-from',
                    style: {
                        position: 'relative',
                        display: 'block'
                    },
                    t: [{
                        e: 'textarea',
                        a: {
                            name: 'wf_message_content',
                            placeholder: '回复@[[user/nickname]]'
                        },
                        event: wf.atHelper(),
                    },
                    {
                        e: 'message-handle',
                        t: [
                            {
                                e: 'input',
                                a: {
                                    id: nestedCheckBoxId + p.org_data.messageId,
                                    type: 'checkbox'
                                },
                            },
                            {
                                e: 'label',
                                a: {
                                    for: nestedCheckBoxId + p.org_data.messageId,
                                    style: 'text-align: center'
                                },
                                t: '同时转发'
                            },
                            { 'wf-button': '编辑', click: openeditor },
                            {
                                e: 'wf-button',
                                a: {
                                    datacomment: '',
                                    // class: 'commentBtn'
                                },
                                t: '评论',
                                click: function (e) {
                                    e.parents = $(e.sender).parents('fieldset')
                                    e.org_data.messageId = $(e.sender).parents('fieldset').attr('messageid')
                                    // 按钮禁用
                                    $(e.sender).addClass('wf-disable')
                                    commentInSubmit(e, currentMessage)
                                }
                            }
                        ]
                    }
                    ]
                }
            })
        }
        var commentId = e.org_data.commentId
        $(e.sender).parents('message-body').find('comment-from wf-button').attr('datacomment', commentId)
    }

    //更新回复评论后的内容
    function clickAfterCommentList (e, res) {

        let p = {}
        let commentDiv = $(e.sender).parents('.comment').find('comment-list-in:first')
        let blockHtml = '<message-detail><message-detail>'
        let listIn = '<comment-list-in><message-detail><message-detail><comment-list-in>'
        //在渲染一个空盒子 (备注：因为用render方法渲染是后渲染，所以给个空盒子预留)
        if (commentDiv.length > 0) {
            commentDiv.prepend(blockHtml)
        } else {
            $(e.sender).closest('message-body').append(listIn)
        }
        //在重新获取一下空的元素
        commentItem = $(e.sender).parents('.comment').find('comment-list-in:first').find('message-detail')
        p.data = res.comment
        p.container = commentItem
        p.data.user = res.comment.user

        //渲染新加评论的列表
        renderCommentList(p, false)
    }

    //分页功能
    function more (p) {
        let fromId = p.sender.getAttribute('fromId')
        wf.http.get(
            wf.apiServer() + '/sns/message_comment_list', {
                messageId: p.org_data.messageId,
                fromId: fromId
            },
            function (res) {
                //重新设置按钮的fromId
                $(p.sender).attr('fromId', res.minId)
                $.each(res.comments, function (i, item) {
                    item.loginUid = res.uid
                })
                let messageListEle = $(p.sender).siblings('message-list-wrap')
                if (res.comments) {
                    messageListEle.render({
                        data: res.comments,
                        template: [{
                            e: 'message-detail',
                            a: { class: 'comment' },
                            t: [
                                function (e) {
                                    renderCommentList(e, true)
                                }
                            ]
                        }]
                    })
                }

                // 加载更多逻辑处理 
                var data = res
                data.messages =  res.comments
                wf.sns.timeline.loadmore( messageListEle,data)
            },
            function (err) {
                console.log(err)
            }
        )
    }

    function openeditor (p) {
        wf.editor({
            content: p.new_data.wf_message_content,
            onclose: function (callbackdata) {
                //console.log({ callbackdata});  // 不兼容ie
                console.log({ callbackdata: callbackdata }) //
            },
            onsubmit: function (content) { $(p.sender).parents('message-handle').siblings('textarea').val(content) },
        })
    }

}


//  jsbuilder/wf/sns/wf.sns.timeline/modules/wf.sns.timeline.deletecomment.js

//删除帖子
wf.sns.timeline.deleteComment = function (e, reMoveEle) {
    dialog.sendDialog({
        title:'删除评论',
        content:'您确定要删除这条评论吗？',
        button:['取消','确定'],
        },
        function(){

        },
        function(){
            wf.http.get(
                wf.apiServer() + '/sns/message_comment_delete', {
                commentId: e.org_data.commentId
            },
                function (res) {
    
                    //评论次数减一
                    var NumEle = $(e.sender).parents('.commentFiledset').find('.relayNum')
                    var oldNum = NumEle.text()
                    var newNum = parseInt(oldNum) - 1 > 0 ? parseInt(oldNum) - 1 : 0
                    NumEle.text(newNum)
                    //最外面评论按钮的次数也改变
                    var  commentButtonEle= $(e.sender).parents('message-handle-list').siblings('message-handle').find('.commentBtn')
                   
                    let commentButtonNumEle = commentButtonEle.find('.commentBtnNum')
                    commentButtonNumEle.text('评论(' + newNum + ')')
                    
                    reMoveEle.remove()
                },
                function (err) {
                    wf.error(err)
                }
            )
    })
   




}

//  jsbuilder/wf/sns/wf.sns.timeline/modules/wf.sns.timeline.deletemessage.js

/**
 * 删除帖子
 *  e:传入的数据
 * reMoveEle：删除节点
 * opendetail：区别是(在帖子详情蒙版 false)上还是(本地帖子 true)
 */
wf.sns.timeline.deleteMessage = function(e, reMoveEle, opendetail) {
    dialog.sendDialog({
        title:'删除消息',
        content:'您确定要删除这条消息吗？',
        button:['取消','确定'],
        },
        function(){

        },
        function(){
           
            wf.http.get(
                wf.apiServer() + '/sns/message_delete', {
                    messageId: e.org_data.messageId
                },
                function(res) {
                   
                    //转发次数减一
                    var NumEle = $(e.sender).parents('message-list-wrap').siblings('legend').find('.relayNum')
                    var oldNum = NumEle.text()
                    var newNum = parseInt(oldNum) - 1
                    NumEle.text(newNum)
                    //最外面转发按钮的次数也改变
                    var relayButton = $(e.sender).parents('message-handle-list').siblings('message-handle').find('.relayButton')
                    let relayButtonNumEle =  relayButton.find('.relayButtonNum')
                    relayButtonNumEle.text('转发(' + newNum + ')')
                    //删除页面元素
                    if (!opendetail) {
                        //刷新页面
                        if($('sns-container').length>0){
                            //帖子
                            wf.sns.timeline($('sns-container').find('wf-sns')[0])
                        }else{
                            //第三方评论
                            $(document).comment()
    
                        }
                       
                        
                        reMoveEle.remove()
                    } else {
                        reMoveEle.remove()
                    }
                },
                function(err) {
                   
                    wf.error(err)
                }
            )
    })
}

//  jsbuilder/wf/sns/wf.sns.timeline/modules/wf.sns.timeline.forward.js

wf.sns.timeline.forward = function (p, opendetail) {
    $(p.container).render({
        data: p.data,
        template: {
            e: 'forward-message',
            t: [{
                if: p.data.forwardMessage,
                then: {
                    e: 'message-body',
                    datapath: 'forwardMessage',
                    t: [
                       
                        {
                            e:'wf-user',
                            a:{
                                class:'avatar',
                                'data-nickname':'[[user/nickname]]',
                               
                            },
                            t:'@[[user/nickname]]',
                            click:function(e){
                                window.open(wf.wfPubServer()+'/u/'+e.org_data.user.nickname)
                            }

                        },
                        {
                            e: 'create-time',
                            t: function (e) {
                                return  wf.replace.dateDiff(e.data.createTime)
                            },
                            click: function (e) {
                                if(e.org_data.loginUid){
                                    //登录
                                    // if (opendetail) wf.sns.timeline.relayDetailed(e)
                                    // console.log(opendetail)
                                    if (opendetail) {
                                        window.open(wf.wfPubServer()+'/m/'+e.org_data.messageId)
                                        
                                    }
                                }else{
                                    //没登录
                                    
                                    let url = wf.getRelativeUrl()
                                    window.location.href =wf.oauthServer() + '/login?redirectUri=' + encodeURIComponent(url);
                                   
                                }



                            }
                        },
                        // 渲染精选标识
                        renderExcellentImgStrategy,
                        // function (e) {
                        //     //  @替换  
                        //     wf.sns.timeline.wfArticle(e)
                        //     //return '<wf-article>' + wf.replace.all(e.data.content) + '</wf-article>'
                        //     // $(e.container).append('<wf-article>' + wf.replace.all(e.data.content) + '</wf-article>')
                        //     // 调用mermaid渲染图

                        //     mermaid.init(undefined, $('div.mermaid', e.container))
                        //     // 调用MathJax渲染公式
                        //     // MathJax.typeset()
                        //     // MathJax.typeset([e.container])
                        //     // 调用MathJax渲染公式
                        //     if (MathJax.typesetPromise) MathJax.typesetPromise([e.container])
                        //     wf.functionPlot(e.container)
                        //     // renderMathInElement(e.container, {
                        //     //     delimiters: [
                        //     //         { left: "$$", right: "$$", display: true },
                        //     //         { left: "$", right: "$", display: false }
                        //     //     ]
                        //     // });
                        // },
                        function(e){
                            wf.sns.timeline.getArticleRenderTemplate(e)
                        },
                        {
                            if: 'imageId',
                            then: wf.sns.timeline.imagepart
                        },
                        {
                            if: 'video',
                            then: {
                                video: '',
                                a: {
                                    src: wf.snsOssServer()+'/'+'[[video/id]]',
                                    controls: 'controls',
                                    poster:function (e) {
                                        if (e.data.video.poster){
                                            return e.data.video.poster
                                        }else {
                                            return wf.snsOssServer()+'/'+e.data.video.id+'?x-oss-process=video/snapshot,t_1000,f_jpg,w_800,h_400'
                                        }
                                    }
                                },
                                style: {
                                    width: '100%'
                                }
                            }
                        },
                        {
                            if: 'thirdMessageId',
                            then:wf.sns.timeline.thirdMessage
                        }
                    ]
                },
                else:{
                    e:'message-body',
                    t:'原帖已删除'
                } 
            },
            {
                e: 'message-handle',
                // e: 'div',
                // class: 'forwardHandle',
                t: {
                    if: p.data.forwardMessage,
                    then: [
                        
                        {
                            e: 'wf-button',
                            a: {
                                class: 'relayButton relayStyleBtn',
                            },
                            t:[
                                {
                                    e: 'img',
                                   
                                    a: {
                                        src: function (e) {
                                            return wf.comServer() + '/img/replay.png'
                                        }
                                    }

                                },
                                {
                                    e: 'wf-span',
                                    a: {
                                        class: 'relayButtonNum',
                                    },
                                    t:'转发([[forwardMessage/forwardCount]])'

                                }

                            ],
                            click: function (e) {
                            //重新复制org_data
                                var renderEle = $(e.sender).parent('message-handle').siblings('message-handle-list')
                                e.org_data = e.org_data.forwardMessage
                                if (renderEle.children('.relayFiledset').length > 0) {
                                    renderEle.empty()
                                } else {
                                    // 禁用按钮
                                    $(e.sender).addClass('wf-disable')
                                    wf.sns.timeline.relayMessage(e, renderEle, opendetail)
                                }

                            }
                        },
                        {
                            e: 'wf-button',
                            a: {
                                class: 'commentBtn commentStyleBtn',
                            },
                            t: [
                                
                                {
                                    e: 'img',
                                    a: {
                                        src: function (e) {
                                            return wf.comServer() + '/img/comment.png'
                                        }
                                    }

                                },
                                {
                                    e: 'wf-span',
                                    a: {
                                        class: 'commentBtnNum',
                                    },
                                    t:'评论([[forwardMessage/commentCount]])'

                                }
                            ],

                            click: function (e) {
                                var renderEle = $(e.sender).parent('message-handle').siblings('message-handle-list')
                                e.org_data = e.org_data.forwardMessage
                                if (renderEle.find('.commentFiledset').length > 0) {
                                    renderEle.empty()
                                } else {
                                    $(e.sender).addClass('wf-disable')
                                    wf.sns.timeline.commentMessage(e, renderEle)
                                }

                            }

                        },
                        // {
                        //     e: 'wf-button',
                        //     t: '分享',
                        //     click: function (p) {
                        //         //保持格式一致
                        //         var forwardMessage = p.org_data.forwardMessage
                        //         p.org_data = forwardMessage
                        //         wf.sns.timeline.share(p)
                                
                               
    
                        //     }
                           
                        // }
                        // function(e){
                            
                        //     // 保持格式一致
                        //     var forwardMessage = e.data.forwardMessage
                        //     e.data = forwardMessage
                        //     // 微博分享
                        //     wf.sns.timeline.weiboShare(e)
                        //     // 微信分享
                        //     wf.sns.timeline.wexiShare(e)

                        // }
                        {
                            e: 'wf-button',
                            a: {
                                class: 'favouriteBtn',
                                'data-isfav':function(e){
                                    if(e.data.forwardMessage.favourite){
                                        
                                        return e.data.forwardMessage.favourite.state
                                    }else{
                                        return '未收藏'
                                    }
                                }
                            },
                            t:[
                                {
                                    e:'img',
                                   
                                    a:{
                                        src:function(e){
                                            
                                            if(e.data.forwardMessage.favourite){
                                                if( e.data.forwardMessage.favourite.state === '未收藏'){
                                                    return wf.comServer()+'/img/g-star.png'
                                                }else{
                                                    return wf.comServer()+'/img/o-star.png'
                                                }
                                                
                                            }else{
                                                return wf.comServer()+'/img/g-star.png'
                                            }
                                        }
                                    }
                                    
                                },
                                {
                                    e:'wf-span',
                                    a:{
                                        class:'fav-num',
                                    },
                                    t:function(e){
                                        if(e.data.forwardMessage.favourite){
                                            return e.data.forwardMessage.favourite.collect_num ? '收藏('+e.data.forwardMessage.favourite.collect_num+')' : '收藏(0)'
                                        }else{
                                            return '收藏(0)'
                                        }

                                    }

                                }
                            ],
                            click: function (e) {
                              
                                // 收藏功能

                                // 按钮禁用
                                $(e.sender).addClass('wf-disable')
                                e.org_data = e.org_data.forwardMessage
                                wf.sns.timeline.clickFavourite(e)
                            }
                        },
                        {
                            e: 'wf-button',
                            a: {
                                class: 'praiseBtn',
                                'data-ispraise':function(e){
                                  
                                    
                                    if(e.data.forwardMessage){
                                        if(e.data.forwardMessage.praiseType){
                                            return '已点赞'
                                        }else{
                                            return '未点赞'
                                        }
                                    }else{
                                        return '未点赞'
                                    }
                                    
                                    
                                },
                                'data-praisenum':'[[forwardMessage/praiseCount]]'
                            },
                            t:[
                                {
                                    e:'img',
                                   
                                    a:{
                                        src:function(e){
                                            
                                            if(e.data.forwardMessage.praiseType){
                                                if( e.data.forwardMessage.praiseType === '已点赞'){
                                                    return  wf.comServer()+'/img/o-praise.png'
                                                }else{
                                                    return  wf.comServer()+'/img/g-praise.png'
                                                }
                                                
                                            }else{
                                                return  wf.comServer()+'/img/g-praise.png'
                                            }
                                        }
                                    }
                                    
                                },
                                {
                                    e:'wf-span',
                                    class:'praiseCount',
                                    t:'赞([[forwardMessage/praiseCount]])'
                                }
                            ],
                            click: function (e) {
                                // 点赞功能

                                // 按钮禁用
                                $(e.sender).addClass('wf-disable')
                                
                                e.org_data = e.org_data.forwardMessage
                                wf.sns.timeline.clickPraise(e)
                            }
                        },
                    
                    ]
                }

            },
            {
                // e: 'form',
                // class: 'messageHandleForm'
                e: 'message-handle-list'
            }
            ],

        }
    })

}


//  jsbuilder/wf/sns/wf.sns.timeline/modules/wf.sns.timeline.getArticRenderTemplate.js

// 所需参数
// {
//     data:{}数据
//     contanier:元素
// }
wf.sns.timeline.getArticleRenderTemplate = function (e) {
   
   
    if (e.data && e.data.content !== null) {
        // @替换
        wf.sns.timeline.wfArticle(e)
       

        //加判断是因为数据为空 ，wf.replace.all 报错wf.js:278 Uncaught TypeError: Cannot read property 'replace' of null
        // $(e.container).append('<wf-article>' + wf.replace.all(e.data.content) + '</wf-article>')
        // // 调用mermaid渲染图
        // if($(e.container).find('div.mermaid').length>0){
        //     mermaid.init(undefined, $('div.mermaid', e.container))
        // }
        // // 调用MathJax渲染公式
        // if (MathJax.typesetPromise) MathJax.typesetPromise([e.container])
            
        // if($(e.container).find('div.functionPlot').length>0){
        //     wf.functionPlot(e.container)
        // }

    }
   
   
    
  
    
}

//  jsbuilder/wf/sns/wf.sns.timeline/modules/wf.sns.timeline.getFavouriteData.js

// 获取收藏数据，渲染内容
// data 必传 数据
// renderTemplate 必传 渲染帖子模板的函数
// renderEle  必传 渲染帖子的容器
// renderEle  必传 渲染帖子的容器
// isSetTop  选传  不传是帖子信息，传了yes是置顶帖子信息
wf.sns.timeline.getFavouriteData = function (data,renderTemplate,renderEle,isSetTop) {
    let parmMessage 
    if(isSetTop === 'yes'){
        parmMessage =data.topMessages
        if( parmMessage.length>0){
            renderEle.show()
        }else{
            renderEle.hide()
        }
    }else{
        parmMessage =data.messages
    }
    const urlArr = wf.sns.timeline.buildQueryParametersOfFavourite(parmMessage)
    if(parmMessage  &&  parmMessage.length>0){
        wf.http.post(
            wf.apiServer() + '/favourite/statistic_mul',
            urlArr,
            function(result) {
                wf.sns.timeline.populateFavouriteAndPraiseToMessages(result, data,isSetTop)
                renderEle.siblings('wf-button#more').hide()
                // 渲染帖子
                renderTemplate(renderEle,data)
            },function(err){
                console.log(err)
            }
        )
    }else{
        if(isSetTop !== 'yes'){
            // 区分评论组件还是普通帖子
            if(!data.thirdCommentsType){
                renderEle.siblings('wf-button#more').hide()
                renderEle.render({
                    data: {},
                    template:'<wf-p class="nodata">暂无数据</wf-p>'
                })
            }

        }
       

    }
}

wf.sns.timeline.buildQueryParametersOfFavourite = function (messages) {
    // 请求收藏状态
    const results = []
    $.each(messages, function (i, ele) {
        results.push({url: wf.wfPubServer() + '/m/' + ele.messageId})
        if (ele.forwardMessage) {
            var isForwardMessageId = results.indexOf({url: wf.wfPubServer() + '/m/' + ele.forwardMessage.messageId})
            if (isForwardMessageId === -1) {
                // 不存在
                results.push({url: wf.wfPubServer() + '/m/' + ele.forwardMessage.messageId})
            }
        }
    })
    return results
}

wf.sns.timeline.populateFavouriteAndPraiseToMessages = function (apiPayload, data,isSetTop) {
    let parmMessage 
    if(isSetTop === 'yes'){
        
        parmMessage =data.topMessages
    }else{
        parmMessage =data.messages
    }
    $.each(apiPayload, function (j, item) {
        var favUrl = apiPayload[j].url
        var favUrlMesId = parseInt(favUrl.split('/m/')[1])

        $.each(parmMessage, function (i, ele) {
            // 置顶消息
            if(isSetTop === 'yes'){
                ele.setTopType = 'true'
            }else{
                ele.setTopType = 'false'
            }
            ele.view = data.view
            if(data.topic){
                ele.topic = data.topic 
            }
            //把当前登录用户信息存在每个message里面
            if (data.user) {
                ele.loginUid = data.user.uid
                ele.loginUserRole = data.user.role

            }
            if (ele.messageId === favUrlMesId) {
                // 整合message收藏信息
                ele.favourite = apiPayload[j]
            }
            if (ele.forwardMessage) {
                //把当前登录用户信息存在每个message里面
                if (data.user) {
                    ele.forwardMessage.loginUid = data.user.uid     
                }
                if (ele.forwardMessage.messageId) {
                    // 整合forwardMessage收藏信息
                    if (ele.forwardMessage.messageId === favUrlMesId) {
                        ele.forwardMessage.favourite = apiPayload[j]
                    }

                }

            }
            // 整合点赞数据
            if (data.praiseMessages) {
                var isPraiseFlag = -1
                if (ele.messageId) {
                    isPraiseFlag = data.praiseMessages.indexOf(ele.messageId)

                    if (isPraiseFlag !== -1) {
                        ele.praiseType = '已点赞'
                        // 重置默认状态
                        isPraiseFlag = -1
                    }
                }
                if (ele.forwardMessage) {

                    isPraiseFlag = data.praiseMessages.indexOf(ele.forwardMessage.messageId)
                    if (isPraiseFlag !== -1) {
                        ele.forwardMessage.praiseType = '已点赞'
                        // 重置默认状态
                        isPraiseFlag = -1
                    }
                }
            }
        })
    })
}



//  jsbuilder/wf/sns/wf.sns.timeline/modules/wf.sns.timeline.imagepart.js

wf.sns.timeline.imagepart = function (p) {

    let template_image = [
        {
            e: 'message-item-imgshow',
            t: [
                {
                    e: 'imgshow-max',
                    t: [
                        {
                            e: 'imgshow-pev',
                            //click: switchPevImg,
                            class: 'switchBig',
                        },
                        {
                            e: 'img',
                            //click: showMinImg,
                        },
                        {
                            e: 'imgshow-next',
                            //click: switchNextImg,
                            class: 'switchBig',
                        },
                    ]
                },
                {
                    e: 'imgshow-min-ul',
                    class: 'clearfix',
                    t:
                        {
                            e: 'imgshow-min-li',
                            datapath: 'imageId',
                            //click: switchBelowImg,
                            t: [
                                '<img data-original="' + wf.snsOssServer() + '/[[.]]" ' +
                                'class="hide" src="' + wf.snsOssServer() + '/[[.]]?x-oss-process=image/resize,m_fill,h_130,w_130,limit_0"/>',
                                '<showimg class="hide"></showimg>'
                            ]
                        }
                }
            ]

        },
        {
            e: 'img-item-ul',
            class: 'clearfix',
            style: {display: 'inline-block'},
            t:
                {
                    e: 'img-item-li',
                    style: {width: '130px;', height: '130px;'},
                    datapath: 'imageId',
                    //click: showMaxImg,
                    t: '<img data-original="' + wf.snsOssServer() + '/[[.]]?x-oss-process=image/auto-orient,1"' +
                        'src="' + wf.snsOssServer() + '/[[.]]?x-oss-process=image/resize,m_fill,h_130,w_130,limit_0" >'
                }
        }
    ]

    /* //放大图片
    function showMaxImg(e) {
        replaceBigImg(e.org_data)
        $(p.container).children('img-item-ul').css('display', 'none')
        $(p.container).children('message-item-imgshow').css('display', 'inline-block')
    }

    //缩小图片
    function showMinImg() {
        $(p.container).children('img-item-ul').css('display', 'inline-block')
        $(p.container).children('message-item-imgshow').css('display', 'none')
    }

    //底部切换图片
    function switchBelowImg(e) {
        let imageId = e.org_data
        replaceBigImg(imageId)
    }

    //上一张
    function switchPevImg(e) {
        let currentImageId = $(e.sender).siblings('img').attr('data-imgId')
        let index = e.org_data.imageId.indexOf(currentImageId)
        //第一张不需要向前切换图片
        if (index <= 0) {
            return
        }
        let pevImageId = e.org_data.imageId[index - 1]
        replaceBigImg(pevImageId)

    }

    ////下一张
    function switchNextImg(e) {
        let currentImageId = $(e.sender).siblings('img').attr('data-imgId')
        let index = e.org_data.imageId.indexOf(currentImageId)
        //最后一张不需要向后切换图片
        if (index + 1 >= e.org_data.imageId.length) {
            return
        }
        let nextImageId = e.org_data.imageId[index + 1]
        replaceBigImg(nextImageId)
    }


    function replaceBigImg(imageId) {
        //底部高亮
        let index = p.data.imageId.indexOf(imageId)
        $(p.container).children('message-item-imgshow').find('imgshow-min-ul imgshow-min-li').eq(index).find('showimg').removeClass('hide').addClass('show')
        $(p.container).children('message-item-imgshow').find('imgshow-min-ul imgshow-min-li').eq(index).siblings('imgshow-min-li').find('showimg').removeClass('show').addClass('hide')
        //替换图片
        let url = wf.snsOssServer() + '/' + imageId + '?x-oss-process=image/resize,w_600'
        $(p.container).children('message-item-imgshow').children('imgshow-max').find('img').attr('src', url)
        $(p.container).children('message-item-imgshow').children('imgshow-max').find('img').attr('data-imgId', imageId)

    }
*/


    $(p.container).render({
        data: p.data,
        template: template_image,
    })


    $(p.container).children('img-item-ul').viewer({
        url: 'data-original',
        title:false,
        toolbar: {
            zoomIn: true,
            zoomOut: true,
            oneToOne: false,
            reset: true,
            prev: true,
            play: {
                show: false,
                size: 'large'
            },
            next: true,
            rotateLeft: true,
            rotateRight: true,
            flipHorizontal: true,
            flipVertical: true
        }
    })

}



//  jsbuilder/wf/sns/wf.sns.timeline/modules/wf.sns.timeline.loadSetTopMessage.js

/**
 * 删除帖子
 *  e:传入的数据
 * messageListEle：消息容器
 * messageTopListEle：置顶消息容器
 */
 wf.sns.timeline.loadsetTopMessage = function(e,messageListEle,messageTopListEle) {
     
    let loadingType = false // 懒加载只发一次请求的标识
    let nextRecord = 0 // 懒加载下一个记录的条数
    let dynamicScroll = 0 //动态的滚动条蜷曲的高度
    let button_more = messageTopListEle.siblings('wf-button')
    messageListEle.empty()
    messageTopListEle.empty()
    // 清空formId的值
    button_more.attr('fromId', '')
    // 初始化函数
    loaddata(null)
    function loaddata(formId){
        let reqData = {}
        let reqUrl = ''
        if(e.org_data.view ==='topic'){
            reqUrl = wf.apiServer() + '/sns/message_topic'
            reqData.topic = e.org_data.topic ? e.org_data.topic : null
        }
        if(e.org_data.view ==='public'){
            reqUrl = wf.apiServer() + '/sns/message_public'
        }
        if(formId){
            reaData.fromId =formId
        }

        wf.http.get( reqUrl,reqData,
        function(data) {
                    if(e.org_data.view ==='topic'){
                        data.view = 'topic' //用于区分tab用不用包含置顶
                    }
                    if(e.org_data.view ==='public'){
                        data.view = 'public' //用于区分tab用不用包含置顶
                    }
                   
                    
                   if(data.topMessages){
                    // 获取收藏数据，渲染内容 
                       wf.sns.timeline.getFavouriteData(data,renderMessageTopList,messageTopListEle,'yes')
                    }
                   
            
                    // 获取收藏数据，渲染内容 
                    wf.sns.timeline.getFavouriteData(data,render_messagelist,messageListEle)
                    button_more.attr('fromId', data.minId)
                    button_more.attr('disable', false)
                    loadingType = false
                    nextRecord =data.nextRecord
                    // 懒加载
                    wf.sns.lazyload(loaddata,loadingType,nextRecord,dynamicScroll,data.minId)
            },
            function(err) {
                button_more.attr('disable', false)
        })
    }
   

    // 渲染消息列表
    function render_messagelist(renEle,data) {
        if (data.messages) { 
            getMessagesArr(0)//开始调用渲染帖子信息
            $("wf-button#more").hide(); 
            // 加载更多判断显示隐藏
            wf.sns.timeline.loadmore(renEle,data)
        }
        // 渲染帖子信息
        function getMessagesArr(i) {
        　　var messagesArr=data.messages
    　　　　if ( i < messagesArr.length ) { 　
                renEle.render({
                    data:messagesArr[i],
                    template: { e: "message", t: wf.sns.timeline.message }
                });
                setTimer = setTimeout(function(){ 
                    i++;
                    getMessagesArr(i)
                }, 0);
        　　}
        }
    }
    function renderMessageTopList(renEle,data){
       
        renEle.render({
            data:{},
            template:[
                {
                    e:'set-top-tag',
                    t:'置顶'
                }
            ] 
        });
        renEle.render({
            data:data.topMessages,
            template:[
                { e: "message", t: wf.sns.timeline.message }
            ] 
        });
    }

 }

//  jsbuilder/wf/sns/wf.sns.timeline/modules/wf.sns.timeline.loadmore.js

// messageListEle 元素 必传
// data 必传 data 中需要有 minId 和 remainRecord 和 messages
wf.sns.timeline.loadmore = function (messageListEle,data) {
    
    var  moreEle = messageListEle.siblings('wf-button')
    if (data.minId) moreEle.attr('fromId', data.minId)
    if(data.nextRecord && data.nextRecord>0&& data.messages!==null ){
        moreEle.show()
    }else{
        moreEle.hide()
    }
}


//  jsbuilder/wf/sns/wf.sns.timeline/modules/wf.sns.timeline.message.js

/**
 * 这个函数里首先定义了一组函数, 然后是函数调用. 如果阅读者只关心渲染逻辑的调用点,
 * 滚动到此函数的末尾即可.
 * @param para 一篇帖子的元素信息, 元素信息包含DOM 和 数据.
 */
wf.sns.timeline.message = function (para) {
    let settings = {
        opendetail: true,
        thirdCommentsType: false //在第三方评论用到
    }
    if (para.thirdCommentsType) {
        settings.thirdCommentsType = para.thirdCommentsType
    }
    if (para.opendetail === false) {
        settings.opendetail = para.opendetail
        para = {
            container: para.container,
            data: para.data

        }
    }
    wf.sns.timeline.getCreateTimeRenderTemplate = function () {
        return {
            // e: 'div',
            // class: 'remark',
            e: 'create-time',
            a: {
                class: function () {
                    if (!settings.opendetail) {
                        // 详情页 （时间不能点击）不给小手
                        return 'wf-cursor-default'
    
                    } else {
                        return 'wf-cursor-pointer'
                    }
    
                }
    
            },
            // style:{
            //     // cursor: pointer;
            //     cursor:function(e){
            //         if(!settings.opendetail){
            //             return 'default'
    
            //         }
    
            //     }
    
            // },
            t: function (e) {
                return wf.replace.dateDiff(e.data.createTime)
            },
            click: function (e) {
                if (e.org_data.loginUid) {
                    //登录
                    // if (settings.opendetail) wf.sns.timeline.relayDetailed(e)
                    // 跳转到 新页面
    
                    if (settings.opendetail) {
                        var url = wf.wfPubServer() + '/m/' + e.org_data.messageId
                        window.open(url)
                    }
    
                } else {
    
                    //没登录
                    // let url
                    // if (e.org_data.thirdMessage) {
                    //     url = e.org_data.thirdMessage.url ? e.org_data.thirdMessage.url : window.location.href
                    // } else {
                    //     url = window.location.href
                    // }
                    let url = wf.getRelativeUrl()
                    window.location.href = wf.oauthServer() + '/login?redirectUri=' + url
    
                }
    
            }
        }
    }
   
    wf.sns.timeline.popUpEditHistoryWidget = function (messageId) {
        poplayer({
            header: '编辑记录',
            width: '750px',
            height: '666px',
            template: function (element) {
                wf.sns.renderHistoryMessages(element.container, messageId)
            }
        })
    }



    function render(p) {
      
        let template_menu = {
            e: 'wf-pulldown',
            t: [
                {
                    // if: p.data.user.uid === p.data.loginUid,
                    if: function (e) {
                        if (e.data.user) {
                            return (e.data.user.uid === e.data.loginUid)
                        } else {
                            return false
                        }
                    },
                    then: {
                        e: 'wf-button',
                        t: '删除',
                        click: function (e) {
                            let reMoveEle
                            if (settings.opendetail) {
                                //在本地
                                if (settings.thirdCommentsType) {
                                    reMoveEle = $(e.sender).parents('message-detail')
                                } else {
                                    reMoveEle = $(e.sender).parents('message')
                                }

                            } else {
                                //在弹窗
                                reMoveEle = $(e.sender).parents('message-detail')
                            }
                            wf.sns.timeline.deleteMessage(e, reMoveEle, settings.opendetail)
                        }
                    }
                },
                {e: 'wf-button', t: '投诉'},
                {
                    if: function (e) {
                        let userRoles = e.data.loginUserRole
                        if (userRoles) {
                            return userRoles.includes('管理员') || userRoles.includes('运营者')
                        } else {
                            return false
                        }
                    },
                    then: {
                        e: 'wf-button',
                        t: '禁帖',
                        click: function (e) {
                            clickDisableMes(e, $(e.sender).parents('message-detail'))

                        }
                    }
                },
                {
                    if: function checkOperationPermission(messageElement) {
                       
                        // console.log(messageElement+'messageElement')
                        if (!existLoginUserRole(messageElement)) {
                            return false
                        }
                        return checkPermission(messageElement)

                        function existLoginUserRole(messageElement) {
                            return messageElement.data.loginUserRole
                        }

                        function checkPermission(messageElement) {
                            const userRoles = listUserRoles(messageElement)
                            return userRoles.includes('管理员') || userRoles.includes('运营者')
                        }

                        function listUserRoles(messageElement) {
                            return messageElement.data.loginUserRole
                        }
                    },
                    then: {
                        e: 'wf-button',
                        t: function (messageElement) { return isExcellentMessage(messageElement) ? '除精' : '置精' },
                        click: function (messageElement) {
                            if (hasExcellentState(messageElement)) {
                                clearExcellentState(messageElement)
                                return
                            }
                            setExcellentState(messageElement)
                        }
                    },
                },
                {
                    if: function checkEditPermission(messageElement) {
                        const messageUserId = messageElement.data.user.uid
                        if (!messageUserId) {
                            return false
                        }
                        const loginUserId = messageElement.data.loginUid
                        return isSameUser(messageUserId, loginUserId)

                        function isSameUser(messageUserId, loginUserId) {
                            return messageUserId === loginUserId
                        }
                    },
                    then: {
                        e: 'wf-button',
                        t: '编辑',
                        click: function (messageElement) {
                            popUpForEdit(messageElement)

                            function popUpForEdit(messageElement) {
                                const existedData = copyDeeply(messageElement)
                                existedData.requestSource = 'alter'
                                poplayer({
                                    data: existedData,
                                    header: '编辑帖子',
                                    width: '900px',
                                    height: '360px',
                                    template: function (element) {
                                        // 样式上为了能和帖子列表保持一致, 也为了复用一套css, 包裹弹出框
                                        $('popbody').wrap('<wf-sns></wf-sns>')
                                        wf.sns.messageSender(element)
                                        const imageIds = existedData.org_data.imageId
                                        const imgEditor = new wf.sns.timeline.MessageImgEditor(imageIds)
                                        if (imgEditor.existImages()) {
                                            imgEditor.popUpImagesUploaderWithImages()
                                        }
                                    }
                                })
                            }

                            function copyDeeply(object) {
                                return $.extend({}, object)
                            }
                        }
                    }
                },
                {
                    if: function (messageElement) { return messageElement.data.updated_count > 0 },
                    then: {
                        e: 'wf-button',
                        t: '查看编辑记录',
                        click: function (messageElement) { wf.sns.timeline.popUpEditHistoryWidget(messageElement.org_data.messageId) }
                    }
                },
                {
                    if: function (messageElement) { return messageElement.data.updated_count > 0 },
                },
                {
                    if: function (e) {
                        let userRoles = e.data.loginUserRole
                        let setTopType = e.data.setTopType
                        
                        if(e.data.view ==='public' || e.data.view ==='topic'){
                            if (userRoles) {
                                                               return (userRoles.includes('管理员') || userRoles.includes('运营者')) && setTopType !== 'true'
                            } else {
                                return false
                            }
                        }else{
                            return false
                        }
                       
                    },
                    then: {
                        e: 'wf-button',
                        t: '置顶',
                        click: function (e) {
                           
                            wf.sns.timeline.clickSetTop(e)
                        }
                    }
                },
                {
                    if: function (e) {
                        let userRoles = e.data.loginUserRole
                        let setTopType = e.data.setTopType
                        
                        if(e.data.view ==='public' || e.data.view ==='topic'){
                            if (userRoles) {
                                
                                return (userRoles.includes('管理员') || userRoles.includes('运营者')) && setTopType ==='true'
                            } else {
                                return false
                            }
                        }else{
                            return false
                        }
                    },
                    then: {
                        e: 'wf-button',
                        t: '除顶',
                        click: function (e) {
                            wf.sns.timeline.clickCancelSetTop(e)
                        }
                    }
                },
                // {
                //     e:'wb:share-button',
                //     a:{

                //         appkey:'2298735495',
                //         addition:'simple',
                //         type:'icon'
                //     },

                //     t:function(){
                //         var createEle = document.createElement('script')
                //         createEle.setAttribute('src',  'https://tjs.sjs.sinajs.cn/open/api/js/wb.js')

                //         document.head.append( createEle)
                //     }

                // }


            ],
            closeon: 'click'
        }

        if (p.data.user) {
            $(p.container).render({
                data: p.data,
                template: [
                    // {
                    //     if:function(e){
                        
                    //         if(e.data.setTopType==='true'){
                    //             return true
                    //         }else{
                    //             return false
                    //         }

                    //     },
                    //     then:{
                    //         e:'set-top-tag',
                    //         t:'置顶'
                    //     }
                        

                    // },
                    {
                        'message-detail': [
                            wf.sns.timeline.getAvatarRenderTemplate(),
                            // '<wf-user class=\'avatar\' data-nickname=[[user/nickname]]><img src=\'[[user/avatarUrl]]\' class=\'avatar-img\'></wf-user>',
                            {
    
                                'message-body': [
                                    // {
                                    //     e: 'i',
                                    //     class: 'fas fa-angle-down wf-sns-message',
                                    //     t: '',
                                    //     click: template_menu
                                    // },
    
                                   
                                    {
                                        // e: 'div',
                                        // class: 'wf-sns-message',
                                        e: 'wf-pulldown-font',
    
                                        click: template_menu
                                    },
                                    wf.sns.timeline.getNicknameRenderTemplate(),
                                    function (e) {
    
                                        e.data = e.data.user ? e.data.user : {}
                                        wf.user.renderBadge(e)
    
                                    },
    
                                    // '<wf-user class=\'author\' data-nickname="[[user/nickname]]" >[[user/nickname]]</wf-user>',
                                    {
                                        if: function (p) {
    
                                            if (p.data.user) {
    
                                                return (p.data.user.type !== '个人')
                                            } else {
                                                return false
                                            }
    
                                        },
                                        then: '<wf-user-tag>[[user/type]]</wf-user-tad>',
                                    },
                                    wf.sns.timeline.getCreateTimeRenderTemplate(),
                                    // 渲染精选标识
                                    {
                                        e: 'excellent-badge',
                                        t: renderExcellentImgStrategy
                                    },
                                    {
                                        e: 'edit-state',
                                        style: {
                                            margin: '5px'
                                        },
                                        a: {
                                            id: function (e) { return 'edit-state-of-' + e.data.messageId }
                                        },
                                        t: {
                                            if: function (e) { return e.data.updated_count > 0 },
                                            then: {
                                                t: '已编辑',
                                                class: 'wf-cursor-pointer',
                                                click: function (messageEvent) {
                                                    wf.sns.timeline.popUpEditHistoryWidget(messageEvent.org_data.messageId)
                                                }
                                            }
                                        }
                                    },
                                    function(e){
                                        wf.sns.timeline.getArticleRenderTemplate(e)
                                    },
                                    
                                    {
                                        if: 'imageId',
                                        then: wf.sns.timeline.imagepart
                                    },
                                    {
                                        if: 'video',
                                        then: {
                                            video: '',
                                            a: {
                                                src: wf.snsOssServer() + '/' + '[[video/id]]',
                                                controls: 'controls',
                                                poster: function (e) {
                                                    if (e.data.video.poster) {
                                                        return e.data.video.poster
                                                    } else {
                                                        return wf.snsOssServer() + '/' + e.data.video.id + '?x-oss-process=video/snapshot,t_1000,f_jpg,w_800,h_400'
                                                    }
                                                }
                                            },
                                            style: {
                                                width: '100%'
                                            }
                                        }
                                    }
                                ]
                            },
                            {
                                switch: '[[messageType]]',
                                case: {
                                    // 'forward': wf.sns.timeline.forward(),
                                    'forward': function (e) {
    
                                        return wf.sns.timeline.forward(e, settings.opendetail)
                                    },
                                    // 'thirdForward': wf.sns.timeline.thirdforward,
                                    // defualt: '不是转发'
                                }
                            },
                            {
                                if: function (e) {
                                    return e.data.thirdMessageId ? true : false
    
                                },
                                then: function (e) {
    
                                    //第三方评论不显内容，只有帖子显示中会第三方评论内容
                                    if (!settings.thirdCommentsType) {
                                        wf.sns.timeline.thirdMessage(e)
                                    }
    
    
                                }
                            },
                            {
                                e: 'message-handle',
                                t: [
    
                                    {
                                        e: 'wf-button',
                                        a: {
                                            class: 'relayButton relayStyleBtn',
                                        },
                                        t:[
                                            {
                                                e: 'img',
                                                a: {
                                                    src: function (e) {
                                                        return wf.comServer() + '/img/replay.png'
                                                    }
                                                }
    
                                            },
                                            {
                                                e: 'wf-span',
                                                a: {
                                                    class: 'relayButtonNum',
                                                },
                                                t:'转发([[forwardCount]])'
    
                                            }

                                        ],
                                        click: function (e) {
                                            //排他操作，只有一个评论或转发的内容框
                                            $(e.sender).parents('message').siblings('message').find('message-handle-list').empty()
    
                                            var renderEle = $(e.sender).parent('message-handle').siblings('message-handle-list')
                                            if (renderEle.find('.relayFiledset').length > 0) {
                                                renderEle.empty()
                                            } else {
                                                // 禁用按钮
                                                $(e.sender).addClass('wf-disable')
                                                e.thirdCommentsType = settings.thirdCommentsType
                                                wf.sns.timeline.relayMessage(e, renderEle, settings.opendetail)
                                            }
                                        },
                                    },
                                    {
                                        e: 'wf-button',
                                        a: {
                                            class: 'commentBtn commentStyleBtn',
                                        },
                                        t: [
                                            
                                            {
                                                e: 'img',
                                               
                                                a: {
                                                    src: function (e) {
                                                        
    
                                                        return wf.comServer() + '/img/comment.png'
                                                    }
                                                }
    
                                            },
                                            {
                                                e: 'wf-span',
                                                a: {
                                                    class: 'commentBtnNum',
                                                },
                                                t:'评论([[commentCount]])'
    
                                            }
                                        ],
                                        click: function (e) {
                                            //排他操作，只有一个评论或转发的内容框
                                            $(e.sender).parents('message').siblings('message').find('message-handle-list').empty()
                                            var renderEle = $(e.sender).parent('message-handle').siblings('message-handle-list')
                                            if (renderEle.find('.commentFiledset').length > 0) {
                                                renderEle.empty()
    
                                            } else {
                                                // 按钮禁用
                                                $(e.sender).addClass('wf-disable')
                                                wf.sns.timeline.commentMessage(e, renderEle)
                                            }
    
                                        }
                                    },
                                    {
                                        e: 'wf-button',
                                        a: {
                                            class: 'favouriteBtn',
                                            'data-isfav': function (e) {
                                                if (e.data.favourite) {
    
                                                    return e.data.favourite.state
                                                } else {
                                                    return '未收藏'
                                                }
                                            }
                                        },
                                        t: [
                                            {
                                                e: 'img',
    
                                                a: {
                                                    src: function (e) {
    
                                                        if (e.data.favourite) {
                                                            if (e.data.favourite.state === '未收藏') {
                                                                return wf.comServer() + '/img/g-star.png'
                                                            } else {
                                                                return wf.comServer() + '/img/o-star.png'
                                                            }
    
                                                        } else {
                                                            return wf.comServer() + '/img/g-star.png'
                                                        }
                                                    }
                                                }
    
                                            },
                                            {
                                                e: 'wf-span',
                                                a: {
                                                    class: 'fav-num',
                                                },
                                                t: function (e) {
                                                    if (e.data.favourite) {
                                                        return e.data.favourite.collect_num ? '收藏(' + e.data.favourite.collect_num + ')' : '收藏(0)'
                                                    } else {
                                                        return '收藏(0)'
                                                    }
    
                                                }
    
                                            }
                                        ],
                                        click: function (e) {
    
                                            // 收藏功能
    
                                            // 按钮禁用
                                            $(e.sender).addClass('wf-disable')
                                            // clickFavourite (e)
                                            wf.sns.timeline.clickFavourite(e)
                                        }
                                    },
    
                                    function (e) {
                                        // 微博分享
                                        wf.sns.timeline.weiboShare(e)
                                        // 微信分享
                                        wf.sns.timeline.wexiShare(e)
                                    },
                                    {
                                        e: 'wf-button',
                                        a: {
                                            class: 'praiseBtn',
                                            'data-ispraise': function (e) {
                                                if (e.data.praiseType) {
                                                    return '已点赞'
                                                } else {
                                                    return '未点赞'
                                                }
    
                                            },
                                            'data-praisenum': '[[praiseCount]]'
                                        },
                                        t: [
                                            {
                                                e: 'img',
    
                                                a: {
                                                    src: function (e) {
    
                                                        if (e.data.praiseType) {
                                                            if (e.data.praiseType === '已点赞') {
                                                                return wf.comServer() + '/img/o-praise.png'
                                                            } else {
                                                                return wf.comServer() + '/img/g-praise.png'
                                                            }
    
                                                        } else {
                                                            return wf.comServer() + '/img/g-praise.png'
                                                        }
                                                    }
                                                }
    
                                            },
                                            {
                                                e: 'wf-span',
                                                class: 'praiseCount',
                                                t: '赞([[praiseCount]])'
                                            }
                                        ],
                                        click: function (e) {
                                            // 点赞功能
    
                                            // 按钮禁用
                                            $(e.sender).addClass('wf-disable')
                                            // clickPraise (e)
                                            wf.sns.timeline.clickPraise(e)
                                        }
                                    },
    
    
    
    
                                ]
    
                            },
                            {
                                e: 'message-handle-list',
    
                            }
                        ]
                    }
                ]
            })
        }

        // 微博分享

        // var wbJsStatus = false
        // $.each($('html head').children('script'),function(i,item){
        //     if($(item).attr('src') === 'https://tjs.sjs.sinajs.cn/open/api/js/wb.js'){
        //         wbJsStatus = true

        //         return false
        //     }
        // })
        // if(!wbJsStatus){
        //    
        //     var createEle = document.createElement('script')
        //     createEle.setAttribute('src',  'https://tjs.sjs.sinajs.cn/open/api/js/wb.js')

        //     document.head.append( createEle)

        // }



        if ($('wf-sns.comment').attr('autoopen') == '1' && !settings.opendetail) {
            $(p.container).children('message-detail').children('message-handle').find('.commentBtn').click()
        }

        // 点赞功能
        function clickPraise(e) {
            var apiUrl = $(e.sender).data('ispraise') === '未点赞' ? wf.apiServer() + '/sns/message_praise_add' : wf.apiServer() + '/sns/message_praise_cancel'
            wf.http.post(apiUrl,
                {
                    messageId: e.org_data.messageId
                },
                function (res) {
                    // 按钮解禁
                    $(e.sender).removeClass('wf-disable')

                    if ($(e.sender).data('ispraise') === '未点赞') {
                        $(e.sender).data('ispraise', '已点赞')
                        $(e.sender).find('img').attr('src', wf.comServer() + '/img/o-praise.png')
                        // 获取点赞数量
                        let praiseCount = $(e.sender).data('praisenum')
                        praiseCount = praiseCount + 1
                        // 更新点赞数据
                        $(e.sender).find('.praiseCount').text('赞(' + praiseCount + ')')
                        // 更新点赞自定义数据
                        $(e.sender).data('praisenum', praiseCount)
                    } else {
                        $(e.sender).data('ispraise', '未点赞')
                        $(e.sender).find('img').attr('src', wf.comServer() + '/img/g-praise.png')
                        // 获取点赞数量
                        let praiseCount = $(e.sender).data('praisenum')
                        if (praiseCount > 0) {
                            praiseCount = parseInt(praiseCount - 1)
                            // 更新点赞数据
                            $(e.sender).find('.praiseCount').text('赞(' + praiseCount + ')')
                            // 更新点赞自定义数据
                            $(e.sender).data('praisenum', praiseCount)
                        }

                    }


                },
                function (err) {
                    if (err.err_code === 40002) {
                        let url = wf.getRelativeUrl()
                        window.location.href = wf.oauthServer() + '/login?redirectUri=' + encodeURIComponent(url)
                    } else {
                        wf.error(err)
                    }
                   


                    
                }
            )

        }

        // 收藏功能
        function clickFavourite(e) {
            let _sender = $(e.sender)
            let title = ''
            if (e.org_data.content) {
                if (e.org_data.content.length > 40) {
                    title = e.org_data.content
                    title = title.substring(0, 40) + '...'

                } else {
                    title = e.org_data.content
                }

            }
            var apiUrl = _sender.data('isfav') === '未收藏' ? wf.apiServer() + '/favourite/add' : wf.apiServer() + '/favourite/delete'
            wf.http.post(apiUrl,
                {
                    title: title,
                    url: e.org_data.favourite ? e.org_data.favourite.url : wf.wfPubServer() + '/m/' + e.org_data.messageId,
                    messageId: e.org_data.messageId
                },
                function (result) {
                    // 按钮禁用
                    $(e.sender).removeClass('wf-disable')

                    if (result.state === '已收藏') {
                        _sender.data('isfav', '已收藏')

                        _sender.find('img').attr('src', wf.comServer() + '/img/o-star.png')

                        _sender.find('.fav-num').text('收藏(' + result.collect_num + ')')


                    } else {
                        _sender.data('isfav', '未收藏')
                        _sender.find('img').attr('src', wf.comServer() + '/img/g-star.png')
                        _sender.find('.fav-num').text('收藏(' + result.collect_num + ')')
                    }

                },
                function (err) {
                    if (err.err_code === 40002) {
                        let url = wf.getRelativeUrl()
                        window.location.href = wf.oauthServer() + '/login?redirectUri=' + encodeURIComponent(url)
                    } else {
                        wf.error(err)
                    }

                   

                    
                }
            )

        }

        // 禁帖功能
        function clickDisableMes(e, messageDetail) {
            wf.http.post(
                wf.apiServer() + '/sns/blockd_message',
                {
                    messageId: e.org_data.messageId
                },
                function (res) {
                    messageDetail.remove()
                },
                function (err) {
                    wf.error(err)

                }
            )
        }
        
        

    }

    if (para.container) {
        // console.log(para)
        render(para) // 如果调用参数存在container属性，则是由thin直接调用，直接执行渲染。
    } // 否则，则是参数设置调用，返回渲染函数。
   
   
}

function isExcellentMessage(messageElement) {
    return castStringToBoolean(messageElement.data.is_excellent)
}

function renderExcellentImgStrategy (message) {
    const isExcellentMessage = castStringToBoolean(message.data.is_excellent)
    if (!isExcellentMessage) {
        return
    }
    generateExcellentMessageBadge(message.container)
}

function renderExcellentImg (message, targetContainer) {
    const isExcellentMessage = castStringToBoolean(message.org_data.is_excellent)
    if (!isExcellentMessage) {
        return
    }
    generateExcellentMessageBadge(targetContainer)
}

function castStringToBoolean(target) {
    return target === 'true'
}

function generateExcellentMessageBadge(location) {
    $(location).render({
        template: {
            e: 'wf-badge',
            style: {
                width: '45px',
                display: 'inline-block'
            },
            t: {
                e: 'img',
                a: {
                    class: 'img_badge',
                    title: '精选',
                    style: 'width: 38px; height: 20px;',
                    src: function () { return wf.comServer() + '/img/badge-4.png' }
                }
            }
        }
    })
}

function hasExcellentState(messageElement) {
    return messageElement.org_data.is_excellent === 'true'
}

function updateExcellentState(messageElement, res) {
    messageElement.org_data.is_excellent = res.is_excellent
}

function clearExcellentState(messageElement) {
    const excellentBadgeContainer = $(messageElement.sender).parents('wf-pulldown-font').siblings('excellent-badge')
    const messageContainer = $(messageElement.sender).parents('message')
    wf.http.post(
        wf.apiServer() + '/sns/excellent_message_remove',
        {messageId: messageElement.org_data.messageId},
        function (res) {
            dialog.success('移除精选成功')
            updateExcellentState(messageElement, res)
            if (isExcellentMessageTabActivated()) {
                removeMessage(messageContainer)
                return
            }

            switchButtonTextTo(messageElement, '置精')
            removeExcellentBadge()

            function isExcellentMessageTabActivated() {
                return $('message-list').attr('view') === 'excellentMessages'
            }

            function removeMessage(messageContainer) {
                messageContainer.remove()
            }
        },
        function (err) {
            dialog.fail('移除精选失败, 原因:' + err.err_message + ', ' + err.sub_msg)
        }
    )

    function removeExcellentBadge() {
        excellentBadgeContainer.empty()
    }
}

function setExcellentState(messageElement) {
    const excellentBadgeContainer = $(messageElement.sender).parents('wf-pulldown-font').siblings('excellent-badge')
    wf.http.post(wf.apiServer() + '/sns/excellent_message_add',
        {messageId: messageElement.org_data.messageId},
        function (res) {
            updateExcellentState(messageElement, res)
            switchButtonTextTo(messageElement, '除精')
            renderExcellentImg(messageElement, excellentBadgeContainer)
            dialog.success('设置精选成功')
        },
        function (err) {
            dialog.fail('设置精选失败, 原因:' + err.err_message + ', ' + err.sub_msg)
        }
    )
}

function switchButtonTextTo(messageElement, text) {
    $(messageElement.sender).text(text)
}



wf.sns.timeline.getAvatarRenderTemplate = function () {
    return {
        e: 'wf-user',
        a: {
            class: 'avatar',
            'data-nickname': '[[user/nickname]]',

        },
        t: [
            {
                e: 'img',
                a: {
                    src: '[[user/avatarUrl]]',
                    class: 'avatar-img'
                }

            },
            
        ],
        click: function (e) {

            window.open(wf.wfPubServer() + '/u/' + e.org_data.user.nickname)
        }
    }
}

wf.sns.timeline.getNicknameRenderTemplate = function () {
    return {
        e: 'wf-user',
        a: {
            class: 'author',
            'data-nickname': '[[user/nickname]]'
        },
        t: '[[user/nickname]]',
        click: function (e) {

            window.open(wf.wfPubServer() + '/u/' + e.org_data.user.nickname)
        }
    }
}
wf.sns.timeline.getAvatarRenderTemplate = function () {
    return {
        e: 'wf-user',
        a: {
            class: 'avatar',
            'data-nickname': '[[user/nickname]]',

        },
        t: [
            {
                e: 'img',
                a: {
                    src: '[[user/avatarUrl]]',
                    class: 'avatar-img'
                }

            },
            
        ],
        click: function (e) {

            window.open(wf.wfPubServer() + '/u/' + e.org_data.user.nickname)
        }
    }
}
wf.sns.timeline.getAvatarImgSmallRenderTemplate = function () {
    return {
        e: 'wf-user',
        a: {
            class: 'avatar',
            'data-nickname': '[[user/nickname]]',

        },
        t: [
            {
                e: 'img',
                a: {
                    src: '[[user/avatarUrl]]',
                    class: 'avatar-img-small'
                }

            },
            
        ],
        click: function (e) {

            window.open(wf.wfPubServer() + '/u/' + e.org_data.user.nickname)
        }
    }
}



//  jsbuilder/wf/sns/wf.sns.timeline/modules/wf.sns.timeline.relayDetailed.js

wf.sns.timeline.relayDetailed = function(p) {
    console.log(p)
    wf.pop({
        render: render,
        onclose:function(e){
            close(e)
        }
    })
    function render(e) {
        $(e.container).render({
            data: p.org_data,
            template: {
                e: 'wf-sns',
                a: {
                    'view': 'message',
                    'messageId': '[[messageId]]',
                    'autoopen': '1',
                    class: 'comment relayDetail',
                }
            }
        })
        wf.sns(e.container)
    }
    function close(e){
        //渲染页面
        if( $('sns-container').siblings('tab').find('tab-nav.active').length>0){
            if($('sns-container').siblings('tab').find('tab-nav.active').text()==='帖子'){
                wf.sns.timeline( $('sns-container').find('wf-sns')[0])
            }else{
                $('sns-container').siblings('tab').find('tab-nav.active')[0].click()
    
            }

        }else{
            //这种是第三方评论的情况
            $(e.sender).closest('wf-pop').remove()
            //刷新页面
            $(document).comment()

        }
        
        
        
    }
}

//  jsbuilder/wf/sns/wf.sns.timeline/modules/wf.sns.timeline.relaymessage.js

/**
 * 转发帖子
 * p 传入的元素数据
 * renderEle 在那个节点下渲染
 * opendetail：区别是(在帖子详情蒙版 false)上还是(本地帖子 true)
 */
wf.sns.timeline.relayMessage = function(p, renderEle, opendetail) {
    var thirdCommentsType = p.thirdCommentsType
    // 客观页,主观页 转发区分
    if($(p.sender).parents('wf-sns[view=\'user\']').length>0){
        // 客观页转发逻辑和逻辑第三方评论逻辑相同
        thirdCommentsType = true
    }
    wf.http.get(
        wf.apiServer() + '/sns/message_forward_list', {
            messageId: p.org_data.messageId
        },
        function(res) {
           
            // 解禁按钮
            $(p.sender).removeClass('wf-disable')
            //把当前登录用户信息存在每个message里面
            if(res.messages){
                $.each(res.messages, function(i, item) {
                    item.loginUid = res.uid
                    if (item.forwardMessage) {
                        item.forwardMessage.loginUid = res.uid
                    }
                    if(res.praiseMessages){
                        var isPraiseFlag = -1
                        if(item.messageId){
                            isPraiseFlag = res.praiseMessages.indexOf(item.messageId)
                            
                            if(isPraiseFlag !== -1){
                                item.praiseType = '已点赞'
                                // 重置默认状态
                                isPraiseFlag = -1
                            }
                        }
                        if(item.forwardMessage){
                           
                            isPraiseFlag = res.praiseMessages.indexOf(item.forwardMessage.messageId)
                            if(isPraiseFlag !== -1){
                                ele.forwardMessage.praiseType = '已点赞'
                                // 重置默认状态
                                isPraiseFlag = -1
                            }
                        }
                    
                       
                    } 
                   
                })
            }

            
            p.org_data.loginUid = res.uid
            p.org_data.messageList = res.messages
            p.org_data.minId = res.minId
            p.org_data.totalRecord = res.totalRecord
            renderRelay(p, renderEle)

            // 加载更多逻辑处理 
            var messageListWrap = renderEle.find('message-list-wrap')
            var data = res
            data.messages =res.messages
            wf.sns.timeline.loadmore(messageListWrap,data)
        },
        function(err) {
            console.log(err)
        }
    )


    // 转发后同时评论勾选框id名
    const commentCheckbox = 'comment-checkbox-'
    function renderRelay(p, renderEle) {
        renderEle.empty().render({
            data: p.org_data,
            template: {
                e: 'fieldset',
                class: 'relayFiledset',
                t: [{
                    e: 'legend',
                    t: '当前已转发<span class="relayNum">[[totalRecord]]</span>次数'
                },
                {
                    e: 'textarea-wrap',
                    t:{
                        if: p.org_data.loginUid,
                        then: [
                            {
                                e: 'textarea',
                                a: {
                                    id: 'wf-message-content',
                                    name: 'wf_message_content',
                                    placeholder: '请输入转发理由'
                                },
                                event: wf.atHelper(),
                                t: function(e) {
                                  
                                    var content = ''
                                    if (e.data.messageType === 'forward' || e.data.messageType === 'thirdForward') {
                                        content = '//@' + e.data.user.nickname + ':' + e.data.content
                                    } else {
                                        content =  ''
                                    }
                                   
                                    $(e.container).text(content)
                                    // 光标放在最前面
                                    $(e.container).val(content)
                                    $(e.container).focus()
                                     

                                }
                            },
                            {
                                e: 'message-handle',
                                t: [
                                    {
                                        e: 'input',
                                        a: {
                                            id: commentCheckbox + p.org_data.messageId,
                                            type: 'checkbox'
                                        },
                                    },
                                    {
                                        e: 'label',
                                        a: {
                                            for: commentCheckbox + p.org_data.messageId,
                                            style: 'text-align: center',
                                        },

                                        t: '同时评论'
                                    },
                                    {
                                        e: 'wf-button',
                                        t: '编辑',
                                        click: openeditor
                                    },
                                    {
                                        e: 'wf-button',
                                        t: '转发',
                                        click: function(e) {

                                            // 按钮禁用
                                            $(e.sender).addClass('wf-disable')
                                            relaySubmit(e, false, true, p.org_data.messageId)


                                        }
                                    },

                                ]
                            }
                        ],
                        else:[
                            {
                                e:'wf-no-login',
                                t:[
                                    {
                                        e:'wf-span',
                                        t:'您当前未登录！'
                                    },
                                    {
                                        e:'a',
                                        a:{
                                            href:function(e){
                                                //没登录
                                                let url
                                                // if(e.data.thirdMessage){
                                                //     url = e.data.thirdMessage.url ? e.data.thirdMessage.url : window.location.href
                                                   
                                                // }else{
                                                //     url = window.location.href
                                                // }
                                                url = wf.getRelativeUrl()
                                                url = encodeURIComponent(url)
                                                return wf.oauthServer() + '/login?redirectUri=' + url



                                            }
                                        },
                                        t:'去登录',
                                    }
                                ]
                            }
                        ]

                    }

                },
                {
                    e: 'message-list-wrap',
                    t: [{
                        e: 'message-detail',
                        datapath: 'messageList',
                        t: [
                            function(e) {
                                renderMessageList(e)
                            }
                        ]
                    }]
                },
                {
                    e: 'wf-button',
                    a: {
                        'fromId': '[[minId]]',
                        'disable': 'false',
                        id:'more'

                    },
                    t: '点击加载更多...',
                    click: function(e) {
                        more(e)
                    }
                },
                    // function(e) {
                    //     if (e.data.totalRecord > 20) {
                    //         $(e.container).find('.forwardMore').show()
                    //     }
                    // }
                ]
            }
        })
    }

    //渲染消息列表
    function renderMessageList(e) {
      
        $(e.container).render({
            data: e.data,
            template: [
                wf.sns.timeline.getAvatarImgSmallRenderTemplate(),
           
            {
                e: 'message-body',
                t: [
                    wf.sns.timeline.getNicknameRenderTemplate(),
                  
                    function(e){
                       
                        e.data = e.data.user ? e.data.user : {}
                        wf.user.renderBadge(e)

                    },
                    {
                        e: 'create-time',
                        t: function (e) {
                            return  wf.replace.dateDiff(e.data.createTime)
                        },
                    },
                    function(e){
                        wf.sns.timeline.getArticleRenderTemplate(e)
                    },
                   

                ]
            },
            {
                e: 'message-handle',
                t: [{
                    if: function(p) { return p.data.user.uid === p.data.loginUid },
                    then: {
                        e: 'wf-button',
                        class:'deleteStyleBtn',
                        t: [
                        
                            {
                                e: 'img',
                                a: {
                                    src: function (e) {
                                        return wf.comServer() + '/img/delete.png'
                                    }
                                }

                            },
                            {
                                e: 'wf-span',
                                t:'删除'

                            }
                        ],
                        click: function(e) {
                            var reMoveEle = $(e.sender).parent('message-handle').parent('message-detail')
                            wf.sns.timeline.deleteMessage(e, reMoveEle, true)
                           
                        }
                    }
                },
                {
                    if: function(p) { return  p.data.loginUid ? true :false},
                    then: {
                        e: 'wf-button',
                        class:'relayStyleBtn',
                        t:[
                            {
                                e: 'img',
                                a: {
                                    src: function (e) {
                                        return wf.comServer() + '/img/replay.png'
                                    }
                                }

                            },
                            {
                                e: 'wf-span',
                                a: {
                                    class: 'relayButtonNum',
                                },
                                t:'转发'

                            }

                        ],
                        click: function(e) {

                            listRealySubmit(e, true)
                        }
                    }
                },
                {
                    e: 'wf-button',
                    a: {
                        class: 'praiseBtn',
                        'data-ispraise':function(e){
                            if(e.data.praiseType){
                                return '已点赞'
                            }else{
                                return '未点赞'
                            }
                            
                        },
                        'data-praisenum':'[[praiseCount]]'
                    },
                    t:[
                        {
                            e:'img',
                           
                            a:{
                                src:function(e){
                                    
                                    if(e.data.praiseType){
                                        if( e.data.praiseType === '已点赞'){
                                            return  wf.comServer()+'/img/o-praise.png'
                                        }else{
                                            return  wf.comServer()+'/img/g-praise.png'
                                        }
                                        
                                    }else{
                                        return  wf.comServer()+'/img/g-praise.png'
                                    }
                                }
                            }
                            
                        },
                        {
                            e:'wf-span',
                            class:'praiseCount',
                            t:'赞([[praiseCount]])'
                        }
                    ],
                    click: function (e) {
                        // 点赞功能

                        // 按钮禁用
                        $(e.sender).addClass('wf-disable')
                        // clickPraise (e)
                        wf.sns.timeline.clickPraise(e)
                    }
                },

                ]
            },
            ]
        })

    }

    //提交转发
    function relaySubmit(e, listRelay, isOuterCommentCheckBox, messageId) {
        
        if (!$.trim(e.new_data.wf_message_content)) {
            //解禁禁用
            $(e.sender).removeClass('wf-disable')
            dialog.fail('转发内容不能为空，请输入转发内容！')
            return
        } else {
            const outerCommentSendingCheckBox = $('#' + commentCheckbox + messageId).prop('checked')
            const InnerCommentSendingCheckBox = $('#' + nestedCommentCheckbox + messageId).prop('checked')
            wf.http.post(
                wf.apiServer() + '/sns/message_send', {
                    content: e.new_data.wf_message_content,
                    forwardMessageId: e.org_data.messageId + '',
                    currentMessageId: messageId,
                    relayAndComment:  isOuterCommentCheckBox ? outerCommentSendingCheckBox : InnerCommentSendingCheckBox
                },
                function(res) {
                    dialog.success('转发成功!')
                    //解禁禁用
                    $(e.sender).removeClass('wf-disable')
                    //给添加loginUid
                    res.message.loginUid = res.user.uid
                    res.message.loginUserRole = res.user.role
                    if(res.message.forwardMessage){
                        res.message.forwardMessage.loginUid = e.org_data.loginUid
                    }

                    if (!opendetail || thirdCommentsType) {
                        //蒙版或者第三方评论
                        //改变转发的次数
                        changeRelayNum(e)
                        $(e.sender).siblings('.relayFiledset').show()
                        // 更新点击转发后的内容
                        clickAfterRelayList(e, res, listRelay)
                        //删除元素
                        if (listRelay) {
                            $(e.sender).parents('textarea-wrap').remove()
                        }

                    } else {
                        //本地


                        //改变转发的次数
                        changeRelayNum(e)
                        //更新帖子的列表
                        new wf.sns.timeline.MessageRefresh(e, res).refresh()
                        //删除蒙版
                        $(e.sender).parents('message-handle-list').empty()
                    }


                },
                function(err) {
                    //解禁禁用
                    $(e.sender).removeClass('wf-disable')
                    wf.error(err)
                }
            )

        }

    }
    const nestedCommentCheckbox = 'nested-comment-checkbox-'
    //列表中提交转发
    function listRealySubmit(e) {
        var relayMessage = $(e.sender).parent('message-handle').parent('message-detail')
        //排他操作，只有一个转发内容框子
        relayMessage.siblings('message-detail').find('textarea-wrap').remove()
        if (relayMessage.find('textarea-wrap').length > 0) {
            relayMessage.find('textarea-wrap').remove()
        } else {
            relayMessage.render({
                data: e.org_data,
                template: {
                    e: 'textarea-wrap',
                    t:[
                        {
                            e: 'textarea',
                            a: {
                                id: 'wf-message-content',
                                placeholder: '请输入转发理由',
                                name: 'wf_message_content',
                            },
                            t: function(e) {
                               
                                
                               
                                var content = '//@' + e.data.user.nickname + ':' + e.data.content
                                $(e.container).text(content)
                                // 光标放在最前面
                                $(e.container).val(content)
                                $(e.container).focus()
                               
                            },
                            event: wf.atHelper()

                        },
                        {
                            e: 'message-handle',
                            t: [
                                {
                                    e: 'input',
                                    a: {
                                        id: nestedCommentCheckbox + p.org_data.messageId,
                                        type: 'checkbox'
                                    },
                                },
                                {
                                    e: 'label',
                                    a: {
                                        for: nestedCommentCheckbox + p.org_data.messageId,
                                        style: 'text-align: center',
                                    },

                                    t: '同时评论'
                                },
                                {
                                    e: 'wf-button',

                                    t: '编辑',
                                    click: function(e) { openeditor(e) }
                                },
                                {
                                    e: 'wf-button',
                                    t: '转发',
                                    click: function(e) {
                                        // 按钮禁用
                                        $(e.sender).addClass('wf-disable')
                                        relaySubmit(e, true, false, p.org_data.messageId)



                                    }

                                }

                            ]
                        }



                    ]
                }
            })
        }
    }
    //改变转发的次数
    function changeRelayNum(e) {
        //里面转发列表的次数
        let relayNumEle = $(e.sender).parents('.relayFiledset').find('.relayNum')
        let oldNum = parseInt(relayNumEle.text())
        let newNum = oldNum + 1
        relayNumEle.text(newNum)
        //外层数量改变
        let relayButtonEle = $(e.sender).parents('message-handle-list').siblings('message-handle').find('.relayButton')
        let relayButtonNumEle = relayButtonEle.find('.relayButtonNum')
        relayButtonNumEle.text('转发(' + newNum + ')')
    }

    //更新点击转发后的内容
    function clickAfterRelayList(e, res) {
        let relayDiv = $(e.sender).parents('.relayFiledset').children('message-list-wrap')
        let blockRelayListContent = relayDiv.children(':first')
        //在渲染一个空盒子 (备注：因为用render方法渲染是后渲染，所以给个空盒子预留)
        // let blockHtml = '<div class="clearfloat messageListContent"></div>'
        let blockHtml = '<message-detail></message-detail>'
        if (blockRelayListContent.length > 0) {
            blockRelayListContent.before(blockHtml)
        } else {
            relayDiv.append(blockHtml)
        }

        //在重新获取一下空的元素
        relayDiv = $(e.sender).parents('.relayFiledset').children('message-list-wrap')
        blockRelayListContent = relayDiv.children(':first')
        //渲染新加转发的列表
        renderMessageList({
            container: blockRelayListContent,
            data: res.message
        })

    }

    //加载更多内容
    function more(p) {
        let fromId = p.sender.getAttribute('fromId')
        wf.http.get(
            wf.apiServer() + '/sns/message_forward_list', {
                messageId: p.org_data.messageId,
                fromId: fromId
            },
            function(res) {
                //重新设置按钮的fromId
                $(p.sender).attr('fromId', res.minId)
                //把当前登录用户信息存在每个message里面
                $.each(res.messages, function(i, item) {
                    item.loginUid = res.uid
                    if (item.forwardMessage) {
                        item.forwardMessage.loginUid = res.uid
                    }
                    if(res.praiseMessages){
                        var isPraiseFlag = -1
                        if(item.messageId){
                            isPraiseFlag = res.praiseMessages.indexOf(item.messageId)
                            
                            if(isPraiseFlag !== -1){
                                item.praiseType = '已点赞'
                                // 重置默认状态
                                isPraiseFlag = -1
                            }
                        }
                        if(item.forwardMessage){
                           
                            isPraiseFlag = res.praiseMessages.indexOf(item.forwardMessage.messageId)
                            if(isPraiseFlag !== -1){
                                ele.forwardMessage.praiseType = '已点赞'
                                // 重置默认状态
                                isPraiseFlag = -1
                            }
                        }
                    
                       
                    } 

                })
                let messageListEle = $(p.sender).siblings('message-list-wrap')
                if (res.messages) {
                    messageListEle.render({
                        data: res.messages,
                        template: [
                            {
                                e: 'message-detail',
                                t: [
                                    function(e) {
                                        renderMessageList(e)
                                    }
                                ]
                            }
                            
                        ]
                       
                    })
                }

                // 加载更多逻辑处理 
                var data = res
                data.messages = res.messages
                wf.sns.timeline.loadmore(messageListEle,data)

            },
            function(err) {






                console.log(err)
            }
        )
    }
    //编辑功能
    function openeditor(p) {
        wf.editor({
            content: p.new_data.wf_message_content,
            onclose: function(callbackdata) {
                console.log({ callbackdata: callbackdata })
            },
            onsubmit: function(content) {
                $(p.sender).parent('message-handle').siblings('textarea').val(content)
            },
        })
    }
}


//  jsbuilder/wf/sns/wf.sns.timeline/modules/wf.sns.timeline.share.js

/**
 * 分享功能
 * p 传入的元素数据
 * 
 */
wf.sns.timeline.share = function(p) {
    //阻止事件冒泡
    window.event.stopPropagation()                          
 
    if($(p.sender).children('wf-share').length>0){
        $(p.sender).children('wf-share').remove()

    }else{
        $(p.sender).closest('wf-sns').find('wf-share').remove()
        renderShare(p)
    }
    function renderShare (e){
        

        $(e.sender).find('wf-share').remove()
        $(e.sender).render({
            data:e.org_data,
            template:{
                e:'wf-share',
                a:{
                  
                    class: function(e) {
                        //获取蒙版位置函数

                        return getWfShareSite(e)
                    }

                },
                t:[
                    {
                        e:'wf-wb',
                        t:'新浪微博',
                        click:function(e){
                          
                            var url = wf.wfPubServer()+'/m/'+e.org_data.messageId
                         
                            var language = 'zh_cn'
                            var appkey = '2298735495'
                            var title = e.org_data.content
                            // 把#号转义一下    
                            var reg = new RegExp('#','g')//g,表示全部替换
                            title = title.replace(reg, '%23')
                            
                            if(title.length>100){
                                title=title.substring(0,99)
                                title=title+'...'
                            }

                            // if(e.org_data.thirdMessage){
                            //     title = e.org_data.thirdMessage.title

                            // }else if(e.org_data.forwardMessage){
                            //     if(e.org_data.forwardMessage.thirdMessage){
                            //         title = e.org_data.forwardMessage.thirdMessage.title
                            //     }else{
                            //         title = e.org_data.content
                            //     }

                            // }else{
                            //     title = e.org_data.content
                            // }
                          
                            var searchPic = true
                          
                            var href= 'https://service.weibo.com/share/share.php?url='+url+'&language='+language+'&appkey='+appkey+'&title='+title+'&searchPic'+searchPic
                          
                            href = encodeURI(href)
                            window.open(href,'专业内容知识聚合服务平台')
                    
                        }
                     
  
                    },
                    {
                        e:'wf-qrcode',
                       
                        t:[
                            {
                                e:'wf-div',
                                t:'微信扫一扫'
                            },
                            {
                                e:'wf-div',
                                t:function(e){
                                    $(e.container).qrcode({
                                        render: 'canvas', //也可以替换为table
                                        width: 100,
                                        height: 100,
                                        text: wf.wfPubServer()+'/m/'+e.data.messageId
                                    })
                                    
                                }
                                

                            },
                            // {
                            //     e:'wf-div',
                            //     t:'微信“扫一扫”打开网页后点击屏幕右上角“...”按钮,可以分享啦'
                            // },
                        ]
                    }
                ]
            }
        })
      

    }
  

    $(document).on('click',function(){
        if($('wf-share').length>0){
            $('wf-share').remove()

        }
    })

    //获取蒙板位置函数
    function getWfShareSite(e) {
        var classContent = '' //返回类名的变量
        var elementOffsetTop =$(e.container).offset().top //元素距离顶部高度
        var scrollBarHeight = $(document).scrollTop() //滚动条高度
        var elementToViewHeight = elementOffsetTop-scrollBarHeight //元素到页面顶部的高度
        // var elementWidth =  $(e.container).width()
        // var elementOffsetWidth =$(e.container).offset().left//元素距离右边的宽度
        // var scrollBarWidth = $(document).scrollLeft() //滚动条宽度
        // var elementToViewWidth= elementOffsetWidth-scrollBarWidth //元素到页面顶部的宽度
        // console.log(elementOffsetWidth)
        // console.log(scrollBarWidth)
        // console.log('元素到页面左边的宽度'+elementToViewWidth)
        var elementHeight = $(e.container).height()

        if(elementToViewHeight>elementHeight){
            classContent = classContent+'bottom'
        }else{
            classContent = classContent+'top'
        }

        
        return classContent
    }
}


//  jsbuilder/wf/sns/wf.sns.timeline/modules/wf.sns.timeline.thirdforward.js

wf.sns.timeline.thirdMessage = function(p) {

    $(p.container).render({
        
        data: p.data,
        template: {
            e: 'third-message',
            t: {
                if: 'thirdMessage',
                
                then: [
                   
                    {
                        if: 'thirdMessage/video/url',
                        then: {
                            video: '',
                            a: {
                                src: '[[thirdMessage/video/url]]',
                                controls: 'controls',
                                poster:'[[thirdMessage/video/poster]]'
                               

                            },
                            style: {
                                width: '100%'
                            }
                        }
                    },
                    {
                        if: 'thirdMessage/audio/url',
                        then: {
                            audio: '',
                            a: {
                                src: '[[thirdMessage/audio/url]]',
                                controls: 'controls',
                                
                               

                            },
                            style: {
                                width: '100%'
                            }
                        }
                    },
                    {
                        if: 'thirdMessage/icon/url',
                        then: {
                            icon: [{
                                e:'a',
                                a:{
                                    href: function(p) {
                                        return p.data.icon.href || p.data.url
                                    },
                                    target:'_blank' 
                                },
                                t: {
                                    img: '[[icon/url]]',
                                    style: {
                                        height: '70px',
                                        width: '113px'
                                    }
                                }
                            }
                            ],
                            datapath: 'thirdMessage'
                        },
                        else: function(p){
                           
                            var thirdMessage = p.data.thirdMessage
                            $(p.container).render({
                                data:thirdMessage,
                                template:{
                                    if: 'appinfo/logoUrl',
                                    
                                    then: {
                                        icon: [{
                                            
                                            e:'a',
                                            a:{
                                                href:wf.wfPubServer() + '/apps/[[appinfo/indexUrl]]',
                                                target:'_blank',
                                            },
                                            t: {
                                                img: '[[appinfo/logoUrl]]',
                                                style: {
                                                    height: '70px',
                                                    width: '113px'
                                                }
                                            }
                                            
                                           
                                        }],
                                        datapath: 'thirdMessage',
                                        a: {
                                            title: '[[appinfo/appName]]'
                                        }
                                    },
                                }

                            })

                        }
                    }, {
                        description: [
                            { 
                                // a:'[[url]]',
                                e:'a',
                                a:{
                                    href:'[[url]]',
                                    target:'_blank' 
                                },
                                t: { h2: '[[title]]' } 
                            }, 
                            {
                                'wf-p':function(e){
                                    let description
                                    if(e.data.description){
                                        description = e.data.description
                                        description = description.replace(/</g,'&lt;')
                                        description = description.replace(/>/g,'&gt;')
                                        description = description.replace(/\n/g,'')
                                        return description 
                                    }
                                }
                            }
                        ],
                        datapath: 'thirdMessage'
                    }
                ],

                else: '不可访问'
            }
        }
    })
}

//  jsbuilder/wf/sns/wf.sns.timeline/modules/wf.sns.timeline.userRecommend.js

// $.fn.extend({
//     userRecommend: function() {
//         $('wf-user-recommend', this).each(function(i, element) {
//             wf.sns.timeline.userRecommend(element)
//         })
//     }
// })

wf.sns.timeline.userRecommend= function () {
    if($('wf-user-recommend-pop').length>0){
        // wf.sns()
        return false

    }
    
    if(wf.userRecommendState===0){
        renderWfUserRecommendPop()
    }
    function renderWfUserRecommendPop(){
        $(document.body).render({
            data:{},
            template: {
                e:'wf-user-recommend-pop',
                
                t:[
                    {
                        e:'wf-user-recommend',
                      
                        t:function(e){
                            getData(e.container)
                                   
                        }
                    },
                    
                ]
            }
        })
        $('wf-user-recommend-pop').show()
        
    }
    
    function getData (element) {
        wf.http.get(wf.apiServer() + '/sns/user_recommend',
            {},
            function (data) {
                $(element).empty().render({
                    data:data,
                    template:[
                        {
                            e:'wf-user-recommend-content',
                            t:[
                                {
                                    e:'wf-user-recommend-heard',
                                   
                                    t:'平台为您推荐以下可关注用户：'
                                },
                                {
                                    e:'wf-user-recommend-info',
                                    datapath:'users',
                                    t:[
                                        {
                                            e: 'user-wrap',

                                            t: [
                                                
                                                {
                                                    e: 'img',
                                                    style:{
                                                        'margin-right':'10px',
                                                        float:'left',
                                                      
                                                    },
                                                    a: {
                                                        src: '[[avatarUrl]]',
                                                        class: 'avatar-img'
                                                    }
                                                },
                                                {
                                                    e:'wf-nickname-type',
                                                    a:{
                                                        class:function(e){
                                                           
                                                            if(e.data.type){
                                                                if(e.data.type==='个人'){
                                                                    var badge = e.data.badge ? e.data.badge : []
                                                                    if(badge){
                                                                        var flag = e.data.badge.indexOf('creator')
                                                                        if(  flag !== -1){
                                                                            return 'tag-type-true' 
                                                                        }
                                                                    }
                                                                   
                                                                    return 'tag-type-false'

                                                                }else{
                                                                    return 'tag-type-true'
                                                                }
                                                            }
                                                            


                                                        }
                                                    },
                                                    t:[
                                                        {
                                                            e: 'wf-span',
                                                            a:{
                                                                title:'[[nickname]]'
                                                            },
                                                            t: '[[nickname]]'
                                                           
                                                        },
                                                        function(e){
                                                            wf.user.renderBadge(e)
                                                        },
                                                        // {
                                                        //     e:'wf-user-tag',
                                                        //     style:{
                                                        //         // 'margin-right':'10px'
                                                        //     },
                                                           
                                                        //     t:'[[type]]'
                                                        // }
                                                        {
                                                            if: function (p) {
                                                                
                                                              
                                                                return (p.data.type !== '个人')
                                                            },
                                                            then: '<wf-user-tag>[[type]]</wf-user-tad>',
                                                        }

                                                    ]
                                                },
                                                {
                                                    e:'input',
                                                    
                                                    a:{
                                                        type:'checkbox',
                                                        name:'recommend_user_checkbox',
                                                        value:'[[uid]]',
                                                        checked:'checked',
                                                        class:function(e){
                                                            if(e.data.type){
                                                                if(e.data.type==='个人'){
                                                                   
                                                                    return 'tag-type-false'

                                                                }else{
                                                                    return 'tag-type-true'
                                                                }
                                                            }else{
                                                                return 'tag-type-false'
                                                            }

                                                        }
                                                    },
                                                    click:function(e){
                                                        var checkedAttr =$(e.sender).prop('checked')
                                                        $(e.sender).prop('checked',!checkedAttr)
                                                
                                                    }
                                                },
                                                   
                                            ]
                                        },
            
                                    ]
                           
                                },
                                {
                                    e:'wf-oneclickattention-handle',
                                    style:{
                                        display:'block',
                                        width:'100%',
                                        'text-align':'center'

                                    },
                                    t:{
                                        e:'wf-button',
                                       
                                        t:'一键关注',
                                        click:function(e){
                                            submitFollowData(e.sender)
                                        }
                                              
                                    }
                                }
                                
                            ]
        
                        },
                        {
                            e:'wf-user-recommend-popclose',
                            
                            t: 'x',
                            click:function(e){
                               
                                $(e.sender).parents('wf-user-recommend-pop').remove()
            
                            }
                        }
                    ]
                })
                var firstWfUserRecommendInfo =  $(element).find('wf-user-recommend-info')[0]
                var firstInput = $(firstWfUserRecommendInfo).find('input[name="recommend_user_checkbox"]')
                $(firstInput).prop('checked','checked')
                $(firstInput).prop('disabled','disabled')
                $('input[name="recommend_user_checkbox"]').unbind('click')
            })
    }

    function submitFollowData (element){
        var wfUserRecommend =$(element).closest('wf-user-recommend')
        var wfUserRecommendAllInput = wfUserRecommend.find('input[name="recommend_user_checkbox"]')
        var submitData = []
        $.each(wfUserRecommendAllInput,function(i,item){
            if( $(item).prop('checked')){
                submitData.push( $(item).val())

            }
            
        })
        wf.http.post(wf.apiServer() + '/sns/follow_batch_add',
            {
                targetUids:submitData 
            },
            function(){
                $(element).closest('wf-user-recommend-pop').hide()
                console.log($('wf-sns sns-container tab tab-nav'))
                
                // // 成功关注之后刷新页面
                // $.each($('wf-sns sns-container tab tab-nav'), function (i, item) {
                    
                //     // 给帖子加上类名
                //     if ($(item).text() === '关注') {
                //         console.log('进来了')
                //         $(item).click()
                //     }
        
                // })
            },
            function(err){
               
                wf.error(err)
            }
        )
        
    }
    
}

//  jsbuilder/wf/sns/wf.sns.timeline/modules/wf.sns.timeline.weboShare.js

wf.sns.timeline.weiboShare = function (e) {
    $(e.container).render({
        data:e.data,
        template:{
            e: 'wf-button',
            a: {
                class: 'weiboShareBtn',
            },
            
            t: [
                {
                    e:'img',
                    
                    a:{
                        src:function(){
                            return wf.comServer()+'/img/wb.png'
                        },
                        title:'分享到微博'
                    }
                },
                '分享到微博'
            ],
            click: function (e) {
                var url = wf.wfPubServer()+'/m/'+e.org_data.messageId
                var language = 'zh_cn'
                var appkey =wf.weiboAppKey()
                var title = e.org_data.content
                // // 把#号转义一下    
                // var reg = new RegExp('#','g')//g,表示全部替换
                // title = title.replace(reg, '%23')
                // // 把&符号转义一下&amp;
                // var test = new RegExp('&','g')
                // title = title.replace(test, '%26')
         
                
                if(title.length>100){
                    title=title.substring(0,99)
                    title=title+'...'
                }
          
                // if(e.org_data.thirdMessage){
                //     title = e.org_data.thirdMessage.title
  
                // }else if(e.org_data.forwardMessage){
                //     if(e.org_data.forwardMessage.thirdMessage){
                //         title = e.org_data.forwardMessage.thirdMessage.title
                //     }else{
                //         title = e.org_data.content
                //     }
  
                // }else{
                //     title = e.org_data.content
                // }
              
                var searchPic = true
                url = encodeURIComponent(url)
                title =  encodeURIComponent(title)
                appkey = encodeURIComponent(appkey)
             
                var href= 'https://service.weibo.com/share/share.php?url='+url+'&language='+language+'&appkey='+appkey+'&title='+title+'&searchPic'+searchPic
                href = encodeURI(href)
                window.open(href,'专业内容知识聚合服务平台')
       
  
            }
   
        }

    })
      
}

//  jsbuilder/wf/sns/wf.sns.timeline/modules/wf.sns.timeline.wexiShare.js

wf.sns.timeline.wexiShare = function (e) {
    $(e.container).render({
        data:e.data,
        template:{
            e: 'wf-button',
            a: {
                class: 'weixiShareBtn',
            },
            t: [
                {
                    e:'img',
                    a:{
                        src:function(){
                            return wf.comServer()+'/img/wx.png'
                        },
                        title:'微信扫一扫'
                    }
                },
                '微信扫一扫'
            ],
            click: function (e) {
                //阻止事件冒泡
                window.event.stopPropagation()   
                if( $('wf-qrcode').length>0){
                    if($(e.sender).find('wf-qrcode').length>0){
                        $('wf-qrcode').remove()
                    }else{
                        $('wf-qrcode').remove()
                        wxScan(e)
                    }
                }else{
                    wxScan(e)
                }
            }
     
        }
    })
    // 二维码
    function wxScan(e){
        $(e.sender).render({
            data:e.org_data,
            template: {
                e:'wf-qrcode',
                a:{
                    class:function(e){
                       
                        return  getWfShareSite(e)

                    }

                },
                t:function(e){
                    
                    $(e.container).qrcode({
                        render: 'canvas', //也可以替换为table
                        width: 80,
                        height: 80,
                        text: wf.wfPubServer()+'/m/'+e.data.messageId
                    })
                  
                }
            }
     
        })

    }

    //获取蒙板位置函数
    function getWfShareSite(e) {
        var classContent = '' //返回类名的变量
        var elementOffsetTop =$(e.container).offset().top //元素距离顶部高度
      
        var scrollBarHeight = $(document).scrollTop() //滚动条高度

        var elementToViewHeight = elementOffsetTop-scrollBarHeight //元素到页面顶部的高度
        // var elementWidth =  $(e.container).width()
        // var elementOffsetWidth =$(e.container).offset().left//元素距离右边的宽度
        // var scrollBarWidth = $(document).scrollLeft() //滚动条宽度
        // var elementToViewWidth= elementOffsetWidth-scrollBarWidth //元素到页面顶部的宽度
        // console.log(elementOffsetWidth)
        // console.log(scrollBarWidth)
        // console.log('元素到页面左边的宽度'+elementToViewWidth)
        var elementHeight = $(e.container).height()
     

        if(elementToViewHeight>elementHeight){
            classContent = classContent+'bottom'
        }else{
            classContent = classContent+'top'
        }

        
        return classContent
    }
    $(document).on('click',function(){
        if($('wf-qrcode').length>0){
            $('wf-qrcode').remove()
        }
    })
}


//  jsbuilder/wf/sns/wf.sns.timeline/modules/wf.sns.timeline.wfArticle.js

wf.sns.timeline.wfArticle = function (params) {
   
    $(params.container).render({
        data:params.data.content,
        template:[
            {
                e:'wf-article-content',
                id: params.data.messageId,
                t:[
                    {
                        e:'wf-button',
                        a:{
                            class:'readAllArticle'
                        },
                        t:'',
                        click:function(e){
                 
                            var wfArticle = $(e.sender).siblings('wf-article')
                  
                  
                            if($(e.sender).text()==='阅读全文'){
                                wfArticle.css('max-height','none')
                                wfArticle.css('height','auto')
                                $(e.sender).text('收起全文')
    
                            }else if($(e.sender).text()==='收起全文'){
                                wfArticle.css('max-height','210px')
                                $(e.sender).text('阅读全文')
    
                            }
    
                        }
    
    
                    },
                    {
                        e:'wf-article',
                       
                        a: {
                            'id': function () { return 'content-of-' + params.data.messageId },
                            'class':' wf-article-content'
                        },
                        t:function(e){
                            var containerHtml = wf.replace.all(e.data,e.container)
                            $(e.container).html(containerHtml)
                            // 调用mermaid渲染图
                            if($(e.container).find('div.mermaid').length>0){
                                mermaid.init(undefined, $('div.mermaid', e.container))
                            }
                            // 调用MathJax渲染公式
                            if (MathJax.typesetPromise) MathJax.typesetPromise([e.container])
                            // functionPlot 图像 
                            if($(e.container).find('div.functionPlot').length>0){
                                wf.functionPlot(e.container)
                            }
                            if(e.data.match(/\$\$\n/)||e.data.match(/\$\n/)||e.data.match(/\\\(\n/)||e.data.match(/\\\[\n/)){
                                if (MathJax.typesetPromise) MathJax.typesetPromise([e.container])
                            }

                            setTimeout(function(){
                                var wfArticleHeight = $(e.container).outerHeight()
                                var defaultHeight = 210
                                var buttonEle = $(e.container).siblings('wf-button')
                                var wfArticleContentEle =  $(e.container).closest('wf-article-content')
                                
                                if(wfArticleHeight>defaultHeight){
                                    buttonEle.text('阅读全文')
                                    wfArticleContentEle.css('padding','0 0 20px 0')
                                    wfArticleContentEle.css('margin-bottom','10px')
                                    $(e.container).css('max-height',defaultHeight+'px')
                                    $(e.container).css('overflow','hidden')
                                    $(e.container).css('display','block')
                                    $(e.container).siblings('.readAllArticle').show()
        
                                }else{
                                    buttonEle.remove()
                                    $(e.container).css('display','block')
                                }
                            },50)
                           
    
                  
    
                        }
                    },
                ]
            }
            
     
     

        ]
    })
}

//  jsbuilder/wf/sns/wf.sns.timeline/modules/common/MessageRefresh.js

wf.sns.timeline.MessageRefresh = function (e, res) {
    this.refresh = function () {
        let blockMessageContainer = $(e.sender).parents('message-list').children(':first')
        locateTheFirst()
        //渲染装message的空盒子
        let blockMessageHtml = '<message></message>'
        blockMessageContainer.before(blockMessageHtml)
        blockMessageContainer = $(e.sender).parents('message-list').children(':first')

        locateTheFirst()

        //在渲染更新帖子
        wf.sns.timeline.message({
            container: blockMessageContainer,
            data: res.message
        })

        function locateTheFirst() {
            if (blockMessageContainer.length === 0) {
                blockMessageContainer = $('message-list').children(':first')
            }
        }
    }
}

//  jsbuilder/wf/sns/wf.sns.timeline/modules/message-edit/wf.sns.timeline.message-editor.js

wf.sns.MessageEditor = function (previousData, currentData) {
    this.previousData = previousData
    this.currentData = currentData
    const MAX_UPDATE_COUNT = 5

    this.edit = function () {
        if (previousData.updated_count >= MAX_UPDATE_COUNT) {
            dialog.fail('此次编辑失败. 您编辑这个帖子太多次了, 目前仅支持一个帖子不超过' + MAX_UPDATE_COUNT + '次的修改')
            return
        }
        const newContent = generateNewTextContent(this.previousData, this.currentData)
        const requestPayload = buildRequestPayload(newContent)

        submitAlteration(requestPayload)
    }

    this.isAlterOperation = function (requestSource) {
        return requestSource === 'alter'
    }

    function generateNewTextContent(previousData, currentData) {
        const newTextContent = getNewTextContent(currentData)
        const forwardingDelimiter = '//@';
        if (previousData.content.includes(forwardingDelimiter)) {
            return newTextContent + getForwardedTextContent(previousData)
        }
        return newTextContent

        function getNewTextContent(currentData) {
            return currentData.wf_message_content
        }

        function getForwardedTextContent(previousData) {
            return previousData.content.slice(previousData.content.indexOf(forwardingDelimiter))
        }
    }

    function buildRequestPayload(newContent) {
        const result = {messageId: getMessageId(), newContent: newContent}
        overrideImageIds(result)
        return result
    }

    function overrideImageIds(target) {
        const imageIds = new wf.sns.timeline.MessageImgEditor(null).listRenderedImageIds()
        if (!$.isEmptyObject(imageIds)) {
            target.imageId = imageIds
            return
        }
        // 清空图片信息
        target.imageId = null
    }

    function submitAlteration(requestPayload) {
        wf.http.post(wf.apiServer() + '/sns/user_message_update', requestPayload,
            function (payload) {
                reflectToPage(payload)
            },
            function(err) {
                dialog.fail('编辑失败, 失败原因: ' + err.err_message + ', ' + err.sub_msg + ' 您若有任何疑问, 请联系网站人员')
            }
        )

        function reflectToPage(payload) {
            const newContent = generateNewTextContent(previousData, currentData)
            storeIntoElement(payload, newContent)
            render(newContent)
        }

        function storeIntoElement(payload, newContent) {
            previousData.content = newContent
            overrideImageIds(previousData)
            if (payload === null || payload.updated_count === null) {
                return
            }
            // 刷新修改次数
            previousData.updated_count = payload.updated_count
        }

        function render(newContent) {
            const $articleContainer = $('#content-of-' + getMessageId())
            const $editStateSelector = getEditStateSelector()

            renderText($articleContainer, newContent)
            renderEditState($editStateSelector)
            renderDiagram($articleContainer)
            renderImages($editStateSelector)
        }

        function renderText($articleContainer, newContent) {
            $articleContainer.html(generateContentHtml(newContent))
        }

        function generateContentHtml(newContent) {
            return wf.replace.all(newContent)
        }

        function renderEditState($editStateSelector) {
            $editStateSelector.html('<t class="wf-cursor-pointer">已编辑</t>')
            $editStateSelector.unbind('click').bind('click', function(event) {
                const clickedMessageId = $(event.currentTarget).siblings('wf-article-content').attr('id')
                wf.sns.timeline.popUpEditHistoryWidget(clickedMessageId)
            })
        }

        function renderDiagram($articleContainer) {
            // 调用mermaid渲染图
            mermaid.init(undefined, $('div.mermaid', $articleContainer))
            // 调用MathJax渲染公式
            if (MathJax.typesetPromise) MathJax.typesetPromise($articleContainer)
            wf.functionPlot($articleContainer)
        }

        function renderImages($editStateSelector) {
            // 清空已渲染的图片
            $editStateSelector.siblings('img-item-ul').remove()
            // 重新渲染新图片
            wf.sns.timeline.imagepart({
                container: $editStateSelector.parents('message-body'),
                data: previousData
            })
        }
    }

    function getEditStateSelector() {
        return $('#edit-state-of-' + getMessageId())
    }

    function getMessageId() {
        return previousData.messageId
    }
}

//  jsbuilder/wf/sns/wf.sns.timeline/modules/message-edit/wf.sns.timeline.message-history.js

wf.sns.renderHistoryMessages = function (container, messageId) {
    wf.http.get(wf.apiServer() + '/sns/user_message_history_list',
        {messageId: messageId},
        function (data) {
            if ($.isEmptyObject(data)) {
                return
            }
            $(container).render({
                data: data.results,
                template: {e: 'message', t: renderMessage}
            })
            // 样式上为了能和帖子列表保持一致, 也为了复用一套css, 包裹弹出框.
            $('popbody').wrap('<wf-sns></wf-sns>')
        }
    )

    /**
     * 渲染一个帖子的规则
     * @param messageElement 一个贴子的元素信息, 包含数据和DOM
     */
    function renderMessage(messageElement) {
        $(messageElement.container).render({
            data: messageElement.data,
            template: {
                'message-detail': [
                    wf.sns.timeline.getAvatarRenderTemplate(),
                    {
                        'message-body': [
                            wf.sns.timeline.getNicknameRenderTemplate(),
                            {
                                e: 'create-time',
                                t: function (e) {
                                    return e.data.createTime.split('.')[0]
                                }
                            },
                            {
                                e: 'edit-state',
                                style: {
                                    margin: '5px'
                                },
                                t: function (e) {
                                    return e.data.updated_count > 0 ? '编辑贴' : '原贴'
                                }
                            },
                            function (e){ wf.sns.timeline.getArticleRenderTemplate(e) },
                            {
                                if: function (e) {
                                    return e.data.imageId
                                },
                                then: wf.sns.timeline.imagepart
                            }
                        ]
                    },
                    {
                        e: 'message-handle-list',
                    }
                ]
            }
        })
    }
}

//  jsbuilder/wf/sns/wf.sns.timeline/modules/message-edit/wf.sns.timeline.message-img-editor.js

wf.sns.timeline.MessageImgEditor = function (imageIds) {
    this.ids = imageIds

    this.existImages = function () {
        return this.ids != null && this.ids.length > 0
    }

    this.popUpImagesUploaderWithImages = function () {
        getImageUploadContainerSelector().css('display', 'block')
        const imageSlotSelector = getImageSlotSelector()
        const images = constructImagesData(this.ids)
        wf.sns.renderImagesContainerWithImages(imageSlotSelector, images)
    }

    this.listRenderedImageIds = function () {
        const $imagesContainerSelector = getImageSlotSelector()
        const imgDoms = $imagesContainerSelector.siblings('.upload-img-list-item').children('img').toArray()
        return imgDoms.map(function (imgDom) {
            return imgDom.id
        })
    }

    function getImageSlotSelector() {
        const $uploadImageContainer = getImageUploadContainerSelector()
        return $uploadImageContainer.find('.upload-img-list-button')
    }

    function getImageUploadContainerSelector() {
        const $imageFileUploadEle = $('popdialog popbody wf-messagesender wf-messagesender-img #image-file-upload')
        return $imageFileUploadEle.siblings('upload-image-container')
    }

    function constructImagesData(imageIds) {
        return imageIds.map(function (id) {
            return {
                name: id,
                url: wf.snsOssServer() + '/' + id
            }
        })
    }
}

//  jsbuilder/wf/sns/wf.sns.timeline/modules/message-sender/edit/md/image-upload/wf.sns.timeline.message-sender.edit.md.image-upload.js

wf.sns.timeline.ImageUploadMarkdown = function (imageUploadElementId) {
    
    this.popUpUploadWidget = function () {
        getImageUploadElementSelector().click()
    }

    this.uploadAndRender = function (insertTextFunction) {
        getImageUploadElementSelector().fileupload({
            'url': wf.snsServer() + '/message/uploadImage',
            xhrFields: {
                withCredentials: true
            },
            //按顺序上传
            sequentialUploads: true,
            //多个文件一起上传
            singleFileUploads: false,
            add: function (event, data) {
                const acceptFileTypes = /^gif|jpe?g|png$/i
                const imageAmount = data.originalFiles.length
                if (imageAmount > 9) {
                    dialog.fail('单次上传最多支持9张图片, 请分批上传')
                    return
                }
                for (let i = 0; i < imageAmount; i++) {
                    let item = data.originalFiles[i]
                    let name = item.name
                    let index = name.lastIndexOf('.') + 1
                    let fileType = name.substring(index, name.length)
                    if (!acceptFileTypes.test(fileType)) {
                        dialog.fail('包含非图片, 请排除后重新上传')
                        return
                    }
                    //文件大小判断
                    if (item.size > (20 * 1024 * 1024)) {
                        dialog.fail('检测到包含大于20M的图片, 暂不支持单个图片超过20M的上传, 请移除它或压缩后重新上传.')
                        return
                    }
                }
                data.submit()
            },
            done: function (event, data) {
                render(data.result.fileList, insertTextFunction)
            }
        })
    }

    function getImageUploadElementSelector() {
        return $('#' + imageUploadElementId)
    }

    function render(items, insertTextFunction) {
        const urls = listImageUrls(items)

        const imagesMarkdownStrings = constructImageMarkdownFormat(urls)

        insertResultIntoEditor(imagesMarkdownStrings)

        function listImageUrls(items) {
            return items.map(function (item) {
                return item.url
            })
        }

        function constructImageMarkdownFormat(urls) {
            return urls.map(function (url) {
                return '![](' + url + ')'
            })
        }

        function insertResultIntoEditor(markdownTexts) {
            insertTextFunction(markdownTexts.join(''))
        }
    }
}

//  jsbuilder/wf/sns/wf.sns.timeline/modules/relay-after-commenting/CommentAndRelay.js

wf.sns.timeline.CommentAndRelay = function (e, isOuterComment) {
    this.relay = function() {
        let comment = e.new_data.wf_message_content
        const isRelayedMessage = e.org_data.messageType === 'forward' || e.org_data.messageType === 'thirdForward'
        if (isOuterComment && isRelayedMessage) {
            comment = comment + '//@' + e.org_data.user.nickname + ':' + e.org_data.content
        }
        wf.http.post(
            wf.apiServer() + '/sns/message_send', {
                content: comment,
                forwardMessageId: e.org_data.messageId + ''
            },
            function(res) {
                //解禁禁用
                $(e.sender).removeClass('wf-disable')
                //给添加loginUid
                res.message.loginUid = res.user.uid
                res.message.loginUserRole = res.user.role
                if(res.message.forwardMessage){
                    res.message.forwardMessage.loginUid = e.org_data.loginUid
                }

                const newCount = e.org_data.forwardCount + 1

                const relayButtonEle = $(e.sender)
                    .parents('message-handle-list')
                    .siblings('message-handle')
                    .find('.relayButton')
                relayButtonEle.text('转发(' + newCount + ')')

                //更新帖子的列表
                new wf.sns.timeline.MessageRefresh(e, res).refresh()

            },
            function(err) {
                //解禁禁用
                $(e.sender).removeClass('wf-disable')
                wf.error(err)
            }
        )
    }
}

//  jsbuilder/wf/synclogin/synclogin.js

wf.synclogin = function () {
    if (window != top){
        return
    }
    let url = window.location.host
    if (url.match(RegExp(/test.wanfangdata.com.cn/))) {
        return
    }
    if (url.match(RegExp(/wanfangdata.com.cn/))) {
        synclogin_wanfang()
        return
    }
}


function synclogin_wanfang() {
    $.ajax({
        type: 'get',
        url: 'https://login.wanfangdata.com.cn/user/person',
        cache: false,
        async: false,
        crossDomain: true,
        xhrFields: {
            withCredentials: true //携带cookie
        },
        data: {},
        success: function (data) {
            if (data && data.online === true) {
                let loginState = wf.isLogin()
             
                if (loginState && loginState.code !== 200)
                    window.location.replace('https://open.wanfangdata.com.cn/oauth2/wfpub?redirectUri=' + encodeURIComponent(window.location.href))
            }
        }
    })
}

//  jsbuilder/wf/user/experiencePop.js


wf.user.experiencePop = function () {
    
    wf.pop({
        width: '800px',
        style:{
            padding:'0 10px'
        },
        template: [
            {
                e:'wf-pop-exp-head',
                t:'经验值指南',
            },
            {
                e:'wf-pop-exp-body',
                t:[
                    {
                        e:'wf-pop-exp-des',
                        t:[
                            {
                                e:'wf-pop-exp-title',
                                t:'I 经验值是什么'
                            },
                            {
                                e:'wf-p',
                                t:'为提升用户社区活跃积极性和等级权益，建立社区用户等级，目前用户等级分为6级，社区等级是根据用户在社区的行为（发帖、评论、转发等）所计算出的，用户可在社区进行一定的行为增加经验值以升级。'
                            }
                        ]
                
                    },
                    {
                        e:'wf-pop-exp-rule',
                        t:[
                            {
                                e:'wf-pop-exp-title',
                               
                                t:'II 经验值规则'
                            },
                            {
                                e:'table',
                               
                                a:{
                                    class:'wf_sns_table'
                                },
                                t:[
                                    {
                                        e:'thead',
                                        t:[
                                            {
                                                e:'tr',
                                                a:{
                                                    class:'wf_sns_tr'
                                                },
                                            
                                                t:[
                                                    {
                                                        e:'th',
                                                       
                                                        a:{
                                                            class:'wf_sns_th'
                                                        },
                                                        t:'行为'
                                                    },
                                                    {
                                                        e:'th',
                                                        a:{
                                                            class:'wf_sns_th'
                                                        },
                                                       
                                                        t:'经验值'
                                                    }
                                                ]
                                            },
                                        ]

                                    },
                                    {
                                        e:'tbody',
                                        a:{
                                            class:' wf_sns_tbody'
                                        }, 
                                        t:[
                                            {
                                                e:'tr',
                                                a:{
                                                    class:'wf_sns_tr'
                                                }, 
                                               
                                                t:[
                                                    {
                                                        e:'td',
                                                        a:{
                                                            class:'wf_sns_td'
                                                        }, 
                                                        t:'首次注册登录'
                                                    },
                                                    {
                                                        e:'td',
                                                        a:{
                                                            class:'wf_sns_td'
                                                        }, 
                                                        t:'+5'
                                                    }
                                                ]
                                            },
                                            {
                                                e:'tr',
                                                a:{
                                                    class:'wf_sns_tr'
                                                }, 
                                                t:[
                                                    {
                                                        e:'td',
                                                        a:{
                                                            class:'wf_sns_td'
                                                        },
                                                        t:'发帖'
                                                    },
                                                    {
                                                        e:'td',
                                                        a:{
                                                            class:'wf_sns_td'
                                                        },
                                                        t:'+3'
                                                    }
                                                ]
                                            },
                                            {
                                                e:'tr',
                                                a:{
                                                    class:'wf_sns_tr'
                                                },
                                                t:[
                                                    {
                                                        e:'td',
                                                        a:{
                                                            class:'wf_sns_td'
                                                        },
                                                        t:'帖子首次被转发'
                                                    },
                                                    {
                                                        e:'td',
                                                        a:{
                                                            class:'wf_sns_td'
                                                        },
                                                        t:'+3'
                                                    }
                                                ]
                                            },
                                            {
                                                e:'tr',
                                                a:{
                                                    class:'wf_sns_tr'
                                                },
                                                t:[
                                                    {
                                                        e:'td',
                                                        a:{
                                                            class:'wf_sns_td'
                                                        },
                                                        t:'评论'
                                                    },
                                                    {
                                                        e:'td',
                                                        a:{
                                                            class:'wf_sns_td'
                                                        },
                                                        t:'+2'
                                                    }
                                                ]
                                            },
                                            {
                                                e:'tr',
                                                a:{
                                                    class:'wf_sns_tr'
                                                },
                                                t:[
                                                    {
                                                        e:'td',
                                                        a:{
                                                            class:'wf_sns_td'
                                                        },
                                                        t:'转发'
                                                    },
                                                    {
                                                        e:'td',
                                                        a:{
                                                            class:'wf_sns_td'
                                                        },
                                                        t:'+2'
                                                    }
                                                ]
                                            },
                                            
                                            {
                                                e:'tr',
                                                a:{
                                                    class:'wf_sns_tr'
                                                },
                                                t:[
                                                    {
                                                        e:'td',
                                                        a:{
                                                            class:'wf_sns_td'
                                                        },
                                                        t:'点赞'
                                                    },
                                                    {
                                                        e:'td',
                                                        a:{
                                                            class:'wf_sns_td'
                                                        },
                                                        t:'+1'
                                                    }
                                                ]
                                            },
                                            {
                                                e:'tr',
                                                a:{
                                                    class:'wf_sns_tr'
                                                },
                                                t:[
                                                    {
                                                        e:'td',
                                                        a:{
                                                            class:'wf_sns_td'
                                                        },
                                                        t:'连续登录1天'
                                                    },
                                                    {
                                                        e:'td',
                                                        a:{
                                                            class:'wf_sns_td'
                                                        },
                                                        t:'+1'
                                                    }
                                                ]
                                            },
                                            {
                                                e:'tr',
                                                a:{
                                                    class:'wf_sns_tr'
                                                },
                                                t:[
                                                    {
                                                        e:'td',
                                                        a:{
                                                            class:'wf_sns_td'
                                                        },
                                                        t:'连续登录2天'
                                                    },
                                                    {
                                                        e:'td',
                                                        a:{
                                                            class:'wf_sns_td'
                                                        },
                                                        t:'+2'
                                                    }
                                                ]
                                            },
                                            {
                                                e:'tr',
                                                a:{
                                                    class:'wf_sns_tr'
                                                },
                                                t:[
                                                    {
                                                        e:'td',
                                                        a:{
                                                            class:'wf_sns_td'
                                                        },
                                                        t:'连续登录3到n天'
                                                    },
                                                    {
                                                        e:'td',
                                                        a:{
                                                            class:'wf_sns_td'
                                                        },
                                                        t:'+3'
                                                    }
                                                ]
                                            }
                                        ]

                                    }
                                ]
                            },
                            {
                                e:'wf-pop-exp-note',
                                t:'注 1: 连续登录中断,按照连续登录1天计算经验值'
                            },
                            {
                                e:'wf-pop-exp-note',
                                t:'注 2: 评论、转发、点赞行为每天最多增长各10个经验值'
                            }
                            

                                
                                
                        ]
              
                    },
                    {
                        e:'wf-pop-exp-upgrade',
                      
                        t:[
                            {
                                e:'wf-pop-exp-title',
                                
                                t:'III 升级解锁权益'
                            },
                            {
                                e:'wf-p',
                                t:'不同等级用户可以获得不同的权益，等级越高可获得的社区权益越多，具体内容请期待【权益中心】'
                            }
                        ]
                    }
                ]
            }
        ]
    })
  
}

//  jsbuilder/wf/user/get_url_param.js

wf.user.getUrlParam = function () {
    let url = window.location.href
    let query =  url.split('?')
    if(!query[1]){
        return {}
    }else{
        query = query[1].split('&')
        var params = {}

        for (let i = 0; i < query.length; i++) {
            let q = query[i].split('=')
            if (q.length === 2) {
                params[q[0]] = q[1]+'' ? decodeURIComponent(q[1]+ '') :q[1]+''
            }
        }
        return params

    }
}

//  jsbuilder/wf/user/other_usercard.js

$.fn.extend({
    render_other_usercard: function() {
        $('wf-other-usercard', this).each(function(i, element) {
            var requireData = {}
            var uid = element.getAttribute('uid') || element.getAttribute('data-uid') 
            var subjectRouter = element.getAttribute('subject_router') || element.getAttribute('data-subject_router')
            var unionId = element.getAttribute('union_id') || element.getAttribute('data-union_id')
           
            if(unionId) {
                requireData.unionId = unionId

            }else{
                if (uid) {
                    requireData.uid = uid
                }
            }

            var requestUrl =wf.apiServer() + '/sns/user_card'
            
            wf.http.get(
                requestUrl,
                requireData,
                function(resData) {
                    //动态渲染元素
                    if (resData.user) {
                        $(element).empty().render({
                            data: resData,
                            template: [
                                {
                                    e: 'wf-nickname-profile',
                                    a:{
                                        class:'clearfloat'
                                    },
                                    t:[
                                       
                                        {
                                            e:'wf-nickname',
                                            datapath: 'user',
                                            a:{
                                                title:function(e){
                                                    return e.data.nickname ? e.data.nickname : '暂无信息！'

                                                }
                                            },
                                            t:'@'+'[[nickname]]'
                                           
                                          
                                        },
                                        
                                        {
                                            e:'wf-profile',
                                            datapath: 'user',
                                            a:{
                                                title:function(e){
                                                    return e.data.profile ? e.data.profile : '暂无信息！'
    
                                                }
                                            },
                                            t:function(e){

                                                
                                                return e.data.profile ? e.data.profile : '暂无信息！'
                                            }   
                                        },
                                        {
                                                
                                            e:'wf-user-level',
                                            datapath: 'user',
                                           
                                            t:function(e){
                                                if(e.data.experience){
                                                    if(e.data.experience.level){
                                                        return 'LV' + e.data.experience.level
                                                    }
                                                   
                                                }

                                                return 'LV1'


                                            }
                                            

                                        },
                                    ]

                                },
                                function(e){  
                                   
                                    if( subjectRouter &&  subjectRouter==='my'){
                                        // 主观页显示经验值
                                        wf.user.renderExperience(e) 
                                    }
                                },
                                {
                                    e: 'user-ope',
                                    a:{
                                        class:'clearfloat'
                                    },
                                    t: [{
                                        e: 'ope-wrap',
                                        t: [{
                                            e: 'wf-p',
                                            a: {
                                                class: 'wf-follow-count'
                                            },
                                            t: '[[followCount]]'
                                        },
                                        {
                                            e: 'wf-p',
                                            t: '关注',
                                        }
                                        ],
                                        click: function(e) {
                                            if( subjectRouter &&  subjectRouter==='my'){
                                                window.open(wf.wfPubServer()+'/#following') 

                                            }else{
                                                window.open(wf.wfPubServer()+'/u/'+e.org_data.user.nickname+'/'+'#following')
                                            }
                                           
                                            
                                            // wf.user.url('u/'+e.org_data.user.nickname+'/'+'#following')

                                        }
                                    },
                                    {
                                 
                                        e: 'ope-wrap',
                                  
                           
                                        t: [{
                                            e: 'wf-p',
                                            a: {
                                                class: 'wf-fans-count'
                                            },
                                            t: '[[fansCount]]'
                                        },
                                        {
                                            e: 'wf-p',
                                            t: '粉丝'
                                        }
                                        ],
                                        click: function(e) {
                                            if( subjectRouter &&  subjectRouter==='my'){
                                                window.open(wf.wfPubServer()+'#fans')

                                            }else{
                                                window.open(wf.wfPubServer()+'/u/'+e.org_data.user.nickname+'/'+'#fans')
                                            }
                                            


                                        }
                                    },
                                    {
                                        e: 'ope-wrap',
                                        t: [{
                                            e: 'wf-p',
                                            t: '[[messageCount]]'
                                        },
                                        {
                                            e: 'wf-p',
                                            t: '发帖'
                                        }
                                        ],
                                        click: function(e) {
                                            if( subjectRouter &&  subjectRouter==='my'){
                                                window.open(wf.wfPubServer()+'#messages') 

                                            }else{
                                                window.open(wf.wfPubServer()+'/u/'+e.org_data.user.nickname+'/'+'#messages')
                                            }
                                        }
                                    }
                                    ]
                                }
                            ]
                        })

                    }
                },
                function(err) {
                    console.log(err)

                }
            )
        })
    }
})

//  jsbuilder/wf/user/renderBadge.js

// 渲染徽章
// p 中包含 container 和 data 属性 data 是user 字段的内容

wf.user.renderBadge = function (e) {
   
    if(e.data){
        var badge = e.data.badge ? e.data.badge : []
        if(badge){
            var flag = e.data.badge.indexOf('creator')
            if(  flag !== -1){
                render()
            }
        }
    }
    function render (){
        $(e.container).render({
            data:e.data,
            template: {
                e: 'wf-badge',
                t: {
                    e: 'img',
                    a: {
            
                        class:'img_badge',
                        title:'创作者',
                        src: function(e) {
                            // if (e.data.avatarUrl) {
                            //     return e.data.avatarUrl
                            // } else {
                            //     // return  wf.comServer()+'/img/default-avatar.png'
                            // }
                            return   wf.comServer()+'/img/badge-3.png'
                            // return   '/img/badge-3.png'
                        }
                    }
                }
            }
              
           
        })
    }
   
  
}

//  jsbuilder/wf/user/renderExperience.js

// 渲染经验值
// e 中包含 container 和 data 属性 

wf.user.renderExperience = function (e) {
    
    $(e.container).render({
        data:e.data.user,
        template:{
            e:'wf-user-experience',
            
            t:[
          
                {
                    e:'wf-user-experience-name',
                    t:'经验值:'
                },
                {
                    e:'wf-user-experience-value',
                    datapath: 'experience',
            
                    t:[
                        {
                            e:'wf-exp',
                            style:{
                          
                        
                          

                                width:function(e){
                                   
                           
                                    // var x = e.data.value
                             
                                    // var curLevel = e.data.level
                                    var value
                                    var limit
                                    if(e.data.value === null || e.data.value === undefined){
                                        value = 0
                                    }else{
                                        value = parseInt(e.data.value)
                                      
                                    }

                                    if(e.data.limit === null || e.data.limit === undefined){
                                        limit = 99
                                    }else{
                                        limit = e.data.limit
                                      
                                    }
                              
                               
                                    if(value===0){
                                        return 
                                    }
                                    if(limit === '--') {
                                        $(e.container).css('width','150px')
                                        $(e.container).css('border-radius','3px')
                                        return
                                    }else{
                                        limit = parseInt(limit)
                                    }
                             
                                
                              
                                    var num = (value/limit*100).toFixed(2)
                                    // 获取经验条的宽度
                                    var wfUserExperienceValue = $(e.container).parent('wf-user-experience-value')
                                    wfUserExperienceValueWidth =parseInt(wfUserExperienceValue.width())
                                 
                              
                                    if((num>=95) && (num<100)){
                              
                                        // $(e.container).css('width',(num-3+'%'))
                                        $(e.container).css('width',parseInt(num  * wfUserExperienceValueWidth / 100) -3  +'px')
                                        $(e.container).css('border-radius','3px 0 0 3px')
                                    }else if(num >= 100){
                                
                                        // $(e.container).css('width',num+'%')
                                        $(e.container).css('width',parseInt(num * wfUserExperienceValueWidth / 100) +'px')
                                        $(e.container).css('border-radius','3px')
                                    }
                                    else if(num<=1.5){
                                 
                                        $(e.container).css('width','1%')
                                        // $(e.container).css('width',parseInt(num * 150 / 100) +'px')
                                        $(e.container).css('border-radius','30px')
                                 
                                    }else if((num>1.5) && (num<95)){
                                 
                                        $(e.container).css('border-radius','3px 0 0 3px')
                                  
                                        // console.log(num)
                                        // console.log(num * wfUserExperienceValueWidth / 100)
                                        $(e.container).css('width',parseInt(num * wfUserExperienceValueWidth / 100) +'px')
                                    }
                                }
                            }
                      

                        },
                        {
                            e:'wf-exp-num',
                     
                            t:[
                                {
                                    e:'wf-exp-num-content',
                             
                                    // t: '[[value]]/[[limit]]'
                                    t:function(e){
                                      
                                        var value = e.data.value ? e.data.value : 0
                                        var limit = e.data.limit ? e.data.limit : 99
                                        return value +'/'+ limit

                                    }
                                  
                                },
                          
                            ]
                        }
                    ]
                }
            ],
            click:function(){
                // 经验值蒙版
                wf.user.experiencePop()

            }

        }

    })
    
}

//  jsbuilder/wf/user/user_certification.js

wf.user.certification = function (e) {
    $(e.container)
        .empty()
        .render({
            data: e.data,
            template: {
                if: function (param) {
                    return $.inArray('机构', param.data.currLoginUser.role) === -1;
                },
                then: {
                    // 创作者
                    // if: function (param) {
                    //     return $.inArray('creator', param.data.currLoginUser.badge) !== -1;
                    // },
                    // then: {
                    //     e: 'img',
                    //     a: {
                    //         src: wf.comServer() + '/img/badge-3.png'
                    //     }
                    // }
                },
                else: {
                    e: 'img',
                    a: {
                        title: 'WFPUB机构认证',
                        src: wf.comServer() + '/img/attestation_mecha.png'
                    }
                }
            }
        });
};


//  jsbuilder/wf/user/user_postcard.js

wf.user.postcard = function() {
    var time = null //防止闪动加入延迟操作
    $(document).on('mouseenter', 'wf-user', function(e) {
        clearTimeout(time) // 清空定时器
      
        // if($(this).is($('wf-postcard'))||$(this).parents('wf-postcard').is($('wf-postcard')) || $(this).is($('wf-user'))){
        //     return 
            
        // }
        if($(e.relatedTarget).is($('wf-postcard'))||$(e.relatedTarget).parents('wf-postcard').is($('wf-postcard'))){
            return 
        }
        var _this = $(this)
        
        time = setTimeout(function() { // 延时操作
           
            //定义发送请求的数据
            var requireData = {}
            //data-(自定义属性) 和 属性 都支持
            var uid = _this.attr('uid')?_this.attr('uid'):_this.data('uid')
            var nickname = _this.attr('nickname')?_this.attr('nickname'):_this.data('nickname')
            if (uid) {
                requireData.uid = uid
            }
            if (nickname) {
                requireData.nickname = nickname
            }
            if (JSON.stringify(requireData) == '{}') {
            //显示暂无此用户
                renderNoUser(_this)
            } else {
            //发送ajax
                var requestUrl = wf.apiServer() + '/sns/user_card'
                getUserInfo(_this, requestUrl, requireData)

            }


        }, 800)
    })
    $(document).on('mouseenter', 'wf-postcard', function(e) {
        // e.stopPropagation() //阻止事件冒泡即可
        // e.preventDefault() //阻止默认行为
       
        
        if($(e.relatedTarget).is($('wf-user'))){
            var relatedTargetUid = $(e.relatedTarget).data('uid')
            var relatedTargetNickname =  $(e.relatedTarget).data('nickname')
           
            if(relatedTargetUid){
                if(relatedTargetUid==$(this).data('uid')) {
                    return  $('wf-postcard').show()
                }
            }
            if(relatedTargetNickname){
                if(relatedTargetNickname==$(this).data('nickname')) {
                    return $('wf-postcard').show()
                }
            }

            // 说明不是同一个wf-user

            // $('wf-postcard').hide()

        }
       
    })

    $(document).on('mouseleave', 'wf-user', function(e) {
   
        if($(e.relatedTarget).is($('wf-postcard'))||$(e.relatedTarget).parents('wf-postcard').is($('wf-postcard'))){
          
            return 
        }
        if (time != null) { // 判断是否显示
            clearTimeout(time) // 清空定时器
            time = null
        }
        $('body').children('wf-postcard').remove()

    })


    $(document).on('mouseleave', 'wf-postcard', function(e) {
       

        if($(e.relatedTarget).is($('wf-user'))){
            var relatedTargetUid = $(e.relatedTarget).data('uid')
            var relatedTargetNickname =  $(e.relatedTarget).data('nickname')
            
            if(relatedTargetUid){
                if(relatedTargetUid==$(this).data('uid')) {
                    return
                }
            }
            if(relatedTargetNickname){
                if(relatedTargetNickname==$(this).data('nickname')) {
                    return
                }
            }
           
        }
        if (time != null) { // 判断是否显示
            clearTimeout(time) // 清空定时器
            time = null
        }
        $('body').children('wf-postcard').remove()
    })
    $(document).bind('mousewheel DOMMouseScroll', function(event) {
        // 滚动条触发时，不显示wf-postcard
        if (time != null) { // 判断是否显示
            clearTimeout(time) // 清空定时器
            time = null
        }
        $('body').children('wf-postcard').remove()
    })

    
    //获取数据,渲染内容
    function getUserInfo(_this, requestUrl, requireData) {
        
        wf.http.get(
            // wf.apiServer+'/postcard/user',
            requestUrl,
            requireData,
            function(resData) {
                
                $('wf-postcard').remove()
                if (resData.user) {
                    // $(_this).render({
                    $('body').render({
                        data: resData,
                        template: {
                            e: 'wf-postcard',
                            a: {
                                class: function(e) {
                                    //获取蒙版位置函数
                                    return getWfPostcardSite(e, _this)
                                },
                                'data-nickname':function(e){
                                 
                                    if(e.data.user){
                                        if(e.data.user.nickname){
                                            return e.data.user.nickname
                                        }
                                    }

                                },
                                'data-uid':function(e){
                                    
                                    if(e.data.user){
                                        if(e.data.user.uid){
                                            return e.data.user.uid
                                        }
                                    }

                                },
                               
                            },
                            t: [
                                // {
                                //     e:'wf-p',
                                //     style:{
                                //         background:'#fff'
                                //     },
                                //     t:{
                                //         e: 'i',
                                //         style:{
                                //             color:'#eee'
                                //         },
                                //         class:'fa fa-caret-up',
                                //     },
                                // },
                                {
                                    e:'wf-postcard-inner', 
                                    t: [{
                                        e: 'wf-userinfo',
                                        datapath: 'user',
                                        t: [
                                            {
                                                e:'wf-p',
                                                a:{
                                                    class:'wf_p_img'
                                                },
                                                // style:{
                                                //     display:'block',
                                                //     'position':'relative',
                                                // },
                                                t:[
                                                    {
                                                        e: 'a',
                                                        t: {
                                                            e: 'img',
                                                            a: {
                                                                class: 'avatar-img',
                                                                src: function(e) {
                                                                    if (e.data.avatarUrl) {
                                                                        return e.data.avatarUrl
                                                                    } else {
                                                                        return wf.comServer()+'/img/default-avatar.png'
                                                                    }
                                                                }
                                                            }
            
                                                        },
                                                        click: function(e) {
                                                            window.open(wf.wfPubServer()+'/u/' + e.org_data.nickname)
                                                            // window.top.location.href =  wf.wfPubServer()+'/u/' + e.org_data.nickname
                                                        }
                                                    },
                                                    // {
                                                    //     e: 'img',
                                                    //     class:'img_v',
                                                    //     // style:{
                                                    //     //     display:'block',
                                                    //     //     position: 'absolute',
                                                    //     //     right: '120px',
                                                    //     //     top: '30px'
                                                    //     // },
                                                    //     a: {
                                                        
                                                            
                                                    //         src: function() {
                                                    //             return  wf.comServer()+'/img/v.png'
                                                    //         }
                                                    //     }
                                                    // },
                                                ]
                                            },
                                            
                                            {
                                                e: 'wf-p',
                                                t: [
                                                    {
                                                        e: 'a',
                                                        t: {
                                                            e: 'wf-span',
                                                            class:'profile',
                                                            style:{
                                                                width:function(e){
                                                                    var width = parseInt($(e.container).width())
                                                                    if(width>80){
                                                                        return 80 +'px'
            
                                                                    }
                                                                }
                                                            },
                                                            a: {
                                                                title: '[[nickname]]'
                                                            },
                                                            t: '[[nickname]]'
    
                                                        },
                                                        click: function(e) {
                                                            window.open(wf.wfPubServer()+'/u/' + e.org_data.nickname)
                                                            // window.top.location.href =  wf.wfPubServer()+'/u/' + e.org_data.nickname
                                                        }
    
                                                    },
                                                    
                                                    {
                                                        e: 'wf-span',
                                                        // style:{
                                                        //     position:'relative',
                                                        //     'text-align':'center',
                                                        //     width:'20px'
                                                        // },
                                                        a: {
                                                            title: '[[sex]]',
                                                            class:'user_sex'
                                                        },
                                                        t: {
                                                            e: 'img',
                                                            
                                                            // style:{
                                                            //     position:'absolute',
                                                            //     top:'-13px',
                                                            //     left:'0',
                                                            //     right:'0'
                                                            // },
                                                            a: {
                                                                class:'img_sex',
                                                                src: function(e) {
                                                                    if (e.data.sex === 1) {
                                                                
                                                                        return wf.comServer()+'/img/b-mars.png'
                                                                    } else if (e.data.sex === 2) {
                                                                        return wf.comServer()+'/img/p-venus.png'
                                                                    } else {
                                                                        return wf.comServer()+'/img/b-mars.png'
                                                                    }
                                                                }
                                                            }
                                                        }
    
                                                    },
                                                   
                                                    function(e){
                                              
                                                        
                                                        wf.user.renderBadge(e)
                
                                                    },
                                                    {
                                                        // e:'wf-span',
                                                        e:'wf-user-level',
                                                        // style:{
                                                        //     'margin-left': '11px',
                                                        //     'border':'1px solid #ffbc00c7' ,
                                                        //     'border-radius': '8px',
                                                        //     'background': '#ffbc00c7',
                                                        //     'font-size':'13px'
                                                        // },
                                                        datapath:'experience',
                                                        t:function(e){
                                                            if(e.data.level){
                                                                return 'LV' + e.data.level
                                                            }else{
                                                                return 'LV1'
                                                            }
        
        
                                                        }
                                                        
        
                                                    }
    
    
                                                ]
    
                                            },
                                            {
                                                e: 'wf-p',
                                                a:{
                                                    class:'user_profile'
                                                },
                                                t: [{
                                                    e: 'wf-span',
                                                    a:{
                                                        class:'info'
                                                    },
                                                    t: '介绍: '
    
                                                },
                                                {
                                                    e: 'wf-span',
                                                    a:{
                                                        class:'info_conent',
                                                        title:function(e){
                                                            return e.data.profile ? e.data.profile : '暂无信息！'
                                                        }
                                                    },
                                                    // t: '[[profile]]'
                                                    t:function(e){
                                                        return e.data.profile ? e.data.profile :'暂无信息！'
                                                    }
    
                                                },
    
                                                ]
    
                                            },
                                            // {
                                            //     e:'wf-user-experience',
                                            //     datapath: 'experience',
                                               
                                            //     t:[
                                                    
                                            //         {
                                            //             e:'wf-user-experience-name',
                                            //             t:'经验值:'
                                            //         },
                                            //         {
                                            //             e:'wf-user-experience-value',
                                                        
                                                      
                                            //             t:[
                                            //                 {
                                            //                     e:'wf-exp',
                                            //                     style:{
                                                                    
                                                                  
                                                                    

                                            //                         width:function(e){
                                                                     
                                            //                             // var x = e.data.value
                                                                       
                                            //                             // var curLevel = e.data.level
                                                                        
                                            //                             var value = parseInt(e.data.value)
                                                                        
                                            //                             var limit = e.data.limit
                                            //                             if(value===0){
                                            //                                 return 
                                            //                             }
                                            //                             if(limit === '--') {
                                            //                                 $(e.container).css('width','150px')
                                            //                                 $(e.container).css('border-radius','3px')
                                            //                                 return
                                            //                             }else{
                                            //                                 limit = parseInt(limit)
                                            //                             }
                                                                       
                                            //                             // var curLevel = 1
                                            //                             // var oldCopies = 0
                                            //                             // var curCopies = 99
                                            //                             // if(x===0){
                                            //                             //     return 
                                            //                             // }
                                            //                             // switch(curLevel) {
                                            //                             // case 1:
                                            //                             //     oldCopies = 0
                                            //                             //     curCopies = 99
                                            //                             //     break
                                            //                             // case 2:
                                            //                             //     oldCopies = 99
                                            //                             //     curCopies = 199
                                            //                             //     break
                                            //                             // case 3:
                                            //                             //     oldCopies = 299
                                            //                             //     curCopies = 499
                                            //                             //     break
                                            //                             // case 4:
                                            //                             //     oldCopies = 799
                                            //                             //     curCopies = 699
                                            //                             //     break
                                            //                             // case 5:
                                            //                             //     oldCopies = 1499
                                            //                             //     curCopies = 1499
                                            //                             //     break
                                            //                             // case 6:
                                            //                             //     oldCopies = 2999
                                            //                             //     curCopies = 6999
                                            //                             //     break
                                            //                             // } 
                                            //                             // console.log((x-oldCopies),curCopies)
                                                                        
                                            //                             // var num = ((x-oldCopies)/ curCopies*100).toFixed(2)
                                                                        
                                            //                             var num = (value/limit*100).toFixed(2)
                                                                        
                                                                        
                                            //                             if((num>=95) && (num<100)){
                                                                        
                                            //                                 // $(e.container).css('width',(num-3+'%'))
                                            //                                 $(e.container).css('width',parseInt(num  * 150 / 100) -3  +'px')
                                            //                                 $(e.container).css('border-radius','3px 0 0 3px')
                                            //                             }else if(num >= 100){
                                                                          
                                            //                                 // $(e.container).css('width',num+'%')
                                            //                                 $(e.container).css('width',parseInt(num * 150 / 100) +'px')
                                            //                                 $(e.container).css('border-radius','3px')
                                            //                             }
                                            //                             else if(num<=1.5){
                                                                           
                                            //                                 $(e.container).css('width','1%')
                                            //                                 // $(e.container).css('width',parseInt(num * 150 / 100) +'px')
                                            //                                 $(e.container).css('border-radius','30px')
                                                                           
                                            //                             }else if((num>1.5) && (num<95)){
                                                                           
                                            //                                 $(e.container).css('border-radius','3px 0 0 3px')
                                                                            
                                                                           
                                            //                                 $(e.container).css('width',parseInt(num * 150 / 100) +'px')
                                            //                             }
                                            //                         }
                                            //                     }
                                                                

                                            //                 },
                                            //                 {
                                            //                     e:'wf-exp-num',
                                                               
                                            //                     t:[
                                            //                         {
                                            //                             e:'wf-exp-num-content',
                                                                       
                                            //                             t: '[[value]]/[[limit]]'
                                            //                         },
                                                                    
                                            //                     ]
                                            //                 }
                                            //             ]
                                            //         }
                                            //     ]
        
                                            // },
                                        ]
                                    },
                                    
                                    {
                                        e: 'wf-useroperate',
                                        t: [{
                                            e: 'user-mes',
                                            t: [
                                                {
                                                    e: 'wf-p',
                                                    t: {
                                                        e: 'a',
                                                      
                                                        t: [
                                                            {
                                                                e: 'wf-span',
                                                                t: '关注'
                                                            },
                                                            {
                                                                e: 'wf-span',
                                                        
                                                                t: '[[followCount]]'
        
                                                            },
                                                        ]
                                                        
                                                    },
                                                    click:function(e){
                                                        window.open(wf.wfPubServer()+'/u/'+e.org_data.user.nickname+'#following')
                                                        // window.top.location.href = wf.wfPubServer()+'/u/'+e.org_data.user.nickname+'#following'
                                                    }
    
                                                },
                                                {
                                                    e: 'wf-p',
                                                    t: [{
                                                        e: 'wf-span',
                                                        t: '粉丝'
                                                    },
                                                    {
                                                        e: 'wf-span',
                                                        a: {
                                                            class: 'fansCount'
    
                                                        },
                                                        t: '[[fansCount]]'
                                                    },
    
                                                    ],
                                                    click:function(e){
                                                        window.open(wf.wfPubServer()+'/u/'+e.org_data.user.nickname+'#fans')
                                                        // window.top.location.href = wf.wfPubServer()+'/u/'+e.org_data.user.nickname+'#fans'
    
                                                    }
    
    
                                                }
                                            ]
                                        },
                                        {
                                            e: 'user-ope',
                                            t: [
                                                {
                                                    e: 'wf-button',
                                                    
                                                    t: function(e) {
                                                        if (e.data.currLoginUser) {
                                                            //只有在登陆的情况才去判断
                                                            if (e.data.currLoginUser.uid === e.data.user.uid) {
                                                                $(e.container).remove()
                                                            }
    
                                                        }
                                                        
                                                        if (e.data.followStatus == 0 ) {
                                                            return '+关注'
                                                        } else if (e.data.followStatus == 1) {
                                                            return '已关注'
                                                        } else if (e.data.followStatus == 2){
                                                            return '互相关注'
                                                        } else{
                                                            return '+关注'
                                                        }
                                                        
                                                    },
                                                    event: {
                                                        mouseenter: function(e) {
                                                           
                                                            if (e.org_data.followStatus == 2 || e.org_data.followStatus == 1) {
                                                                $(e.sender).text('取消关注')
                                                            }else if(e.org_data.followStatus == 0){
                                                                $(e.sender).text('+关注')
    
                                                            }
                                                        },
                                                        mouseleave: function(e) {
                                                           
                                                            if (e.org_data.followStatus == 0) {
                                                                $(e.sender).text('+关注')
                                                            } else if (e.org_data.followStatus == 1) {
                                                                $(e.sender).text('已关注')
                                                            } else if (e.org_data.followStatus == 2) {
                                                                $(e.sender).text('互相关注')
                                                            }
                                                        },
                                                        click: function(e) {
                                                            followClickFun(e)
                                                        }
                                                    }
                                                },
                                                {
                                                    e: 'wf-button',
                                                    
                                                    t: function(e) {
                                                        if (e.data.currLoginUser) {
                                                            if (e.data.currLoginUser.uid === e.data.user.uid) {
                                                                $(e.container).remove()
                                                            }
                                                                
                                                        }
                                                        return '私信'
                                                    },
                                                    click: function(e) {
                                                        if (e.org_data.currLoginUser) {
                                                            $('wf-postcard').remove()
                                                            wf.sns.chat.sender(e)
                                                        } else {
                                                            
                                                            // var wfCommentUrl = $(e.sender).closest('wf-comment').data('url')
                                                            // //没登录
                                                            let url
                                                            // if(wfCommentUrl){
                                                            //     url = wfCommentUrl ? wfCommentUrl :window.top.location.href
                                                            // }else{
                                                            //     url = window.top.location.href
                                                            // } 
                                                            url = wf.getRelativeUrl()
                                                            url = encodeURIComponent(url)
                                                            window.top.location.href = wf.oauthServer() + '/login?redirectUri=' + url
                                                                
                    
                                                        }
                                                        
                                                        
                                                    }
    
                                                }
                                            ]
                                        }
    
                                        ]
                                    }
    
                                    ]
                                }
                            ],
                            click: function() {
                                window.event.stopPropagation() //阻止事件冒泡即可
                                window.event.preventDefault() //阻止默认行为
                            }
                        }

                    })
                }

                

            },
            function(err) {
                renderNoUser(_this)

            }
        )
    }

    //显示暂无数据
    function renderNoUser(_this) {
        $('wf-postcard').remove()
        // $(_this).render({
        $('body').render({
            data: {},
            template: {
                e: 'wf-postcard',
                a: {
                    class: function(e) {
                        //获取蒙版位置函数
                        return getWfPostcardSite(e, _this)
                    }
                },
                t: {
                   
                    e:'wf-postcard-inner', 
                    t: '用户未找到'
                }


            }

        })

    }


    //点击关注,取消关注的功能 
    var followClickFun = function(e) {
        if (e.org_data.currLoginUser) {
            if (e.org_data.followStatus == 0) {
                followRequestFun(e)
            } else {
                cancelFollowRequestFun(e)
            }
        } else {
            // var wfCommentUrl = $(e.sender).closest('wf-comment').data('url')
            //没登录
            let url
            // if(wfCommentUrl){
            //     url = wfCommentUrl ? wfCommentUrl : window.top.location.href
            // }else{
            //     url = window.top.location.href
            // } 
            url = wf.getRelativeUrl()
            url = encodeURIComponent(url)
            window.top.location.href = wf.oauthServer() + '/login?redirectUri=' + url
            
        }

    }
    //发送关注请求
    var followRequestFun = function(e) {
        wf.http.post(
            wf.apiServer() + '/sns/follow_add', {
                targetUid: e.org_data.user.uid
            },
            function(resData) {
                e.org_data.followStatus = resData.followStatus
                $(e.sender).text('取消关注')
                //不管神魔情况粉丝数都要增加
                //粉丝数量加1
                var fansCount = $(e.sender).parent().siblings('user-mes').find('.fansCount')
                var fansCountNum = parseInt(fansCount.text()) + 1
                fansCount.text(fansCountNum)
            },
            function(err) {
                console.log(err)
            }
        )

    }
    //发送取消关注的请求 
    var cancelFollowRequestFun = function(e) {
        wf.http.post(
            wf.apiServer() + '/sns/follow_cancel', {
                targetUid: e.org_data.user.uid
            },
            function(resData) {
                $(e.sender).text('+关注')
                e.org_data.followStatus = resData.followStatus
                //粉丝数量减1
                var fansCount = $(e.sender).parent().siblings('user-mes').find('.fansCount')
                var fansCountNum = parseInt(fansCount.text()) - 1
                fansCount.text(fansCountNum)
            },
            function(err) {
                console.log(err)
            }
        )
    }
    //获取蒙板位置函数
    var getWfPostcardSite = function(e, _this) {
        var wfPostcardHeight = $(e.container).height() //wf-postcard高度
        var wfPostcardWidth = $(e.container).width() //wf-postcard宽度
        var elementHeight = _this.height() //元素高度
        var elementOffsetTop = _this.offset().top //元素距离顶部高度
        // var elementOffsetBottom //元素到浏览器（或者某个元素）底部的高度
        // var elementOffsetRight //元素到浏览器（或者某个元素）右边的宽度
        var elementWidth = _this.width() //元素宽度
        var elementOffsetLeft = _this.offset().left //元素距离左边的距离
        // $('wf-postcard').css('position','absolute')
        // $('wf-postcard').css('z-index',10001)
        
       
        var browserHeight = $(window).height() //浏览器窗口高度
        var browserwidth = $(window).width() //浏览器窗口宽度
        var elementOffsetBottom
        var elementOffsetRight 
        var scrollBarleft = $(document).scrollLeft() //滚动条高度
        var scrollBarHeight = $(document).scrollTop() //滚动条高度
      
        elementOffsetBottom = browserHeight - (elementHeight + elementOffsetTop - scrollBarHeight) //元素到浏览器底部的高度
        
        if(parseInt(elementOffsetBottom)<parseInt(wfPostcardHeight)){
            let top1 = parseInt(elementOffsetTop)-parseInt(wfPostcardHeight)-17
            $('wf-postcard').css('top',top1)
           
        }else{
            $('wf-postcard').css('top',elementOffsetTop+5)
        }

        elementOffsetRight = browserwidth - (elementWidth + elementOffsetLeft - scrollBarleft)
        if(parseInt(elementOffsetRight)<parseInt(wfPostcardWidth)){
            
            // let left1 = parseInt(elementOffsetLeft)-parseInt(wfPostcardWidth)+parseInt(elementWidth/2)
            // let  left1 = parseInt(elementOffsetLeft)-parseInt(wfPostcardWidth/2)+parseInt(elementWidth/2)
            
            if(elementOffsetRight+elementWidth/2-wfPostcardWidth/2<0){
              
                $('wf-postcard').css('right',elementOffsetRight)
            }else{
                $('wf-postcard').css('right', elementOffsetRight+elementWidth/2-wfPostcardWidth/2)
            }
           
            // $('wf-postcard').css('left', left1)
        }else{
            
            if(elementOffsetLeft+elementWidth/2-wfPostcardWidth/2 <0){
                $('wf-postcard').css('left',elementOffsetLeft)
            }else{
                $('wf-postcard').css('left',elementOffsetLeft+elementWidth/2-wfPostcardWidth/2)
            }
            
            // $('wf-postcard').css('left',elementOffsetLeft+20)
        }

       
    }
}

//  jsbuilder/wf/user/usercard.js

$.fn.extend({
    render_usercard: function () {
        $('wf-usercard', this).each(function (i, element) {
            var requireData = {};
            var uid = element.getAttribute('uid') || element.getAttribute('data-uid');
            var nickname = element.getAttribute('nickname') || element.getAttribute('data-nickname');
            if (uid) {
                requireData.uid = uid;
            }
            if (nickname) {
                requireData.nickname = nickname;
            }
            var requestUrl = wf.apiServer() + '/sns/user_card';
            wf.http.get(
                requestUrl,
                requireData,
                function (resData) {
                    //动态渲染元素
                    if (resData.user) {
                        $(element)
                            .empty()
                            .render({
                                data: resData,
                                template: [
                                    {
                                        e: 'wf-userinfo',

                                        t: [
                                            {
                                                e: 'wf-p',
                                                a: {
                                                    class: 'wf_p_img'
                                                },

                                                t: [
                                                    {
                                                        e: 'img',

                                                        a: {
                                                            class: 'avatar-img',
                                                            src: function (e) {
                                                                if (e.data.user.avatarUrl) {
                                                                    return e.data.user.avatarUrl;
                                                                } else {
                                                                    return wf.comServer() + '/img/default-avatar.png';
                                                                }
                                                            }
                                                        }
                                                    },
                                                    {
                                                        e: 'wf-acc-certificate',
                                                        t: function (e) {
                                                            wf.user.certification(e);
                                                        }
                                                    }
                                                    // {
                                                    //     e: 'img',
                                                    //     a: {
                                                    //         class:'img_v',
                                                    //         src: function() {
                                                    //             return  wf.comServer()+'/img/v.png'
                                                    //         }
                                                    //     }
                                                    // },
                                                ]
                                            },
                                            {
                                                e: 'wf-p',
                                                datapath: 'user',
                                                t: [
                                                    {
                                                        e: 'wf-span',
                                                        class: 'profile',
                                                        style: {
                                                            width: function (e) {
                                                                var width = parseInt($(e.container).width());
                                                                if (width > 80) {
                                                                    return 80 + 'px';
                                                                }
                                                            }
                                                        },
                                                        a: {
                                                            title: '[[nickname]]'
                                                        },
                                                        t: '[[nickname]]'
                                                    },
                                                    function (e) {
                                                        wf.user.renderBadge(e);
                                                    },
                                                    {
                                                        e: 'wf-user-level',

                                                        datapath: 'experience',
                                                        t: function (e) {
                                                            if (e.data.level) {
                                                                return 'LV' + e.data.level;
                                                            } else {
                                                                return 'LV1';
                                                            }
                                                        }
                                                    }
                                                ]
                                            },

                                            {
                                                e: 'wf-p',
                                                a: {
                                                    class: 'user_profile'
                                                },
                                                datapath: 'user',
                                                t: [
                                                    {
                                                        e: 'wf-span',
                                                        a: {
                                                            class: 'info'
                                                        },
                                                        t: '介绍:'
                                                    },
                                                    {
                                                        e: 'wf-span',
                                                        a: {
                                                            class: 'info_conent',
                                                            title: function (e) {
                                                                return e.data.profile ? e.data.profile : '暂无信息！';
                                                            }
                                                        },
                                                        // t: '[[jdata/profile]]'
                                                        t: function (e) {
                                                            return e.data.profile ? e.data.profile : '暂无信息！';
                                                        }
                                                    }
                                                ]
                                            },
                                            function (e) {
                                                // 经验值
                                                wf.user.renderExperience(e);
                                            }
                                        ]
                                    },
                                    {
                                        e: 'user-ope',
                                        t: [
                                            {
                                                e: 'ope-wrap',
                                                t: [
                                                    {
                                                        e: 'wf-p',
                                                        a: {
                                                            class: 'wf-follow-count'
                                                        },
                                                        t: '[[followCount]]'
                                                    },
                                                    {
                                                        e: 'wf-p',
                                                        t: '关注'
                                                    }
                                                ],
                                                click: function (e) {
                                                    if (e.org_data.currLoginUser) {
                                                        wf.user.url('#following');
                                                    } else {
                                                        //跳转登录页
                                                        let url = wf.getRelativeUrl()
                                                        window.location.href =wf.oauthServer() + '/login?redirectUri=' + encodeURIComponent(url);
                                                    }
                                                }
                                            },
                                            {
                                                e: 'ope-wrap',

                                                t: [
                                                    {
                                                        e: 'wf-p',
                                                        a: {
                                                            class: 'wf-fans-count'
                                                        },
                                                        t: '[[fansCount]]'
                                                    },
                                                    {
                                                        e: 'wf-p',
                                                        t: '粉丝'
                                                    }
                                                ],
                                                click: function (e) {
                                                    if (e.org_data.currLoginUser) {
                                                        wf.user.url('#fans');
                                                        // wf.user.popViewFun(e, 'my/fans',e.org_data.user.nickname,e.org_data.user.uid)
                                                    } else {
                                                       
                                                        //跳转登录页
                                                        let url = wf.getRelativeUrl()
                                                        window.location.href =wf.oauthServer() + '/login?redirectUri=' + encodeURIComponent(url);
                                                    }
                                                }
                                            },
                                            {
                                                e: 'ope-wrap',
                                                t: [
                                                    {
                                                        e: 'wf-p',
                                                        t: '[[messageCount]]'
                                                    },
                                                    {
                                                        e: 'wf-p',
                                                        t: '发帖'
                                                    }
                                                ],
                                                click: function (e) {
                                                    if (e.org_data.currLoginUser) {
                                                        wf.user.url('#message/my');
                                                    } else {
                                                        
                                                        //跳转登录页
                                                        let url = wf.getRelativeUrl()
                                                        window.location.href =wf.oauthServer() + '/login?redirectUri=' + encodeURIComponent(url);
                                                    }
                                                }
                                            }
                                        ]
                                    }
                                ]
                            });
                    }
                },
                function (err) {
                    console.log(err);
                }
            );
        });
    }
});

wf.user.url = function (hashpath) {
    var url = window.location.protocol + '//' + window.location.host + '/';
    window.location.href = url + hashpath;
};

wf.user.popViewFun = function (e, view, nickname, uid) {
    wf.pop({
        render: render
    });
    function render(e) {
        $(e.container).render({
            data: e.org_data,
            template: {
                e: 'wf-sns',
                a: {
                    view: view,
                    nickname: nickname,
                    uid: uid + '',
                    class: ' relayDetail'
                }
            }
        });
        wf.sns(e.container);
    }
};
//把他放到wf.js里面
// $(function() {
//     $(document).render_usercard()
// })


//  jsbuilder/wf/util/wf.editor.js

// 传入参数
// {
//  content: 内容,   必传
//  onclose: function (callbackdata) {}, 关闭编辑蒙版的方法  必传
//  onsubmit: function (content) {},提交蒙版数据的方法  必传
//  messageSenderEle: false 选传  判断是不是发帖子的编辑(默认为false)
// }

wf.editor = function(p) {
    var currentScrollTab = 0 //确定当前滚动条状态
    var isInput = false  //输入状态
    wf.pop({
        width:'1200px',
        render: render,
    })

    function render(r) {
        $(r.container).render({
            template: {
                'wf-sns': [
                    {
                        e:'wf-editor-head',
                        a:{
                            class:'clearfloat'
                        },
                        
                        t:[
                            {
                                e:'wf-span',
                               
                                t:'编辑功能'
                            },
                            {
                                e:'wf-button',
                               
                                t:'提交',
                                click:function(e){
                                   
                                    submit(e)
                                }

                            }
                        ]
                    },
                    {
                        e:'wf-editor-body',
                       
                        t:[
                            {
                                'wf-part': [
                                    {
                                        'wf-edit-menu': [
                                            {
                                                fieldset: [
                                                    { legend: 'markdown' },
                                                    {
                                                        'wf-button': '语法说明',
                                                        click: function(){
                                                            var markDownUrl = 'http://markdown.p2hp.com/basic-syntax/'
                                                            window.open(markDownUrl)
                                                        }
                                                    },
                                                    {
                                                        'wf-button': '一级标题',
                                                        click: headingLevelOne
                                                    },
                                                    {
                                                        'wf-button': '字体加粗',
                                                        click: fondBlod
                                                    },
                                                    {
                                                        'wf-button': '上传图片',
                                                        click: function () {
                                                            const imageUpload = new wf.sns.timeline.ImageUploadMarkdown(getImageUploadElementId())
                                                            imageUpload.popUpUploadWidget()
                                                            imageUpload.uploadAndRender(insertText)
                                                        }
                                                    },
                                                ]
                                            },
                                            {
                                                fieldset: [
                                                    { legend: 'functionPlot' },
                                                    {
                                                        'wf-button': '函数曲线',
                                                        click: functionPlotTemplate
                                                    },
                                                    {
                                                        'wf-button': '函数曲线2',
                                                        click: functionPlotTemplate2
                                                    },
                                                ]
                                            },
                                            {
                                                fieldset: [{ legend: 'MathJax' }, {
                                                    'wf-button': '公式1',
                                                    click: MathJaxTemplate1
                                                }, {
                                                    'wf-button': '希腊字母',
                                                    click: MathJaxTemplate2
                                                }, {
                                                    'wf-button': '行间公式',
                                                    click: MathJaxTemplate3
                                                }]
                                            }, 
                                            {
                                                fieldset: [
                                                    { legend: 'mermaid' },
                                                    {
                                                        'wf-button': '流程图',
                                                        click: MermaidTemplate1
                                                    },
                                                    {
                                                        'wf-button': '序列图',
                                                        click: MermaidTemplate2
                                                    },
                                                    {
                                                        'wf-button': '甘特图',
                                                        click: MermaidTemplate3
                                                    },
                                                    {
                                                        'wf-button': '饼形图',
                                                        click: MermaidPie
                                                    },
                                                    {
                                                        'wf-button': '行程图',
                                                        click: MermaidJourney
                                                    },
                                                    {
                                                        'wf-button': '实体图',
                                                        click: MermaidErDiagram
                                                    },
                                                    {
                                                        'wf-button': '状态图',
                                                        click: MermaidStateDiagramV2
                                                    },
                                                    {
                                                        'wf-button': '类图',
                                                        click: MermaidClassDiagram
                                                    },
                                                    {
                                                        'wf-button': 'git图',
                                                        click: MermaidGitGraph
                                                    }
                                            ]
                                            }
        
                                        ],
                                        
                                    },
                                    {
                                        'wf-edit-content':[
                                           
                                            {
                                                e:'wf-edit-container',
                                                
                                                t: {
                                                    textarea: 'content',
                                                    
                                                    
                                                    value: p.content,
                                                    a:{
                                                       
                                                        id:'content',
                                                        placeholder:'在这里编辑！！！！！',
                                                    },
                                                    event:{
                                                        input:function(e){
                                                           
                                                            if(!isInput){
                                                                isInput = true
                                                                
                                                            }else{
                                                                return 
                                                            }
                                                            if(isInput){
                                                                setTimeout(function(){
                                                                    // 先渲染
                                                                    preview()
                                                                    // 重新计算
                                                                   
                                                                    isInput = false
                                                                    // if (currentScrollTab !== 1) return
                                                                    let scale //滚动比例
                                                                    let rc= wfEditPreViewEle.querySelector('wf-article')
                                                                    if (rc){
                    
                                                                        scale = (rc.offsetHeight -wfEditPreViewEle.offsetHeight) / (lc.scrollHeight - lc.clientHeight)
                                                                    }else{
                                                                        scale = (0 - wfEditPreViewEle.offsetHeight) / (lc.scrollHeight - lc.clientHeight )
                                                                    }
                                                               
                                                                    if(lc.scrollHeight-lc.scrollTop - lc.clientHeight<= 100){
                                                                        // 说明在底部
                                                                        wfEditPreViewEle.scrollTop = wfEditPreViewEle.scrollHeight
                                                                    }else{
                                                                        // 不在底部
                                                                        wfEditPreViewEle.scrollTop = lc.scrollTop * scale
                                                                    
                                                                    }
                                                                  
                                                                }, 2000)
                                                            }
                                                        }
                                                       
                                                    }
    
                                                },
                                                event:{
                                                    mouseover:function(){
                                                        // 1 表示表示当前鼠标位于 编辑元素范围内      
                                                        currentScrollTab = 1
                                                    }
                                                }
                                            },
                                            {
                                                e:'wf-edit-preview',
                                                t:function(e){
                                                    if(p.content.length>0){
                                                        preview()
                                                    }else{
                                                        return '在这里预览！！！！！'
                                                    }
                                                },
                                                event:{
                                                    mouseover:function(){
                                                        // 2表示表示当前鼠标位于 预览元素范围内
                                                        currentScrollTab = 2

                                                    },
                                                    
                                                }
                                                


                                            },
                                           
                                        ],
                                        a:{
                                            class:'clearfloat'
                                        },
                                       
                                    },
                                    {
                                        e: 'input',
                                        id: getImageUploadElementId(),
                                        name: 'files[]',
                                        style: {
                                            display: 'none'
                                        },
                                        a: {
                                            multiple: 'multiple',
                                            accept: 'image/*',
                                            type: 'file'
                                        }
                                    }
                                ],
                                id: 'edit',
                                class:'clearfloat',
                               
                            },
                           
                        ]
                    }
                ],
                class:'wf_editor_sns',
            },
        })
        edit()
        let wfEditContentEle=document.querySelector('wf-edit-content')
        let wfEditPreViewEle=document.querySelector('wf-edit-preview')
        let lc = $('textarea#content')[0]
        // let lc = wfEditPreViewEle.querySelector('textare')
       
     
        if(wfEditContentEle.querySelector('#content').offsetHeight>=  lc.scrollHeight){
            // 没有滚动条
            // 预览的让他到可视区域
            wfEditPreViewEle.scrollTop = wfEditPreViewEle.scrollHeight
        }
        lc.addEventListener('scroll', function(){
            // 监听编辑滚动条
            let rc= wfEditPreViewEle.querySelector('wf-article')
            if (currentScrollTab !== 1) return
            let scale //滚动比例
            if (rc){
                scale = (rc.offsetHeight -wfEditPreViewEle.offsetHeight) / (lc.scrollHeight - lc.clientHeight)
            }else{
                scale = (0 - wfEditPreViewEle.offsetHeight) / (lc.scrollHeight - lc.clientHeight )
            }
            // 判断滚动条是不是在底部
            if(lc.scrollHeight-lc.scrollTop - lc.clientHeight<= 20){
                // 说明在底部
                wfEditPreViewEle.scrollTop = wfEditPreViewEle.scrollHeight
            }else{
                // 不在底部
                wfEditPreViewEle.scrollTop = lc.scrollTop * scale
               
            }
            
        })
        wfEditPreViewEle.addEventListener('scroll', function(){
            // 监听预览滚动条
            // let rc=wfEditPreViewEle.querySelector('wf-article')
            let rc= wfEditPreViewEle.querySelector('wf-article')
            let scale
            if (rc){
                scale = (rc.offsetHeight -wfEditPreViewEle.offsetHeight) / (lc.scrollHeight - lc.clientHeight)
            }else{
                scale = (0 - wfEditPreViewEle.offsetHeight) / (lc.scrollHeight - lc.clientHeight )
            }
            if (currentScrollTab !== 2) return
            lc.scrollTop = wfEditPreViewEle.scrollTop / scale
        })
        
        
        function edit() {
            $('wf-part#edit', p.container).show()
        }

        
        function preview(){
            
            let content = $('textarea#content').val()
            $('wf-edit-preview', p.container).empty().render({
                template:function(e) {
                    $(e.container).append('<wf-article>' + wf.replace.all(content) + '</wf-article>')
                    // 调用mermaid渲染图
                    mermaid.init(undefined, $('div.mermaid', e.container))
                    // 调用MathJax渲染公式
                    MathJax.typesetPromise([e.container])
                    wf.functionPlot(e.container)
                },
            })
           
        }

        function submit(submit) {
            if (p.onsubmit) {
                p.onsubmit(submit.new_data.content)
            }
            if(p.messageSenderEle){
                
                if(wf.cookie.get('uid')){
                    // 添加草稿
                    localStorage.setItem('publish_draft_'+wf.cookie.get('uid'),submit.new_data.content)
                }
                            
            }
            r.container.close()
        }

        // function getScale( editorEle){
        //     var editorEle = editorEle
        //     var wfEditPreview = editorEle.siblings('wf-edit-preview')
        //     console.log( editorEle)
        //     var scale = parseInt(editorEle[0].scrollHeight - editorEle[0].clientHeight ) / parseInt (wfEditPreview[0].scrollHeight - wfEditPreview[0].clientHeight)
        //     console.log('editorEle.scrollHeight'+editorEle[0].scrollHeight)
        //     console.log('editorEle.clientHeight '+editorEle[0].clientHeight )
        //     console.log('wfEditPreview.scrollHeight' +wfEditPreview[0].scrollHeight)
        //     console.log('wfEditPreview.clientHeight' +wfEditPreview[0].clientHeight)
        //     console.log(scale)
        //     return scale 


        // }

        function functionPlotTemplate(e) {
            insertText('这是一个functionPlot的例子,您可以在此基础上修改或者创建自己的函数图像\n' +
                '```functionPlot\n\n{"data": [\n   {"fn": "x^2"},\n   {"fn": "sin(x)"}\n]}\n\n```\n')
                
             
        }

        function functionPlotTemplate2(e) {
            insertText('这是一个functionPlot的例子,您可以在此基础上修改或者创建自己的函数图像\n' +
                '```functionPlot\n\n' +
                '{\n' +
                '    "yAxis": {"domain": [-4.428571429, 4.428571429]},\n' +
                '    "xAxis": {"domain": [-7, 7]},\n' +
                '    "data": [{\n' +
                '        "x": "sin(t) * (exp(cos(t)) - 2 cos(4t) - sin(t/12)^5)",\n' +
                '        "y": "cos(t) * (exp(cos(t)) - 2 cos(4t) - sin(t/12)^5)",\n' +
                '        "range": [-31.415926, 31.415926],\n' +
                '        "fnType": "parametric",\n' +
                '        "graphType": "polyline"\n' +
                '    }]\n' +
                '}\n' +
                '```\n\n')
        }

        function MathJaxTemplate1(e) {
            insertText('\n这是一个Latex公式的例子\n' +
                '$$\n\\left( \\sum_{k=1}^n a_k b_k \\right)^2 \\leq \\left( \\sum_{k=1}^n a_k^2 \\right) \\left( \\sum_{k=1}^n b_k^2 \\right)\n$$\n')
        }

        function MathJaxTemplate2(e) {
            insertText('$$\n' + '\\Gamma\\ \\Delta\\ \\Theta\\ \\Lambda\\ \\Xi\\ \\Pi\\ \\Sigma\\ \\Upsilon\\ \\Phi\\ \\Psi\\ \\Omega' + '$$\n')
        }

        function MathJaxTemplate3(e) {
            insertText('$E=mc^2$\n')
        }
        function MermaidTemplate1(e) {
            insertText('这是一个流程图的例子\n' +
                '```\n' +
                'graph TD;\n' +
                '    A-->B;\n' +
                '    A-->C;\n' +
                '    B-->D;\n' +
                '    C-->D;\n' +
                '```\n')
        }

        function MermaidTemplate2(e) {
            insertText('这是一个序列图的例子\n' +
                '```\n' +
                'sequenceDiagram\n' +
                'A->> B: Query\n' +
                'B->> C: Forward query\n' +
                'Note right of C: Thinking...\n' +
                'C->> B: Response\n' +
                'B->> A: Forward response\n' +
                '```\n')
        }

        function MermaidTemplate3(e) {
            insertText('这是一个甘特图的例子\n' +
                '```\n' +
                'gantt\n' +
                'dateFormat  YYYY-MM-DD\n' +
                'title Adding GANTT diagram to mermaid\n' +
                'excludes weekdays 2014-01-10\n' +
                '\n' +
                'section A section\n' +
                'Completed task            :done,    des1, 2014-01-06,2014-01-08\n' +
                'Active task               :active,  des2, 2014-01-09, 3d\n' +
                'Future task               :         des3, after des2, 5d\n' +
                'Future task2               :         des4, after des3, 5d\n' +
                '```\n')
        }
        function MermaidPie(e) {
            insertText('这是一个饼形图的例子\n' +
                '```\n' +
                'pie\n' +
                '"Dogs" : 386\n' +
                '"Cats" : 85\n' +
                '"Rats" : 15\n' +
                '```\n')
                
        }
        function MermaidJourney(e) {
            insertText('这是一个行程图的例子\n' +
                '```\n' +
                'journey\n' +
                'title My working day\n' +
                'section Go to work\n' +
                'Make tea: 5: Me\n' +
                'Go upstairs: 3: Me\n' +
                'Do work: 1: Me, Cat\n' +
                'section Go home\n' +
                'Go downstairs: 5: Me\n' +
                'Sit down: 3: Me\n' +
                '```\n')
                
        }
        function MermaidErDiagram(e) {
            insertText('这是一个实体图的例子\n' +
                '```\n' +
                'erDiagram\n' +
                'CUSTOMER ||--o{ ORDER : places\n' +
                'ORDER ||--|{ LINE-ITEM : contains\n' +
                ' CUSTOMER }|..|{ DELIVERY-ADDRESS : uses\n' +
                '```\n')
                
        }
        function  MermaidStateDiagramV2(e) {
            insertText('这是一个状态图的例子\n' +
                '```\n' +
                'stateDiagram-v2\n' +
                '[*] --> Still\n' +
                'Still --> [*]\n' +
                '\n' +
                'Still --> Moving\n' +
                'Moving --> Still\n' +
                'Moving --> Crash\n' +
                'Crash --> [*]\n' +
                '```\n')
        }
        function  MermaidClassDiagram(e) {
            insertText('这是一个类图的例子\n' +
                '```\n' +
                'classDiagram\n' +
                '    Animal <|-- Duck\n' +
                '    Animal <|-- Fish\n' +
                '    Animal <|-- Zebra\n' +
                '    Animal : +int age\n' +
                '    Animal : +String gender\n' +
                '    Animal: +isMammal()\n' +
                '    Animal: +mate()\n' +
                '    class Duck{\n' +
                '        +String beakColor\n' +
                '        +swim()\n' +
                '        +quack()\n' +
                '    }\n' +
                '    class Fish{\n' +
                '        -int sizeInFeet\n' +
                '        -canEat()\n' +
                '    }\n' +
                '    class Zebra{\n' +
                '        +bool is_wild\n' +
                '        +run()\n' +
                '    }\n' +
                '```\n')
        }
        function MermaidGitGraph(){
            insertText('这是一个git图的例子\n' +
            '```\n' +
            'gitGraph:\n' +
            'options\n' +
            '{\n' +
            '    "nodeSpacing": 75,\n' +
            '    "nodeRadius": 5\n' +
            '}\n' +
            'end\n' +
            'commit\n' +
            'branch newbranch\n' +
            'checkout newbranch\n' +
            'commit\n' +
            'commit\n' +
            'checkout master\n' +
            'commit\n' +
            'commit\n' +
            'merge newbranch\n' +
            '```\n')
        }
        function insertText(str) {
            let obj = $('textarea', r.container)[0]
            if (document.selection) {
                var sel = document.selection.createRange()
                sel.text = str
            } else if (typeof obj.selectionStart === 'number' && typeof obj.selectionEnd === 'number') {
                var startPos = obj.selectionStart,
                    endPos = obj.selectionEnd,
                    cursorPos = startPos,
                    tmpStr = obj.value
                obj.value = tmpStr.substring(0, startPos) + str + tmpStr.substring(endPos, tmpStr.length)
                cursorPos += str.length
                obj.selectionStart = obj.selectionEnd = cursorPos
            } else {
                obj.value += str
            }
            preview()
        }

        function fondBlod(){

            insertText('这是一个字体加粗的例子\n' +
            '**这是一个字体加粗的例子**\n' )
           

        }
        function headingLevelOne(){
           
            insertText('这是一个一级标题例子\n' +
            '# 一级标题\n' )
            

        }
        
       
    }

    function getImageUploadElementId() {
        return 'image-upload-in-md'
    }

}


//  jsbuilder/wf/util/wf.error.js

wf.error = function(err) {
    if(err.err_code === 404 &&(err.err_message ? (err.err_message ==="not login" ? true :false) : false)){
        //跳转登录页
        let url = wf.getRelativeUrl()
        window.location.href =wf.oauthServer() + '/login?redirectUri=' + encodeURIComponent(url);
    }else{
        if(err.sub_msg){
             dialog.fail(err.sub_msg)
             return
        }
        if(err.err_message){
           
            dialog.fail(err.err_message)
            return
        }
    }
}

//  jsbuilder/wf/util/wf.functionPlot.js

wf.functionPlot = function (container) {
    if (!window.functionPlot) return;
    $('.functionPlot', container).each(render);

    function render (i, ele) {
        //console.log(ele);
        $('define', ele).hide();
        let define = $('define', ele).text();
        $(ele).render({
            template: [
                { div: '', class: "graph" },
                {
                    div: [{ textarea: 'sandbox', t: define, height: 350 },
                    { button: 'try', click: tryrun },
                    { button: 'retrieve', click: retrieve }
                    ],
                    class: 'sandbox',
                    style: { "padding-right": "30px" }
                },
                {
                    tab: {
                        nav: {
                            'graph': graphbox,
                            'code': code,
                            sandbox: sandbox
                        },
                        class: 'l2'
                    }
                }
            ]
        })

        graphbox();

        function graphbox () {
            $('div.graph', ele).show();
            $('div.sandbox', ele).hide();
            $('pre', ele).hide();
            $('div.graph', ele).each(
                function (i, graph) {
                    try {
                        let data = JSON.parse(define.trim());
                        data.width = 550;
                        data.height = 550 / 1.77;
                        data.target = graph;
                        functionPlot(data);
                    } catch (err) {
                        $(graph).text("functionPlot:".concat(err));
                    }
                }
            )
        };

        function tryrun (e) {
            define = e.new_data.sandbox;
            graphbox();
        };

        function retrieve () {
            define = $('define', ele).text();
            $('textarea#sandbox', ele).val(define);
        }

        function code () {
            $('div.graph', ele).hide();
            $('div.sandbox', ele).hide();
            $('pre', ele).show();
        };

        function sandbox () {
            $('div.graph', ele).hide();
            $('div.sandbox', ele).show();
            $('pre', ele).hide();
        };

    }
}

//  jsbuilder/wf/util/wf.getRelativeUrl.js

wf.getRelativeUrl =function(){
    let url = null
    let reg = wf.development ? 'https://d.wf.pub': 'https://wf.pub'
    let wfCommentEle = $('wf-comment')[0]
    // let wfSns = $('wf-sns')[0]
    if(wfCommentEle){
        url = $(wfCommentEle).attr('url') ? $(wfCommentEle).attr('url') : $(wfCommentEle).data('url')
        console.log($(wfCommentEle).attr('url'))
        if(url){
            return url.replace(reg,'')
        }
    }
    // if(wfSns){
    //     //目前只考虑wf.pub 项目，没考虑老社区sns 所以没加data属性
    //     url = $(wfSns).data('loginredirecturi') ? $(wfSns).data('loginredirecturi') :$(wfSns).attr('loginredirecturi')
    //     console.log(url)
    //     if(url){
    //         return url.replace(reg,'')
    //     }
        
    // }
    if(!url){
        url = window.location.href
        if(url){
            return url.replace(reg,'')
        }
    }
   
}

