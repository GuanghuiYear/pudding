var util = require('../../utils/util.js');
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    minute_list: [{ 'option': 1, 'value': 1 }, { 'option': 2, 'value': 15 }, { 'option': 3, 'value': 60}]
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(app.globalData)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  patternSetting: function(e) {
    let minute = e.detail.value.minute;
    if(!minute) {
      wx.showToast({
        title: '请选择模式',
        icon: 'none'
      })
      return
    }

    util.httpPost(app.globalData.requestUrl + '/bindings/search', { mobile: app.globalData.pudding.mobile }, function (res) {
      if (res.code == 200) {
        if (res.data.total > 0) {
          let binding_id = res.data.result[0].id;
          util.httpPost(app.globalData.requestUrl + '/bindings/' + binding_id + '/mode', { gps_mode: minute }, function (result) {
            if (result.code == 200) {
              wx.showModal({
                title: '模式设置',
                content: '设置成功',
                showCancel: false,
                success(res1) {
                  wx.switchTab({
                    url: '../jfxbdidx/idx'
                  })
                }
              })
            } else {
              wx.showToast({
                title: '系统繁忙,请稍后',
                icon: 'none'
              })
            }
          })
        } else {
          wx.showToast({
            title: '该用户没有绑定设备',
            icon: 'none'
          })
        }
      } else {
        wx.showToast({
          title: '系统繁忙,请稍后再试',
          icon: 'none'
        })
      }
    })

    
  },
  goback: function() {
    wx.switchTab({
      url: '../jfxbdidx/idx'
    })
  }
})