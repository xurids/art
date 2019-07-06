var Host = "http://192.168.0.198:8082";
var Hosts = "http://192.168.0.198:8082";

(function($, owner) {

	/**
	 * 用户登录
	 **/
	owner.login = function(loginInfo, callback) {
		callback = callback || $.noop;
		loginInfo = loginInfo || {};
		loginInfo.account = loginInfo.account || '';
		loginInfo.password = loginInfo.password || '';
		if (loginInfo.account.length < 5) {
			return callback('账号最短为 5 个字符');
		}
		if (loginInfo.password.length < 6) {
			return callback('密码最短为 6 个字符');
		}
		var waitLogin = plus.nativeUI.showWaiting();
		
		$.ajax(Host+'/json.php?c=login&a=login',{
			data:{
				userName:loginInfo.account,
				password:loginInfo.password
			},
			dataType:'json',
			type:'post',
			timeout:10000,
			success:function(data){
				waitLogin.close();
				if(data.Success=="true"){
					return owner.createState(loginInfo.account,data.UserId,data.token,callback);
				}else{
					callback('用户名或密码错误');
				}
			},
			error:function(xhr,type,errorThrown){
				waitLogin.close();
				callback('请求失败，请检查网络')
			}
		});
	};

	owner.createState = function(name,userId,token, callback) {
		var state = owner.getState();
		state.account = name;
		state.userId = userId;
		state.token = token;
		owner.setState(state);
		return callback();
	};

	/**
	 * 新用户注册
	 **/
	owner.reg = function(regInfo, callback) {
		callback = callback || $.noop;
		regInfo = regInfo || {};
		regInfo.account = regInfo.account || '';
		regInfo.password = regInfo.password || '';
		if (regInfo.account.length < 5) {
			return callback('用户名最短需要 5 个字符');
		}
		if (regInfo.password.length < 6) {
			return callback('密码最短需要 6 个字符');
		}
		/*if (!checkEmail(regInfo.email)) {
			return callback('邮箱地址不合法');
		}*/
		var waitReg = plus.nativeUI.showWaiting();		
		$.ajax(Host+'/json.php?c=login&a=register',{
			data:{
				'userName':regInfo.account,
				'password':regInfo.password
			},
			dataType:'json',
			type:'get',
			timeout:10000,
			success:function(data){
				waitReg.close();
				if(data.Success=="true"){
					return callback();
				}else{
					return callback('注册失败，请重试');
				}
			},
			error:function(xhr,type,errorThrown){
				waitReg.close();
				return callback('请求失败，请检查网络')
			}
		});
		
	};

	/**
	 * 获取当前状态
	 **/
	owner.getState = function() {
		var stateText = localStorage.getItem('$state') || "{}";
		return JSON.parse(stateText);
	};

	/**
	 * 设置当前状态
	 **/
	owner.setState = function(state) {
		state = state || {};
		localStorage.setItem('$state', JSON.stringify(state));
		//var settings = owner.getSettings();
		//settings.gestures = '';
		//owner.setSettings(settings);
	};

	var checkEmail = function(email) {
		email = email || '';
		return (email.length > 3 && email.indexOf('@') > -1);
	};

	/**
	 * 找回密码
	 **/
	owner.forgetPassword = function(email, callback) {
		callback = callback || $.noop;
		if (!checkEmail(email)) {
			return callback('邮箱地址不合法');
		}
		return callback(null, '暂不支持邮箱找回密码功能，请前往PC端找回密码' /*'新的随机密码已经发送到您的邮箱，请查收邮件。'*/);
	};

	/**
	 * 设置应用本地配置
	 **/
	owner.setSettings = function(settings) {
		settings = settings || {};
		localStorage.setItem('$settings', JSON.stringify(settings));
	}

	/**
	 * 获取应用本地配置
	 **/
	owner.getSettings = function() {
		var settingsText = localStorage.getItem('$settings') || "{}";
		return JSON.parse(settingsText);
	}
	
	//判断是否是ios
	owner.ios = function() {
		if (plus.os.name.toLocaleLowerCase() == 'ios') {
			return true;
		} else {
			return false;
		}
	};
	
	//IOS判断QQ是否已经安装
	owner.isQQInstalled = function() {
		var TencentOAuth = plus.ios.import("TencentOAuth");
		var isQQInstalled = TencentOAuth.iphoneQQInstalled();
		return isQQInstalled == '0' ? false : true
	};
	//IOS判断微信是否已经安装
	owner.isWXInstalled = function() {
		var Weixin = plus.ios.import("WXApi");
		var isWXInstalled = Weixin.isWXAppInstalled();
		return isWXInstalled == '0' ? false : true;
	};
	
	/*大于零显示元素*/
	owner.whichShow = function(data,obj) {
		if(data>0){
			document.getElementById(obj).innerText=data.toString();
			document.getElementById(obj).style.display='block';
		}else{
			document.getElementById(obj).style.display='none';
		}
			
	}
	
	/*不为空显示*/
	owner.nullShow = function(data,obj) {
		if(data!=''&&data!=null){
			document.getElementById(obj).innerText=data;
			document.getElementById(obj).style.display='block';
		}else{
			document.getElementById(obj).style.display='none';
		}
			
	}
	
	//阻止a链接跳转
	owner.stopHref = function(obj) {
		obj.on('tap', 'a', function(e) {
			e.preventDefault();
		});
	}
	
	owner.trim = function(str) {　　
		return str.replace(/(^\s*)|(\s*$)/g, "");
	}
	
	owner.isLogin = function(){
		var userState = JSON.parse(localStorage.getItem('$state') || "{}");
		if (userState.userId && userState.userId != '') {
			$.ajax(Host+'/json.php?c=login&a=check',{
				data:{
					ids:userState.userId
				},
				dataType:'json',
				type:'get',
				timeout:10000,
				success:function(data){
					if(data.Success == 'true'){
						return true;
					}else{
						return false;
					}
				}
			});
		} else {
			return false;
		}
	}
	
	/**
	 * 重写退出应用
	 **/
	owner.quitApp = function() {
		$.oldBack = mui.back;
		var backButtonPress = 0;
		$.back = function(event) {
			backButtonPress++;
			if (backButtonPress > 1) {
				plus.runtime.quit();
			} else {
				plus.nativeUI.toast('再按一次退出');
			}
			setTimeout(function() {
				backButtonPress = 0;
			}, 1000);
			return false;
		};
	}
	
	//打开软键盘
	owner.openSoftKeyboard = function() {
		if (mui.os.ios) {
			var webView = plus.webview.currentWebview().nativeInstanceObject();
			webView.plusCallMethod({
				"setKeyboardDisplayRequiresUserAction": false
			});
		} else {
			var webview = plus.android.currentWebview();
			plus.android.importClass(webview);
			webview.requestFocus();
			var Context = plus.android.importClass("android.content.Context");
			var InputMethodManager = plus.android.importClass("android.view.inputmethod.InputMethodManager");
			var main = plus.android.runtimeMainActivity();
			var imm = main.getSystemService(Context.INPUT_METHOD_SERVICE);
			imm.toggleSoftInput(0, InputMethodManager.SHOW_FORCED);
		}
	};
}(mui, window.app = {}));

//function showLogin(url){
//	pUrl='login.html';
//	if(url=='/'){
//		pUrl='../login.html'
//	}
//	plus.nativeUI.toast('请先登录')
//	mui.openWindow({
//		id:'login.html',
//		url:pUrl,
//		show: {
//			autoShow:true,
//			aniShow: 'zoom-fade-out'
//		},
//		waiting: {
//			autoShow: false
//		}
//	});
//}

function showProduct(id,url){
	var detailPage=plus.webview.getWebviewById('goods/show.html');
	if(detailPage!=null){
		detailPage.hide();
		detailPage.close();
	}
	pUrl='goods/show.html';
	if(url=='/'){
		pUrl='../goods/show.html'
	}
	
	setTimeout(function(){
		mui.openWindow({
			id:'goods/show.html',
			url:pUrl,
			extras:{
				product_id:id
		    },
			show: {
				autoShow:true,
				aniShow: 'pop-in'
			},
			waiting: {
				autoShow: false
			}
		});
	},100)
	
}

/*进度条:诚信 精品 正品*/
function showWaiting(hintText) {
	plus.nativeUI.showWaiting(hintText, {
		width: "20%",
		padding: "16px"
	});
}

function reloadWvLoad(){
	var errorText = document.createElement('div');
    errorText.innerHTML = '<h4>服务器开小差了</h4><button id="reloadWv" class="mui-btn mui-btn-negative">重新加载</button>';
    errorText.setAttribute('class','empty-show');
    document.body.appendChild(errorText);
}

mui('body').on('tap', '#closeWv', function() {
	if(plus.webview.currentWebview().parent()!=null)
		plus.webview.currentWebview().parent().close();
	else
		plus.webview.currentWebview().close();
});

mui('body').on('tap', '#reloadWv', function() {
	plus.webview.currentWebview().reload();
});

/*获取用户当前位置的经纬度*/
function getCurPosition(success, error) {
	var _provider = "system";
	if (mui.os.android) {
		_provider = "baidu";
	}
	plus.geolocation.getCurrentPosition(function(position) {
		var codns = position.coords; //获取地理坐标信息
		if (mui.os.android) {
			plus.storage.setItem("longitude", "" + codns.longitude);
			plus.storage.setItem("latitude", "" + codns.latitude);
			//回调经纬度 codns.latitude, codns.longitude
			success(codns);
		} else {
			var newcodns = bd09Encrypt(codns.longitude, codns.latitude); //转换坐标系
			plus.storage.setItem("longitude", "" + newcodns.longitude);
			plus.storage.setItem("latitude", "" + newcodns.latitude);
			success(newcodns);
		}
	}, function(e) {
		if (error) error(e);
	}, {
		provider: _provider
	});
}

/*经纬度获取省,市,区,街道*/
function getAddressComponent(latitude, longitude, success) {
	xhrPost(Url.getPositionURL(latitude, longitude), function(data) {
		if (data != null && data.status == 0) {
			var info = data.result.addressComponent;
			plus.storage.setItem("city", info.city); //更新本地数据
			success(info); //省,市,区,街道(info.province, info.city, info.district, info.street)
		}
	}, null, {
		'showWait': false,
		'toastErr': false,
		'method': 'GET'
	});
}

/*坐标由Wgs转bd*/
function bd09Encrypt(lon, lat) {
	var z = Math.sqrt(lon * lon + lat * lat) + 0.00002 * Math.sin(lat * Math.PI);
	var theta = Math.atan2(lat, lon) + 0.000003 * Math.cos(lon * Math.PI);
	var lnglat = new Object();
	lnglat.longitude = z * Math.cos(theta) + 0.0065;
	lnglat.latitude = z * Math.sin(theta) + 0.006;
	return lnglat;
}

/**
 * Post联网
 * @param {Object} url 网络地址
 * @param {Object} success 成功回调function(data)
 * @param {Object} param 参数 字符串拼接 "user=HBuilder&test=value"
 * @param {Object} config 配置json {'showWait':false, 'toastErr':false, 'showErr':true, 'method':"POST"}
 * @param {Object} err 错误回调function()
 * showWait 默认true,显示进度条对话框;
 * toastErr 默认true,弹出提示:"网络连接失败";
 * showErr 默认false,不显示错误对话框;
 * method 默认POST请求;(地图定位使用'GET');
 */
function xhrPost(url, success, param, config, err) {
	if (config == null) config = {};
	if (config.showWait == null) config["showWait"] = true;
	if (config.toastErr == null) config["toastErr"] = true;
	if (config.showErr == null) config["showErr"] = false;
	if (config.method == null) config["method"] = "POST";
//	plus.navigator.setCookie( Host, "JSESSIONID=1udqjoceydbjlqp2t6dtyu86c");
	plus.navigator.setCookie( Host, "JSESSIONID=" +plus.storage.getItem("JSESSIONID"));
	var xhr = new plus.net.XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			if (config.showWait) plus.nativeUI.closeWaiting(); //关闭进度条
			console.log("请求url--> " + url + " 参数--> " + param + " xhr=" + xhr);
			if (xhr.status == 200) {
				console.log("请求成功--> " + xhr.responseText);
				var data = xhr.response;
				if (data == -9) {
					if (mui.os.ios) {
						jsNative("goLogin");
					} else {
						jsNative("startActivity", "com.wd.baby.view.user.LoginActivity", "");
					}
				} else {
					success(data);
				}
			} else {
				//请求失败
				console.log("请求失败--> " + xhr.status);
				if (err != null) err();
				if (config.toastErr) mui.toast("网络连接失败");
				//错误对话框
				if (config.showErr) {
					//动态在body中加入布局:数据加载失败,点击重试
					var div_app_net_err = create("div", "div_app_net_err");
					div_app_net_err.innerHTML = "<img src='../images/no_net.png' /><p>数据加载失败:" + xhr.status + "<br />请检查网络</p><div class='bt_white_blue' onclick='plus.webview.currentWebview().reload(true)'>点此重试</div><div class='bt_white_blue' onclick='mui.back()'>关 闭</div>";
					document.body.appendChild(div_app_net_err);
					mui.createMask().show(); //显示遮罩
				}
			}
		}
	}
	xhr.open(config.method, url);
	xhr.timeout = 10000;
	xhr.responseType = "json";
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); //传参必须写
//	xhr.setRequestHeader("Cookie", "JSESSIONID=" + plus.storage.getItem("JSESSIONID"));
	//设备平台参数:Android=1;IOS=2;
	var de = 1;
	if (mui.os.ios) de = 2;
	if (param == null) {
		param = "de=" + de;
	} else {
		param += "&de=" + de;
	}
//	xhr.send(param);	
	xhr.send();
	//显示进度条 默认显示
	if (config.showWait) showWaiting();
}

/*根据id查找元素*/
function $id(id) {
	return document.getElementById(id);
}

/*根据class查找元素*/
function $class(className, parentDom) {
	if (parentDom) {
		return parentDom.getElementsByClassName(className);
	} else {
		return document.getElementsByClassName(className);
	}
}

/*创建元素,并设置类型和id*/
function create(_tag, _class, _id) {
	var newElement = document.createElement(_tag);
	if (_class != null)
		newElement.setAttribute("class", _class);
	if (_id != null)
		newElement.setAttribute("id", _id);
	return newElement;
}

/*打开界面*/
function openWindow(_url, params, isClose) {
	//跳转界面后是否关闭当前页面
	if (isClose) {
		var curWin = plus.webview.currentWebview();
		setTimeout(function() {
			curWin.hide(); //避免出现关闭动画
			curWin.close();
		}, 500);
	}
	var win = plus.webview.getWebviewById(_url);
	if (win){
		//直接显示
		win.show();
		if(_url=="wallet.html"){
			//如果是我的钱包需刷新数据
			win.evalJS("getWalletData()");
		}
	}else{
		//打开
		mui.openWindow({
			url: _url,
			id: _url,
			extras: params,
			waiting: {
				autoShow: false
			},
			show: {
				duration: 200
			}
		});
	}
}

/*多少天前*/
function getDateDiff(dateTimeStamp) {
	var minute = 1000 * 60;
	var hour = minute * 60;
	var day = hour * 24;
	var halfamonth = day * 15;
	var month = day * 30;
	//当前时间
	var now = new Date().getTime();
	var diffValue = now - dateTimeStamp;
	if (diffValue <= 0)
		return "刚刚";
	var monthC = diffValue / month;
	var weekC = diffValue / (7 * day);
	var dayC = diffValue / day;
	var hourC = diffValue / hour;
	var minC = diffValue / minute;
	if (monthC >= 1) {
		result = parseInt(monthC) + "个月前";
	} else if (weekC >= 1) {
		result = parseInt(weekC) + "周前";
	} else if (dayC >= 1) {
		result = parseInt(dayC) + "天前";
	} else if (hourC >= 1) {
		result = parseInt(hourC) + "小时前";
	} else if (minC >= 1) {
		result = parseInt(minC) + "分钟前";
	} else
		result = "刚刚";
	return result;
}

/*隐藏界面*/
function hideWindow(_url) {
	var win = plus.webview.getWebviewById(_url);
	if (win) win.hide();
}

/*暂无数据,显示空div*/
function showEmptyDiv(hintStr, todoStr, todoFun) {
	//检查是否已经创建
	var div_app_empty = $id("div_app_empty");
	if (div_app_empty) {
		div_app_empty.style.display = "block";
	} else {
		div_app_empty = create("div", null, "div_app_empty");
		div_app_empty.innerHTML = "<p class='mui-icon iconfont icon-empty_box'></p><p id='div_app_empty_p_hint'></p><p id='div_app_empty_p_todo'></p>";
		document.body.appendChild(div_app_empty);
	}
	//设置内容
	if (hintStr) $id("div_app_empty_p_hint").innerHTML = hintStr;
	var span_todo = $id("div_app_empty_p_todo");
	if (todoStr) span_todo.innerHTML = todoStr;
	if (todoFun) span_todo.addEventListener("tap", todoFun);
}

/*隐藏暂无数据的div*/
function hideEmptyDiv() {
	var div_app_empty = $id("div_app_empty");
	if (div_app_empty)
		div_app_empty.style.display = "none";
}

/*显示轮播图片 
 *src_array 图片地址的数组
 *div_slider 轮播<div id='slider' class='mui-slider'></div>,需设置宽高
 *src_default 首次显示的图 src地址 不是下标,默认显示第一张;
 *change_time 自动轮播周期，若为0则不自动播放，默认为5000;
 *PS:获取当前轮播的下标 var curIndex=mui('#slider').slider().getSlideNumber();
 */
function initSlider(src_array, div_slider, src_default, change_time) {
	var size = src_array.length;
	if (size > 0) {
		//如果首次显示的图不传,默认第一张;
		if (src_default == null)
			src_default = src_array[0];
		//如果自动轮播的时间不传,则默认5秒轮播一次
		if (change_time == null)
			change_time = 5000;
		//额外增加的一个节点(循环轮播：第一个节点是最后一张轮播) 
		var preStr = "<div class='mui-slider-group mui-slider-loop'><div class='mui-slider-item mui-slider-item-duplicate'><img data-src='" + src_array[size - 1] + "' src='../images/translate.png' onload='imgload.load(this)'/></div>";
		//真正的轮播图
		var imgStr = "";
		for (var i = 0; i < size; i++) {
			imgStr = imgStr + "<div class='mui-slider-item'><img data-src='" + src_array[i] + "' src='../images/translate.png' onload='imgload.load(this)'/></div>";
		}
		//额外增加的一个节点(循环轮播：最后一个节点是第一张轮播) 
		var endStr = "<div class='mui-slider-item mui-slider-item-duplicate'><img data-src='" + src_array[0] + "' src='../images/translate.png' onload='imgload.load(this)'/></div></div>";
		//首次显示的图
		var index = 0;
		for (var i = 0; i < size; i++) {
			if (src_default == src_array[i]) {
				index = i;
				break;
			}
		}
		//小圆点
		var dotStr = "<div class='mui-slider-indicator'>";
		for (var i = 0; i < size; i++) {
			if (i == index) {
				dotStr = dotStr + "<div class='mui-indicator mui-active'></div>";
			} else {
				dotStr = dotStr + "<div class='mui-indicator'></div>";
			}
		}
		dotStr = dotStr + "</div>";
		//放入轮播图
		div_slider.innerHTML = preStr + imgStr + endStr + dotStr;
		//初始化轮播图
		mui("#slider").slider({
			interval: change_time
		});
		//设置首次显示的图
		mui('.mui-slider').slider().gotoItem(index);
	}
}

/*获取url的网络地址*/
function getImgUrl(imgDom) {
	var bg_url = imgDom.style.backgroundImage;
	if (bg_url) {
		var net_url = bg_url.substring(bg_url.indexOf("(") + 1, bg_url.indexOf(")"));
		return net_url;
	} else {
		return "";
	}
}

/*JS调原生
 *methodName 原生WebappMode的方法名
 *param 参数,个数自行添加再后面
 * */
function jsNative(methodName, param1, param2, param3) {
	if (mui.os.android) {
		if (param1 == null) { //无参
			plus.android.invoke("com.wd.baby.web.WebappMode", methodName);
		} else if (param2 == null) { //带一个参数
			plus.android.invoke("com.wd.baby.web.WebappMode", methodName, param1);
		} else if (param3 == null) { //带两个参数
			plus.android.invoke("com.wd.baby.web.WebappMode", methodName, param1, param2);
		} else if (param3 != null) { //带三个参数
			plus.android.invoke("com.wd.baby.web.WebappMode", methodName, param1, param2, param3);
		} //else if(param4...)个数自行添加再后面...
	} else if (mui.os.ios) {
		if (param1 == null) {
			plus.ios.invoke("WDControllerShare", methodName);
		} else if (param2 == null) {
			plus.ios.invoke("WDControllerShare", methodName, param1);
		} else if (param3 == null) {
			plus.ios.invoke("WDControllerShare", methodName, param1, param2);
		} else if (param3 != null) {
			plus.ios.invoke("WDControllerShare", methodName, param1, param2, param3);
		}
	}
}