//logs.js
const util = require('../../utils/util.js')

Page({
  data: {
    logs: []
  },

  toProjIdx:function(){
    wx.navigateTo({
      url: '../jfxbdidx/idx',
    })
  },

  onLoad: function () {
    // this.setData({
    //   logs: (wx.getStorageSync('logs') || []).map(log => {
    //     return util.formatTime(new Date(log))
    //   })
    // })
  }
})
