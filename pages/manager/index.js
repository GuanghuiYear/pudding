var util = require('../../utils/util.js');
var app = getApp();
Page({
  data: {
    members: [],
    isEmptyPageDesc: '正在加载...',
    isEmptyPage: true
  },

  itemTouch: function(evt) {
    wx.navigateTo({
      url: '../../pages/manager/personprofile',
    })
  },

  requestMembers: function(callback) {
    let gb = app.globalData
    if (!gb.selGroup) {
      this.setData({
        isEmptyPageDesc: '您当前没有加入任何组织,请联系管理员。',
        isEmptyPage: true
      })
      return;
    }

    let gid = gb.selGroup.id
    let pid = gb.pudding.id
    let lng = gb.location.longitude
    let lat = gb.location.latitude

    var url = gb.baseUrl + '/organizations/' + gid + '/group?parent=' + pid + '&lng=' + lng + '&lat=' + lat;
    console.log(url);

    let that = this
    wx.showLoading();
    util.httpGet(url, function(res) {
      wx.hideLoading()
      let tmpMems = res.data
      if (!tmpMems || tmpMems.length == 0) {
        that.setData({
          isEmptyPage: true,
          isEmptyPageDesc: '当前账户无可管理成员'
        })
      } else {
        for (let i = 0; i < tmpMems.length; i++) {
          if (tmpMems[i].distance == 12395342) {
            tmpMems[i].distance = '无信号';
          } else {
            tmpMems[i].distance = tmpMems[i].distance + '米';
          }
        }
        that.setData({
          members: tmpMems,
          isEmptyPage: false,
          isEmptyPageDesc: ''
        })
      }
    })
  },

  phoneCallHandler: function(evt) {
    if (!evt.currentTarget.dataset.mobile) {
      wx.showModal({
        content: '无法呼叫该用户，手机号未找到.',
        showCancel: false
      })
    } else {
      wx.makePhoneCall({
        phoneNumber: evt.currentTarget.dataset.mobile
      })
    }
  },

  onLoad: function(options) {},

  onReady: function() {},
  onShow: function() {
    this.requestMembers()
  },
  onHide: function() {},
  onUnload: function() {},
  onPullDownRefresh: function() {},
  onReachBottom: function() {},
  onShareAppMessage: function() {}
})