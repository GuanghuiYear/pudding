var util = require('../../utils/util.js');
var app = getApp();
Page({
  data: {
    plypath1:[],
    ms:[],
    inPoint:[]
  },

  requestTrace: function (options) {
    console.log(444,options)
    let gb = getApp().globalData
    let lp = gb.limithistory
    let ids_arr = options.ids.split(',');
    let sdt = options.start_date + "%20" + options.start_time.replace(":", "%3A")
    let edt = options.end_date + "%20" + options.end_time.replace(":", "%3A")
    let requrl = '';
    let polyline = [];
    let that = this;
    let all_point = [];

    wx.showLoading()
    for(var index in ids_arr) {
      requrl = gb.baseUrl + '/bindings/' + ids_arr[index] + '/positions?start=' + sdt + '&end=' + edt;
      util.httpGet(requrl,function (res) {
        console.log(res)
        if (res.code == 200) {
          if(res.data.length > 0) {
            let ps = []
            for (let i = 0; i < res.data.length; i++) {
              let item = {
                latitude: res.data.data[i].latitude,
                longitude: res.data.data[i].longitude
              }
              ps.push(item);
              all_point.push(item);
            }
            polyline.push({
              points: ps,
              color: "#123456AA",
              width: 6,
              arrowLine: true
            });
          }
        }
      })
    }
    wx.hideLoading()
    that.setData({
      inPoint: all_point,
      plypath1: polyline
    })
  },

  onLoad: function (options) {
    if (this.data.plypath1.length <= 0) {
      this.requestTrace(options)
    }
  },
})