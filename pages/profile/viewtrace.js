var util = require('../../utils/util.js');
var app = getApp();
Page({
  data: {
    select_date: '',
    start_time: '00:00',
    end_time: '23:59',
    user_info: [],
    binding_ids: ''
  },
  onLoad: function(options) {
    var that = this;
    let ymd = util.getdate(0);
    that.setData({
      select_date: ymd
    });
    util.httpGet(app.globalData.baseUrl + '/organizations/' + app.globalData.selGroup.id + '/group?parent=' + app.globalData.pudding.id, function(res) {
      if (res.code == 200) {
        that.setData({
          user_info: res.data
        });
      }
    })
  },
  bindDateChange(e) {
    console.log(e)
    this.setData({
      select_date: e.detail.value
    })
  },
  bindTimeChange(e) {
    let type = e.target.dataset.type;
    if (type == 'start') {
      this.setData({
        start_time: e.detail.value
      })
    } else {
      this.setData({
        end_time: e.detail.value
      })
    }
  },
  formSubmit(e) {
    if (this.data.binding_ids.length == 0) {
      wx.showToast({
        title: '请选择用户',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    if (this.data.select_date == '') {
      wx.showToast({
        title: '请选择日期',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    if (this.data.start_time == '') {
      wx.showToast({
        title: '请选择起始时间',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    if (this.data.end_time == '') {
      wx.showToast({
        title: '请选择结束时间',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    app.globalData.userList = this.data.user_info;
    wx.navigateTo({
      url: '../profile/trace?start_date=' + this.data.select_date + '&start_time=' + (this.data.start_time + ':00') + '&end_date=' + this.data.select_date + '&end_time=' + (this.data.end_time+':59') + '&ids=' + this.data.binding_ids
    })
  },
  checkboxChange: function (e) {
    let arr = e.detail.value;
    let ids = '';
    if(arr.length > 0) {
      for (let i = 0; i < arr.length; i++) {
        ids += this.data.user_info[arr[i]].binding_id + ',';
      }
    }
    ids = ids.substring(0, ids.length - 1);
    this.setData({
      binding_ids: ids
    });
  }
})