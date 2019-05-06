var util = require('../../utils/util.js');
var app = getApp();
Page({
  data: {
    date: '2019-01-02',
    time: '12:00',
    isshowstart:false,
    isshowend:false,
    start_date:'',
    start_time:'',
    end_date:'',
    end_time:'',
    user_info: []
  },
  onLoad: function(options) {
    console.log(app.globalData.selGroup)
    util.httpGet(app.globalData.baseUrl + '/organizations/' + app.globalData.selGroup.id + '/group?parent=0', function (res) {
      console.log(res)
    })
  },
  removeUser(e){
    console.log(e);
  },
  bindDateChange_start() {
    var date = new Date();

    var monthDay = ['今天', '明天'];
    var hours = [];
    var minute = [];

    // 月-日
    for (var i = 2; i <= 28; i++) {
      var date1 = new Date(date);
      date1.setDate(date.getDate() + i);
      var md = (date1.getMonth() + 1) + "-" + date1.getDate();
      monthDay.push(md);
    }

    // 时
    for (var i = 0; i < 24; i++) {
      hours.push(i);
    }
    // 分
    for (var i = 0; i < 60; i += 10) {
      minute.push(i);
    }

    var data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex
    };
    data.multiArray[0] = monthDay;
    data.multiArray[1] = hours;
    data.multiArray[2] = minute;
    this.setData(data);
  },
  bindDateChange(e) {
    let type = e.target.dataset.type;
    if (type == 'start') {
      this.setData({
        start_date: e.detail.value
      })
    } else {
      this.setData({
        end_date: e.detail.value
      })
    }
  },
  bindTimeChange(e) {
    let type = e.target.dataset.type;
    if(type == 'start') {
      this.setData({
        start_time : e.detail.value
      })
    } else {
      this.setData({
        end_time : e.detail.value
      })
    }
  },
  showdate(e) {
    let type = e.target.dataset.type;
    if(type == 'start') {
      this.setData({
        isshowstart: true,
        start_date: util.formatDate(),
        start_time: util.formatTime2()
      })
    } else {
      this.setData({
        isshowend: true,
        end_date: util.formatDate(),
        end_time: util.formatTime2()
      })
    }
  },
  formSubmit(e) {
    console.log(e)
    if(this.data.user_info.length == 0) {
      wx.showToast({
        title: '请选择用户',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    if (!this.data.isshowstart || this.data.start_date == '' || this.data.start_time == '') {
      wx.showToast({
        title: '请选择起始时间',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    if (!this.data.isshowend || this.data.end_date == '' || this.data.end_time == '') {
      wx.showToast({
        title: '请选择结束时间',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    let ids = '';
    for (let i = 0; i < this.data.user_info.length; i++) {
      ids = this.data.user_info[i].id+',';
    }
    wx.navigateTo({
      url: '../profile/trace?start_time=' + this.data.start_date + ' ' + this.data.start_time + '&end_time=' + this.data.end_date + ' ' + this.data.end_time+'&ids='+ids
    })
  }
})