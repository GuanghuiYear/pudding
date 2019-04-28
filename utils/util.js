const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function httpGet(url, success, fail) {
  wx.request({
    url: url,
    method: 'GET',
    header: {
      "Content-Type": "json"
    },
    success: function (res) {
      if (typeof (success) == 'function') {
        success(res.data);
      }
    },
    fail: function (error) {
      if (typeof (fail) == 'function') {
        fail(error)
      }
    }
  })
}

/**
 * 全局post请求方法
 */
function httpPost(url, data, success, fail) {
  wx.showLoading({ title: '加载中...' })
  wx.request({
    url: url,
    method: 'POST',
    data: data,
    dataType: 'json',
    success: function (data, statusCode, header) {
      wx.hideLoading();
      if (typeof (success) == 'function') {
        success(data.data);
      }
    },
    fail: function (error) {
      wx.hideLoading();
      if (typeof (fail) == 'function') {
        fail(error)
      }
    }
  })
}

module.exports = {
  formatTime: formatTime
}
module.exports = {
  formatTime: formatTime,
  httpGet: httpGet,
  httpPost: httpPost,
  baseUrl: getApp().globalData.baseUrl
}
