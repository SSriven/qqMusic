(function (window) {
    function Lyric(path) {
        return new Lyric.prototype.init(path);
    }
    Lyric.prototype = {
        constructor: Lyric,
        init:function (path) {
            this.path = path;
        },
        times:[],
        lyrics:[],
        index:0,
        //加载歌词
        loadLyric:function (callBack) {
            var $this = this;
            $.ajax({
                url: $this.path,
                dataType: "text",
                success: function (data) {
                    $this.parseLyric(data);
                    callBack();
                },
                error: function (e) {
                    console.log(e);
                }
            });
        },
        //解析歌词
        parseLyric:function (data) {
            var $this =this;
            $this.times = [];
            $this.lyrics = [];
            var array = data.split("\n");
            // console.log(array);
            var timeReg = /\[(\d*:\d*\.\d*)\]/;
            //遍历所有歌词
            $.each(array,function (index,ele) {
                //排除空字符串
                var lrc = ele.split("]")[1];
                // console.log(lrc,lrc.length);
                if(lrc.length === 0) return true;
                $this.lyrics.push(lrc);
                // console.log(ele);
                var res = timeReg.exec(ele);
                // console.log(res);
                if(res === null) return true;
                var timeStr = res[1];
                var timeStr2 = timeStr.split(":");
                var min = parseInt(timeStr2[0]) * 60;
                var sec = parseFloat(timeStr2[1]);
                var time = parseFloat(Number(min+sec).toFixed(2));
                // console.log(time);
                $this.times.push(time);
            });
            // console.log($this.times,$this.lyrics);
        },
        //计算当前高亮显示的歌词的索引
        currentIndex:function (currentTime) {
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