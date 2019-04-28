// pages/choisegroup/choisegroup.js
Page({

  /**
   * 页面的初始数据
   */
  data: { 
    glist: []
  },

  // business data
  app:{},
  groups:{},
  selGroup:{},
 
  // functions
  radioChange: function(evt){
  },

  setTestGroupData: function(){
    console.log("--------");
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.app = getApp()
    this.groups = this.app.globalData.groups
    this.selGroup = this.app.globalData.selGroup
    for (var i=0; i<this.groups.length; i++) {
      this.groups[i].checked = this.selGroup.id === this.groups[i].id
    }
    this.setData({
      glist: this.groups
    })
  },

  groupItemSelHandler: function(evt){
    if (evt.currentTarget.dataset.gid === this.app.globalData.selGroup.id) {
      return 
    }
  
    for(var i=0; i<this.groups.length; i++) {
      this.groups[i].checked = evt.currentTarget.dataset.gid === this.groups[i].id
      if (this.groups[i].checked){
        wx.setStorageSync("lastWatchingGroupId", this.groups[i].id)
        this.app.globalData.selGroup = this.groups[i]
      }
    }
    this.setData({glist: this.groups})
    wx.navigateBack({ delta:1})
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})