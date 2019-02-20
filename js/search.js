(function (window) {
    function Search(input, search) {
        return new Search.prototype.init(input, search);
    }

    Search.prototype = {
        constructor: Search,
        init: function (input, search) {
            this.$input = input;
            this.$search = search;
        },
        hotMusics: [],
        //加载新歌
        loadHotMusic: function (callBack) {
            var $this = this;
            // var url = "https://c.y.qq.com/v8/fcg-bin/fcg_v8_toplist_cp.fcg?" +
            //     "g_tk=5381&uin=0&format=json&inCharset=utf-8&outCharset=utf-8%C2%ACice=0&platform=h5&needNewCode=1&tpl=3&page=detail&type=top&topid=36&_=1520777874472";
            // $.ajax({
            //     url: "https://c.y.qq.com/v8/fcg-bin/fcg_v8_toplist_cp.fcg?g_tk=5381&uin=0&format=json&inCharset=utf-8&outCharset=utf-8%C2%ACice=0&platform=h5&needNewCode=1&tpl=3&page=detail&type=top&topid=27&_=1519963122923",
            //     dataType: "json",
            //     success: function (data) {
            //         console.log(data);
            //         // $.each(data, function (index, ele) {
            //         //     console.log(ele);
            //         //     // var item = creatEle(index, ele);
            //         //     // musicList.append(item);
            //         // });
            //
            //     },
            //     error: function (e) {
            //         console.log(e);
            //     }
            // });
            var url = 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_toplist_cp.fcg?g_tk=5381&uin=0&format=json&inCharset=utf-8&outCharset=utf-8&notice=0&platform=h5&needNewCode=1&tpl=3&page=detail&type=top&topid=27&_=1519963122923';
            $.ajax({
                url:url,
                type:"get",
                dataType:'jsonp',
                jsonp: "jsonpCallback",
                scriptCharset: 'GBK',//解决中文乱码
                success: function(data){
                    //最新音乐数据
                    // console.log(data);
                    for(var i = 0; i < 7; i++){
                        $this.hotMusics[i] = data.songlist[i];
                    }
                    callBack($this.hotMusics);
                },
                error:function (e) {
                    console.log('error');
                }
            });

        },
        //搜索歌曲
        searchMusic:function (value,callBack) {
            // console.log(value);
            if(value === "") return;
            console.log(value);
            var url = 'https://api.bzqll.com/music/tencent/search?key=579621905&s='+value+'&limit=100&offset=0&type=song';
            $.ajax({
                url:url,
                type:"get",
                dataType:'json',
                // jsonp: "callback",
                // jsonpCallback:'callback',
                scriptCharset: 'GBK',//解决中文乱码
                success: function(data){
                    //获取搜索数据
                    var array = data.data;
                    $.each(array,function (index,ele) {
                        callBack(index,ele);
                    });

                },
                error:function (e) {
                    console.log(e);
                }
            });

        }
    };
    Search.prototype.init.prototype = Search.prototype;
    window.Search = Search;
})(window);