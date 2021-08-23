

//  jsbuilder/wfpub/wfpub.js

wfpub = function () {
    $("wf-header a#appmenu,a#wfpub_app").click(wfpub.appmenu)
    $("#my-appmenu").click(wfpub.favoriteapps)
    //wfheader 悬浮显示详细信息
    $('wf-header .logo-icon').on('mouseover', function (e) {
        $(this).find('.wf-logo-detail').addClass('show')
    }).on('mouseleave', function () {
        if ($(this).is($('form.wf-logo-detail').parent())) {
            if ($(this).find('input').is(':focus')) {
                return
            }
        }
        $(this).find('.wf-logo-detail').removeClass('show')
    });
    $(document).on('click', '.search-icon', function () {
        $(this).parent().mouseover()
        $('.wf-logo-detail input').focus()

    })
    $('.wf-logo-detail input').blur(function (e) {
        console.log(e)
        if ( !$(e.relatedTarget).is($('.logo-icon.search-logo')[0]) && $(e.relatedTarget).parents('.logo-icon').length === 0) {
            $('.wf-logo-detail').removeClass('show')
        }
    })
}
$(wfpub);

//  jsbuilder/wfpub/modules/wfpub.appdetail.js

wfpub.appdetail = function (indexUrl) {
    wf.http.post('/api/appstore_appinfo', { indexUrl: indexUrl }, function (data) {
        var appId = data.app.appId;
        $('container').render({
            data: data,
            template: [
                {
                    aside: [
                        { div: wfpub.appmenuitem, datapath: 'app' },
                        {
                            e: 'p',
                            t: {
                                e: 'a',
                                a: { href: wf.wfPubServer() + '/[[indexUrl]]' },
                                t: '进入应用',
                                style: {
                                    border: '1px solid #76a8e4',
                                    padding: '5px 10px',
                                    color: '#333',
                                    'font-size': '15px'
                                }
                            },
                            style: {
                                'text-align': 'center',
                                'margin-top': '20px'
                            }
                        }
                    ],
                    style: {
                        width: '250px'
                    }
                },
                {
                    div: [
                        {
                            h1: '[[app/appName]]'
                        },
                        {
                            if: data.app.description !== null,
                            then: [
                                { h2: '简介' },
                                {
                                    'wf-article': function (p) {
                                        $(p.container).append(wf.replace.all(data.app.description));
                                    }
                                }
                            ]
                        },
                        { h2: '开发者的其他应用' },
                        {
                            div: {
                                otherapp: [
                                    {
                                        a: wf.wfPubServer() + '/apps/[[indexUrl]]',
                                        t: {
                                            img: '[[logoUrl]]',
                                            style: {
                                                height: '70px',
                                                width: '112px'
                                            }
                                        }
                                    }
                                ],
                                a: { title: '[[appName]]' },
                                datapath: 'otherApps'
                            }
                        },
                        { h2: '资源包列表' },
                        {
                            div: function (param) {
                                // 渲染可购买的资源列表
                                renderPackages(param.container, param.data.app.appId);
                            },
                            style: {
                                padding: '10px'
                            }
                        },
                        { h2: '评论' },
                        {
                            'wf-comment': '',
                            a: {
                                url: wf.wfPubServer() + '/apps/[[app/indexUrl]]',
                                title: data.app.appName,
                                description: data.app.description,
                                icon: data.app.logoUrl
                                // iconHref: wf.wfPubServer() + '/apps/[[app/indexUrl]]'
                            }
                        }
                    ],
                    style: {
                        'margin-left': '260px',
                        width: '760px'
                    }
                }
            ]
        });
        $('container').comment();

        function renderPackages(container, appId) {
            wf.http.post('/api/appstore_package_list', { appId: appId }, function (resData) {
                resData.b2cPackages = equalType(resData.packageList, "b2c");
                resData.b2bPackages = equalType(resData.packageList, "b2b");
                function equalType(arr, type) {
                    if (arr && arr.length) {
                        return arr.filter(_item => _item.type === type);
                    } else {
                        return []
                    }
                }
                $(container).render({
                    data: resData,
                    template: {
                        if: function () {
                            return resData.packageList.length > 0;
                        },
                        then: [
                            // {
                            //     'package-ul': {
                            //         'package-li': [
                            //             {
                            //                 h3: [
                            //                     '[[package]]',
                            //                     {
                            //                         span: function (param) {
                            //                             if (param.data.type === 'b2b') {
                            //                                 return '（机构资源包）';
                            //                             } else {
                            //                                 return '（个人资源包）';
                            //                             }
                            //                         }
                            //                     },
                            //                     {
                            //                         if: function (param) {
                            //                             return param.data.jdata.trial == '1' && param.data.type === 'b2b';
                            //                         },
                            //                         then: {
                            //                             'wf-button': '试用',
                            //                             style: {
                            //                                 color: '#000'
                            //                             },
                            //                             click: function (param) {
                            //                                 packageTrial(param);
                            //                             }
                            //                         }
                            //                     }
                            //                 ]
                            //             },
                            //             {
                            //                 label: [
                            //                     {
                            //                         input: '',
                            //                         a: {
                            //                             type: 'radio',
                            //                             name: 'packageType',
                            //                             value: 'priceMonth',
                            //                             'data-package': '[[package]]',
                            //                             'data-packagetype': '[[type]]'
                            //                         },
                            //                         style: {
                            //                             'vertical-align': 'middle',
                            //                             'margin-right': '10px'
                            //                         },
                            //                         click: function (param) {
                            //                             packageChoose(param);
                            //                         }
                            //                     },
                            //                     {
                            //                         span: '包月[[new_price/priceMonth]]元/月',
                            //                         style: {
                            //                             'vertical-align': 'middle'
                            //                         }
                            //                     }
                            //                 ],
                            //                 style: {
                            //                     color: '#000',
                            //                     width: '200px',
                            //                     'margin-right': '40px',
                            //                     'padding-left': '30px'
                            //                 }
                            //             },
                            //             {
                            //                 label: [
                            //                     {
                            //                         input: '',
                            //                         a: {
                            //                             type: 'radio',
                            //                             name: 'packageType',
                            //                             value: 'priceYear',
                            //                             'data-package': '[[package]]',
                            //                             'data-packagetype': '[[type]]'
                            //                         },
                            //                         style: {
                            //                             'vertical-align': 'middle',
                            //                             'margin-right': '10px'
                            //                         },
                            //                         click: function (param) {
                            //                             packageChoose(param);
                            //                         }
                            //                     },
                            //                     {
                            //                         span: '包年[[new_price/priceYear]]元/年',
                            //                         style: {
                            //                             'vertical-align': 'middle'
                            //                         }
                            //                     }
                            //                 ],
                            //                 style: {
                            //                     color: '#000',
                            //                     width: '200px',
                            //                     'margin-right': '40px',
                            //                     'padding-left': '30px'
                            //                 }
                            //             }
                            //         ],
                            //         datapath: 'packageList'
                            //     }
                            // },
                            {
                                e: "form",
                                a: {
                                    id: "pay-form"
                                },
                                t: [{
                                    //     e: "h3",
                                    //     a: {
                                    //         class: "recharge_header"
                                    //     },
                                    //     style: {
                                    //         position: "relative",
                                    //         width: "100%"
                                    //     }
                                    // }, {
                                    e: "multiview",
                                    a: {
                                        id: "acspay-package-list"
                                    },
                                    t: [{
                                            e: "tab",
                                            t: [{
                                                    e: "tab-nav",
                                                    a: {
                                                        view: "personal",
                                                        class: "active"
                                                    },
                                                    t: "个人套餐",
                                                    click: function (r) {
                                                        filterPackage(r.sender);
                                                    }
                                                },
                                                {
                                                    e: "tab-nav",
                                                    a: {
                                                        view: "orgal"
                                                    },
                                                    t: "机构套餐",
                                                    click: function (r) {
                                                        filterPackage(r.sender);
                                                    }
                                                }
                                            ]
                                        },
                                        {
                                            e: "view",
                                            a: {
                                                id: "personal",
                                                class: "active"
                                            },
                                            t: [
                                                {
                                                    e: "ul",
                                                    a: {
                                                        class: "b2c"
                                                    },
                                                    t: [{
                                                            e: "li",
                                                            datapath: "b2cPackages",
                                                            a: {
                                                                type: "radio",
                                                                name: "packagetype",
                                                                "data-pricetype": "priceYear",
                                                                "data-type": "[[type]]",
                                                                "data-package": "[[package]]",
                                                                "data-price": "[[new_price/priceYear]]"
                                                            },
                                                            t: [{
                                                                    e: "div",
                                                                    a: {
                                                                        class: "price-con"
                                                                    },
                                                                    t: [{
                                                                            e: "span",
                                                                            a: {
                                                                                class: "package-name"
                                                                            },
                                                                            t: "[[package]]"
                                                                        },
                                                                        {
                                                                            e: "br"
                                                                        },
                                                                        {
                                                                            e: "span",
                                                                            a: {
                                                                                class: "package-amount-prompt"
                                                                            },
                                                                            t: [
                                                                                "¥",
                                                                                {
                                                                                    e: "span",
                                                                                    a: {
                                                                                        class: "recharge-money"
                                                                                    },
                                                                                    t: "[[new_price/priceYear]]"
                                                                                },
                                                                                {
                                                                                    e: "span",
                                                                                    a: {
                                                                                        class: "recharge-dot"
                                                                                    }
                                                                                },
                                                                                "元/年"
                                                                            ]
                                                                        }
                                                                    ]
                                                                },
                                                                {
                                                                    e: "i",
                                                                    a: {
                                                                        class: "fa fa-check"
                                                                    }
                                                                }
                                                            ],
                                                            click: function(r) {
                                                                packageChoose(r);
                                                            }
                                                        },
                                                        {
                                                            e: "li",
                                                            datapath: "b2cPackages",
                                                            a: {
                                                                type: "radio",
                                                                name: "packagetype",
                                                                "data-pricetype": "priceMonth",
                                                                "data-type": "[[type]]",
                                                                "data-package": "[[package]]",
                                                                "data-price": "[[new_price/priceMonth]]"
                                                            },
                                                            t: [{
                                                                    e: "div",
                                                                    a: {
                                                                        class: "price-con"
                                                                    },
                                                                    t: [{
                                                                            e: "span",
                                                                            a: {
                                                                                class: "package-name"
                                                                            },
                                                                            t: "[[package]]"
                                                                        },
                                                                        {
                                                                            e: "br"
                                                                        },
                                                                        {
                                                                            e: "span",
                                                                            a: {
                                                                                class: "package-amount-prompt"
                                                                            },
                                                                            t: [
                                                                                "¥",
                                                                                {
                                                                                    e: "span",
                                                                                    a: {
                                                                                        class: "recharge-money"
                                                                                    },
                                                                                    t: "[[new_price/priceMonth]]"
                                                                                },
                                                                                {
                                                                                    e: "span",
                                                                                    a: {
                                                                                        class: "recharge-dot"
                                                                                    }
                                                                                },
                                                                                "元/月"
                                                                            ]
                                                                        }
                                                                    ]
                                                                },
                                                                {
                                                                    e: "i",
                                                                    a: {
                                                                        class: "fa fa-check"
                                                                    }
                                                                }
                                                            ],
                                                            click: function(r) {
                                                                packageChoose(r);
                                                            }
                                                        }
                                                    ]
                                                },
                                                {
                                                    e: "div",
                                                    a: {
                                                        class: "clearfloat"
                                                    }
                                                }
                                            ]
                                        },
                                        {
                                            e: "view",
                                            a: {
                                                id: "orgal"
                                            },
                                            t: [
                                                function(r) {
                                                    if (r.data.b2bPackages.length) {
                                                        $(r.container).render({
                                                            data: r.data,
                                                            template: [{
                                                                    e: "ul",
                                                                    a: {
                                                                        class: "b2b"
                                                                    },
                                                                    t: [{
                                                                            e: "li",
                                                                            datapath: "b2bPackages",
                                                                            a: {
                                                                                type: "radio",
                                                                                name: "packagetype",
                                                                                "data-pricetype": "priceYear",
                                                                                "data-type": "[[type]]",
                                                                                "data-package": "[[package]]",
                                                                                "data-trial": "[[jdata/trial]]",
                                                                                "data-price": "[[new_price/priceYear]]"
                                                                            },
                                                                            t: [{
                                                                                    e: "div",
                                                                                    a: {
                                                                                        class: "price-con"
                                                                                    },
                                                                                    t: [{
                                                                                            e: "span",
                                                                                            a: {
                                                                                                class: "package-name"
                                                                                            },
                                                                                            t: "[[package]]"
                                                                                        },
                                                                                        {
                                                                                            e: "br"
                                                                                        },
                                                                                        {
                                                                                            e: "span",
                                                                                            a: {
                                                                                                class: "package-amount-prompt"
                                                                                            },
                                                                                            t: [
                                                                                                "¥",
                                                                                                {
                                                                                                    e: "span",
                                                                                                    a: {
                                                                                                        class: "recharge-money"
                                                                                                    },
                                                                                                    t: "[[new_price/priceYear]]"
                                                                                                },
                                                                                                {
                                                                                                    e: "span",
                                                                                                    a: {
                                                                                                        class: "recharge-dot"
                                                                                                    }
                                                                                                },
                                                                                                "元/年"
                                                                                            ]
                                                                                        }
                                                                                    ]
                                                                                },
                                                                                {
                                                                                    e: "i",
                                                                                    a: {
                                                                                        class: "fa fa-check"
                                                                                    }
                                                                                }
                                                                            ],
                                                                            click: function(r) {
                                                                                packageChoose(r);
                                                                            }
                                                                        },
                                                                        {
                                                                            e: "li",
                                                                            datapath: "b2bPackages",
                                                                            a: {
                                                                                type: "radio",
                                                                                name: "packagetype",
                                                                                "data-pricetype": "priceMonth",
                                                                                "data-type": "[[type]]",
                                                                                "data-package": "[[package]]",
                                                                                "data-trial": "[[trial]]",
                                                                                "data-price": "[[new_price/priceMonth]]"
                                                                            },
                                                                            t: [{
                                                                                    e: "div",
                                                                                    a: {
                                                                                        class: "price-con"
                                                                                    },
                                                                                    t: [{
                                                                                            e: "span",
                                                                                            a: {
                                                                                                class: "package-name"
                                                                                            },
                                                                                            t: "[[package]]"
                                                                                        },
                                                                                        {
                                                                                            e: "br"
                                                                                        },
                                                                                        {
                                                                                            e: "span",
                                                                                            a: {
                                                                                                class: "package-amount-prompt"
                                                                                            },
                                                                                            t: [
                                                                                                "¥",
                                                                                                {
                                                                                                    e: "span",
                                                                                                    a: {
                                                                                                        class: "recharge-money"
                                                                                                    },
                                                                                                    t: "[[new_price/priceMonth]]"
                                                                                                },
                                                                                                {
                                                                                                    e: "span",
                                                                                                    a: {
                                                                                                        class: "recharge-dot"
                                                                                                    }
                                                                                                },
                                                                                                "元/月"
                                                                                            ]
                                                                                        }
                                                                                    ]
                                                                                },
                                                                                {
                                                                                    e: "i",
                                                                                    a: {
                                                                                        class: "fa fa-check"
                                                                                    }
                                                                                }
                                                                            ],
                                                                            click: function(r) {
                                                                                packageChoose(r);
                                                                            }
                                                                        }
                                                                    ]
                                                                },
                                                                {
                                                                    e: "div",
                                                                    a: {
                                                                        class: "clearfloat"
                                                                    }
                                                                }
                                                            ]
                                                        });
                                                    }
                                                }
                                            ]
                                        },
                                        // {
                                        //     e: "div",
                                        //     a: {
                                        //         class: "confirm-pay"
                                        //     },
                                        //     t: [{
                                        //             e: "p",
                                        //             a: {
                                        //                 class: "couponSelect"
                                        //             }
                                        //         },
                                        //         {
                                        //             e: "p",
                                        //             a: {
                                        //                 class: "pricedisplay"
                                        //             },
                                        //             t: [
                                        //                 "<i class='txt'>总价：</i>",
                                        //                 {
                                        //                     e: "span",
                                        //                     a: {
                                        //                         id: "total-amount"
                                        //                     },
                                        //                     style: {
                                        //                         color: "rgb(255, 0, 0)"
                                        //                     },
                                        //                     t: "¥ 0"
                                        //                 }
                                        //             ]
                                        //         },
                                        //         {
                                        //             e: "button",
                                        //             a: {
                                        //                 id: "btn-tryout",
                                        //                 type: "button"
                                        //             },
                                        //             t: "试用",
                                        //             click: function(r) {
                                        //                 packageTrial(r);
                                        //             }
                                        //         },
                                        //         {
                                        //             e: "input",
                                        //             a: {
                                        //                 type: "button",
                                        //                 value: "确认下单",
                                        //                 id: "btn-to-payment",
                                        //                 disabled: "disabled"
                                        //             },
                                        //             style: {
                                        //                 "background-color": "rgba(82, 82, 82, 0.4)"
                                        //             },
                                        //             click: function(r) {
                                        //                 doPayment(r);
                                        //             }
                                        //         },
                                        //         {
                                        //             e: "p",
                                        //             a: {
                                        //                 id: "orgPrice"
                                        //             },
                                        //             style: {
                                        //                 "font-weight": "700",
                                        //                 "font-size": "16px",
                                        //                 "text-align": "right",
                                        //                 display: "none"
                                        //             }
                                        //         }
                                        //     ]
                                        // }
                                    ]
                                }]
                            },
                            {
                                p: [
                                    {
                                        e: "button",
                                        a: {
                                            id: "btn-tryout",
                                            type: "button"
                                        },
                                        style: {
                                            display: "none"
                                        },
                                        t: "试用",
                                        click: function(r) {
                                            packageTrial(r);
                                        }
                                    },
                                    {
                                        b: '0',
                                        id: 'total-mount',
                                        style: {
                                            color: '#ff0000',
                                            'font-size': '16px'
                                        }
                                    },
                                    {
                                        span: '元',
                                        style: {
                                            color: '#ff0000',
                                            'font-size': '16px'
                                        }
                                    },
                                    {
                                        span: [
                                            {
                                                e: "wf-button",
                                                a: {
                                                    id: "confirm_container"
                                                },
                                                t: { 
                                                    e: "input",
                                                    a: {
                                                        type: "button",
                                                        value: "去购买"
                                                    }
                                                },
                                                click: function (r) {
                                                    packageInfoSubmit(r);
                                                }
                                            },
                                            {
                                                span: '？',
                                                style: {
                                                    display: 'inline-block',
                                                    'background-color': '#76a8e4',
                                                    color: '#fff',
                                                    'border-radius': '16px',
                                                    width: '16px',
                                                    height: '16px',
                                                    'text-align': 'center',
                                                    'line-height': '16px',
                                                    cursor: 'help'
                                                },
                                                a: {
                                                    title:
                                                        '个人购买：个人只能购买b2c类型的资源包，购买之后只能该账户使用。\n机构购买：只能通过认证过的机构账户购买，购买后可在【我的资源】中配置IP，配置成功后该IP下的用户都可以享受资源包。'
                                                }
                                            }
                                        ],
                                        id: 'user-package-buy'
                                    },
                                    {
                                        span: [
                                            {
                                                e: "wf-button",
                                                t: { 
                                                    e: "input",
                                                    a: {
                                                        type: "button",
                                                        value: "机构购买"
                                                    }
                                                },
                                                click: function (param) {
                                                    packageInfoSubmit(param);
                                                }
                                            },
                                            {
                                                span: '？',
                                                style: {
                                                    display: 'inline-block',
                                                    'background-color': '#76a8e4',
                                                    color: '#fff',
                                                    'border-radius': '16px',
                                                    width: '16px',
                                                    height: '16px',
                                                    'text-align': 'center',
                                                    'line-height': '16px',
                                                    cursor: 'help'
                                                },
                                                a: {
                                                    title:
                                                        '个人购买：个人只能购买b2c类型的资源包，购买之后只限该账户使用。\n机构购买：只能通过认证过的机构账户购买，购买后可在【我的资源】中配置IP，配置成功后该IP下的用户都可以享受资源包。'
                                                }
                                            }
                                        ],
                                        id: 'org-package-buy',
                                        style: {
                                            display: 'none'
                                        }
                                    }
                                ],
                                style: {
                                    'text-align': 'right',
                                    height: '50px'
                                }
                            }
                        ],
                        else: {
                            p: '该应用暂无可购买的资源包'
                        }
                    }
                });
            });
        }
        // 资源包选择  tabnav切换功能
        function filterPackage(r) {
            if ($("tab tab-nav.active").attr("view") !== $(r).attr("view")) {
                $('#total-mount').text("0");
                $("view ul li").removeClass("active");
                $("#btn-tryout").hide();
                if ($(r).attr("view") === "orgal") {
                    $('#user-package-buy').hide();
                    $('#org-package-buy').show();
                } else {
                    $('#user-package-buy').show();
                    $('#org-package-buy').hide();
                }
            }
        }

        function packageChoose(param) {
            $("input#btn-to-payment").css("background-color", "").attr("disabled", false);
            var _this = $(param.sender);
            let payUserType = _this.data().type;
            let payPriceType = _this.data().pricetype;
            let price = _this.data().price;
            $('#total-mount').text(price);
            $("multiview#acspay-package-list ul li").removeClass("active");
            _this.attr("class", "active");
            switch (payUserType) {
                case "b2b": //机构用户
                    if (_this.data().trial == "1") {
                        $("#btn-tryout").show();
                    } else {
                        $("#btn-tryout").hide();
                    }
                    $('#user-package-buy').hide();
                    $('#org-package-buy').show();
                    break;
                default: //个人用户
                    $('#user-package-buy').show();
                    $('#org-package-buy').hide();
                    break;
            }
        }

        function packageInfoSubmit(param) {
            var radio = $("li.active");
            var priceType = radio.data().pricetype;
            var package = radio.data().package;
            var type = radio.data().type;
            var return_url = window.location.href;
            if (param.org_data.uid === null) {
                window.location.href = wf.wfPubServer() + '/login?redirectUri=' + return_url;
            } else {
                if (type === "b2b") {
                    organizationBuy({
                        package: package,
                        packageType: type,
                        priceType: priceType
                    });
                } else {
                    // console.log(appId, package, priceType, wf.oauthServer() + "/my/coupon/")
                    window.location.href = 
                    wf.accServer()
                    .concat(
                        "/pay/v2/acsentry?appid=", encodeURIComponent(appId),
                        "&package=", encodeURIComponent(package),
                        "&pricetype=", encodeURIComponent(priceType),
                        "&return_url=", encodeURIComponent(window.location.href)
                    )
                }
            }
        }
        // 机构试用
        function packageTrial(param) {
            var packageInfo = $("li.active").data();
            wf.http.post(
                wf.apiServer() + '/acs/order_create',
                {
                    docType: '机构试用申请单', // 工单类型
                    appId: appId,
                    package: packageInfo.package,
                    packageType: packageInfo.type,
                    memo: packageInfo.package + '(' + packageInfo.type + ')试用'
                },
                function (data, response) {
                    if (!response.code && !response.err_code) {
                        alert('试用开通成功');
                        //- 系统通知
                        wf.workOrderNotice(data);
                    } else {
                        if (response.err_code === 403) {
                            // 非机构用户
                            organizationPop(!!response.sqlMessage ? response.sqlMessage : response.err_message);
                        } else if (response.err_code === 40002) {
                            // 未登录
                            var return_url = window.location.href;
                            window.location.href = wf.wfPubServer() + '/login?redirectUri=' + return_url;
                        } else {
                            alert(!!response.sqlMessage ? response.sqlMessage : response.err_message);
                        }
                    }
                }
            );
        }
        // 机构购买
        function organizationBuy(data) {
            var tranPriceType = data.priceType === 'priceMonth' ? '包月' : '包年';
            wf.http.post(
                wf.apiServer() + '/acs/order_create',
                {
                    docType: '机构购买申请单', // 工单类型
                    appId: appId,
                    package: data.package,
                    packageType: data.packageType,
                    priceType: data.priceType,
                    memo: '机构用户购买' + data.package + '(' + data.packageType + ')' + tranPriceType
                },
                function (data, response) {
                    if (!response.code && !response.err_code) {
                        alert('申请提交成功，请等待管理员审核');
                        //- 系统通知
                        wf.workOrderNotice(data);
                    } else {
                        // 未登录
                        if (response.err_code === 403) {
                            // 非机构用户
                            organizationPop(!!response.sqlMessage ? response.sqlMessage : response.err_message);
                        } else if (response.err_code === 40002) {
                            var return_url = window.location.href;
                            window.location.href = wf.wfPubServer() + '/login?redirectUri=' + return_url;
                        } else {
                            alert(!!response.sqlMessage ? response.sqlMessage : response.err_message);
                        }
                    }
                }
            );
        }

        //- 认证窗口
        function organizationPop(text) {
            var pop = poplayer({
                header: '机构认证提示',
                width: '400px',
                height: '200px',
                data: {
                    text: text
                },
                template: {
                    e: 'div',
                    t: [
                        {
                            e: 'p',
                            style: {
                                'text-align': 'center',
                                'line-height': '125px'
                            },
                            t: '[[text]]'
                        },
                        {
                            e: 'div',
                            style: {
                                'text-align': 'center',
                                position: 'absolute',
                                bottom: '0',
                                left: '0',
                                width: '100%'
                            },
                            t: [
                                {
                                    e: 'button',
                                    t: '取消',
                                    click: function () {
                                        pop.remove();
                                    }
                                },
                                {
                                    e: 'button',
                                    t: '去认证',
                                    click: function () {
                                        // var returnUrl = window.location.href;
                                        window.location.href = wf.wfPubServer() + '/open/certification/mechanism';
                                    }
                                }
                            ]
                        }
                    ]
                }
            });
        }
    });
};


//  jsbuilder/wfpub/modules/wfpub.appfavoriteicon.js

/*
wfpub.appfavoriteicon

函数类型：thin.js函数模板

*/
wfpub.appfavoriteicon = function (p) {
    $(p.container).render({
        data: p.data,
        template: {
            e: "img",
            a: {
                src: function (p) {
                    return (p.data.added === false) ? wf.comServer() + "/img/g-star.png" : wf.comServer() + "/img/o-star.png"
                }
            },
            click: favorite
        },
    });

    function favorite(d) {
        console.log(d);
        // wf.http.post(
        //     "/api/appstore_favorite_add", { appId: d.org_data.appId },
        //     function(r) {
        //         if (r.added === true) {
        //             // d.sender.setAttribute("src", wf.comServer()+"/img/g-star.png");
        //             d.sender.setAttribute("src", wf.comServer() + "/img/o-star.png");
        //         } else {
        //             // d.sender.setAttribute("src", wf.comServer()+"/img/o-star.png" );
        //             d.sender.setAttribute("src", wf.comServer() + "/img/g-star.png");
        //         }
        //         console.log(r)
        //     },
        //     function(err) {
        //         console.log(err);
        //     }
        // );
        let headers = {}
        if (wf.getInsideOrOutsideStatus()) {
            //站外
            var wfpub_token = wf.cookie.get('sync_login_wfpub_token')
            headers['X-Ca-AppKey'] = 'g3uhs3vsx0zi'
            if (wfpub_token) {
                headers['x-ca-token'] = wfpub_token
            }
        }
        wf.http.post({
            url: wf.apiServer() + "/apps/appstore_favorite_add",
            data: { appId: d.org_data.appId },
            headers: headers
        }, function (r) {
            if (r.added === true) {
                // d.sender.setAttribute("src", wf.comServer()+"/img/g-star.png");
                d.sender.setAttribute("src", wf.comServer() + "/img/o-star.png");
            } else {
                // d.sender.setAttribute("src", wf.comServer()+"/img/o-star.png" );
                d.sender.setAttribute("src", wf.comServer() + "/img/g-star.png");
            }
            console.log(r)
        },
            function (err) {
                console.log(err);
            })

    }
}

//  jsbuilder/wfpub/modules/wfpub.appmenu.js

wfpub.appmenu = function (e) {
    // console.log({ e: e });
    wf.pop({
        width: '85%',
        a: {
            class: 'wf-menu'
        },
        template: [
            { carouselcont: {} },
            {
                apptype: [
                    {
                        e: 'currtype',
                        t: '全部分类'
                    },
                    {
                        e: 'typelist',
                        t: {
                            e: 'typename',
                            t: '全部',
                            class: 'active'
                        }
                    }
                ]
            },

            {
                popcontainer: [
                    {
                        e: "tab",
                        t: [
                            { e: "tab-nav", t: "综合排序", click: function (data) { $(data.sender).addClass('active').siblings().removeClass('active'); searchApp() }, class: "active sort", a: { 'data-sort': '' } },
                            // { e: "tab-nav", t: "<i class='fa fa-star'/>", click: star },
                            {
                                e: "tab-nav",
                                t: '最新上架',
                                click: function (data) { $(data.sender).addClass('active').siblings().removeClass('active'); searchApp() },
                                class: "sort",
                                a: { 'data-sort': 'online' }
                            },
                            // {
                            //     e: "tab-nav",
                            //     t: '近期热门',
                            //     click: searchApp,
                            //     a: { 'data-sort': 'hot' }

                            // },
                            {
                                e: "tab-nav",
                                t: '最多收藏',
                                click: function (data) { $(data.sender).addClass('active').siblings().removeClass('active'); searchApp() },
                                class: "sort",
                                a: { 'data-sort': 'star' }
                            }
                        ]
                    },
                    {
                        e: 'search-tab',
                        t: [{
                            e: 'input',
                            a: { type: 'text', id: 'appName', placeholder: '输入关键词查找应用' }
                        },
                        {
                            e: 'button',
                            t: {
                                e: "img",
                                a: { src: wf.wfPubServer() + '/images/appmenu/wfpub_search.png' }
                            },
                            click: searchApp
                        }]
                    },
                    { e: "container", id: "appmenu" }
                ],
            }
        ]
    })
    carouselList()
    // searchApp()
    $('popcontainer tab-nav.active').click()
    $('applist-container tab-nav.active').click()
    getTagList()
    function carouselSet() {
        if ($('carouselcont').length) {
            const length = $('.carousel li').length
            let index = 0
            let a = null
            setMove()
            function setMove() {
                clearInterval(a)

                a = setInterval(function () {
                    index++;
                    if (index === length) {
                        index = 0;
                    }
                    $('.carousel li').eq(index).stop().fadeIn(300).siblings().stop().fadeOut(300)
                    $('.index-container li').eq(index).addClass('active').siblings().removeClass('active')
                    setMove()
                }, 3000)
            }

            $(document).on('click', '.index-container li', function () {
                index = $(this).index()
                $('.carousel li').eq(index).stop().fadeIn(300).siblings().stop().fadeOut(300)
                $('.index-container li').eq(index).addClass('active').siblings().removeClass('active')
                setMove()
            })
            $(document).on('click', '.banner-anchor', function () {
                if ($(this).hasClass('prev')) {
                    index -= 1
                    if (index < 0) {
                        index = length - 1
                    }
                } else {
                    index += 1
                    if (index === length) {
                        index = 0
                    }
                }
                $('.carousel li').eq(index).fadeIn(300).siblings().fadeOut(300)
                $('.index-container li').eq(index).addClass('active').siblings().removeClass('active')
                setMove()
            })



        }

    }
    function getTagList() {
        let headers = {}
        if (wf.getInsideOrOutsideStatus()) {
            //站外
            var wfpub_token = wf.cookie.get('sync_login_wfpub_token')
            headers['X-Ca-AppKey'] = 'g3uhs3vsx0zi'
            if (wfpub_token) {
                headers['x-ca-token'] = wfpub_token
            }
        }
        wf.http.post({
            url: wf.apiServer() + "/apps/app_tag_online_list",
            data: {},
            headers: headers
        },
            function (d) {
                console.log(d)
                // $("container#appmenu").empty().render({
                //     data: d.apps,
                //     template: wfpub.appmenuitem
                // });
                let html = ''
                d.tags.forEach((item, index) => {
                    html += `<typename data-tagId="${item.tagId}">${item.tagName}</typename>`
                })
                $('typelist').append(html)


            },
            function (err) {
                console.log(err);
            })
    }
    function carouselList() {
        let list;
        wf.http.post(wf.apiServer() + "/apps/banner_home_online_list", {}, function (data, response) {

            if (!response.err_code && response.banners.length > 0) {
                list = response.banners
                console.log(list)
                let listHtml = '<ul class="carousel">'
                let indexHtml = '<ul class="index-container">'
                list.forEach((item, index) => {
                    let carItem = `<li>`
                    carItem += `<a href="${item.href}" target="_blank"><img src="${item.imgUrl}"/></a>`
                    carItem += '</li>'
                    let indexItem = `<li class="${index === 0 ? 'active' : ""}"></li>`
                    listHtml += carItem
                    indexHtml += indexItem
                })
                listHtml += `</ul>`
                indexHtml += "</ul>"
                let anchor = `
                <a href="javascript:;" class="banner-anchor prev"></a>
                <a href="javascript:;" class="banner-anchor next"></a>

                `
                let extraBanner = `<div style="visibility:hidden;"><img src="${list[0].imgUrl}" style="width:100%"></div>`
                $('carouselcont').html(listHtml + extraBanner + indexHtml + anchor)
                carouselSet()
                // return listHtml + indexHtml + anchor;
            }
        })
        // const list = [
        //     {
        //         bg:wf.wfPubServer()+ '/images/appmenu/wfopen.png',
        //         // img:wf.wfPubServer() +  '/images/appmenu/wfopen/img.png',
        //         // text: wf.wfPubServer() + '/images/appmenu/wfopen/text.png',
        //         href: 'https://wf.pub/open'
        //     },
        //     {
        //         bg:wf.wfPubServer()+'/images/appmenu/baike.png',
        //         // img: wf.wfPubServer()+'/images/appmenu/baike/img.png',
        //         // text: wf.wfPubServer()+ '/images/appmenu/baike/text.png',
        //         href: 'https://wf.pub/ecph'
        //     },
        //     {
        //         bg: wf.wfPubServer()+'/images/appmenu/chongqing.png',
        //         // text: wf.wfPubServer()+'/images/appmenu/chongqing/text.png',
        //         href: 'https://wf.pub/cqtsk'
        //     },
        //     {
        //         bg:wf.wfPubServer()+'/images/appmenu/video.png',
        //         // img: wf.wfPubServer()+'/images/appmenu/video/img.png',
        //         // text: wf.wfPubServer()+'/images/appmenu/video/text.png',
        //         href: 'https://wf.pub/videotopic'
        //     },
        //     {
        //         bg: wf.wfPubServer()+'/images/appmenu/opera.png',
        //         // img: wf.wfPubServer() + '/images/appmenu/opera/img.png',
        //         // text: wf.wfPubServer()+'/images/appmenu/opera/text.png',
        //         href: 'https://wf.pub/xqz'
        //     }
        // ]

    }
}
$(document).on('click', 'wf-pagination a', function () {
    searchApp({ page: $(this).attr('data-page') })
})
function renderPagination(pager) {
    let count = pager.count
    let page = pager.page
    let pagelist = ''
    if (count === 1 || count === 0) {
        return
    }
    if (page !== 1) {
        pagelist += `<a href="javascript:;" data-page="${page - 1}"> < </a>`
    } else {
        pagelist += `<a href="javascript:;" class="den"> < </a>`
    }
    if (page - 5 > 1) {
        pagelist += `<a class="page-back" href="javascript:;" data-page="${page - 5}"> ··· </a>`
    }

    for (let i = page - 5 > 0 ? page - 5 : 1; i < (count + 1 > page + 5 ? page + 5 : count + 1); i++) {
        if (i === page) {
            pagelist += `<span>${i}</span>`
        } else {
            pagelist += `<a href="javascript:;" data-page="${i}">${i.toString()}</a>`
        }
    }
    if (page + 5 < count) {
        pagelist += `<a class="page-ahead" href="javascript:;" data-page="${page + 5}"> ··· </a>`
    }
    if (page !== count) {
        pagelist += `<a href="javascript:;" data-page="${page + 1}"> > </a>`
    } else {
        pagelist += `<a href="javascript:;" class="den"> > </a>`
    }
    let html = `
    <wf-pagination>
    ${pagelist}
    </wf-pagination>
    `
    $('wf-popbody').append(html)
}
$(document).on('click', 'typename', function () {
    $(this).addClass('active').siblings().removeClass('active')
    searchApp()
})
function searchApp(data) {
    // console.log(data.sender)
    console.log(data)
    $('wf-pagination').remove()
    const sort = $('tab-nav.sort.active').attr('data-sort')
    console.log(sort)
    $("container#appmenu").empty().html("loading...");
    const appName = $('#appName').val()
    const tagId = $('typename.active').attr('data-tagId') || null
    let headers = {}
    if (wf.getInsideOrOutsideStatus()) {
        //站外
        var wfpub_token = wf.cookie.get('sync_login_wfpub_token')
        headers['X-Ca-AppKey'] = 'g3uhs3vsx0zi'
        if (wfpub_token) {
            headers['x-ca-token'] = wfpub_token
        }
    }
    wf.http.post({
        url: wf.apiServer() + '/apps/appstore_query2',
        data: { appName: appName, sort: sort, tagId: tagId, page: data && data.page ? data.page : 1 },
        headers: headers
    }, function (d) {
        $("container#appmenu").empty().render({
            data: d.apps,
            template: wfpub.appmenuitem
        });
        const pager = {
            page: d.page,
            count: d.pageCount,
            pageSize: d.pageSize
        }
        renderPagination(pager)
    }, function (err) {
        console.log(err)
    })
}


//  jsbuilder/wfpub/modules/wfpub.appmenuitem.js

/*
wfpub.appmenuitem

函数类型：thin.js函数模板

*/
wfpub.appmenuitem = function(p) {
    $(p.container).render({
        data: p.data,
        template: {
            app: [{
                    e: "a",
                a: {
                    href: function (p) {
                        if ($('#domainUrl').length) {
                            return ($('#domainUrl').val() + p.data.indexUrl)
                        }
                        return wf.wfPubServer() + '/' + p.data.indexUrl
                    }
                },
                    t: {
                        if: function(p) { return p.data.logoUrl ? true : false },
                        then: {
                            e: "image",
                            style: {
                                'background-image': function(p) {return  'url("' +p.data.logoUrl + '")'}
                            }
                            // a: { src: "[[logoUrl]]" }
                        },
                        else: {
                            e: "no-img",
                            t: "[[appName]]"
                        }
                    }
                },
                {
                    e: "app-info",
                    t: [{
                            e: 'a',
                            t: { e: "app-name", t: "[[appName]]" },
                        a: {
                            href: function (p) {

                                if ($('#domainUrl').length) {
                                    return ($('#domainUrl').val()+ 'apps/' + p.data.indexUrl)
                                }
                                return wf.wfPubServer() + '/apps/' + p.data.indexUrl
                            }, title: "查看简介" }
                    },
                        {
                            if: function () {
                                let flag
                                if (p.data.tag) {
                                    flag = p.data.tag.isRecommend
                                } else {
                                    flag = p.data.isRecommend
                                }
                                return flag === 1
                            },
                            then: {
                                e: 'recommend-app',
                                t: '推荐',
                                a: {class: 'recommended-app' },
                                style: {'background-image': 'url("[[wf.wfPubServer]]/images/appmenu/recommend_icon.png")'}
                            }
                        },
                        {
                            e: 'app-desc',
                            t: '[[introduction]]'
                        },
                        {
                            e: "wf-user",
                            a: { 'data-nickname': "[[developer]]" },
                            t: {
                                e: "a", a: {
                                    href: function (p) {
                                        if ($('#domainUrl').length) {
                                            return ($('#domainUrl').val() + 'u/' + p.data.developer)
                                        }
                                        return wf.wfPubServer() + '/u/' + p.data.developer
                                    }

                                }, t: "@[[developer]]"
                            }
                        },
                        wfpub.appfavoriteicon,
                        '<br/>',
                    ]
                },
            ]
        }
    });
}

//  jsbuilder/wfpub/modules/wfpub.apps.js

wfpub.apps = function () {
    $("app-container").empty().html("loading...");
    // $('carouselcont').append()
    carouselList()
    getTagList()
    wf.http.post(
        "/api/appstore_query2", {},
        function (d) {
            $("app-container").empty().render({
                data: d.apps,
                template: wfpub.appmenuitem,
            });
            const pager = {
                page: d.page,
                count: d.pageCount,
                pageSize: d.pageSize
            }
            renderPagination(pager)
        },
        function (err) {
            console.log(err);
        }
    )

    function getTagList() {
        let headers = {}
        if (wf.getInsideOrOutsideStatus()) {
            //站外
            var wfpub_token = wf.cookie.get('sync_login_wfpub_token')
            headers['X-Ca-AppKey'] = wf.appFalg()
            if (wfpub_token) {
                headers['x-ca-token'] = wfpub_token
            }
        }
        wf.http.post({
            url: wf.apiServer() + "/apps/app_tag_online_list",
            data: {},
            headers: headers
        },
            function (d) {
                let html = ''
                d.tags.forEach((item, index) => {
                    html += `<typename data-tagId="${item.tagId}">${item.tagName}</typename>`
                })
                $('typelist').append(html)

                $(document).on('click', 'typename', function () {
                    $(this).addClass('active').siblings().removeClass('active')
                    searchApp()
                })
            },
            function (err) {
                console.log(err);
            })
    }
    function carouselSet() {
        if ($('carouselcont').length) {
            const length = $('.carousel li').length
            let index = 0
            let a = null
            setMove()
            function setMove() {
                clearInterval(a)
                a = setInterval(function () {
                    index++;
                    if (index === length) {
                        index = 0;
                    }
                    $('.carousel li').eq(index).fadeIn(300).siblings().fadeOut(300)
                    $('.index-container li').eq(index).addClass('active').siblings().removeClass('active')
                }, 3000)
            }
            $(document).on('click', '.index-container li', function () {

                index = $(this).index()
                console.log(index)
                $('.carousel li').eq(index).fadeIn(300).siblings().fadeOut(300)
                $('.index-container li').eq(index).addClass('active').siblings().removeClass('active')
                setMove()
            })
            $(document).on('click', '.banner-anchor', function () {
                if ($(this).hasClass('prev')) {
                    index -= 1
                    if (index < 0) {
                        index = length - 1
                    }
                } else {
                    index += 1
                    if (index === length) {
                        index = 0
                    }
                }
                $('.carousel li').eq(index).fadeIn(300).siblings().fadeOut(300)
                $('.index-container li').eq(index).addClass('active').siblings().removeClass('active')
                setMove()
            })

        }

    }
    function carouselList() {
        let list;
        let headers = {}
        if (wf.getInsideOrOutsideStatus()) {
            //站外
            var wfpub_token = wf.cookie.get('sync_login_wfpub_token')
            headers['X-Ca-AppKey'] = wf.appFalg()
            if (wfpub_token) {
                headers['x-ca-token'] = wfpub_token
            }
        }
        wf.http.post({
            url: wf.apiServer() + "/apps/banner_home_online_list",
            data: {},
            headers: headers
        },
            function (response) {
                // if (!response.err_code && response.banners.length > 0) {
                    list = response.banners
                    let listHtml = '<ul class="carousel">'
                    let indexHtml = '<ul class="index-container">'
                    list.forEach((item, index) => {
                        let carItem = `<li>`
                        carItem += `<a href="${item.href}" target="_blank"><img src="${item.imgUrl}"></img></a>`
                        carItem += '</li>'
                        let indexItem = `<li class="${index === 0 ? 'active' : ""}"></li>`
                        listHtml += carItem
                        indexHtml += indexItem
                    })
                    listHtml += '</ul>'
                    indexHtml += '</ul>'
                    let extraBanner = `<div style="visibility:hidden;"><img src="${list[0].imgUrl}" style="width:100%"></div>`
                    let anchor = `
                <a href="javascript:;" class="banner-anchor prev"></a>
                <a href="javascript:;" class="banner-anchor next"></a>
                `
                    // return listHtml + extraBanner + indexHtml + anchor;
                    $('carouselcont').html(listHtml + extraBanner + indexHtml + anchor)
                    carouselSet()
                // }
            },
            function (err) {
                console.log(err);
            })
        // wf.http.post(wf.apiServer() + "/apps/banner_home_online_list", {}, function (data, response) {
        //     if (!response.err_code && response.banners.length > 0) {
        //         list = response.banners
        //         let listHtml = '<ul class="carousel">'
        //         let indexHtml = '<ul class="index-container">'
        //         list.forEach((item, index) => {
        //             let carItem = `<li>`
        //             carItem += `<a href="${item.href}" target="_blank"><img src="${item.imgUrl}"></img></a>`
        //             carItem += '</li>'
        //             let indexItem = `<li class="${index === 0 ? 'active' : ""}"></li>`
        //             listHtml += carItem
        //             indexHtml += indexItem
        //         })
        //         listHtml += '</ul>'
        //         indexHtml += '</ul>'
        //         let extraBanner = `<div style="visibility:hidden;"><img src="${list[0].imgUrl}" style="width:100%"></div>`
        //         let anchor = `
        //     <a href="javascript:;" class="banner-anchor prev"></a>
        //     <a href="javascript:;" class="banner-anchor next"></a>

        //     `
        //         // return listHtml + extraBanner + indexHtml + anchor;
        //         $('carouselcont').html(listHtml + extraBanner + indexHtml + anchor)
        //         carouselSet()
        //     }

        // })
        // const list = [
        //     {
        //         bg: '/images/appmenu/wfopen.png',
        //         // img: '/images/appmenu/wfopen/img.png',
        //         // text: '/images/appmenu/wfopen/text.png',
        //         href: 'https://wf.pub/open'
        //     },
        // {
        //     bg: '/images/appmenu/baike.png',
        //     // img: '/images/appmenu/baike/img.png',
        //     // text: '/images/appmenu/baike/text.png',
        //     href: 'https://wf.pub/ecph'
        // },
        // {
        //     bg: '/images/appmenu/chongqing.png',
        //     // text: '/images/appmenu/chongqing/text.png',
        //     href: 'https://wf.pub/cqtsk'
        // },
        // {
        //     bg: '/images/appmenu/video.png',
        //     // img: '/images/appmenu/video/img.png',
        //     // text: '/images/appmenu/video/text.png',
        //     href: 'https://wf.pub/videotopic'
        // },
        // {
        //     bg: '/images/appmenu/opera.png',
        //     // img: wf.wfPubServer() + '/images/appmenu/opera/img.png',
        //     // text: '/images/appmenu/opera/text.png',
        //     href: 'https://wf.pub/xqz'
        // }
        // ]

    }
    $(document).on('click', 'tab-nav', searchApp)
    $(document).on('click', 'search-tab button', searchApp)
    function searchApp(data) {
        $('wf-pagination').remove()
        const sort = $('tab-nav.active').attr('data-sort')
        $("app-container").empty().html("loading...");
        const appName = $('#appName').val()
        const tagId = $('typename.active').attr('data-tagId') || null
        let headers = {}
        if (wf.getInsideOrOutsideStatus()) {
            //站外
            var wfpub_token = wf.cookie.get('sync_login_wfpub_token')
            headers['X-Ca-AppKey'] = wf.appFalg()
            if (wfpub_token) {
                headers['x-ca-token'] = wfpub_token
            }
        }
        wf.http.post({
            url: wf.apiServer() + '/apps/appstore_query2',
            data: { appName: appName, sort: sort, tagId: tagId, page: data && data.page ? data.page : 1 },
            headers: headers
        }, function (d) {
            $("app-container").empty().render({
                data: d.apps,
                template: wfpub.appmenuitem
            });
            const pager = {
                page: d.page,
                count: d.pageCount,
                pageSize: d.pageSize
            }
            renderPagination(pager)
        }, function (err) {
            console.log(err)
        })
    }
    function renderPagination(pager) {
        let count = pager.count
        let page = pager.page
        let pagelist = ''
        if (count === 1 || count === 0) {
            return
        }
        if (page !== 1) {
            pagelist += `<a href="javascript:;" data-page="${page - 1}"> < </a>`
        } else {
            pagelist += `<a href="javascript:;" class="den"> < </a>`
        }
        if (page - 5 > 1) {
            pagelist += `<a class="page-back" href="javascript:;" data-page="${page - 5}"> ··· </a>`
        }

        for (let i = page - 5 > 0 ? page - 5 : 1; i < (count + 1 > page + 5 ? page + 5 : count + 1); i++) {
            if (i === page) {
                pagelist += `<span>${i}</span>`
            } else {
                pagelist += `<a href="javascript:;" data-page="${i}">${i.toString()}</a>`
            }
        }
        if (page + 5 < count) {
            pagelist += `<a class="page-ahead" href="javascript:;" data-page="${page + 5}"> ··· </a>`
        }
        if (page !== count) {
            pagelist += `<a href="javascript:;" data-page="${page + 1}"> > </a>`
        } else {
            pagelist += `<a href="javascript:;" class="den"> > </a>`
        }
        let html = `
        <wf-pagination>
        ${pagelist}
        </wf-pagination>
        `
        $('applist-container').append(html)
    }
    $(document).on('click', 'wf-pagination a', function () {
        console.log(3333)
        searchApp({ page: $(this).attr('data-page') })
    })
}


//  jsbuilder/wfpub/modules/wfpub.favoriteapps.js

wfpub.favoriteapps = function () {
    wf.pop({
        width: '85%',
        template: {
            e: 'app-container',
            id: 'favoriteapps'
        }
    })
    searcFavoriteApps()
    function searcFavoriteApps() {
        $("app-container#favoriteapps").empty().html("loading...");
        let headers = {}
        if (wf.getInsideOrOutsideStatus()) {
            //站外
            var wfpub_token = wf.cookie.get('sync_login_wfpub_token')
            headers['X-Ca-AppKey'] = 'g3uhs3vsx0zi'
            if (wfpub_token) {
                headers['x-ca-token'] = wfpub_token
            } else {
                alert('请先登录再查看收藏的应用！')
                return
            }
        }
        wf.http.post({
            url: wf.apiServer() + '/apps/appstore_favorite',
            data: {},
            headers: headers
        }, function (d) {
            if (d.apps.length > 0) {
                $("app-container#favoriteapps").empty().render({
                    // data: d.apps,
                    // template: [
                    //     {
                    //         e: 'tab',
                    //         t: [
                    //             {
                    //                 e: 'tab-nav',
                    //                 t: '我的收藏',
                    //                 class: 'active'
                    //             }
                    //         ]
                    //     },
                    //     wfpub.appmenuitem
                    // ]
                    data: d,
                    template: {
                        e: 'wf-a',
                        t: [
                            {
                                e: 'tab',
                                t: [{
                                    e: 'img',
                                    a: {
                                        src: "https://com-d.wf.pub/img/o-star.png",
                                        style:'vertical-align: middle;margin-top: -2px;'
                                    }
                                },
                                {
                                    e: 'tab-nav',
                                    t: '我的应用',
                                    class: 'active'
                                }
                                ]
                            },
                            {
                                e: 'wf-meau',
                                datapath: 'apps',
                                t: [
                                    wfpub.appmenuitem
                                    // function (e) {
                                    //     console.log(e)
                                    //      wfpub.appmenuitem()
                                    // }

                                ]

                            }
                        ]
                    }

                });
            } else {
                $("app-container#favoriteapps").empty().html('您当前没有收藏应用！')
            }

            // const pager = {
            //     page: d.page,
            //     count: d.pageCount,
            //     pageSize: d.pageSize
            // }
            // renderPagination(pager)
        }, function (err) {
            console.log(err)
        })
    }
}