//index.js
//获取应用实例
// const app = getApp()
// Page({
//   data: {
//     motto: 'Hello World',
//     userInfo: {},
//     hasUserInfo: false,
//     canIUse: wx.canIUse('button.open-type.getUserInfo')
//   },
//   //事件处理函数
//   bindViewTap: function() {
//     wx.navigateTo({
//       url: '../logs/logs'
//     })
//   },
//   onLoad: function () {
//     if (app.globalData.userInfo) {
//       this.setData({
//         userInfo: app.globalData.userInfo,
//         hasUserInfo: true
//       })
//     } else if (this.data.canIUse){
//       // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
//       // 所以此处加入 callback 以防止这种情况
//       app.userInfoReadyCallback = res => {
//         this.setData({
//           userInfo: res.userInfo,
//           hasUserInfo: true
//         })
//       }
//     } else {
//       // 在没有 open-type=getUserInfo 版本的兼容处理
//       wx.getUserInfo({
//         success: res => {
//           app.globalData.userInfo = res.userInfo
//           this.setData({
//             userInfo: res.userInfo,
//             hasUserInfo: true
//           })
//         }
//       })
//     }
//   },
//   getUserInfo: function(e) {
//     console.log(e)
//     app.globalData.userInfo = e.detail.userInfo
//     this.setData({
//       userInfo: e.detail.userInfo,
//       hasUserInfo: true
//     })
//   }
// })
// 以上是最原始的js，新建项目时自带的
var app=getApp();
var config=require("../../utils/config.js");
var util=require("../../utils/util.js");
Page({
  /**
   * 页面的初始数据
   */
  data: {
    indicatorDots: true,
    autoplay: true,
    interval: 3500,
    duration: 1500,
    loadingMore: true, // loading中
    isEnd: false, //到底啦
    userInfo: {},
    swiperCurrent: 0,
    recommendTitlePicStr: '',
    categories: [],
    activeCategoryId: 0,
    goodsList: [], //按类别的商品
    recommendGoods: [], //推荐商品
    recommendGoodsShow: [], //显示的推荐商品，为了缓解网络加载压力设置每次加载15个推荐商品
    banners: [],
    showNoBanners: false,
    loadingMoreHidden: true,
    page:1,  //加载商品时的页数默认为1开始,在app页面加载
    stv: {
      windowWidth: 0,
      windowHeight: 0,
    },
    height: []
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this;
    this.getLocation();
    this.getBanners();
    this.getRecommendTitlePicStr();
    // 获取首页商品
    util.goodsList.call(that,config.apiList.goodsList,that.data.page);
  },
  // 切换城市
  switchCity:function(){
    wx.navigateTo({
      url: '../city/city',
    })
  },
  // 切换搜索页
  switchResult:function(){
    wx.navigateTo({
      url: '../search/search',
    })
  },
  // 获取城市当前定位
  getLocation: function () {
    this.setData({
      county: ''
    })
    const that = this;
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        //当前的经度和纬度
        let latitude = res.latitude
        let longitude = res.longitude
        console.log("latitude" + latitude)
        console.log("longitude" + longitude)
        wx.request({
          url: `https://apis.map.qq.com/ws/geocoder/v1/?location=${latitude},${longitude}&key=${app.globalData.tencentMapKey}`,
          success: res => {
            console.log(res.data)
            that.setData({
              city: res.data.result.ad_info.city,
              currentCityCode: res.data.result.ad_info.adcode,
              county: res.data.result.ad_info.district
            })
          }
        })
      }
    })
  },
  // banner图
  getBanners: function () {
    var that = this
    wx.request({
      url: config.apiList.getBanner,
      data: {
        key: 'mallName'
      },
      success: function (res) {
        console.log("请求banners返回代码", res.data);
        if (res.data.code === 0) {
          that.setData({
            banners: res.data.data
          });
        } else if ((res.data.code === 404) || (res.data.code === 700) || (res.data.code === 701)) {
          that.setData({
            showNoBanners: true
          })

        } else {
          that.setData({
            showNoBanners: true
          })
          that.showPopup('.banners_warn_Popup')
        }
      }
    })
  },
  swiperchange: function (e) {
    this.setData({
      swiperCurrent: e.detail.current
    })
  },
  toDetailsTap: function (e) {
    wx.navigateTo({
      url: "/pages/goods-detail/goodsdetail?id=" + e.currentTarget.dataset.id
    })
  },
  tapBanner: function (e) {
    if (e.currentTarget.dataset.id != 0) {
      wx.navigateTo({
        url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
      })
    }
  },
  handlerStart(e) {
    console.log('handlerStart')
    let { clientX, clientY } = e.touches[0];
    this.startX = clientX;
    this.tapStartX = clientX;
    this.tapStartY = clientY;
    this.data.stv.tStart = true;
    this.tapStartTime = e.timeStamp;
    this.setData({ stv: this.data.stv })
  },
  handlerMove(e) {
    console.log('handlerMove')
    let { clientX, clientY } = e.touches[0];
    let { stv } = this.data;
    let offsetX = this.startX - clientX;
    this.startX = clientX;
    stv.offset += offsetX;
    if (stv.offset <= 0) {
      stv.offset = 0;
    } else if (stv.offset >= stv.windowWidth * (this.tabsCount - 1)) {
      stv.offset = stv.windowWidth * (this.tabsCount - 1);
    }
    this.setData({ stv: stv });
  },
  handlerCancel(e) {

  },
  handlerEnd(e) {
    console.log('handlerEnd')
    let { clientX, clientY } = e.changedTouches[0];
    let endTime = e.timeStamp;
    let { tabs, stv, activeTab } = this.data;
    let { offset, windowWidth } = stv;
    //快速滑动
    if (endTime - this.tapStartTime <= 300) {
      console.log('快速滑动')
      //判断是否左右滑动(竖直方向滑动小于50)
      if (Math.abs(this.tapStartY - clientY) < 50) {
        //Y距离小于50 所以用户是左右滑动
        console.log('竖直滑动距离小于50')
        if (this.tapStartX - clientX > 5) {
          //向左滑动超过5个单位，activeTab增加
          console.log('向左滑动')

        } else if (clientX - this.tapStartX > 5) {
          //向右滑动超过5个单位，activeTab减少
          console.log('向右滑动')

        }
        stv.offset = stv.windowWidth * activeTab;
      } else {
        //Y距离大于50 所以用户是上下滑动
        console.log('竖直滑动距离大于50')

      }
    } else {

    }
    stv.tStart = false;
    this.setData({ stv: this.data.stv })
  },
  showPopup(PopupClassname) {
    let popupComponent = this.selectComponent(PopupClassname);
    popupComponent && popupComponent.show();
  },
  // 特别推荐
  getRecommendTitlePicStr: function () {
    var that = this;
    //  获取商城名称
    wx.request({
      url: config.apiList.mallName,
      data: {
        key: 'finderRecommendTtile'
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            recommendTitlePicStr: res.data.data.value
          })
        }
      },
      fail: function () {
        console.log('fail')
      },
    })
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
    var that=this;
    util.goodsList.call(that, config.apiList.goodsList, that.data.page);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }
})
