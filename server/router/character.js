const express = require('express');
const router = express.Router();
const cheerio = require('cheerio');
const axios = require('axios');

function GetProfile(html) {
    let profile;
    let $ = cheerio.load(html);

    // Profile 관련 정보만 parsing
    if ($('script')[2].children[0].data === '\n') {
        return null;
    }
    profile = $('script')[2].children[0].data.split('$.Profile = ')[1].split(';')[0];

    return JSON.parse(profile);
}
function ParseLevel(html) {
    let levelData = {expedition:0, battle:0, item:0};
    let $ = cheerio.load(html);

    levelData.expedition = $($('.level-info__expedition').children('span')[1]).text().substring(3);
    levelData.battle = $($('.level-info__item').children('span')[1]).text().substring(3);
    levelData.item = $($('.level-info2__expedition').children('span')[1]).text().substring(3);

    return levelData;
}
function ParseAbility(html) {
    let abilityData = {basic: {attack: 0, engrave:0, maxHP: 0}, battle: {치명:0, 특화:0, 신속:0, 제압:0, 인내:0, 숙련:0 }};
    let $ = cheerio.load(html);

    // 공격력 parsing
    let att = $('.profile-ability-basic').children('ul').children('li')[0];
    let lists = $(att).children('div').children('ul').children('li');
    let defaultAtt = $($(lists[1]).children('textformat').children('font')[1]).text();
    let engraveAtt = $($(lists[2]).children('textformat').children('font')[1]).text();
    abilityData.basic.attack = defaultAtt;
    abilityData.basic.engrave = engraveAtt;

    // hp값 parsing
    let hp = $($($('.profile-ability-basic').children('ul').children('li')[1]).children('span')[1]).text();
    abilityData.basic.maxHP = hp;

    // 전투 특성 parsing
    $('.profile-ability-battle').children('ul').children('li').map((i, element) => {
        let type = $($(element).children('span')[0]).text();
        let value = $($(element).children('span')[1]).text();
        abilityData.battle[type] = value;
    });

    return abilityData;
}
function ParseEngrave(html) {
    let engraveData = [];   // {engrave, level}
    let $ = cheerio.load(html);

    let engraveList = $('.profile-ability-engrave div div ul');
    engraveList.map((i, ul) => {
        if (ul != undefined) {
            $(ul).children('li').map((i, li) => {
                if (li != undefined) {
                    let engrave = $(li).children('span').text().split(' Lv. ');
                    // [0] : 각인 이름, [1] : level
                    engraveData.push({engrave:engrave[0], level:engrave[1]});
                }
            });
        }
    });

    return engraveData;
}
function ParseEquipment(html, equip) {
    let equipmentData = {equip:[], accessory:[], stone:{}, bracelet:{}};
    let $ = cheerio.load(html);
    let itemKey = [];

    $('.profile-equipment__slot').children('div').map((i, div) => {
        let key = $(div).attr('data-item');

        // 장비탭에서 각인을 제외한 정보만 가져옴
        if (key != undefined && key[0] === 'E') {
            itemKey.push(key);
        }
    });
    itemKey.sort();

    itemKey.map(item => {
        let itemCode = Number(item.slice(-3));

        // 장비
        if (itemCode >= 0 && itemCode <= 5) {
            let eq = {name:"", quality:0, iconPath:""};

            eq.name = equip[item].Element_000.value.toLowerCase();
            eq.quality = equip[item].Element_001.value.qualityValue;
            eq.iconPath = 'https://cdn-lostark.game.onstove.com/' + equip[item].Element_001.value.slotData.iconPath;
            equipmentData.equip.push(eq);
        }
        // 장신구
        else if (itemCode >= 6 && itemCode <= 10) {
            let acc = {name:"", quality:0, value:"", iconPath:""};

            acc.name = equip[item].Element_000.value.toLowerCase();
            acc.quality = equip[item].Element_001.value.qualityValue;
            acc.value = equip[item].Element_005.value.Element_001.toLowerCase();
            acc.iconPath = 'https://cdn-lostark.game.onstove.com/' + equip[item].Element_001.value.slotData.iconPath;
            equipmentData.accessory.push(acc);
        }
        // 돌
        else if (itemCode === 11) {
            let st = {name:"", baseHP:"", bonusHP:"", engrave:"", iconPath:""};

            st.name = equip[item].Element_000.value.toLowerCase();
            st.baseHP = equip[item].Element_004.value.Element_001;
            if (Object.entries(equip[item]).length === 9) {
                st.bonusHP = 0;
                st.engrave = equip[item].Element_005.value.Element_001.toLowerCase();
            } else {
                st.bonusHP = equip[item].Element_005.value.Element_001;
                st.engrave = equip[item].Element_006.value.Element_001.toLowerCase();
            }
            st.iconPath = 'https://cdn-lostark.game.onstove.com/' + equip[item].Element_001.value.slotData.iconPath;
            equipmentData.stone = st;
        }
        // 팔찌
        else if (itemCode === 26) {
            let brc = {name:"", effect:[], iconPath:""};

            brc.name = equip[item].Element_000.value.toLowerCase();

            // effect parsing - img태그 제거
            let effs = equip[item].Element_004.value.Element_001.toLowerCase();
            effs = effs.split(/<img.*?>|<\/img>|<br>/);
            effs.map((e) => {
                if (e != '') {
                    brc.effect.push(e);
                }
            });
            brc.iconPath = 'https://cdn-lostark.game.onstove.com/' + equip[item].Element_001.value.slotData.iconPath;
            equipmentData.bracelet = brc;
        }
    });

    return equipmentData;
}
function ParseJewel(html, profile) {
    let jewelData = []; // {iconPath, level, desc}
    let $ = cheerio.load(html);

    // {index, desc}
    let myuls = [];
    let hongs = [];
    // 장착 슬롯(index)과 보석 효과 추출 (효과에 따라 멸화, 홍염 구분)
    if (profile.GemSkillEffect == undefined) {
        return null;
    }
    profile.GemSkillEffect.map((element) => {
        if (element != undefined) {
            let index = element.EquipGemSlotIndex;
            let desc = element.SkillDesc.toLowerCase();;

            if (desc.slice(-2) === '증가') {
                myuls.push({index:index, desc:desc});
            } else if (desc.slice(-2) === '감소') {
                hongs.push({index:index, desc:desc});
            }
        }
    });
    // profile에서 사용할 key값을 html에서 추출
    let dataItems = [];
    $('.jewel__wrap').children('span').map((i, element) => {
        if (element != undefined) {
            dataItems.push($(element).attr('data-item'));
        }
    });
    // profile에서 iconPath와 보석레벨 정보 추출
    myuls.map((myul) => {
        let key = dataItems[myul.index];
        let slotData = profile.Equip[key].Element_001.value.slotData;
        let iconPath = 'https://cdn-lostark.game.onstove.com/' + slotData.iconPath;
        let level = slotData.rtString;

        jewelData.push({iconPath:iconPath, level:level, desc:myul.desc});
    });
    hongs.map((hong) => {
        let key = dataItems[hong.index];
        let slotData = profile.Equip[key].Element_001.value.slotData;
        let iconPath = 'https://cdn-lostark.game.onstove.com/' + slotData.iconPath;
        let level = slotData.rtString;

        jewelData.push({iconPath:iconPath, level:level, desc:hong.desc});
    });

    return jewelData;
}
function ParseCard(cardSet) {
    let card = [];  // {desc, title}
    
    for (let i = 0; i < 6; i++) {
        let key = 'Effect_00' + i;
        let value = cardSet.CardSetEffect_000[key];
        
        if (value !== undefined) {
            card.push(value);
        }
    }

    return card;
}

router.get('/profile/:nickname', (req, res) => {
    if (req.params.nickname != null) {
        let url = 'https://lostark.game.onstove.com/Profile/Character/' + encodeURI(req.params.nickname);
        let profile;
        let data = {
            Name:"",
            Level:{expedition:0, battle:0, item:0}, 
            Ability:{basic:{attack:0, engrave:0, maxHP:0}, battle:{치명:0, 특화:0, 신속:0, 제압:0, 인내:0, 숙련:0}}, 
            Engrave:[], 
            Equipment:{equip:[], accessory:[], stone:{name:"", baseHP:"", bonusHP:"", engrave:"", iconPath:""}, bracelet:{name:"", effect:[], iconPath:""}}, 
            Jewel:[], 
            Card:[]
        };

        axios.get(url).then((result) => {
            let html = result.data;
            let $ = cheerio.load(html);
            let find = $($('.profile-attention').children('span')[1]).text();

            if (find == '캐릭터명을 확인해주세요.') {
                data.Name = '존재하지 않는 캐릭터명입니다.';
                res.send(data);
            } else {
                data.Name = req.params.nickname;
                profile = GetProfile(html);
                
                // DEBUG
                // fs.writeFileSync('../../temp/profile.html', html, 'utf-8');

                data.Level = ParseLevel(html);
                data.Ability = ParseAbility(html);
                data.Engrave = ParseEngrave(html);
                if (profile != null) {
                    data.Equipment = ParseEquipment(html, profile.Equip);
                    data.Jewel = ParseJewel(html, profile);
                    data.Card = ParseCard(profile.CardSet);
                }
                res.send(data);
            }
        });
    }
});

router.get('/diff/:nickname1/:nickname2', (req, res) => {
    
});

module.exports = router;