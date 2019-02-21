$(function () {
//0.设置滚动条
    $(".music_list").mCustomScrollbar();
    $(".search_result_list").mCustomScrollbar();
    $("#input").val("");//每次加载都清空搜索框中的值
    //1.加载歌曲
    musicOnload();
    var audio = $("audio");
    var player = new Player(audio);
    var progress;
    var voiceProgress;
    var lyric;
    var search = new Search($("#input"), $("#search"));//实例化搜索对象
    var searchBox = $(".search_result_list ul");//获取搜索结果

    //2.初始化进度条
    initProgress();

    //3.初始化所有事件
    eventInit();


    /**
     * 初始化进度条
     */
    function initProgress() {
        var progressBar = $(".progress_bar");
        var progressSize = $(".progress_size");
        var progressDot = $(".progress_dot");
        progress = new Progress(progressBar, progressSize, progressDot);//实例化进度条对象
        progress.progressClick(function (value) {//进度条的点击事件
            player.musicSeekTo(value);
        });
        progress.progressMove(function (value) {//移动进度条
            //跳转到指定时间播放
            player.musicSeekTo(value);
        }, function (timeStr) {
            //同步时间
            $("#progress_time").text(timeStr);
        }, player.audio);
        var voiceProgressBar = $(".voice_bar");
        var voiceProgressSize = $(".voice_size");
        var voiceProgressDot = $(".voice_dot");
        voiceProgress = new Progress(voiceProgressBar, voiceProgressSize, voiceProgressDot);//实例化声音对象
        player.musicVoiceSeekTo(0.5);//把声音控制到50%
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
        var musicLists = $(".music_list ul");
        var url = "https://c.y.qq.com/v8/fcg-bin/fcg_v8_toplist_cp.fcg?" +
            "g_tk=5381&uin=0&format=json&inCharset=utf-8&outCharset=utf-8&notice=0&" +
            "platform=h5&needNewCode=1&tpl=3&page=detail&type=top&topid=36&_=1520777874472";
        $.ajax({
            url: url,
            type: "get",
            dataType: 'jsonp',
            async:false,
            jsonp: "jsonpCallback",
            scriptCharset: 'GBK',//解决中文乱码
            success: function (data) {
                // console.log(data);
                for(var i = 0; i < data.songlist.length; i++){
                    player.musicList[i] = data.songlist[i].data;
                    player.musicList[i].songurl = "https://api.bzqll.com/music/tencent/url?id="+player.musicList[i].songmid+"&key=579621905";
                    player.musicList[i].songtime = 0;
                    player.musicList[i].songpic = "https://api.bzqll.com/music/tencent/pic?id="+player.musicList[i].songmid+"&key=579621905";
                    player.musicList[i].songlrc = "https://api.bzqll.com/music/tencent/lrc?id="+player.musicList[i].songmid+"&key=579621905";
                    var item = creatEle(i, player.musicList[i]);
                    musicLists.append(item);
                }
                initMusicInfo(player.musicList[0]);
                initMusicLyric(player.musicList[0]);


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
        var searchMaskBg = $(".search_maskBg");
        var minute = Math.floor(music.songtime / 60) < 10 ? "0" + Math.floor(music.songtime / 60) : Math.floor(music.songtime / 60);
        var second = music.songtime % 60 < 10 ? "0" + music.songtime % 60 : music.songtime % 60;
        var curMin = Math.floor(player.audio.currentTime / 60) < 10 ? "0" + Math.floor(player.audio.currentTime / 60) : Math.floor(player.audio.currentTime / 60);
        var curSec = Math.floor(player.audio.currentTime % 60) < 10 ? "0" + Math.floor(player.audio.currentTime % 60) : Math.floor(player.audio.currentTime % 60);
        //赋值
        musicImg.attr("src", music.songpic);
        musicName.text(music.songname);
        musicSinger.text(music.singer[0].name);
        musicAblum.text(music.albumname);
        progressName.text(music.songname + " - " + music.singer[0].name);
        progressTime.text(curMin + ":" + curSec + " / " + minute + ":" + second);
        maskBg.css("background", "url(" + music.songpic + ") no-repeat 0 0");
        maskBg.css("backgroundSize", "cover");
        searchMaskBg.css("background", "url(" + music.songpic + ") no-repeat 0 0");
        searchMaskBg.css("backgroundSize", "cover");
    }

    /**
     * 设置歌词
     * @param music
     */
    function initMusicLyric(music) {
        lyric = new Lyric(music.songlrc);
        lyric.loadLyric(function () {//加载歌词
            var lyricContainer = $(".music_info_lyric");
            lyricContainer.html("");//清空之前的歌词
            $(".lyric_container").css({
                height:150
            });
            lyricContainer.css({
                marginTop:0
            });
            var translate = "";
            $.each(lyric.lyrics, function (index, ele) {
                translate = lyric.translateLyrics[index] !== undefined ? lyric.translateLyrics[index] : "";
                var item = $("<li><p>" + ele + "</p><p>"+translate+"</p></li>");
                lyricContainer.append(item);
            })
        });
    }

    /**
     * 监听事件
     */
    function eventInit() {
        //1.监听鼠标的移入移出事件
        $(".music_list").delegate(".music_info", "mouseenter", function () {
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
        $(".music_list").delegate(".music_info", "mouseleave", function () {
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
        $(".music_list").delegate(".check_box i", "click", function () {
            $(this).toggleClass("selected");
        });


        //3.监听小菜单中的播放按钮的点击事件
        var isPlaying = false;//歌曲是否正在播放
        var bottomPlay = $(".footer_play");
        $(".music_list").delegate(".list_menu_play", "click", function () {
            var music_item = $(this).parents(".music_info");
            if(music_item.get(0).index !== player.currentIndex){
                isPlaying = true;
            }else{
                isPlaying = false;
            }
            // console.log(music_item.get(0).index);
            // console.log(music_item.get(0).music);
            //3.1切换播放图标
            $(this).find("i").toggleClass("srivenIcon-3");
            //3.2复原其他播放按钮
            music_item.siblings().find(".list_menu_play").find("i").removeClass("srivenIcon-3");
            //3.3同步底部的播放按钮
            if ($(this).find("i").attr("class").indexOf("srivenIcon-3") != -1) {
                //当前是播放状态
                bottomPlay.find("i").addClass("srivenIcon-16");
                $(this).attr("title", "暂停");
                music_item.siblings().find(".list_menu_play").attr("title", "播放");
                //让文字高亮
                music_item.find("div").css("color", "rgba(255,255,255,1)");
                music_item.siblings().find("div").css("color", "rgba(255,255,255,0.5)");
            } else {
                //当前是暂停状态
                bottomPlay.find("i").removeClass("srivenIcon-16");
                //让文字不高亮
                music_item.find("div").css("color", "rgba(255,255,255,0.5)");
            }
            //3.4切换序号图标
            music_item.find(".index").toggleClass("index_play");
            music_item.siblings().find(".index").removeClass("index_play");
            //3.5播放
            player.playMusic(music_item.get(0).index, music_item.get(0).music);
            //3.6切换歌曲信息
            initMusicInfo(music_item.get(0).music);
            //3.7切换歌曲歌词
            if(isPlaying)
                initMusicLyric(music_item.get(0).music);
        });


        //4.监听底部播放按钮的点击事件
        bottomPlay.click(function () {
            //判断是否播放过音乐
            if (player.currentIndex === -1) {
                //没有播放过
                // console.log($(".music_info").eq(0).find(".list_menu_play"));
                progress.setProgress(0);
                $(".music_info").eq(0).find(".list_menu_play").trigger("click");
            } else {
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
        $(".music_list").delegate(".del", "click", function () {
            var item = $(this).parents(".music_info");
            //判断这首歌曲是否在播放
            if (item.get(0).index === player.currentIndex) {
                $(".footer_next").trigger("click");
            }
            item.remove();
            player.delMusic(item.get(0).index);//播放下一首

            //重新排序
            $(".music_info").each(function (index, ele) {
                ele.index = index;
                $(ele).find(".index").text(index + 1);
            })

        });


        //8.监听播放速度
        player.musicTimeUpdate(function (duration, currentTime, timeStr) {
            //判断歌曲是否正在播放
            if(currentTime >= 0 && currentTime <= duration){
                isPlaying = false;
            }else{
                isPlaying = true;
            }
            //同步时间
            $(".music_info").eq(player.currentIndex).find(".time").text(timeStr.split("/ ")[1]);
            $("#progress_time").text(timeStr);
            //同步进度条
            var value = currentTime / duration * 100;
            progress.setProgress(value);
            var curindex = lyric.currentIndex(currentTime);
            var item = $(".music_info_lyric li").eq(curindex);
            item.addClass("cur");
            item.siblings().removeClass("cur");
            var n = 2;
            //判断歌词什么时候开始滚动
            try{
                var offset = item.offset().top - $(".music_info_lyric").offset().top;
            }catch(ex){
                console.log(ex);
                offset = 0;
            }finally {
                if (offset < item.height() ||
                    offset >= $(".music_info_lyric").height() - item.height()) return;
            }
            if(item.height() >= 40){
                n = 1;
                $(".lyric_container").css("height","180px");
                console.log(1);
            }else {
                n = 2;
                $(".lyric_container").css("height","150px");
            }
            //滚动歌词
            $(".music_info_lyric").css(
                {
                    marginTop: ((-curindex + n) * item.height())
                }
            );
            //播放完一首歌后自动播放下一首
        }, function () {
            $(".footer_next").trigger("click");
        });

        //9.监听音量的点击
        $("#music_voice").click(function () {
            if ($(this).attr("class").indexOf("srivenIcon-15") !== -1) {
                $(this).attr("class", "srivenIcon-uniE912");
                //关闭声音
                player.musicVoiceSeekTo(0);
            } else {
                $(this).attr("class", "srivenIcon-15");
                //打开声音
                player.musicVoiceSeekTo(1);
            }
        });


        //10.搜索输入框获得焦点事件
        $("#input").focus(function () {
            var ul = $(this).parents(".search_box").find("ul");
            $(this).val("");
            $(this).css("borderBottomLeftRadius", 0);
            ul.stop().slideDown(500);
            $(".search_box ul").html("");
            //加载最新歌曲
            search.loadHotMusic(function (hotMusics) {
                var item;
                for (var i = 0; i < 7; i++) {
                    if (i === 0) {
                        item = $('<li class="hot_music"><span class="first">1</span><p class="songName">' + hotMusics[0].data.songname + '</p><p class="singerName">' + hotMusics[0].data.singer[0].name + '</p></li>');
                    } else if (i === 1) {
                        item = $('<li class="hot_music"><span class="second">2</span><p class="songName">' + hotMusics[1].data.songname + '</p><p class="singerName">' + hotMusics[1].data.singer[0].name + '</p></li>');
                    } else if (i === 2) {
                        item = $('<li class="hot_music"><span class="third">3</span><p class="songName">' + hotMusics[2].data.songname + '</p><p class="singerName">' + hotMusics[2].data.singer[0].name + '</p></li>');
                    } else {
                        item = $('<li class="hot_music"><span>' + (i + 1) + '</span><p class="songName">' + hotMusics[i].data.songname + '</p><p class="singerName">' + hotMusics[i].data.singer[0].name + '</p></li>');
                    }
                    $(".search_box ul").append(item);
                }

            });
        });
        $("#input").focusout(function () {
            var ul = $(this).parents(".search_box").find("ul");
            $(this).css("borderBottomLeftRadius", "5px");
            ul.stop().slideUp(500);
        });

        //11.搜索按钮的点击事件
        $("#search").click(function () {
            //搜索
            searchBox.find(".result_list").remove();
            if($("#input").val() === "") return;
            $(".search_container").css("display", "block");
            search.searchMusic($("#input").val(), creatSearchResultPage);
        });


        //12.推荐歌曲的点击事件
        $(".search_box").delegate(".hot_music", "click", function () {
            var value = $(this).find(".songName").text();
            //搜索
            searchBox.find(".result_list").remove();
            $(".search_container").css("display", "block");
            search.searchMusic(value, creatSearchResultPage);

        });


        //13.监听搜索界面关闭按钮的点击
        $(".close").click(function () {
            $(".search_container").css("display", "none");
        });


        //14.将搜索到的歌曲添加到播放列表中
        $(".search_result_list").delegate(".result_list a","click",function () {
            var music_item = $(this).parents(".result_list");
            addMusic(music_item);
            return false;//阻止事件冒泡
        });


        //15.点击搜索到的歌曲进行播放
        $(".search_result_list").delegate(".result_list","click",function () {
            //添加
            addMusic($(this));
            //播放
            $(".music_info").eq(player.musicList.length - 1).find(".list_menu_play").trigger("click");
        });

        //16.搜索框按键事件
        $("#input").keypress(function (event) {
            switch(event.keyCode){
                case 13:$("#search").trigger("click");break;
                default:break;
            }
        });

        //17.按空格键实现暂停和播放
        $(document).keypress(function (event) {
            switch(event.keyCode || event.which){
                case 32:bottomPlay.trigger("click");break;
                default:break;
            }
        });

    }

    /**
     * 将歌曲添加到播放列表
     * @param music_item
     */
    function addMusic(music_item) {
        var musicObj = {
            songmid:music_item.get(0).music.id,
            songname:music_item.get(0).music.name,
            songurl:music_item.get(0).music.url,
            songpic:music_item.get(0).music.pic,
            songlrc:music_item.get(0).music.lrc,
            songtime:music_item.get(0).music.time,
            singer:[{
                name:music_item.get(0).music.singer
            }],
            albumname:music_item.get(0).music.name
        };
        // console.log(musicObj);
        player.musicList.push(musicObj);
        // console.log(player.musicList);
        var item = creatEle(player.musicList.length - 1,musicObj);
        $(".music_list ul").append(item);
        $(".log").stop().fadeIn(1000,function () {
            $(this).stop().fadeOut(1000);
        })
    }

    /**
     * 创建搜索到的歌曲条目
     * @param array
     */
    function creatSearchResultPage(array) {
        $.each(array,function (index,ele) {
            var minute = Math.floor(ele.time / 60) < 10 ? "0" + Math.floor(ele.time / 60) : Math.floor(ele.time / 60);
            var second = ele.time % 60 < 10 ? "0" + ele.time % 60 : ele.time % 60;
            var item = $('<li class="result_list">\n' +
                '                    <div class="list_number">' + (index + 1) + '</div>\n' +
                '                    <div class="list_name">' + ele.name + '</div>\n' +
                '                    <div class="list_singer">' + ele.singer + '</div>\n' +
                '                    <div class="list_time">' + minute + ':' + second + '</div>\n' +
                '                    <a href="javascript:;" class="list_add" title="添加到播放列表"><i class="srivenIcon-2"></i></a>\n' +
                '                </li>');
            item.get(0).index = index;
            item.get(0).music = ele;
            searchBox.append(item);
        });

    };


    /**
     * 创建元素
     * @param index
     * @param ele
     * @returns {*|jQuery|HTMLElement}
     */
    function creatEle(index, music) {
        var minute = Math.floor(music.songtime / 60) < 10 ? "0" + Math.floor(music.songtime / 60) : Math.floor(music.songtime / 60);
        var second = music.songtime % 60 < 10 ? "0" + music.songtime % 60 : music.songtime % 60;
        if(isNaN(minute) || isNaN(second)){
            minute = "00";
            second = "00";
        }
        // console.log(music.songtime);
        var str = $('<li class="music_info">\n' +
            '                        <div class="check_box"><i></i></div>\n' +
            '                        <div class="index">' + (index + 1) + '</div>\n' +
            '                        <div class="music_name">' + music.songname + '\n' +
            '                            <div class="music_menu">\n' +
            '                                <a href="javascript:;"title="播放" class="list_menu_play"><i class="srivenIcon-uniE900"></i></a>\n' +
            '                                <a href="javascript:;"title="添加"><i class="srivenIcon-2"></i></a>\n' +
            '                                <a href="javascript:;"title="分享"><i class="srivenIcon-1"></i></a>\n' +
            '                            </div>\n' +
            '                        </div>\n' +
            '                        <div class="music_singer">' + music.singer[0].name + '</div>\n' +
            '                        <div class="music_time"><span class="time">' + minute + ':' + second + '</span>\n' +
            '                            <a href="javascript:;"title="删除" class="del"><i class="srivenIcon-7"></i></a>\n' +
            '                        </div>\n' +
            '                    </li>');
        str.get(0).index = index;
        str.get(0).music = music;
        // console.log(index);
        return str;
    }
});