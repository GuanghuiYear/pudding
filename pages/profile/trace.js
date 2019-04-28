
Page({
  data: {
    plypath1:[],
    ms:[],
    inPoint:[]
  },

  requestTrace: function() {
    let gb = getApp().globalData
    let lp = gb.limithistory

    let sdt = lp.sdate + "%20" + lp.stime.replace(":", "%3A") + '%3A00'
    let edt = lp.edate + "%20" + lp.etime.replace(":", "%3A") + '%3A00'
    let requrl = gb.baseUrl + '/bindings/' + gb.selPosition.binding.id + '/positions?start=' + sdt + '&end=' + edt;
    let that = this
    
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
            width: 6
          }]
        })
      }
    })
  },

  onLoad: function (options) {
    if (this.data.plypath1.length <= 0) {
      this.requestTrace()
    }
  },
})