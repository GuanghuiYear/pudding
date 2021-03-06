var util = require('../../utils/util.js');
var app = getApp();
Page({
  data: {
    plypath1:[],
    ms:[],
    inPoint:[],
    userList:[],
    colorArr: ["#EE2C2C", "#4876FF", "#EEC900", "#ff6100",
      "#7DC67D", "#E17572", "#FF7095", "#7898AA", "#C35CFF", "#33BCBA", "#C28F5C",
      "#FF8533", "#6E6E6E", "#428BCA", "#5cb85c", "#FF674F", "#E9967A",
      "#66CDAA", "#00CED1", "#9F79EE", "#CD3333", "#FFC125", "#32CD32",
      "#00BFFF", "#68A2D5", "#FF69B4", "#DB7093", "#CD3278", "#607B8B"],
    
  },

  requestTrace: function (options) {
    let gb = getApp().globalData
    let lp = gb.limithistory
    let ids_arr = options.ids.split(',');
    let sdt = options.start_date + "%20" + options.start_time.replace(":", "%3A")
    let edt = options.end_date + "%20" + options.end_time.replace(":", "%3A")
    let requrl = '';
    let polyline = [];
    let all_point = [];
    let that = this,
      labLen = app.globalData.userList.length,
      colorArr = that.data.colorArr,
      colorLen = colorArr.length,
      randomColorArr = [];
    //判断执行
    let n = 0;
    do {
      let random = colorArr[n];
      randomColorArr.push(random);
      labLen--;
    } while (labLen > 0);
    wx.showToast({
      title: '正在加载中,请稍等',
      icon: 'none'
    })

    for(var index in ids_arr) {
      let _ids = ids_arr[index];
      requrl = gb.baseUrl + '/bindings/' + _ids + '/positions?start=' + sdt + '&end=' + edt;
      util.httpGet(requrl,function (res) {
        if (res.code == 200) {
          if(res.data.length > 0) {
            let ps = []
            for (let i = 0; i < res.data.length; i++) {
              let item = {
                latitude: res.data[i].latitude,
                longitude: res.data[i].longitude
              }
              ps.push(item);
              all_point.push(item);
            }
            polyline.push({
              points: ps,
              color: colorArr[n]+'AA',
              width: 6,
              arrowLine: true
            });
            
            wx.showToast({
              title: '加载完成',
              icon: 'none'
            })
          }
          for (let i = 0; i < app.globalData.userList.length; i++) {
            if (app.globalData.userList[i]['binding_id'] == _ids) {
              that.data.userList.push({ user_name: app.globalData.userList[i]['username'], color: colorArr[n] + 'AA' });
            }
          }
          n++;
          if (all_point.length > 0) {
            that.setData({
              inPoint: all_point,
              plypath1: polyline,
              userList: that.data.userList,
            })
          } else {
            wx.showToast({
              title: '没有定位信息',
              icon: 'none'
            })
          }
        }
      })
    }
    
  },
  onLoad: function (options) {
    if (this.data.plypath1.length <= 0) {
      this.requestTrace(options)
    }
  },
})