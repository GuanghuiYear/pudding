var app = getApp()
var util = require('../../utils/util.js');
const markersize = 30

function range(start, edge, step) {
  for (var ret = [];
    (edge - start) * step > 0; start += step) {
    ret.push(start);
  }
  return ret;
}

function markers(northeast, southwest, scale, width, height) {

  const markerslng = (northeast.longitude - southwest.longitude) * markersize / width
  const markerslat = (northeast.latitude - southwest.latitude) * markersize / height

  const maxlon = northeast.longitude
  const minlon = southwest.longitude
  const maxlat = northeast.latitude
  const minlat = southwest.latitude

  const lons = range(minlon, maxlon, markerslng)
  const lats = range(minlat, maxlat, markerslat)

  let _markers = []
  lons.forEach((lon, i) => {
    lats.forEach((lat, j) => {
      _markers.push({
        id: lon + ',' + lat,
        latitude: lat,
        longitude: lon,
        iconPath: '/images/location.png',
        alpha: 0, //将图片设置为透明,通过开发者工具看不出效果,但真机是有效果的
        width: markersize,
        height: markersize
      })
    })
  })
  return _markers
}

Page({
  data: {
    polygons: [],
    controls: [{
      id: 1,
      position: {
        left: 0,
        top: 300 - 50,
        width: 50,
        height: 50
      },
      clickable: true
    }],
    markers: [],
    is_marker: false
  },
  createMarkers() {

    this.mapCtx = wx.createMapContext('map')
    const query = wx.createSelectorQuery()
    const map = query.select('#map').boundingClientRect()

    let that = this

    that.mapCtx.getRegion({
      success(res1) {
        that.mapCtx.getScale({
          success(res2) {
            query.exec((res) => {
              let width = res[0].width;
              let height = res[0].height;
              let _markers = markers(res1.northeast, res1.southwest, res2.scale, width, height)
              that.data.markers = _markers
              that.setData(that.data)
            })
          }
        })
      }
    })
  },
  regionchange(e) {
    this.createMarkers()
  },
  markertap(e) {
    for (var i = 0; i < this.data.markers.length; i++) {
      this.data.markers[i]['alpha'] = 0;
    }
    for(var i = 0; i < this.data.markers.length; i++) {
      if (this.data.markers[i]['id'] == e.markerId) {
        this.data.markers[i]['alpha'] = 1;
        break;
      }
    }
    let arr = e.markerId.split(',');
    app.globalData.longitude = arr[0];
    app.globalData.latitude = arr[1];
    this.setData({
      markers: this.data.markers,
      is_marker: true
    });
  },
  controltap(e) {
    // console.log(e.controlId)
  },
  onReady(e) {
    this.createMarkers()
  },
  commitHandler() {
    if (this.data.is_marker) {
      util.httpPost(app.globalData.baseUrl + '/organizations/' + app.globalData.selGroup.id + '/rail', {
        longitude: parseFloat(app.globalData.longitude),
        latitude: parseFloat(app.globalData.latitude),
        radius: app.globalData.settingRail.radius,
        type: 1,
        creator: app.globalData.pudding.id
      }, function (result) {
        if (result.code == 200) {
          wx.showToast({
            title: '围栏设置成功',
            icon: 'none',
            duration: 2000
          })
          app.globalData.is_self_location = false;
          wx.switchTab({
            url: '../jfxbdidx/idx'
          })
        } else {
          wx.showToast({
            title: '围栏设置失败,请重试',
            icon: 'none',
            duration: 2000
          })
        }
      })
    } else {
      wx.showToast({
        title: '请选择定点',
        icon: 'none',
        duration: 2000
      })
    }
  }
})
// // pages/railsetting/railsetidx.js
// Page({

//   mapCtx: null,

//   data: {
//     latitude: 0.0, 
//     longitude: 0.0, 
//     railCenterY: "", 
//     railCenterX: "", 
//     circles: []
//   },

//   centerRailMarker: function(){         
//     var res = wx.getSystemInfoSync();
//     var yp = (res.windowHeight / 2 - 40) + "px;"
//     var xp = (res.windowWidth / 2 - 25) + "px;"
//     this.setData({
//       railCenterY: yp,
//       railCenterX: xp
//     });
//   },

//   setRadiusHandler: function(){
//     // wx.navigateTo({
//     //   url: 'radius',
//     // });
//   },

//   commitCenterHandler: function(evt){
//     var that = this;
//     var app = getApp();
//     var gd = app.globalData
//     var pd = gd.pudding

//     wx.showLoading()
//     this.mapCtx.getCenterLocation({success:function(res){
//       app.globalData.settingRail.center = res;
//       let reqUrl = gd.baseUrl + '/organizations/' + gd.selGroup.id + '/rail' 
//       let reqData = {
//         latitude: res.latitude,
//         longitude: res.longitude,
//         radius: gd.settingRail.radius,
//         ['type']: 2,
//         creator: gd.pudding.id
//       }
//       // app.globalData.selGroup.rails
//       // console.log(reqUrl, reqData) // for debug
//       wx.request({
//         url: reqUrl,
//         method: 'POST',
//         data: reqData,
//         success: function (res) {
//           wx.hideLoading()
//           if(res.data.code != 200) {
//             wx.showToast({
//               title: '创建失败[' + res.data.msg +']',
//               icon: 'none'
//             })
//             return 
//           }

//           console.log(res)
//           that.putUpdatedRailToSelGroup(reqData)
//           wx.navigateBack({ delta: 2 });
//         }
//       })
//     }});
//   },

//   putUpdatedRailToSelGroup: function(updatedRail){
//     var app = getApp() 
//     if (!app.globalData.selGroup.rails || app.globalData.selGroup.rails.length == 0) {
//       app.globalData.selGroup.rails = [updatedRail]
//       return 
//     }
//     var existRails = app.globalData.selGroup.rails
//     for (var i=0; i< existRails.length; i++){
//       let tp = existRails[i]
//       if (tp.creator === updatedRail.creator) {
//         existRails[i] = updatedRail
//         break
//       }
//     }
//   },

//   // drawCurrentRail: function(newRail, center){
//   //   console.log(newRail);
//   //   var c = {
//   //     latitude: center.latitude,
//   //     longitude: center.longitude,
//   //     radius: newRail.radius,
//   //     strokeWidth: 1,
//   //     color: "#CFE1FF",
//   //     fillColor: "#CADEFF31"
//   //   }
//   //   return c;
//   // }, 

//   onLoad: function (options) {
//     this.mapCtx = wx.createMapContext("railMap");
//     this.centerRailMarker();
//     this.setData(getApp().globalData.location);
//   },

//   onReady: function () {},
//   onShow: function () {
//     // var app = getApp();
//     // if(app.globalData.settingRail && app.globalData.settingRail.commit === true){
//       // if(app.globalData.settingRail.isFlow) {
//         // var circle = this.drawCurrentRail(app.globalData.settingRail, app.globalData.location);
//         // this.setData({ circles: [circle] });
//       // } else {
//         // var that = this;
//         // this.mapCtx.getCenterLocation({success:function(res){
//           // var circle = that.drawCurrentRail(app.globalData.settingRail, res);
//           // that.setData({ circles: [circle] });
//         // }});
//       // }
//     // }
//   },

//   onHide: function () {},
//   onUnload: function () {},
//   onPullDownRefresh: function () {},
//   onReachBottom: function () {},
//   onShareAppMessage: function () {}
// })