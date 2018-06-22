// pages/authorize/index.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
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
  
  },
  rejectLogin: function (e){
    wx.navigateBack({
      
    })
  },
  bindGetUserInfo: function (e) {
    if (!e.detail.userInfo){
      return;
    }
    wx.setStorageSync('userInfo', e.detail.userInfo)
    this.login();
  },
  login: function () {
    let that = this;
    
    let token = wx.getStorageSync('token');
    // console.log("token",token);
    if (token) {
      wx.request({
        // url: 'https://api.it120.cc/' + app.globalData.subDomain + '/user/check-token',
        url:'https://api.it120.cc/c1e7b00ba9fec22ab7a9371337325243/user/check-token',
        data: {
          token: token
        },
        success: function (res) {
          if (res.data.code != 0) {
            console.log("00000")
            wx.removeStorageSync('token')
            that.login();
          } else {
            console.log("自定义login中请求的数据", res.data);
            // 回到原来的地方放
            wx.navigateBack();
          }
        }
      })
      return;
    }
    // 小程序登录界面，通过code查看token
    wx.login({
      success: function (res) {
        console.log("获取res.code");
        wx.request({
          // url: 'https://api.it120.cc/' + app.globalData.subDomain + '/user/wxapp/login',
          url:'https://api.it120.cc/c1e7b00ba9fec22ab7a9371337325243/user/wxapp/login',
          data: {
            code: res.code
          },
          success: function (res) {
            console.log("查看请求登录接口返回的数据",res.data);
            if (res.data.code == 10000) {
              // 去注册
              that.registerUser();
              return;
            }
            else if (res.data.code != 0) {
              // 登录错误
              wx.hideLoading();
              wx.showModal({
                title: '提示',
                content: '无法登录，请重试',
                showCancel: false
              })
              return;
            }
            // 
            wx.setStorageSync('token', res.data.data.token)
            wx.setStorageSync('uid', res.data.data.uid)
            // 回到原来的页面
            wx.navigateBack();
          }
        })
      }
    })
  },
  // 登录之前首先调用注册api，不过没有直接的注册按钮，而是点击同意授权登录时才有
  registerUser: function () {
    var that = this;
    wx.login({
      success: function (res) {
        var code = res.code; // 微信登录接口返回的 code 参数，下面注册接口需要用到
        wx.getUserInfo({
          success: function (res) {
            var iv = res.iv;
            var encryptedData = res.encryptedData;
            // 下面开始调用注册接口
            wx.request({
              // url: 'https://api.it120.cc/' + app.globalData.subDomain + '/user/wxapp/register/complex',
              url:'https://api.it120.cc/c1e7b00ba9fec22ab7a9371337325243/user/wxapp/register/complex',
              data: { code: code, encryptedData: encryptedData, iv: iv }, // 设置请求的 参数
              success: (res) => {
                wx.hideLoading();
                that.login();
              }
            })
          }
        })
      }
    })
  }
})