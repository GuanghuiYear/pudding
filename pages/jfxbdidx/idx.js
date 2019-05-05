
Page({
  /*  页面的初始数据 */
  data: {
    railCenterY:"50%", // bind data
    railCenterX: "", // bind data
    // header panel content bind content
    userIcon: "", // bind data
    nickName: "", // bind data
    selGroup: {}, // property bind data
    // map wxml bind data
    markers: [], // bind data
    circles: [], // bind data
    latitude: 23.099994, // bind data
    longitude: 113.324520, // bind data
    mgctrlPositions: [{ btm: 64, lt: 100 }, { btm: 0, lt: 0 }, { btm: 0, lt: 0 }, { btm: 0, lt: 0 }], // binding data
    userLocation:null, // user current location
    inPoints: [] // bind data
  }, 

  states:{
    needUpdateCircle:false
  },

  layoutMgControl:function(centerPoint, bottomPadding, layoutAry){
    const itemSize = 48;
    layoutAry[0].btm = bottomPadding;
    layoutAry[0].lt = (centerPoint.width - itemSize) / 2;
    // seoncd item
    layoutAry[1].btm = bottomPadding;
    layoutAry[1].lt = (centerPoint.width - (itemSize * 2 + 86)) / 2;
    // third item
    layoutAry[2].btm = bottomPadding;
    layoutAry[2].lt = layoutAry[0].lt;
    // fourth item
    layoutAry[3].btm = bottomPadding;
    layoutAry[3].lt = layoutAry[1].lt + 86 + itemSize;
    return layoutAry;
  },

  getCicleData:function(center, rudis){
    var c = {
      latitude: center.latitude,
      longitude: center.longitude,
      radius: rudis,
      strokeWidth: 1,
      color: "#CFE1FF",
      fillColor: "#CADEFF31"
    }
    return c
  }, 

  getMarkerData:function(center, title, userInfo){
    var m = {}
    m.id = userInfo.binding.id
    m.latitude = center.latitude
    m.longitude = center.longitude
    m.userInfo = userInfo
    m.label = {
      content: title,
      anchorX: -30,
      anchorY: -54,
      fontSize: 15,
      color: "#000079",
      borderWidth: 2,
      borderColor: "#FFAD86",
      borderRadius: 5,
      bgColor: "#FFFFFF",
      padding: 4,
      textAlign: "center",
      // userInfo: userInfo
    }
    return m
  },

  testScarBarCode: function () {
    wx.scanCode({
      success: (res) => { 
        wx.showToast({
          title: res + ''
        })
      }
    });
  },

  ctrlPlaceTapHandler: function(evt) {
    this.testScarBarCode();
  },

  ctrlRefreshTapHandler: function(evt) {
    // this.loadRailInfo();
  },

  showRailsManager:function(){
    var app = getApp();
    if (app.globalData.selGroup == null || !app.globalData.selGroup.id) {
      wx.showModal({
        title: '无法创建围栏',
        content: '您还没有加入任何组织，请联系组织管理者',
        showCancel: false
      })
      return
    }
    app.globalData.location = { latitude:this.data.latitude, longitude:this.data.longitude };
    wx.navigateTo({
      url: '../../pages/railsetting/radius',
    });
  },

  /* 生命周期函数--监听页面加载 */
  onLoad: function (options) {
    this.mapCtx = wx.createMapContext('map')
    var that = this
    // layout map control position.
    var query = wx.createSelectorQuery();
    query.select('#map').boundingClientRect(function(res){
      const destLayout = that.layoutMgControl({width:res.width, height:res.height}, 20, that.data.mgctrlPositions);
      that.setData({
        mgctrlPositions: destLayout
      });
    }).exec();
    // update header panel.(user icon, user name, and so on)
    var app = getApp()
    this.setData({
      userIcon : app.globalData.userInfo.avatarUrl,
      nickName: app.globalData.userInfo.nickName
    })
    // get mobile current location and update UI
    wx.getLocation({
      type: 'gcj02',
      success: function(res) {
        app.globalData.location = res
        that.setData({
          latitude: res.latitude,
          longitude: res.longitude,
          userLocation: res
        })
      },
    })
    console.log('logined info main index page:')
    console.log(app.globalData.pudding)
  },

  regionchangeHandler:function(evt){
    console.log("get region change event.", evt);
  },

  showCrtLocation:function(evt){
    var that = this;
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        that.setData({
          latitude: res.latitude,
          longitude: res.longitude,
        });
      }
    });
  },
 
  loadOrgs:function(succBlock){
    var app = getApp() 
    var gd = app.globalData
    var that = this
    var gprequrl = gd.baseUrl + '/users/' + gd.pudding.id + '/organizations'
    console.log("will request url:", gprequrl)
    wx.showLoading()
    wx.request({
      url: gprequrl,
      success: function(res){
        wx.hideLoading()
        console.log(res) // for debug
        if ((res.statusCode == 200 && res.statusCode < 300) && res.data.code == 200) {
          app.globalData.groups = res.data.data.groups
          if (app.globalData.groups == null || app.globalData.groups.length == 0) {
            return
          }
          var gid = wx.getStorageSync("lastWatchingGroupId")
          if(gid == null || gid == undefined || gid === ""){
            let fg = app.globalData.groups[0]
            wx.setStorageSync("lastWatchingGroupId", fg.id)
            gid = fg.id
          }
          for (var i = 0; i < app.globalData.groups.length; i++){
            if (app.globalData.groups[i].id === gid) {
              app.globalData.selGroup = app.globalData.groups[i]
              that.setData({
                selGroup: app.globalData.selGroup
              })
              break
            }
          }
          that.drawFlagRails()
          if(succBlock) {
            succBlock()
          }
        } else { // response error
        }
      }
    })
  },

  markerTouchHandler:function(evt){
    var gb = getApp().globalData
    for(var i=0; i<this.data.markers.length; i++) {
      console.log(this.data.markers[i].userInfo)
      if (this.data.markers[i].userInfo.binding.id === evt.markerId) {
        gb.selPosition = this.data.markers[i].userInfo
        break;
      }
    }

    if (gb.selPosition.binding.id){
      wx.navigateTo({ url:"../../pages/profile/personhistory"})
    }
  },

  runningTimer:null,
  loopMax: 2147483647,
  startDevLoops:function(){
    let that = this
    let interval = 1000 * 1 * 60
    let app = getApp()
    let gb = app.globalData

    let devsLocationsReq = function(){
      let g = app.globalData.selGroup
      if (!g) { return }
      let lpUrl = gb.baseUrl + '/organizations/' + g.id + '?uid=' + gb.pudding.id
      console.log('will request url:', lpUrl, ', in loop service')

      wx.request({
        url: lpUrl,
        method: 'GET',
        success: function (res) {
          console.log(res)
          if (res.data && (res.data.code == 200) ) { // success
            g.rails = res.data.data.rails
            g.children = res.data.data.children
            that.drawFlagRails()
            that.showDevicesMark()
            that.showAllPoints()
          } else {
            if (res.data){
              wx.showToast({
                icon:'none',
                title: res.data.msg,
                duration: 2000
              })
            } else {
              wx.showToast({
                icon:'none',
                title: 'net work err:[' + res.statusCode + ']',
                duration: 2000
              })
            }
          }
        }
      })
    }
    devsLocationsReq()
    var loopCounter = 0
    // start timer
    this.runningTimer = setInterval(function(){
      // update devices locations data  
      loopCounter += 1
      if (loopCounter > that.loopMax) {
        that.stopDevLoops()
      }
      devsLocationsReq()
    }, interval)
  },

  showAllPoints:function() {
    // console.log('info:', this.data.markers)
    this.setData({
      inPoints: this.data.markers
    })
  },

  stopDevLoops:function(){
    if (!this.runningTimer) { return }
    clearInterval(this.runningTimer)
    this.runningTimer = null
  },

  followRails:[], // 如果需要，此处改为map
  drawFlagRails:function() {
    var app = getApp() 
    if (!app.globalData.selGroup || !app.globalData.selGroup.id) {
      console.warn('none selected rails exist. stop draw rails')
      return 
    }
    let railsData = app.globalData.selGroup.rails
    if(!railsData) return
    var cicles = []
    this.followRails = []
    for (var i=0; i<railsData.length; i++){
      let rd = railsData[i]
      if (rd.type == 2) {
        this.followRails.push(rd)
        cicles.push(this.getCicleData(this.data, rd.radius))
      } else {
        cicles.push(this.getCicleData(rd, rd.radius))
      }
    }
    this.setData({
      ['circles']: cicles
    }) 
  },

  showDevicesMark:function(){
    // return // service has error
    var devs = getApp().globalData.selGroup.children  //children
    if (!devs) return
    var ms = []
    for(var i=0; i<devs.length; i++){
      var center = { latitude: devs[i].latitude, longitude: devs[i].longitude}
      let mdata = this.getMarkerData(center, devs[i].username, devs[i])
      ms.push(mdata)
    }
    this.setData({
      markers: ms
    })
  }, 

  railSettingHandler:function(evt) {
    this.showRailsManager()
  },

  choiseGroup: function(evt) {
    var app = getApp()
    if (!app.globalData.groups || app.globalData.groups.length == 0){
      wx.showModal({
        content: '您当前未加入任何组织，或加入的组织未开始',
        showCancel: false
      })
      return
    }
    // if (app.globalData.groups.length == 1) { return } // 仅仅只有一个, 不用切换
    wx.navigateTo({ url: "../../pages/choisegroup/choisegroup"})
  },

  /* 生命周期函数--监听页面初次渲染完成 */
  onReady: function () {
    this.tAnm = wx.createAnimation();
    // this.animations = [wx.createAnimation(),wx.createAnimation(),wx.createAnimation(),wx.createAnimation()];
  },
  /* 生命周期函数--监听页面显示*/
  onShow: function () {
    var app = getApp()
    var that = this
    if(!app.globalData.selGroup) {
      this.loadOrgs(function(){
        if (!that.timer) {
          that.startDevLoops()
        }
      })
    } else {
      that.setData({
        selGroup: app.globalData.selGroup
      })
    }
  },
  /* 生命周期函数--监听页面隐藏*/
  onHide: function () {
    this.states.needUpdateCircle = true
  },
  /* 生命周期函数--监听页面卸载*/
  onUnload: function () {},
  onPullDownRefresh: function () { }, /* 页面相关事件处理函数--监听用户下拉动作 */
  onReachBottom: function () { }, /* 页面上拉触底事件的处理函数 */
  onShareAppMessage: function () { }, /* 用户点击右上角分享 */
  patternSettingHandler: function() {
    wx.navigateTo({ url: "../../pages/pattern/pattern" })
  },
  viewTraceHandler: function () {
    wx.navigateTo({ url: "../../pages/profile/viewtrace" })
  }
})