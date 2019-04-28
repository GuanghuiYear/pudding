// pages/profile/personhistory.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    uname:'penpenqie',
    sdate:'开始日期',
    stime:'开始时间',
    edate:'结束日期',
    etime:'结束时间',

    minsd:'',
    maxsd:'',
    minst:'',
    maxst:'',

    mined: '',
    maxed: '',
    minet: '',
    maxet: '',
  },

  bindSdateChange:function(evt) {
    this.setData({
      sdate: evt.detail.value
    })
  },

  bindStimeChange:function(evt) {
    this.setData({
      stime: evt.detail.value
    })
  },

  bindEdateChange:function(evt) {
    this.setData({
      edate: evt.detail.value
    })
  },

  bindEtimeChange:function(evt) {
    this.setData({
      etime: evt.detail.value
    })
  },

  requestTraceLimit:function(){
    var gb = getApp().globalData
    var bid = gb.selPosition.binding.id
    var reqUrl = gb.baseUrl + '/bindings/' + bid + '/timerange'
    var that = this
    console.log('will request trace history time range:', reqUrl)

    wx.showLoading()
    wx.request({
      url: reqUrl,
      method:'GET',
      success: function(res) {
        wx.hideLoading()
        console.log('trace time limit response:', res)
    
        var er = res.data.data.end.split(" ")
        er[1] = er[1].substring(0, 5)
        var sr = res.data.data.start.split(" ")
        sr[1] = sr[1].substring(0, 5)

        that.setData({
          minsd: sr[0],
          maxsd: er[0],
          minst: sr[1],
          maxst: er[1],

          mined: sr[0],
          maxed: er[0],
          minet: sr[1],
          maxet: er[1]
        })
      }
    })
  }, 

  spliteDateTime:function(origin){
    var er = origin.split(" ")
    console.log(r);
  },

  onLoad: function (options) {
    this.requestTraceLimit()
  },

  varifyInput:function(){
    if (this.data.sdate === '开始日期'){
      return "请输入开始日期"
    } else if (this.data.stime === '开始时间') {
      return "请输入开始时间"
    } else if (this.data.edate === '结束日期') {
      return "请输入结束日期"
    } else if (this.data.etime === '结束时间') {
      return "请输入结束日期"
    }
    return null
  },

  submitTapHandler:function(evt) {
    let errInfo = this.varifyInput()
    if (errInfo) {
      wx.showModal({
        content: errInfo,
        showCancel: false
      })
      return
    }
    var gb = getApp().globalData
    gb.limithistory = {
      sdate: this.data.sdate,
      edate: this.data.edate,
      stime: this.data.stime,
      etime: this.data.etime
    }
    wx.navigateTo({
      url: '../../pages/profile/trace',
    })
  }
})