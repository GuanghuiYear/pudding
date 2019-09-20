var app = getApp();
Page({
  data: {
    isLogin: false,
    userIcon: '',
    nickName: ''
  },

  logoutTapHandler:function(evt) {
    let backUrl = getApp().globalData.baseUrl
    getApp().globalData = {baseUrl: backUrl}
    wx.removeStorageSync("pudding")
    wx.removeStorageSync("user")
    wx.removeStorageSync("userInfo")
    wx.removeStorageSync("lastWatchingGroupId")
    wx.redirectTo({
      url: '../../pages/index/index',
    })
  },
  onLoad: function () {
    wx.request({
      url: 'http://image.yuanchanxidi.com/aa3d.jpg',
      header: {
        'Referer':'https://www.baidu.com'
      },
      // url:"https://img10.360buyimg.com/imgzone/jfs/t3127/127/1601774396/436691/3223ee55/57d0d43fN452553f8.jpg",
      method:'GET',
      success: function(res){
        console.log(res);
      }
    })
    
  },
  onShow: function() {
    var pudding = typeof app.globalData.pudding ? app.globalData.pudding : {};
    
    if (pudding != undefined && pudding.mobile != undefined && pudding.mobile != null) {
      this.setData({
        isLogin: true
      });
    } else {
      this.setData({
        isLogin: false
      });
    }
    this.setData({
      userIcon: app.globalData.userInfo.avatarUrl,
      nickName: app.globalData.userInfo.nickName
    })
  },
  loginTapHandler: function() {
    wx.navigateTo({
      url: '/pages/index/index',
    })
  }
})