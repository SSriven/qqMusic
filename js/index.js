$(function () {
//0.设置滚动条
    $(".music_list").mCustomScrollbar();
    //1.加载歌曲
    musicOnload();
    var audio = $("audio");
    var player = new Player(audio);
    var progress;
    var voiceProgress;
    var lyric;
    // var marginTop = $(".music_info_lyric li").eq(0).height();
    // var preindex = 0;
    //初始化进度条
    initProgress();

    //2.所有事件
    eventInit();


    function initProgress() {
        var progressBar = $(".progress_bar");
        var progressSize = $(".progress_size");
        var progressDot = $(".progress_dot");
        progress = new Progress(progressBar,progressSize,progressDot);
        progress.progressClick(function (value) {
            player.musicSeekTo(value);
        });
        progress.progressMove(function (value) {
            //跳转到指定时间播放
            player.musicSeekTo(value);
        },function (timeStr) {
            //同步时间
            $("#progress_time").text(timeStr);
        },player.audio);
        var voiceProgressBar = $(".voice_bar");
        var voiceProgressSize = $(".voice_size");
        var voiceProgressDot = $(".voice_dot");
        voiceProgress = new Progress(voiceProgressBar,voiceProgressSize,voiceProgressDot);
        player.musicVoiceSeekTo(0.5);
        voiceProgress.setProgress(50);
        voiceProgress.progressClick(function (value) {
            player.musicVoiceSeekTo(value);
        });
        voiceProgress.progressMove(function (value) {
            player.musicVoiceSeekTo(value);
        });
    }

    /**
     * 加载歌曲
     */
    function musicOnload() {
        var musicList = $(".music_list ul");
        // console.log(musicList);
        $.ajax({
            url: "./source/musiclist.json",
            dataType: "json",
            success: function (data) {
                // console.log(data);
                player.musicList = data;
                $.each(data, function (index, ele) {
                    // console.log(ele.data[0].name);
                    var item = creatEle(index, ele);
                    musicList.append(item);
                });
                initMusicInfo(data[0]);
                initMusicLyric(data[0]);

            },
            error: function (e) {
                console.log(e);
            }
        });
    }

    /**
     * 设置歌曲信息
     * @param music
     */
    function initMusicInfo(music) {
        //获取相关的标签
        var musicImg = $(".music_info_pic img");
        var musicName = $("#song_name a");
        var musicSinger = $("#song_singer a");
        var musicAblum = $("#song_ablum a");
        var progressName = $("#progress_name");
        var progressTime = $("#progress_time");
        var maskBg = $(".mask_bg");
        var minute = Math.floor(music.data[0].time/60) < 10 ? "0"+Math.floor(music.data[0].time/60) : Math.floor(music.data[0].time/60);
        var second = music.data[0].time%60 < 10 ? "0"+music.data[0].time%60 : music.data[0].time%60;
        var curMin = Math.floor(player.audio.currentTime / 60) < 10 ? "0"+Math.floor(player.audio.currentTime / 60) : Math.floor(player.audio.currentTime / 60);
        var curSec = Math.floor(player.audio.currentTime % 60) < 10 ? "0"+Math.floor(player.audio.currentTime % 60) : Math.floor(player.audio.currentTime % 60);
        //赋值
        musicImg.attr("src",music.data[0].pic);
        musicName.text(music.data[0].name);
        musicSinger.text(music.data[0].singer);
        musicAblum.text(music.data[0].name);
        progressName.text(music.data[0].name + " - " + music.data[0].singer);
        progressTime.text(curMin + ":" + curSec +" / " + minute +":"+second);
        maskBg.css("background","url("+music.data[0].pic+")");
    }
    function initMusicLyric(music){
        lyric = new Lyric(music.data[0].lrc);
        lyric.loadLyric(function () {
            var lyricContainer = $(".music_info_lyric");
            lyricContainer.html("");
            $.each(lyric.lyrics,function (index,ele) {
                var item = $("<li>"+ele+"</li>");
                lyricContainer.append(item);
            })
        });
    }
    /**
     * 监听事件
     */
    function eventInit() {
        //1.监听鼠标的移入移出事件
        $(".music_list").delegate(".music_info","mouseenter",function () {
            //显示子菜单
            $(this).find(".music_menu").css({
                display: "block"
            });
            //隐藏时间
            $(this).find(".music_time .time").css({
                display: "none"
            });
            //显示删除
            $(this).find(".music_time a").css({
                display: "block"
            });
        });
        $(".music_list").delegate(".music_info","mouseleave",function () {
            //隐藏子菜单
            $(this).find(".music_menu").css({
                display: "none"
            });
            $(this).find(".music_time a").css({
                display: "none"
            });
            //显示时间
            $(this).find(".music_time .time").css({
                display: "block"
            });
        });
        //2.监听单选框的点击
        $(".music_list").delegate(".check_box i","click",function () {
            $(this).toggleClass("selected");
        });
        //3.监听小菜单中的播放按钮的点击事件
        var bottomPlay = $(".footer_play");
        $(".music_list").delegate(".list_menu_play","click",function () {
            var music_item =  $(this).parents(".music_info");
            // console.log(music_item.get(0).index);
            // console.log(music_item.get(0).music);
            //3.1切换播放图标
            $(this).find("i").toggleClass("srivenIcon-3");
            //3.2复原其他播放按钮
            music_item.siblings().find(".list_menu_play").find("i").removeClass("srivenIcon-3");
            //3.3同步底部的播放按钮
            if($(this).find("i").attr("class").indexOf("srivenIcon-3") != -1){
                //当前是播放状态
                bottomPlay.find("i").addClass("srivenIcon-16");
                $(this).attr("title","暂停");
                music_item.siblings().find(".list_menu_play").attr("title","播放");
                //让文字高亮
                music_item.find("div").css("color","rgba(255,255,255,1)");
                music_item.siblings().find("div").css("color","rgba(255,255,255,0.5)");
            }else{
                //当前是暂停状态
                bottomPlay.find("i").removeClass("srivenIcon-16");
                //让文字不高亮
                music_item.find("div").css("color","rgba(255,255,255,0.5)");
            }
            //3.4切换序号图标
            music_item.find(".index").toggleClass("index_play");
            music_item.siblings().find(".index").removeClass("index_play");
            //3.5播放
            player.playMusic(music_item.get(0).index,music_item.get(0).music);
            //3.6切换歌曲信息
            initMusicInfo(music_item.get(0).music);
            //3.7切换歌曲歌词
            initMusicLyric(music_item.get(0).music);
            //
        });
        //4.监听底部播放按钮的点击事件
        bottomPlay.click(function () {
            //判断是否播放过音乐
            if(player.currentIndex === -1){
                //没有播放过
                // console.log($(".music_info").eq(0).find(".list_menu_play"));
                progress.setProgress(0);
                $(".music_info").eq(0).find(".list_menu_play").trigger("click");
            }else{
                $(".music_info").eq(player.currentIndex).find(".list_menu_play").trigger("click");
            }
        });
        //5.上一首
        $(".footer_prev").click(function () {
            $(".music_info").eq(player.prevIndex()).find(".list_menu_play").trigger("click");
        });

        //6.下一首
        $(".footer_next").click(function () {
            $(".music_info").eq(player.nextIndex()).find(".list_menu_play").trigger("click");
        });
        //7.监听删除按钮的点击事件
        $(".music_list").delegate(".del","click",function () {
            var item = $(this).parents(".music_info");
            //判断这首歌曲是否在播放
            if(item.get(0).index === player.currentIndex){
                $(".footer_next").trigger("click");
            }
            item.remove();
            player.delMusic(item.get(0).index);

            //重新排序
            $(".music_info").each(function (index,ele) {
                ele.index = index;
                $(ele).find(".index").text(index + 1);
            })

        });
        //8.监听播放速度
        player.musicTimeUpdate(function (duration,currentTime,timeStr){
            //同步时间
            $("#progress_time").text(timeStr);
            //同步进度条
            var value = currentTime / duration * 100;
            progress.setProgress(value);
            var curindex = lyric.currentIndex(currentTime);
            var item = $(".music_info_lyric li").eq(curindex);
            item.addClass("cur");
            item.siblings().removeClass("cur");
            if(curindex <= 2) return;
            $(".music_info_lyric").css(
                {
                    marginTop:((-curindex+2) * item.height())
                }
            );
            // if(preindex < curindex)
            //     marginTop -= (item.height()-$(".music_info_lyric li").eq(preindex).height()) <= 0 ? item.height() : item.height()-$(".music_info_lyric li").eq(preindex).height();
            // preindex = curindex;
        },function () {
            $(".footer_next").trigger("click");
        });

        //9.监听音量的点击
        $("#music_voice").click(function () {
            if($(this).attr("class").indexOf("srivenIcon-15") !== -1){
                $(this).attr("class","srivenIcon-uniE912");
                //关闭声音
                player.musicVoiceSeekTo(0);
            }else{
                $(this).attr("class","srivenIcon-15");
                //打开声音
                player.musicVoiceSeekTo(1);
            }
        });
        
    }


    /**
     * 创建元素
     * @param index
     * @param ele
     * @returns {*|jQuery|HTMLElement}
     */
    function creatEle(index, ele) {
        var minute = Math.floor(ele.data[0].time/60) < 10 ? "0"+Math.floor(ele.data[0].time/60) : Math.floor(ele.data[0].time/60);
        var second = ele.data[0].time%60 < 10 ? "0"+ele.data[0].time%60 : ele.data[0].time%60;
        var str = $('<li class="music_info">\n' +
            '                        <div class="check_box"><i></i></div>\n' +
            '                        <div class="index">'+(index+1)+'</div>\n' +
            '                        <div class="music_name">'+ele.data[0].name+'\n' +
            '                            <div class="music_menu">\n' +
            '                                <a href="javascript:;"title="播放" class="list_menu_play"><i class="srivenIcon-uniE900"></i></a>\n' +
            '                                <a href="javascript:;"title="添加"><i class="srivenIcon-2"></i></a>\n' +
            '                                <a href="javascript:;"title="分享"><i class="srivenIcon-1"></i></a>\n' +
            '                            </div>\n' +
            '                        </div>\n' +
            '                        <div class="music_singer">'+ele.data[0].singer+'</div>\n' +
            '                        <div class="music_time"><span class="time">'+minute+':'+second+'</span>\n' +
            '                            <a href="javascript:;"title="删除" class="del"><i class="srivenIcon-7"></i></a>\n' +
            '                        </div>\n' +
            '                    </li>');
        str.get(0).index = index;
        str.get(0).music = ele;
        return str;
    }
});