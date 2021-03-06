const uploader = require("../../utils/uploadImage");
Component({

  /**
   * 页面的初始数据
   */
  data: {
    imageArray:[],
    iconInfo:{},
    qiniuInfo:{}
  },
  properties: {
    iconInfo: {
        type: JSON,
        value: {},
        observer: function (newData, oldData) {
          console.log("newData:" + JSON.stringify(newData));
          this.setData({
            iconInfo:newData
          })
        }
    },
    qiniuInfo: {
      type: JSON,
      value: {},
      observer: function (newData, oldData) {
        console.log("newData:" + JSON.stringify(newData));
        this.setData({
          qiniuInfo: newData
        })
      }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  attached: function (options) {

  },

  methods:{
    configQiniu: function() {
      let qiniuData = this.data.qiniuInfo;
      if (qiniuData.region == ''){
        console.error('七牛存储区域不能为空');
        return false;
      }

      if (qiniuData.token == '') {
        console.error('七牛授权token不能为空');
        return false;
      }

      if (qiniuData.domain == '') {
        console.error('七牛域名不能为空');
        return false;
      }

      return this.data.qiniuInfo;
    },
    /**
   * 选择图片并且上传到七牛
   */
    selectImage: function () {
      let _this = this;
      let configs = _this.configQiniu();

      wx.chooseImage({
        count: _this.data.qiniuInfo.uploadNumber, // 默认9
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: function (res) {

          let temArray = _this.data.imageArray;
          var filePaths = res.tempFilePaths;
          let position = res.tempFilePaths.length - 1;
          let temArrayLength = temArray.length;
          let imagePosition = 0;
          if(temArrayLength == 0){
            imagePosition = 0;
          }else{
            imagePosition = temArrayLength - 1;
          }

          wx.showLoading({
            title: '加载中',
          })

          filePaths.map((item, index) => {
            temArray.push({ "localPath": item});

            uploader.upload(configs, item, res => {
              if (position == index) {
                wx.hideLoading();
              }

              console.log("上传结果:" + res.error);

              if (res.error == undefined) {
                temArray[temArrayLength].uploadResult = res;
                _this.setData({
                  imageArray: temArray
                });
                console.log("内部获取到的照片：" + JSON.stringify(temArray));
                _this.triggerEvent("success", temArray);
              }else{
                //上传失败
                _this.triggerEvent("error", res);
                console.error("上传失败:"+res);
              }
            })

          });

          console.log("temArray:" + JSON.stringify(temArray))

          _this.setData({
            imageArray: temArray
          });

        }
      })

    },

    /**
     * 移除图片
     */
    removeImage: function (event) {
      let id = event.target.id;
      let arr = this.data.imageArray;

      let newArray = arr.filter((item, index) => {
        if (index != id) {
          return item;
        }
      });

      this.setData({
        imageArray: newArray
      });

      this.triggerEvent("delete", newArray);
    }

  },

})