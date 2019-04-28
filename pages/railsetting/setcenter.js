// pages/railsetting/railsetidx.js
Page({

  mapCtx: null,

  data: {
    latitude: 0.0, 
    longitude: 0.0, 
    railCenterY: "", 
    railCenterX: "", 
    circles: []
  },

  centerRailMarker: function(){         
    var res = wx.getSystemInfoSync();
    var yp = (res.windowHeight / 2 - 40) + "px;"
    var xp = (res.windowWidth / 2 - 25) + "px;"
    this.setData({
      railCenterY: yp,
      railCenterX: xp
    });
  },

  setRadiusHandler: function(){
    // wx.navigateTo({
    //   url: 'radius',
    // });
  },

  commitCenterHandler: function(evt){
    var that = this;
    var app = getApp();
    var gd = app.globalData
    var pd = gd.pudding

    wx.showLoading()
    this.mapCtx.getCenterLocation({success:function(res){
      app.globalData.settingRail.center = res;
      let reqUrl = gd.baseUrl + '/organizations/' + gd.selGroup.id + '/rail' 
      let reqData = {
        latitude: res.latitude,
        longitude: res.longitude,
        radius: gd.settingRail.radius,
        ['type']: 2,
        creator: gd.pudding.id
      }
      // app.globalData.selGroup.rails
      // console.log(reqUrl, reqData) // for debug
      wx.request({
        url: reqUrl,
        method: 'POST',
        data: reqData,
        success: function (res) {
          wx.hideLoading()
          if(res.data.code != 200) {
            wx.showToast({
              title: '创建失败[' + res.data.msg +']',
              icon: 'none'
            })
            return 
          }

          console.log(res)
          that.putUpdatedRailToSelGroup(reqData)
          wx.navigateBack({ delta: 2 });
        }
      })
    }});
  },

  putUpdatedRailToSelGroup: function(updatedRail){
    var app = getApp() 
    if (!app.globalData.selGroup.rails || app.globalData.selGroup.rails.length == 0) {
      app.globalData.selGroup.rails = [updatedRail]
      return 
    }
    var existRails = app.globalData.selGroup.rails
    for (var i=0; i< existRails.length; i++){
      let tp = existRails[i]
      if (tp.creator === updatedRail.creator) {
        existRails[i] = updatedRail
        break
      }
    }
  },

  // drawCurrentRail: function(newRail, center){
  //   console.log(newRail);
  //   var c = {
  //     latitude: center.latitude,
  //     longitude: center.longitude,
  //     radius: newRail.radius,
  //     strokeWidth: 1,
  //     color: "#CFE1FF",
  //     fillColor: "#CADEFF31"
  //   }
  //   return c;
  // }, 

  onLoad: function (options) {
    this.mapCtx = wx.createMapContext("railMap");
    this.centerRailMarker();
    this.setData(getApp().globalData.location);
  },

  onReady: function () {},
  onShow: function () {
    // var app = getApp();
    // if(app.globalData.settingRail && app.globalData.settingRail.commit === true){
      // if(app.globalData.settingRail.isFlow) {
        // var circle = this.drawCurrentRail(app.globalData.settingRail, app.globalData.location);
        // this.setData({ circles: [circle] });
      // } else {
        // var that = this;
        // this.mapCtx.getCenterLocation({success:function(res){
          // var circle = that.drawCurrentRail(app.globalData.settingRail, res);
          // that.setData({ circles: [circle] });
        // }});
      // }
    // }
  },

  onHide: function () {},
  onUnload: function () {},
  onPullDownRefresh: function () {},
  onReachBottom: function () {},
  onShareAppMessage: function () {}
})