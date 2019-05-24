var util = require('../../utils/util.js');
var app = getApp();
Page({
  data: {
    fixRadius: null
  },

  cancelTapHandler: function() {
    var app = getApp();
    app.globalData.settingRail = null;
    wx.navigateBack({
      delta: 1
    });
  },

  flowModelSelectHandler: function(evt) {
    var numberRadius = Number(this.data.fixRadius);
    if (numberRadius === 0 || numberRadius >= 10000) {
      wx.showToast({
        icon: "none",
        title: "围栏半径必须大于0公里，小于10公里",
        duration: 3000
      });
      return;
    }
    wx.getLocation({
      type: 'gcj02',
      success: function(res) {
        app.globalData.location = res
        app.globalData.longitude = res.longitude;
        app.globalData.latitude = res.latitude;
        util.httpPost(app.globalData.baseUrl + '/organizations/' + app.globalData.selGroup.id + '/rail', {
          longitude: res.longitude,
          latitude: res.latitude,
          radius: numberRadius,
          type: 2,
          creator: app.globalData.pudding.id
        }, function(result) {
          if (result.code == 200) {
            wx.showToast({
              title: '围栏设置成功',
              icon: 'none',
              duration: 2000
            })
            app.globalData.settingRail = {
              commit: false,
              isFlow: true,
              radius: numberRadius
            };
            app.globalData.is_self_location = true;
            wx.navigateBack({
              delta: 1
            });
          } else {
            wx.showToast({
              title: '围栏设置失败,请重试',
              icon: 'none',
              duration: 2000
            })
          }
        })
      },
    })
  },

  submitRails: function() {
    var app = getApp()
    wx.request({
      url: app.globalData.baseUrl + '/',
    })

  },

  placeModelSelectHandler: function(evt) {
    var numberRadius = Number(this.data.fixRadius);
    if (numberRadius === 0 || numberRadius >= 10000) {
      wx.showToast({
        icon: "none",
        title: "围栏半径必须大于0公里，小于10公里",
        duration: 3000
      });
      return;
    }
    var app = getApp();
    app.globalData.settingRail = {
      commit: false,
      isFlow: true,
      radius: numberRadius
    };
    wx.navigateTo({
      url: "setcenter"
    });
  },

  inputFixRadiusHandler: function(evt) {
    this.data.fixRadius = evt.detail.value;
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {},
  onReady: function() {},
  onShow: function() {
    wx.hideToast();
  },
  onHide: function() {},
  onUnload: function() {},
  onPullDownRefresh: function() {},
  onReachBottom: function() {},
  onShareAppMessage: function() {}
})