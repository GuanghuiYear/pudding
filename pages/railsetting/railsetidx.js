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
    wx.navigateTo({
      url: 'radius',
    });
  },

  drawCurrentRail: function(newRail, center){
    console.log(newRail);
    var c = {
      latitude: center.latitude,
      longitude: center.longitude,
      radius: newRail.radius,
      strokeWidth: 1,
      color: "#CFE1FF",
      fillColor: "#CADEFF31"
    }
    return c;
  }, 

  onLoad: function (options) {
    this.mapCtx = wx.createMapContext("railMap");
    this.centerRailMarker();
    this.setData(getApp().globalData.location);
  },

  onReady: function () {},
  onShow: function () {
    var app = getApp();
    if (app.globalData.settingRail && app.globalData.settingRail.commit === true){
      if (app.globalData.settingRail.isFlow) {
        var circle = this.drawCurrentRail(app.globalData.settingRail, app.globalData.location);
        this.setData({ circles: [circle] });
      } else {
        var that = this;
        this.mapCtx.getCenterLocation({success:function(res){
          var circle = that.drawCurrentRail(app.globalData.settingRail, res);
          that.setData({ circles: [circle] });
        }});
      }
    }
  },

  onHide: function () {},
  onUnload: function () {},
  onPullDownRefresh: function () {},
  onReachBottom: function () {},
  onShareAppMessage: function () {}
})