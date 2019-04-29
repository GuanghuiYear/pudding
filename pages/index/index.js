//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    motto: '',
    userInfo: {},
    hasUserInfo: false,
    mobile: "18616601589",
    vCode: "123456",
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    showBindMobile: true
  },
  //事件处理函数
  bindViewTap: function() {
    wx.switchTab({
      url: '../jfxbdidx/idx'
    })
  },
  
  onLoad: function () {
    let that = this
    var pudding = wx.getStorageSync('pudding') || {}
    // console.log('local pudding info:', pudding) // for debug
    if (pudding.mobile != undefined && pudding.mobile!=null) {
      app.globalData.pudding = pudding
      app.globalData.userInfo = wx.getStorageSync('userInfo')
      wx.switchTab({
        url: '../jfxbdidx/idx'
      })
    }
  },  
 
  lastVerifyRequest:{},
  reqCodeHandler: function(evt){
    var actionUrl = app.globalData.baseUrl + '/users/verify'
    // lastVerifyRequest = new Date()
    wx.request({
      url: actionUrl,
      header: {
        'content-type': 'application/json'
      },
      data: {
        mobile:this.data.mobile
      },
      method: 'POST',
      success: function(res) {
        console.log("verify code request api get response")
        console.log(res)
        if(res.statusCode >= 200 && res.statusCode < 300 && res.data.code >= 200 && res.data.code < 300 ){
          wx.showToast({ title: "短信", duration: 3000 })
        } else {
          wx.showToast({icon:"none", title:res.data.msg, duration:3000})
        }
      }   
    })   
  },

  iptCodeInput:function(evt){
    this.data.vCode = evt.detail.value
  },
 
  bindSubmitHandler: function(evt) {
    var that = this
    var reqParam = {
      openId:  app.globalData.user.openid,
      mobile: that.data.mobile,
      code: that.data.vCode,
      nickName: app.globalData.userInfo.nickName
    } 
    console.log(reqParam);

    var actionUrl = app.globalData.baseUrl + '/users/bind'
    wx.showLoading()
    wx.request({
      url: actionUrl, 
      header: {
        'content-type': 'application/json'
      },
      data: reqParam, 
      method: 'POST', 
      success: function(res) {
        wx.hideLoading()
        console.log("bind api get response")
        console.log(res)
        if ((res.statusCode == 200 && res.statusCode < 300) && res.data.code == 200){
          app.globalData.pudding = res.data.data.user
          wx.setStorageSync('pudding', app.globalData.pudding)
          wx.switchTab({
            url: '../jfxbdidx/idx'
          })
        } else {
          wx.showToast({
            title: "请求失败[" + res.statusCode + "]",
            icon: 'none'
          })
        }
      },
      fail: function(err){
        wx.showModal({
          title: '请求失败',
          content: '绑定失败[' + err  + '], 点击确定重试',
          success: function (res){
            if(res.confirm) {
              that.bindSubmitHandler()
            }
          }
        })
      }
    })
  },
   
  puddingLogin: function(){
    var that = this
    var pudding = wx.getStorageSync('pudding') || {}
    console.log('cached pudding info:', pudding)
    if(pudding.mobile) {
      app.globalData.pudding = pudding
      wx.switchTab({ url: '../jfxbdidx/idx' })
    } else {  // request 
      var loginUrl = app.globalData.baseUrl + "/users/login" 
      console.log('will request pudding login:', loginUrl)
      wx.request({
        url: loginUrl,
        data: app.globalData.user.openid,
        method: 'POST',
        success: function(res) {
          console.log(res)
          wx.hideLoading() 
          if(res.statusCode == 200){
            that.responseLogin(null);
            return false;
            if(res.data.data == null ){
              that.responseLogin(null)
            } else {
              var mbStr = res.data.data.user
              that.responseLogin(mbStr)
            }
          } else {
            wx.showModal({
              title:"请求失败",
              content:"登陆失败[" + res.statusCode + "], 点击确定重试" , 
              success: function(res) {
                if(res.confirm){
                  wx.showLoading()
                  that.puddingLogin()
                } else if(res.cancel){
                  console.log("cancel")
                } else {}
              }
            }) 
          }
        },
        fail: function (err) {
          console.log(err)
        }
      })   
    }
  },

  userAvatarTapHandler:function(evt){
    wx.showLoading()
    this.puddingLogin()
  },

  responseLogin: function(res){ 
    if (res == null || res.mobile == null || res.mobile.length == 0) {  // unbind, show bind mobile component
      this.setData({showBindMobile:false})
    } else { // openid did bind to mobile no, show main index page.
      app.globalData.pudding = res
      wx.setStorageSync('pudding', res)
      wx.switchTab({
        url: '../jfxbdidx/idx'
      })
    }
  },

  iptMobleNoInputHandler:function(evt){
    this.data.mobile = evt.detail.value
  },

  directGetOpenid: function(callbackHandler){
    var that = this
    var user=wx.getStorageSync('user') || {};  
    var userInfo=wx.getStorageSync('userInfo') || {}; 
    if((!user.openid || (user.expires_in || Date.now()) < (Date.now() + 600))&&(!userInfo.nickName)){ 
      wx.login({  
        success: function(res){ 
          if(res.code) {
            wx.getUserInfo({
              success: function (res) {
                var objz={};
                objz.avatarUrl=res.userInfo.avatarUrl;  
                objz.nickName=res.userInfo.nickName;
                app.globalData.userInfo = objz;
                console.log(objz);
                wx.setStorageSync('userInfo', objz);//存储userInfo
              },
              fail: function(err){
                console.log(err)
                console.log("wx.getUserInfo error.")
              }  
            });  
            var d = app.globalData;//这里存储了appid、secret、token串  
            var l = d.baseUrl + "/users/openid" 
            wx.request({  
              url: l,  
              header: {
                'content-type': 'application/json'
              },
              data: { 
                code: res.code
              },  
              method: 'POST',
              success: function(res){ 
                var obj={};
                obj.openid = res.data.data.openid;  
                obj.expires_in = Date.now()  +res.data.data.expires_in;  
                app.globalData.user = obj;
                wx.setStorageSync('user', obj);//存储openid  
                if(callbackHandler) {
                  callbackHandler()
                }
              }  
            });  
          }else {
            console.log('获取用户登录态失败！' + res.errMsg)
          }          
        }      
      }); 
    } else {
      app.globalData.userInfo = userInfo
      app.globalData.user = user
      if(callbackHandler) {
        callbackHandler()
      }
    } 
  },  
 
  getUserInfo: function(e) {
    var that = this
    wx.showLoading()
    that.directGetOpenid(()=>{
      that.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
      that.puddingLogin()
    })
  }
})
