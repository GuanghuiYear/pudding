var util = require('../../utils/util.js');
var app = getApp();
Page({
  /*  页面的初始数据 */
  data: {
    railCenterY: "50%", // bind data
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
    mgctrlPositions: [{
      btm: 64,
      lt: 100
    }, {
      btm: 0,
      lt: 0
    }, {
      btm: 0,
      lt: 0
    }, {
      btm: 0,
      lt: 0
    }], // binding data
    userLocation: null, // user current location
    inPoints: [], // bind data
    polyline: []
  },

  states: {
    needUpdateCircle: false
  },

  layoutMgControl: function(centerPoint, bottomPadding, layoutAry) {
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

  getCicleData: function(center, rudis) {
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

  getMarkerData: function(center, title, userInfo) {
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
  ctrlPlaceTapHandler: function(evt) {
    let that = this;
    util.httpPost(app.globalData.requestUrl + '/bindings/search', { mobile: app.globalData.pudding.mobile}, function (res) {
      if (res.code == 200) {
        if(res.data.total > 0) {
          let binding_id = res.data.result[0].id;
          let sdt = '2019-05-22' + "%20" + '00:00:00'.replace(":", "%3A")
          let edt = '2019-05-27' + "%20" + '23:59:59'.replace(":", "%3A")
          let requrl = app.globalData.baseUrl + '/bindings/' + binding_id + '/positions?start=' + sdt + '&end=' + edt;
          util.httpGet(requrl, function (res) {
            if (res.code == 200) {
              if (res.data.length >= 2) {
                let ps = []
                let len = res.data.length;
                ps.push({
                  latitude: res.data[len-2].latitude,
                  longitude: res.data[len-2].longitude,
                });
                ps.push({
                  latitude: res.data[len - 1].latitude,
                  longitude: res.data[len - 1].longitude,
                });
                that.setData({
                  inPoints: ps,
                  polyline: [{
                    points: ps,
                    color: '#EE2C2CAA',
                    width: 6,
                    arrowLine: true
                  }]
                })
              } else {
                wx.showToast({
                  title: '该用户最近没有定位信息',
                  icon: 'none'
                })
              }
            }
          })
        } else {
          wx.showToast({
            title: '该用户没有绑定设备',
            icon: 'none'
          })
        }
      }
    })
  },
  showRailsManager: function() {
    if (app.globalData.selGroup == null || !app.globalData.selGroup.id) {
      wx.showModal({
        title: '无法创建围栏',
        content: '您还没有加入任何组织，请联系组织管理者',
        showCancel: false
      })
      return
    }
    app.globalData.location = {
      latitude: this.data.latitude,
      longitude: this.data.longitude
    };
    wx.navigateTo({
      url: '../../pages/railsetting/radius',
    });
  },

  /* 生命周期函数--监听页面加载 */
  onLoad: function() {
    this.mapCtx = wx.createMapContext('map')
    var that = this
    // layout map control position.
    var query = wx.createSelectorQuery();
    query.select('#map').boundingClientRect(function(res) {
      const destLayout = that.layoutMgControl({
        width: res.width,
        height: res.height
      }, 20, that.data.mgctrlPositions);
      that.setData({
        mgctrlPositions: destLayout
      });
    }).exec();
    // update header panel.(user icon, user name, and so on)
    this.setData({
      userIcon: app.globalData.userInfo.avatarUrl,
      nickName: app.globalData.userInfo.nickName
    })
    // get mobile current location and update UI
    wx.getLocation({
      type: 'gcj02',
      success: function(res) {
        app.globalData.location = res
        app.globalData.longitude = res.longitude;
        app.globalData.latitude = res.latitude;
        that.setData({
          latitude: res.latitude,
          longitude: res.longitude,
          userLocation: res
        })
      },
    })
  },

  regionchangeHandler: function(evt) {
    console.log("get region change event.", evt);
  },

  showCrtLocation: function(evt) {
    var that = this;
    wx.getLocation({
      type: 'gcj02',
      success: function(res) {
        that.setData({
          latitude: res.latitude,
          longitude: res.longitude,
        });
      }
    });
  },

  loadOrgs: function(succBlock) {
    var gd = app.globalData
    var that = this
    var gprequrl = gd.baseUrl + '/users/' + gd.pudding.id + '/organizations'
    console.log("will request url:", gprequrl)
    wx.showLoading()
    wx.request({
      url: gprequrl,
      success: function(res) {
        wx.hideLoading()
        console.log(res) // for debug
        if ((res.statusCode == 200 && res.statusCode < 300) && res.data.code == 200) {
          app.globalData.groups = res.data.data.groups
          if (app.globalData.groups == null || app.globalData.groups.length == 0) {
            return
          }
          var gid = wx.getStorageSync("lastWatchingGroupId")
          if (gid == null || gid == undefined || gid === "") {
            let fg = app.globalData.groups[0]
            wx.setStorageSync("lastWatchingGroupId", fg.id)
            gid = fg.id
          }
          for (var i = 0; i < app.globalData.groups.length; i++) {
            if (app.globalData.groups[i].id === gid) {
              app.globalData.selGroup = app.globalData.groups[i]
              that.setData({
                selGroup: app.globalData.selGroup
              })
              break
            }
          }
          // that.drawFlagRails()
          if (succBlock) {
            succBlock()
          }
        } else { // response error
        }
      }
    })
  },

  markerTouchHandler: function(evt) {
    var gb = app.globalData
    for (var i = 0; i < this.data.markers.length; i++) {
      console.log(this.data.markers[i].userInfo)
      if (this.data.markers[i].userInfo.binding.id === evt.markerId) {
        gb.selPosition = this.data.markers[i].userInfo
        break;
      }
    }

    if (gb.selPosition.binding.id) {
      wx.navigateTo({
        url: "../../pages/profile/personhistory"
      })
    }
  },

  runningTimer: null,
  loopMax: 2147483647,
  startDevLoops: function() {
    let that = this
    let interval = 1000 * 1 * 60
    let gb = app.globalData

    let devsLocationsReq = function() {
      let g = app.globalData.selGroup
      if (!g) {
        return
      }
      let lpUrl = gb.baseUrl + '/organizations/' + g.id + '?uid=' + gb.pudding.id
      console.log('will request url:', lpUrl, ', in loop service')

      wx.request({
        url: lpUrl,
        method: 'GET',
        success: function(res) {
          if (res.data && (res.data.code == 200)) { // success
            g.rails = res.data.data.rails
            g.children = res.data.data.children
            app.globalData.longitude = res.data.data.rail.longitude;
            app.globalData.latitude  = res.data.data.rail.latitude;
            app.globalData.settingRail.radius = res.data.data.rail.radius;
            that.drawFlagRails()
            that.showDevicesMark()
            that.showAllPoints()
          } else {
            if (res.data) {
              wx.showToast({
                icon: 'none',
                title: res.data.msg,
                duration: 2000
              })
            } else {
              wx.showToast({
                icon: 'none',
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
    this.runningTimer = setInterval(function() {
      // update devices locations data  
      loopCounter += 1
      if (loopCounter > that.loopMax) {
        that.stopDevLoops()
      }
      devsLocationsReq()
    }, interval)
  },

  showAllPoints: function() {
    // console.log('info:', this.data.markers)
    this.setData({
      inPoints: this.data.markers
    })
  },

  stopDevLoops: function() {
    if (!this.runningTimer) {
      return
    }
    clearInterval(this.runningTimer)
    this.runningTimer = null
  },

  followRails: [], // 如果需要，此处改为map
  drawFlagRails: function() {
    // if (!app.globalData.selGroup || !app.globalData.selGroup.id) {
    //   console.warn('none selected rails exist. stop draw rails')
    //   return
    // }
    // let railsData = app.globalData.selGroup.rails
    // if (!railsData) return
    // var cicles = []
    // this.followRails = []
    // for (var i = 0; i < railsData.length; i++) {
    //   let rd = railsData[i]
    //   if (rd.type == 2) {
    //     this.followRails.push(rd)
    //     cicles.push(this.getCicleData(this.data, rd.radius))
    //   } else {
    //     cicles.push(this.getCicleData(rd, rd.radius))
    //   }
    // }
    this.setData({
      ['circles']: [{
        latitude: app.globalData.latitude,
        longitude: app.globalData.longitude,
        color: '#53E8AEDD',
        fillColor: '#22C78915',
        radius: app.globalData.settingRail.radius,
        strokeWidth: 1
      }]
    })
  },

  showDevicesMark: function() {
    // return // service has error
    var devs = app.globalData.selGroup.children //children
    if (!devs) return
    var ms = []
    for (var i = 0; i < devs.length; i++) {
      var center = {
        latitude: devs[i].latitude,
        longitude: devs[i].longitude
      }
      let mdata = this.getMarkerData(center, devs[i].username, devs[i])
      ms.push(mdata)
    }
    this.setData({
      markers: ms
    })
  },

  railSettingHandler: function(evt) {
    this.showRailsManager()
  },

  choiseGroup: function(evt) {
    if (!app.globalData.groups || app.globalData.groups.length == 0) {
      wx.showModal({
        content: '您当前未加入任何组织，或加入的组织未开始',
        showCancel: false
      })
      return
    }
    // if (app.globalData.groups.length == 1) { return } // 仅仅只有一个, 不用切换
    wx.navigateTo({
      url: "../../pages/choisegroup/choisegroup"
    })
  },

  /* 生命周期函数--监听页面初次渲染完成 */
  onReady: function() {
    this.tAnm = wx.createAnimation();
    // this.animations = [wx.createAnimation(),wx.createAnimation(),wx.createAnimation(),wx.createAnimation()];
  },
  /* 生命周期函数--监听页面显示*/
  onShow: function() {
    var that = this
    if (!app.globalData.selGroup) {
      this.loadOrgs(function() {
        if (!that.timer) {
          that.startDevLoops()
        }
      })
    } else {
      let radius = 0;
      if (typeof app.globalData.settingRail != undefined) {
        radius = typeof app.globalData.settingRail.radius != undefined ? app.globalData.settingRail.radius : 0;
      }
      if ((!app.globalData.longitude && !app.globalData.latitude) || app.globalData.is_self_location) {
        wx.getLocation({
          type: 'gcj02',
          success: function(res) {
            app.globalData.location = res
            console.log(res)
            that.setData({
              circles: radius > 0 ? [{
                latitude: res.latitude,
                longitude: res.longitude,
                color: '#53E8AEDD',
                fillColor: '#22C78915',
                radius: radius,
                strokeWidth: 1
              }] : that.data.circles,
              selGroup: app.globalData.selGroup
            })
          }
        })
      } else {
        that.setData({
          circles: radius > 0 ? [{
            latitude: app.globalData.latitude,
            longitude: app.globalData.longitude,
            color: '#53E8AEDD',
            fillColor: '#22C78915',
            radius: radius,
            strokeWidth: 1
          }] : that.data.circles,
          selGroup: app.globalData.selGroup
        })
      }
    }
  },
  /* 生命周期函数--监听页面隐藏*/
  onHide: function() {
    this.states.needUpdateCircle = true
  },
  /* 生命周期函数--监听页面卸载*/
  onUnload: function() {},
  onPullDownRefresh: function() {},
  /* 页面相关事件处理函数--监听用户下拉动作 */
  onReachBottom: function() {},
  /* 页面上拉触底事件的处理函数 */
  onShareAppMessage: function() {},
  /* 用户点击右上角分享 */
  patternSettingHandler: function() {
    if (app.globalData.selGroup == null || !app.globalData.selGroup.id) {
      wx.showModal({
        title: '无法设置模式',
        content: '您还没有加入任何组织，请联系组织管理者',
        showCancel: false
      })
      return
    }

    wx.navigateTo({
      url: "../../pages/pattern/pattern"
    })
  },
  viewTraceHandler: function() {
    if (app.globalData.selGroup == null || !app.globalData.selGroup.id) {
      wx.showModal({
        title: '无法查看轨迹',
        content: '您还没有加入任何组织，请联系组织管理者',
        showCancel: false
      })
      return
    }
    wx.navigateTo({
      url: "../../pages/profile/viewtrace"
    })
  },
  controlRailStatus: function() {
    if (app.globalData.rail_status) {
      this.drawFlagRails();
    } else {
      this.setData({
        circles: []
      })
    }
    app.globalData.rail_status = !app.globalData.rail_status;
  },
  ctrlRefreshTapHandler: function() {
    this.mapCtx = wx.createMapContext('map')
    var that = this
    // layout map control position.
    var query = wx.createSelectorQuery();
    query.select('#map').boundingClientRect(function (res) {
      const destLayout = that.layoutMgControl({
        width: res.width,
        height: res.height
      }, 20, that.data.mgctrlPositions);
      that.setData({
        mgctrlPositions: destLayout
      });
    }).exec();
    // update header panel.(user icon, user name, and so on)
    this.setData({
      userIcon: app.globalData.userInfo.avatarUrl,
      nickName: app.globalData.userInfo.nickName
    })
    // get mobile current location and update UI
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        app.globalData.location = res
        app.globalData.longitude = res.longitude;
        app.globalData.latitude = res.latitude;
        that.setData({
          latitude: res.latitude,
          longitude: res.longitude,
          userLocation: res
        })
      },
    })

    var that = this
    if (!app.globalData.selGroup) {
      this.loadOrgs(function () {
        if (!that.timer) {
          that.startDevLoops()
        }
      })
    } else {
      let radius = 0;
      if (typeof app.globalData.settingRail != undefined) {
        radius = typeof app.globalData.settingRail.radius != undefined ? app.globalData.settingRail.radius : 0;
      }
      if ((!app.globalData.longitude && !app.globalData.latitude) || app.globalData.is_self_location) {
        wx.getLocation({
          type: 'gcj02',
          success: function (res) {
            app.globalData.location = res
            console.log(res)
            that.setData({
              circles: radius > 0 ? [{
                latitude: res.latitude,
                longitude: res.longitude,
                color: '#53E8AEDD',
                fillColor: '#22C78915',
                radius: radius,
                strokeWidth: 1
              }] : that.data.circles,
              selGroup: app.globalData.selGroup
            })
          }
        })
      } else {
        that.setData({
          circles: radius > 0 ? [{
            latitude: app.globalData.latitude,
            longitude: app.globalData.longitude,
            color: '#53E8AEDD',
            fillColor: '#22C78915',
            radius: radius,
            strokeWidth: 1
          }] : that.data.circles,
          selGroup: app.globalData.selGroup
        })
      }
    }
  }
})