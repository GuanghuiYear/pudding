
Page({
  data: {
    plypath1:[],
    ms:[],
    inPoint:[]
  },

  requestTrace: function (options) {
    let gb = getApp().globalData
    let lp = gb.limithistory

    let sdt = options.start_date + "%20" + options.start_time.replace(":", "%3A") + '%3A00'
    let edt = options.end_date + "%20" + options.end_time.replace(":", "%3A") + '%3A00'
    let requrl = gb.baseUrl + '/bindings/' + gb.selPosition.binding.id + '/positions?start=' + sdt + '&end=' + edt;
    let that = this;
    
    console.log('will request trace content:', requrl);
    wx.showLoading()
    wx.request({
      url: requrl,
      method: 'GET',
      success: function(res) {
        wx.hideLoading()
        console.log('response trace content:',res)
        // TODO: check response is valide
        var ps = []
        for (var i=0; i<res.data.data.length; i++){
          let item = {
            latitude: res.data.data[i].latitude,
            longitude: res.data.data[i].longitude
          }
          ps.push(item)
        }

        that.setData({
          inPoint: ps,
          plypath1: [{
            points: ps,
            color: "#123456AA",
            width: 6,
            arrowLine: true
          }]
        })
      }
    })
  },

  onLoad: function (options) {
    if (this.data.plypath1.length <= 0) {
      this.requestTrace(options)
    }
  },
})