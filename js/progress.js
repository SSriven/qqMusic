/**
 * 控制进度条
 */
(function (window) {
    function Progress(progressBar,progressSize,progressDot) {
        return new Progress.prototype.init(progressBar,progressSize,progressDot);
    }
    Progress.prototype = {
        constructor: Progress,
        init:function (progressBar,progressSize,progressDot) {
            this.$progressBar = progressBar;
            this.$progressSize = progressSize;
            this.$progressDot = progressDot;
        },
        isMove:false,
        //监听进度条的点击事件
        progressClick:function (callBack) {
            var $this = this;
            //监听背景的点击
            this.$progressBar.click(function (event) {
                //获取进度条左边距离窗口的默认位置
                var offsetLeft = $(this).offset().left;
                //获取鼠标点击的位置
                var eventLeft = event.pageX;
                //设置前景宽度
                $this.$progressSize.css("width",eventLeft - offsetLeft);
                $this.$progressDot.css("left",eventLeft - offsetLeft);
                //计算进度条的比例
                var value = (eventLeft - offsetLeft) / $(this).width();
                callBack(value);
            });
        },
        //监听进度条的移动事件
        progressMove:function (callBack1,callBack2,audio) {
            //1.鼠标按下
            var $this = this;
            //获取进度条左边距离窗口的默认位置
            var offsetLeft = Math.round(this.$progressBar.offset().left);
            var eventLeft;
            var length;
            this.$progressBar.mousedown(function () {
                $this.isMove = true;
                //2.鼠标移动
               $(document).mousemove(function (event) {
                   //获取鼠标点击的位置
                   
                   eventLeft = Math.floor(event.pageX);
                   length = eventLeft - offsetLeft;
                   if(length <= 0){
                       length = 0;
                   }
                   if(length >= $this.$progressBar.width()){
                       length = $this.$progressBar.width();
                   }
                   //设置前景宽度
                   $this.$progressSize.css("width",length);
                   $this.$progressDot.css("left",length);
                   //计算进度条的比例
                   var value = length / $this.$progressBar.width();
                   $this.moveTimeUpdate(value,audio,callBack2);
               });
            });
            //3.鼠标抬起
            $(document).mouseup(function () {
                $(document).off("mousemove");
                //计算进度条的比例
                if($this.isMove){
                    var value = length / $this.$progressBar.width();
                    callBack1(value);
                }
                $this.isMove = false;

            });

        },
        setProgress:function (value) {
            if(this.isMove) return;
            if(value < 0 || value > 100) return;
            this.$progressSize.css("width",value + "%");
            this.$progressDot.css("left",value + "%");
        },
        //拖拽进度条时更新时间
        moveTimeUpdate:function (value,audio,callBack) {
            var curTime = audio.duration * Math.round(value*100)/100;
            var timeStr = this.timeFormat(audio.duration,curTime);
            callBack(timeStr);
        },
        //格式化时间
        timeFormat:function (duration,current) {
            var endMin = Math.floor(duration / 60) < 10 ? "0"+Math.floor(duration / 60) : Math.floor(duration / 60);
            var endSec = Math.floor(duration % 60) < 10 ? "0"+Math.floor(duration % 60) : Math.floor(duration % 60);
            var curMin = Math.floor(current / 60) < 10 ? "0"+Math.floor(current / 60) : Math.floor(current / 60);
            var curSec = Math.floor(current % 60) < 10 ? "0"+Math.floor(current % 60) : Math.floor(current % 60);
            return curMin + ":" + curSec + " / " + endMin + ":" + endSec;
        }
    };
    Progress.prototype.init.prototype = Progress.prototype;
    window.Progress = Progress;
})(window);