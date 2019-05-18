var util = require('../../utils/util.js');
var dateTimePicker = require('../../utils/dateTimePicker.js');
var app = getApp();
Page({
  data: {
    date: '2019-01-02',
    time: '12:00',
    isshowstart: false,
    isshowend: false,
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: '',
    user_info: [],
    dateTimeArray: [],
    startDateTime: [],
    endDateTime: []
  },
  onLoad: function(options) {
    var that = this;
    var obj = dateTimePicker.dateTimePicker('2015');
    this.setData({
      startDateTime: obj.dateTime,
      endDateTime: obj.dateTime,
      dateTimeArray: obj.dateTimeArray,
    });
    console.log(111,this.data.dateTimeArray)
    util.httpGet(app.globalData.baseUrl + '/organizations/' + app.globalData.selGroup.id + '/group?parent=' + app.globalData.pudding.id, function(res) {
      console.log(res);
      if (res.code == 200) {
        that.setData({
          user_info: res.data
        });
      }
    })
  },
  removeUser(e) {
    if (this.data.user_info.length <= 1) {
      wx.showToast({
        title: '已经是最后一个用户了',
        icon: 'none',
        duration: 2000
      })
      return false;
    }

    let index = e.currentTarget.dataset.index;
    this.data.user_info.splice(index, 1);
    this.setData({
      user_info: this.data.user_info
    });
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
  showdate(e) {
    let type = e.target.dataset.type;
    let ymd = util.formatDate();
    console.log(ymd.join('-'))
    let hms = util.formatTime2();
    if (type == 'start') {
      this.setData({
        isshowstart: true
      })
    } else {
      this.setData({
        isshowend: true
      })
    }
  },
  formSubmit(e) {
    console.log(e)
    if (this.data.user_info.length == 0) {
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
      ids += this.data.user_info[i].binding_id + ',';
    }
    ids = ids.substring(0, ids.length - 1);
    wx.navigateTo({
      url: '../profile/trace?start_date=' + this.data.start_date + '&start_time=' + this.data.start_time + '&end_date=' + this.data.end_date + '&end_time=' + this.data.end_time + '&ids=' + ids
    })
  },
  changeDateTime(e) {
    let type = e.target.dataset.type;
    let dateArr = this.data.dateTimeArray;
    let date = e.detail.value;
    let ymd = dateArr[0][date[0]] + '-' + dateArr[1][date[1]] + '-' + dateArr[2][date[2]];
    let hms = dateArr[3][date[3]] + ':' + dateArr[4][date[4]] + ':' + dateArr[5][date[5]];

    if (type == 'start') {
      this.setData({
        startDateTime: e.detail.value,
        start_date: ymd,
        start_time: hms
      })
    } else {
      this.setData({
        endDateTime: e.detail.value,
        end_date: ymd,
        end_time: hms
      })
    }
  },
  changeDateTimeColumn(e) {
    let type = e.target.dataset.type;
    let arr = [];
    if(type == 'start') {
      arr = this.data.startDateTime;
    } else {
      arr = this.data.endDateTime;
    }
    arr[e.detail.column] = e.detail.value;
    let dateArr = this.data.dateTimeArray;
    let ymd = dateArr[0][arr[0]] + '-' + dateArr[1][arr[1]] + '-' + dateArr[2][arr[2]];
    let hms = dateArr[3][arr[3]] + ':' + dateArr[4][arr[4]] + ':' + dateArr[5][arr[5]];
    dateArr[2] = dateTimePicker.getMonthDay(dateArr[0][arr[0]], dateArr[1][arr[1]]);

    if(type == 'start') {
      this.setData({
        dateTimeArray: dateArr,
        startDateTime: arr,
        start_date: ymd,
        start_time: hms,
        isshowstart:true
      });
    } else {
      this.setData({
        dateTimeArray: dateArr,
        endDateTime: arr,
        end_date: ymd,
        end_time: hms,
        isshowend: true
      });
    }
  }
})