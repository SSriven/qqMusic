/**
 * 控制播放
 */
(function (window) {
    function Player(audio) {
        return new Player.prototype.init(audio);
    }
    Player.prototype = {
        constructor: Player,
        //获取的歌曲信息
        musicList:[],
        init:function (audio) {
            this.$audio = audio;
            this.audio = audio.get(0);
        },
        //当前播放的音乐的索引
        currentIndex:-1,
        //播放或暂停
        playMusic:function (index,music) {
            //判断当前索引和即将要播放的歌曲的索引是否一样
            if(index === this.currentIndex){
                if(this.audio.paused){
                    //如果当前是暂停的，则播放
                    this.audio.play();
                }else{
                    this.audio.pause();
                }
            }else{
                //不是同一首歌
                this.$audio.attr("src",music.data[0].url);
                this.audio.play();
                this.currentIndex = index;
            }

        },
        //上一首
        prevIndex:function () {
            var index = this.currentIndex - 1;
            if(index < 0){
                index = this.musicList.length - 1;
            }
            return index;
        },
        //下一首
        nextIndex:function () {
            var index = this.currentIndex + 1;
            if(index > this.musicList.length - 1){
                index = 0;
            }
            return index;
        },
        //删除对应的数据
        delMusic:function (index) {
            this.musicList.splice(index,1);
            if(index < this.currentIndex){
                this.currentIndex--;
            }
        },
        //更新时间
        musicTimeUpdate:function (callBack) {
            var $this = this;
            this.$audio.on("timeupdate",function () {
                var timeStr = $this.timeFormat($this.audio.duration,$this.audio.currentTime);
                callBack($this.audio.duration,$this.audio.currentTime,timeStr);
            });
        },
        //格式化时间
        timeFormat:function (duration,current) {
            var endMin = Math.floor(duration / 60) < 10 ? "0"+Math.floor(duration / 60) : Math.floor(duration / 60);
            var endSec = Math.floor(duration % 60) < 10 ? "0"+Math.floor(duration % 60) : Math.floor(duration % 60);
            var curMin = Math.floor(current / 60) < 10 ? "0"+Math.floor(current / 60) : Math.floor(current / 60);
            var curSec = Math.floor(current % 60) < 10 ? "0"+Math.floor(current % 60) : Math.floor(current % 60);
            return curMin + ":" + curSec + " / " + endMin + ":" + endSec;
        },
        //跳转到指定时间播放
        musicSeekTo:function (value) {
            this.audio.currentTime = this.audio.duration * value;

        },
        //设置音量
        musicVoiceSeekTo:function (value) {
            this.audio.volume = value;
        }
    };
    Player.prototype.init.prototype = Player.prototype;
    window.Player = Player;
})(window);