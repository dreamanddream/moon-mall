var app=getApp();
module.exports={
  pageSize:20,
  apiList:{
    getBanner: 'https://api.it120.cc/' + app.globalData.subDomain + '/banner/list',
    mallName: 'https://api.it120.cc/' + app.globalData.subDomain + '/config/get-value',
    goodsList: 'https://api.it120.cc/' + app.globalData.subDomain + '/shop/goods/list'
  }
}