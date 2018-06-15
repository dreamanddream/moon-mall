const city = require('../../utils/util.js');
const appInstance = getApp();
Page({
  data: {
    searchLetter: [],
    showLetter: "",
    winHeight: 0,
    cityList: [],
    isShowLetter: false,
    scrollTop: 0,//置顶高度
    scrollTopId: '',//置顶id
    city: "定位中",
    currentCityCode: '',
    hotcityList: [{ cityCode: 110000, city: '北京市' }, { cityCode: 310000, city: '上海市' }, { cityCode: 440100, city: '广州市' }, { cityCode: 440300, city: '深圳市' }, { cityCode: 330100, city: '杭州市' }, { cityCode: 320100, city: '南京市' }, { cityCode: 420100, city: '武汉市' }, { cityCode: 120000, city: '天津市' }, { cityCode: 610100, city: '西安市' },],
    commonCityList: [{ cityCode: 110000, city: '北京市' }, { cityCode: 310000, city: '上海市' }],
    countyList: [{ cityCode: 110000, county: 'A区' }, { cityCode: 310000, county: 'B区' }, { cityCode: 440100, county: 'C区' }, { cityCode: 440300, county: 'D区' }, { cityCode: 330100, county: 'E县' }, { cityCode: 320100, county: 'F县' }, { cityCode: 420100, county: 'G县' }],
    inputName: '',
    completeList: [],
    county: '',
    condition: false,
    toView: 'A'
  },
  //选择城市
  bindCity: function (e) {
    this.setData({
      condition: true,  //选择区县修改为true
      city: e.currentTarget.dataset.city,
      currentCityCode: e.currentTarget.dataset.code,
      scrollTop: 0,
      completeList: [],
    })
    this.selectCounty() //获取当前城市的区名称
    appInstance.globalData.defaultCity = this.data.city
    appInstance.globalData.defaultCounty = ''
  },
  bindCounty: function (e)  //设置当前区域
  {
    this.setData({ county: e.currentTarget.dataset.city })
    appInstance.globalData.defaultCounty = this.data.county
    // wx.switchTab({
    //   url: '../weather/weather'
    // })
    wx.navigateTo({
      url: '/pages/index/index',
    })
  },

  onLoad: function (options) {
    const searchLetter = city.searchLetter;
    console.log("searchLetter")
    console.log(searchLetter)
    // console.log(searchLetter.name)
    const cityList = city.cityList();
    const sysInfo = wx.getSystemInfoSync();
    const winHeight = sysInfo.windowHeight;
    const itemH = winHeight / searchLetter.length;
    let tempArr = [];
    // 处理固定在右侧的A,B,C,D,
    searchLetter.map(
      (item, index) => {
        let temp = {};
        temp.name = item;
        temp.tHeight = index * itemH;
        temp.bHeight = (index + 1) * itemH;
        tempArr.push(temp)
      }
    );
    this.setData({
      winHeight: winHeight,
      itemH: itemH,
      searchLetter: tempArr,
      cityList: cityList
    });
    this.getLocation();
  },

  //定位当前城市的函数
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
          url: `https://apis.map.qq.com/ws/geocoder/v1/?location=${latitude},${longitude}&key=${appInstance.globalData.tencentMapKey}`,
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
  //获取当前选择城市的区县
  selectCounty: function () {
    let code = this.data.currentCityCode
    console.log(code);
    const that = this;
    wx.request({
      url: `https://apis.map.qq.com/ws/district/v1/getchildren?&id=${code}&key=${appInstance.globalData.tencentMapKey}`,
      success: function (res) {
        // 请求区县
        console.log("请求区县")
        console.log(res.data)
        that.setData({
          countyList: res.data.result[0],
        })
      },
      fail: function () {
        console.log("请求区县失败，请重试");
      }
    })
  },
  //重新定位城市
  reGetLocation: function () {
    appInstance.globalData.defaultCity = this.data.city
    appInstance.globalData.defaultCounty = this.data.county
    //返回首页
    // wx.switchTab({
    //   url: '../weather/weather'
    // })
    wx.navigateTo({
      url: '/pages/index/index',
    })
  },
  //点击热门城市回到顶部
  hotCity: function () {
    this.setData({
      scrollTop: 0,
    })
  },
  // 锚点定位
  clickLetter: function (e) {
    // console.log(e);
    // 通过自定义属性
    console.log(e.currentTarget.dataset.letter)
    const showLetter = e.currentTarget.dataset.letter;
    this.setData({
      toastShowLetter: showLetter,
      isShowLetter: true,
      scrollTopId: showLetter,
    })
    // const that = this;
    // wx.showToast({
    //   title: showLetter,
    //   disabled: true,
    //   duration: 500,
    //   complete: function() {
    //     that.setData({
    //       scrollTopId: showLetter,
    //     })
    //   }
    // })
    const that = this;
    setTimeout(function () {
      that.setData({
        isShowLetter: false
      })
    }, 500)
  },
  bindBlur: function (e) {
    this.setData({
      inputName: ''
    })
  },
  // 获取查询框输入，并执行自动查询方法
  // bindInput就是输入内容，边获取输入框内容，查询内容会及时随着更新和改变
  bindKeyInput: function (e) {
    this.setData({
      // 将获取到的input中的内容及时渲染到input输入框中。
      // 这里有个问题注意，在setData中inputName和data中定义的inputName是同一个变量
      inputName: e.detail.value
    })
    // 添加
    this.auto();
  },
  auto: function () {

    let inputSd = this.data.inputName.trim();
    // console.log(inputSd)
    // shng
    let sd = inputSd.toLowerCase()
    let num = sd.length
    const cityList = city.cityObjs
    let finalCityList = []
    let temp = cityList.filter(
      item => {
        // short是拼音
        let text = item.short.slice(0, num).toLowerCase()
        // console.log(sd)
        // console.log(num)
        // text得到的就是首字母
        // console.log("text");
        // console.log(text)
        // console.log(text.length)
        // sd使用户输入的信息转换成了小写
        return (text && text == sd)
      }
    )
    // console.log("temp");
    // console.log(temp);
    // 在城市数据中，添加简拼到“shorter”属性，就可以实现简拼搜索
    // 这个不是很理解
    let tempShorter = cityList.filter(
      itemShorter => {
        if (itemShorter.shorter) {
          let textShorter = itemShorter.shorter.slice(0, num).toLowerCase();
          // console.log("textShorter");
          // console.log(textShorter);
          return (textShorter && textShorter == sd)
        }
        return
      }
    )
    // 将输入的和中文匹配
    let tempChinese = cityList.filter(
      itemChinese => {
        let textChinese = itemChinese.city.slice(0, num)
        // console.log("textChinese");
        // console.log(textChinese)
        // console.log("sd")
        // console.log(sd)
        // sd是用户输入的内容
        return (textChinese && textChinese == sd)
      }
    )
    if (temp[0]) {
      temp.map(
        item => {
          let testObj = {};
          testObj.city = item.city
          testObj.code = item.code
          finalCityList.push(testObj)
        }
      )
      this.setData({
        completeList: finalCityList,
      })
    } else if (tempShorter[0]) {
      tempShorter.map(
        item => {
          let testObj = {};
          testObj.city = item.city
          testObj.code = item.code
          finalCityList.push(testObj)
        }
      );
      this.setData({
        completeList: finalCityList,
      })
    } else if (tempChinese[0]) {
      tempChinese.map(
        item => {
          let testObj = {};
          testObj.city = item.city
          testObj.code = item.code
          finalCityList.push(testObj)
        })
      this.setData({
        completeList: finalCityList,
      })
    } else {
      return
    }
  },


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '很赞的全国城市切换器~',
      desc: '分享个小程序，希望你喜欢☺️~',
      success: function (res) {
        // 转发成功
        wx.showToast({
          title: "分享成功",
          duration: 1000,
          icon: "success"
        })
      }
    }
  }
})