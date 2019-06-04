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