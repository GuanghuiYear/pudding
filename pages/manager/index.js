Page({
  data: {
    members:[],
    isEmptyPageDesc:'正在加载...',
    isEmptyPage: true
  },

  itemTouch:function(evt){
    wx.navigateTo({
      url: '../../pages/manager/personprofile',
    })
  },

  requestMembers:function(callback){
    let gb = getApp().globalData
    if(!gb.selGroup){
      this.setData({
        isEmptyPageDesc: '您当前没有加入任何组织,请联系管理员。',
        isEmptyPage:true
      })
      return;
    }

    let gid = gb.selGroup.id
    let pid = gb.pudding.id
    let lng = gb.location.longitude
    let lat = gb.location.latitude

    var url = gb.baseUrl + '/organizations/' + gid + '/group?parent=' + pid + '&lng=' + lng + '&lat=' + lat;
    console.log(url);

    let that = this
    wx.showLoading()
    wx.request({
      url: url,
      method: 'GET',
      success: function (res) {
        wx.hideLoading()
        console.log(res)
        let tmpMems = res.data.data
        if(!tmpMems || tmpMems.length == 0){
          that.setData({
            isEmptyPage: true,
            isEmptyPageDesc: '当前账户无可管理成员'
          })
        } else {
          // console.log(tmpMems)
          that.setData({
            members: tmpMems,
            isEmptyPage: false,
            isEmptyPageDesc: ''
          })
        }
      }
    })
  },

  phoneCallHandler:function(evt){
    if(!evt.currentTarget.dataset.mobile){
      wx.showModal({
        content: '无法呼叫该用户，手机号未找到.',
        showCancel: false
      })
    } else {
      wx.makePhoneCall({phoneNumber:evt.currentTarget.dataset.mobile})  
    }
  },

  onLoad: function (options) {
  },

  onReady: function () {},
  onShow: function () {
    this.requestMembers()
  },
  onHide: function () {},
  onUnload: function () {},
  onPullDownRefresh: function () {},
  onReachBottom: function () {},
  onShareAppMessage: function () {}
})