var rule = {
    类型: '影视',
    title: 'TG盘搜',
    author: 'wow',
    desc: '仅供测试',
    logo: 'https://api.xinac.net/icon/?url=https://t.me',
    host: 'https://t.me',
    url: '/s/fyclass',
    searchUrl: '?q=**',
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
        'Cookie': 'stel_dt=-480;'
    },
    searchable: 1,
    quickSearch: 1,
    filterable: 0,
    play_parse: true,
    timeout: 10000,
    page_before: '',
    spage_before: [],
    home_flag: '5',
    hikerListCol: 'icon_4',
    class_parse: async function () {
        let classes = [];
        try{
            classes = JSON.parse(ENV.get('tg_channel'));
        } catch(e){
            classes = [{type_name:'夸克云盘综合资源',type_id:'Quark_Movies'},{type_name:'UC网盘资源发布频道',type_id:'ucpanpan'}];
        }
        return {class: classes}
     },
    lazy: async function () {
    },
    推荐: async function () {
        let {publicUrl} = this;
        return [{
            vod_id: JSON.stringify(action_AddTgChannel),
            vod_pic: urljoin(publicUrl, './images/icon_cookie/设置.png'),
            vod_name: '添加TG频道',
            vod_tag:'action'
        }]
    },
    一级: async function () {
        let {input, pdfa, pdfh, pd, MY_PAGE} = this;
        let d = [];
        if(MY_PAGE!==1){
            input = rule.page_before;
        }
        let html = await request(input,{headers:rule.headers,timeout: 10000});
        rule.page_before = pd(html,'.tgme_widget_message_centered&&a&&href');
        let list = pdfa(html,'.tgme_main&&.tgme_widget_message_bubble');
        list.forEach((it) => {
            let vod = pdfh(it,'.tgme_widget_message_text&&Html').split('<br>');
            let vod1 = pdfh(it,'.tgme_widget_message_text&&Html').split('\n');
            let playUrls = pdfa(it,'.tgme_widget_message_text&&a').map((item)=>{
                let url = decodeURIComponent(pdfh(item,'a&&href'));
                if(/www.123684.com/.test(url)&&!url.includes('?')&&url.includes('提取码')){
                    let urls = url.split('提取码');
                    url = urls[0].endsWith('?')?url:(urls[0]+'?提取码'+urls[1]);
                }
                return pdfh(item,'a&&Text')+'$push://'+url;
            }).filter((item)=>/drive.uc.cn|pan.quark.cn|cloud.189.cn|www.alipan.com|www.aliyundrive.com|caiyun.139.com|yun.139.com|www.123684.com/.test(item));
            let playFroms = playUrls.map((item)=>{
                return item.split('$')[0];
            }).join('$$$');
            playUrls = playUrls.join('$$$');
            let title = vod[0].replace(/<[^>]+>/g, "");
            if(title.includes('：')){
                title = title.split('：')[1] || title.split('：')[0];
            }
            let content = vod[2]||'';
            if(content.includes('：')){
                content = content.split('：')[1];
            }
            if(/www.123684.com/.test(playUrls)){
                content = vod1[0];
            }
            let pic = pdfh(it,'.tgme_widget_message_photo_wrap&&style');
            if (playUrls&&/drive.uc.cn|pan.quark.cn|cloud.189.cn|www.alipan.com|www.aliyundrive.com|caiyun.139.com|yun.139.com|www.123684.com/.test(playUrls)){
                d.push({
                    vod_name: title,
                    vod_remarks: pdfh(it,'time&&datetime').split('T')[0]+' '+pdfh(it,'time&&Text'),
                    vod_pic: pic,
                    vod_id: JSON.stringify({
                         vod_name: title,
                         vod_pic: pic,
                         vod_content: content,
                         vod_play_from: playFroms,
                         vod_play_url: playUrls
                    })
                })
            }
        })
        return d.reverse();
    },
    二级: async function (ids) {
        let {input} = this;
        let vod = JSON.parse(ids);
        return vod;
    },
    搜索: async function () {
        let {input, pdfa, pdfh, pd, KEY, MY_PAGE} = this;
        let d = [];
        let channelList = [];
        try{
            channelList = JSON.parse(ENV.get('tg_channel')).map((item)=>{
                return item.type_id;
            });
        } catch(e){
            channelList = ['Quark_Movies','ucpanpan'];
        }
        let htmlUrl = channelList.map((channel) => {
            return {
                url: `${rule.host}/s/${channel}?q=${KEY}`,
                options: {
                    timeout: 10000,
                    headers: rule.headers
                }
            }
        });
        if(MY_PAGE!==1){
            htmlUrl = rule.spage_before.map((url) => {
                return {
                    url: url,
                    options: {
                        timeout: 10000,
                        headers: rule.headers
                    }
                }
            });
        }
        let htmlArr = await batchFetch(htmlUrl);
        //let d = [];
        htmlArr.map((html,i) => {
            if(/after/.test(rule.spage_before[i])){
                rule.spage_before[i] = '';
            } else{
            rule.spage_before[i] = pd(html,'.tgme_widget_message_centered&&a&&href');
            }
            let list = pdfa(html,'.tgme_main&&.tgme_widget_message_bubble');
            list.forEach((it) => {
                let vod = pdfh(it,'.tgme_widget_message_text&&Html').split('<br>');
                let vod1 = pdfh(it,'.tgme_widget_message_text&&Html').split('\n');
                let playUrls = pdfa(it,'.tgme_widget_message_text&&a').map((item)=>{
                    let url = decodeURIComponent(pdfh(item,'a&&href'));
                    if(/www.123684.com/.test(url)&&!url.includes('?')&&url.includes('提取码')){
                        let urls = url.split('提取码');
                        url = urls[0].endsWith('?')?url:(urls[0]+'?提取码'+urls[1]);
                    }
                    return pdfh(item,'a&&Text')+'$push://'+url;
                }).filter((item)=>/drive.uc.cn|pan.quark.cn|cloud.189.cn|www.alipan.com|www.aliyundrive.com|caiyun.139.com|yun.139.com|www.123684.com/.test(item));
                let playFroms = playUrls.map((item)=>{
                    return item.split('$')[0];
                }).join('$$$');
                playUrls = playUrls.join('$$$');
                let title = vod[0].replace(/<[^>]+>/g, "");
                if(title.includes('：')){
                    title = title.split('：')[1] || title.split('：')[0];
                }
                let content = vod[2]||'';
                if(content.includes('：')){
                    content = content.split('：')[1];
                }
                if(/www.123684.com/.test(playUrls)){
                    content = vod1[0];
                }
                let pic = pdfh(it,'.tgme_widget_message_photo_wrap&&style');
                if (playUrls&&/drive.uc.cn|pan.quark.cn|cloud.189.cn|www.alipan.com|www.aliyundrive.com|caiyun.139.com|yun.139.com|www.123684.com/.test(playUrls)){
                    d.push({
                        vod_name: title,
                        vod_remarks: channelList[i],
                        vod_content: pdfh(it,'time&&datetime').split('T')[0]+' '+pdfh(it,'time&&Text'),
                        vod_pic: pic,
                        vod_id: JSON.stringify({
                             vod_name: title,
                             vod_pic: pic,
                             vod_content: content,
                             vod_play_from: playFroms,
                             vod_play_url: playUrls
                        })
                    })
                }
            })
        })
        return d;
    },
    action: async function (action, value) {
        if (action == '添加TG频道') {
            let content = JSON.parse(value);
            if(content.channelId){
                const channelNameList = content.channelName.split('&');
            const channelIdList = content.channelId.split('&');
                let tg_channel = [];
                try{
                    tg_channel = JSON.parse(ENV.get('tg_channel'));
                } catch(e){}
                let new_channel = channelIdList.map((item,index)=>{
                    return {type_name:channelNameList[index]||'未知',type_id:item};
                });
                tg_channel = mergeArrays(tg_channel,new_channel);
                ENV.set('tg_channel',JSON.stringify(tg_channel));
                return '频道已添加！刷新接口查看';
                //重启nodejs服务后生效';
            }
            return '未填写完整频道信息！';
        }
        return `没有动作:${action}的可执行逻辑`
    }
}

const action_AddTgChannel = {
    actionId: '添加TG频道',
    type: 'multiInput',
    title: '设置TG频道',
    width: 550,
    msg: '多个频道使用&隔开',
    input: [
        {
            id: 'channelName',
            name: 'TG频道名称',
            tip: '请输入频道名',
            value: ''
        },
        {
            id: 'channelId',
            name: 'TG频道ID',
            tip: 't.me/后面部分为频道ID',
            value: ''
        }
    ]
}

function mergeArrays(arr1, arr2) {
    const uniqueElements = new Map();
    const result = [];
    const combined = arr1.concat(arr2);
    for (let item of combined) {
        const key = `${item.type_name}-${item.type_id}`;
        if (!uniqueElements.has(key)) {
            result.push(item);
            uniqueElements.set(key, true);
        }
    }
    return result;
}
