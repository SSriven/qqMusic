/**
 * 歌词处理方法封装
 */
(function (window) {
    function Lyric(path) {
        return new Lyric.prototype.init(path);
    }
    Lyric.prototype = {
        constructor: Lyric,
        init:function (path) {
            this.path = path;
        },
        times:[],//时间
        lyrics:[],//歌词
        translateLyrics:[],//翻译
        index:0,//当前该显示的歌词条的索引
        //加载歌词
        /**
         * 加载歌词
         * @param callBack 回调函数
         */
        loadLyric:function (callBack) {
            var $this = this;
            $.ajax({
                url: $this.path,
                dataType: "text",
                success: function (data) {
                    $this.parseLyric(data);//解析歌词
                    callBack();
                },
                error: function (e) {
                    console.log(e);
                    $this.parseLyric("");
                    callBack();
                }
            });
        },
        //解析歌词
        /**
         * 解析歌词
         * @param data 要解析的歌词数据
         */
        parseLyric:function (data) {
            var $this =this;
            if(data === ""){   //如果数据为空，则退出函数
                $this.times = [];
                $this.lyrics = ["无法加载歌词..."];
                return;
            }
            //清空歌词文件
            $this.times = [];
            $this.lyrics = [];
            $this.translateLyrics = [];
            var array1 = data.split("[offset:0]")[1];//获取原生歌词和时间
            var array2 = data.split("[offset:0]")[2];//获取翻译歌词和时间
            var array = array1.split("\n");//把歌词放入数组
            var translate = array2 !== undefined ? array2.split("\n") : [""];
            var timeReg = /\[(\d*:\d*\.\d*)\]/;//正则表达式用于获取时间
            //遍历歌词
            $.each(array,function (index,ele) {
                if(ele === "") return true;
                var lrc = ele.split("]")[1];//获取歌词文字
                if(lrc.length === 0) return true;
                $this.lyrics.push(lrc);//把获取的给文字放入数组
                var res = timeReg.exec(ele);//验证正则表达式
                if(res === null) return true;
                //处理时间
                var timeStr = res[1];//获取每条歌词对应的时间
                var timeStr2 = timeStr.split(":");
                //格式化时间
                var min = parseInt(timeStr2[0]) * 60;
                var sec = parseFloat(timeStr2[1]);
                var time = parseFloat(Number(min+sec).toFixed(2));
                $this.times.push(time);//将格式化的时间放入数组
            });
            //翻译歌词原理同上
            $.each(translate,function (index,ele) {
                if(ele === "") return true;
                var lrc = ele.split("]")[1];
                if(lrc.length === 0) return true;
                $this.translateLyrics.push(lrc);
            });
        },
        //计算当前高亮显示的歌词的索引
        /**
         * 计算当前高亮显示的歌词的索引
         * @param currentTime
         * @returns {number}
         */
        currentIndex:function (currentTime) {
            if(currentTime < this.times[this.index - 1]){
                this.index = 0;
            }
            for(var i = this.index; i < this.times.length; i++){
                if(currentTime < this.times[i]){
                    this.index = i - 1;
                    return i-1;
                }
            }
            // if(currentTime >= this.times[this.index]){
            //     this.index++;
            //     this.times.shift();
            // }
            // return this.index;
        }

    };
    Lyric.prototype.init.prototype = Lyric.prototype;
    window.Lyric = Lyric;
})(window);