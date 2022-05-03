const express = require('express');
const router = express.Router();
const cheerio = require('cheerio');
const axios = require('axios');

// DEBUG
const fs = require('fs');

const URL_PROFILE = 'https://lostark.game.onstove.com/Profile/Character/';
const URL_COLLECTION = 'https://lostark.game.onstove.com/Profile/GetCollection';

function getProfile($) {
    let profile;

    // Profile 관련 정보만 parsing
    if ($('script')[2].children[0].data === '\n') {
        return null;
    }
    profile = $('script')[2].children[0].data.split('$.Profile = ')[1].split(';')[0];

    // DEBUG
    fs.writeFileSync('../../temp/profile.json', profile, 'utf-8');

    return JSON.parse(profile);
}
// 보유 캐릭터 리스트 추출
function getCharacters($) {
    let list = [];
    
    $('#expand-character-list > ul').children('li').map((i, li) => {
        let character = {};

        character.class = $(li).find('span > button > img').attr('alt');
        character.name = $(li).find('span > button > span').text();
        list.push(character);
    });

    return list;
}
// 직업 추출
function getClass($) {
    let cls = {};
    
    cls.name = $('#lostark-wrapper > div > main > div > div.profile-character-info > img').attr('alt');
    cls.imgSrc = $('#lostark-wrapper > div > main > div > div.profile-character-info > img').attr('src');

    return cls;
}
// 서버명 추출
function getServer($) {
    let server = $('.profile-character-info__server').text();

    return server;
}
// 레벨 정보 추출
// 원정대, 전투, 장착, 최대 도달 레벨
function getLevel($) {
    let level = {};

    level.expedition = $('#lostark-wrapper > div > main > div > div.profile-ingame > div.profile-info > div.level-info > div.level-info__expedition > span:nth-child(2)').text();
    level.battle = $('#lostark-wrapper > div > main > div > div.profile-ingame > div.profile-info > div.level-info > div.level-info__item > span:nth-child(2)').text();
    level.itemEquip = $('#lostark-wrapper > div > main > div > div.profile-ingame > div.profile-info > div.level-info2 > div.level-info2__expedition > span:nth-child(2)').text();
    level.itemMax = $('#lostark-wrapper > div > main > div > div.profile-ingame > div.profile-info > div.level-info2 > div.level-info2__item > span:nth-child(2)').text();

    return level;
}
// 칭호, 길드명, pvp등급, 영지이름 추출
function getGameInfo($) {
    let gameInfo = {};

    gameInfo.title = $('#lostark-wrapper > div > main > div > div.profile-ingame > div.profile-info > div.game-info > div.game-info__title > span:nth-child(2)').text();
    gameInfo.guild = $('#lostark-wrapper > div > main > div > div.profile-ingame > div.profile-info > div.game-info > div.game-info__guild > span:nth-child(2)').text();
    gameInfo.pvp = $('#lostark-wrapper > div > main > div > div.profile-ingame > div.profile-info > div.game-info > div.level-info__pvp > span:nth-child(2)').text();
    gameInfo.dominion = $('#lostark-wrapper > div > main > div > div.profile-ingame > div.profile-info > div.game-info > div.game-info__wisdom > span:nth-child(3)').text();

    return gameInfo;
}
// 특수장비 (나침반, 부적, pvp) 추출
function getSpecialItems($) {
    let specialItems = [];

    $('#lostark-wrapper > div > main > div > div.profile-ingame > div.profile-info > div.special-info > div > ul').children('li').map((i, v) => {
        let item = {};
        
        item.imgSrc = $(v).find('.slot_img > img').attr('src');
        item.dataGrade = $(v).find('.slot').attr('data-grade');
        item.name = $(v).find('div > span > p > font').text();
        if (item.imgSrc != null) {
            specialItems.push(item);
        }
    });

    return specialItems;
}
// 능력치 탭의 정보 추출
function getStats($) {
    let stats = {};
    let profile = getProfile($);

    // 기본 특성 (공격력, 최대 생명력)
    stats.abilityBasic = getAbilityBasic($);
    // 전투 특성 (치, 특, 신, 제, 인, 숙)
    stats.abilityBattle = getAbilityBattle($);
    // 각인 효과
    stats.engrave = getEngrave($);
    // 성향
    stats.propensity = getPropensity($);
    // 장비
    stats.equipment = getEquipment($, profile);
    // 보석
    stats.jewels = getJewel($, profile);
    // 카드
    stats.card = getCard($);

    return stats;
}
// 기본 특성 추출 (공격력, 최대 생명력)
function getAbilityBasic($) {
    let abilityBasic = {};

    abilityBasic.maxHp = $('#profile-ability > div.profile-ability-basic > ul > li:nth-child(2) > span:nth-child(2)').text();
    abilityBasic.attack = $('#profile-ability > div.profile-ability-basic > ul > li:nth-child(1) > div > ul > li:nth-child(2) > textformat > font:nth-child(2)').text();
    // 각인 (저주받은 인형, 공격력 감소) 효과
    abilityBasic.attackEngrave = $('#profile-ability > div.profile-ability-basic > ul > li:nth-child(1) > div > ul > li:nth-child(3) > textformat > font:nth-child(2)').text();

    return abilityBasic;
}
// 전투 특성 추출 (치명, 특화, 제압, 신속, 인내, 숙련)
function getAbilityBattle($) {
    let abilityBattle = {};
    let key = ['critical', 'specialization', 'domination', 'swift', 'endurance', 'expertise'];

    $('#profile-ability > div.profile-ability-battle > ul').children('li').map((i, v) => {
        abilityBattle[key[i]] = $($(v).children('span')[1]).text();
    });

    return abilityBattle;
}
// 각인 효과 추출
function getEngrave($) {
    let engrave = [];
    
    $('.profile-ability-engrave > div > div').children('ul').map((i, ul) => {
        $(ul).children('li').map((j, li) => {
            engrave.push($(li).find('span').text());
        });
    });

    return engrave;
}
// 성향 값 추출
function getPropensity($) {
    let propensity = {};
    let rawData = $('script')[12].children[0].data.trim().split(/value\: \[|\n|\]|,/);

    propensity.intelligence = rawData[18].trim();
    propensity.courage = rawData[20].trim();
    propensity.charm = rawData[22].trim();
    propensity.kindness = rawData[24].trim();

    return propensity;
}
// 착용 장비 추출
function getEquipment($, profile) {
    let equipment = {};
    let dataKey;    // data-item 속성에서 추출, 값이 null이면 빈칸(미장착)

    // 무기
    let $_weapon = $('.profile-equipment__slot').find('.slot6');
    dataKey = $($_weapon).attr('data-item');
    if (dataKey != null) {
        let weapon = {};
        
        weapon.dataGrade = $($_weapon).attr('data-grade');
        weapon.imgSrc = $($_weapon).find('img').attr('src');
        weapon.name = profile.Equip[dataKey].Element_000.value.split(/\<.*?\>/)[2];
        weapon.quality = profile.Equip[dataKey].Element_001.value.qualityValue;
        weapon.effect0 = profile.Equip[dataKey].Element_005.value.Element_001;
        weapon.effect1 = profile.Equip[dataKey].Element_006.value.Element_001;

        equipment.weapon = weapon;
    }
    // 방어구 (투구, 견갑, 상의, 하의, 장갑)
    let armors = [];
    for (let i = 1; i <= 5; i++) {
        let $_armor = $('.profile-equipment__slot').find(`.slot${i}`);
        dataKey = $($_armor).attr('data-item');
        if (dataKey != null) {
            let armor = {};

            armor.dataGrade = $($_armor).attr('data-grade');
            armor.imgSrc = $($_armor).find('img').attr('src');
            armor.name = profile.Equip[dataKey].Element_000.value.split(/\<.*?\>/)[2];
            armor.quality = profile.Equip[dataKey].Element_001.value.qualityValue;
            let effect = profile.Equip[dataKey].Element_005.value.Element_001;
            if (effect != null) {
                armor.effect0 = effect.split(/\<BR\>/);
            }
            effect = profile.Equip[dataKey].Element_006.value.Element_001;
            if (effect != null) {
                armor.effect1 = effect.split(/\<BR\>/);
            }

            armors.push(armor);
        }
    }
    equipment.armors = armors;
    // 악세 (목걸이, 귀걸이, 반지)
    let accessories = [];
    for (let i = 7; i <= 11; i++) {
        let $_acc = $('.profile-equipment__slot').find(`.slot${i}`);
        dataKey = $($_acc).attr('data-item');
        if (dataKey != null) {
            let accessory = {};

            accessory.dataGrade = $($_acc).attr('data-grade');
            accessory.imgSrc = $($_acc).find('img').attr('src');
            accessory.name = profile.Equip[dataKey].Element_000.value.split(/\<.*?\>/)[2];
            accessory.quality = profile.Equip[dataKey].Element_001.value.qualityValue;
            accessory.effect0 = [];
            profile.Equip[dataKey].Element_004.value.Element_001.split(/\<.*?\>/).map((v, i) => {
                if (v.length > 0) {
                    accessory.effect0.push(v);
                }
            });
            accessory.effect1 = [];
            profile.Equip[dataKey].Element_005.value.Element_001.split(/\<.*?\>/).map((v, i) => {
                if (v.length > 0) {
                    accessory.effect1.push(v);
                }
            });
            let engrave = profile.Equip[dataKey].Element_006.value.Element_001.split(/\<.*?\>|\[|\]/);
            accessory.engraves = [];
            accessory.engraves.push(engrave[2] + engrave[4]);
            accessory.engraves.push(engrave[7] + engrave[9]);
            accessory.penalty = (engrave[12] + engrave[14]);

            accessories.push(accessory);
        }
    }
    equipment.accessories = accessories;
    // 팔찌
    let $_bracelet = $('.profile-equipment__slot').find('.slot12');
    dataKey = $($_bracelet).attr('data-item');
    if (dataKey != null) {
        let bracelet = {};

        bracelet.dataGrade = $($_bracelet).attr('data-grade');
        bracelet.imgSrc = $($_bracelet).find('img').attr('src');
        bracelet.name = profile.Equip[dataKey].Element_000.value.split(/\<.*?\>/)[2];

        // 팔찌 효과 parsing
        let effects = [];
        // img태그를 기준으로 split (각 효과마다 img태그를 하나씩 가지고 있음)
        let effectSplited = profile.Equip[dataKey].Element_004.value.Element_001.split(/\<img.*?\>|\<\/img\>/);
        // split 결과에서 빈 문자열은 제거
        effectSplited.map((v, i) => {
            if (v.length > 0) {
                effects.push(v);
            }
        });
        // <BR> 태그 제거 (개행문자로 replace)
        effects.map((v, i) => {
            effects[i] = v.replace(/<BR>/g, '\n');
        });
        // style관련 태그를 제거
        effects.map((v, i) => {
            //let styleRemoved = v.split(/\[.*?\]|\<.*?\>/);
            v = v.replace(/\]/g, ' :');
            let styleRemoved = v.split(/\<.*?\>|\[/);
            
            // style관련 태그 제거 후 분리된 문자열들을 다시 합침
            let result = '';
            styleRemoved.map((u, j) => {
                if (u.length > 0) {
                    result += u;
                }
            });
            effects[i] = result.trim();
        });
        bracelet.effects = effects;

        equipment.bracelet = bracelet;
    }
    // 어빌리티 스톤
    let $_stone = $('.profile-equipment__slot').find('.slot13');
    dataKey = $($_stone).attr('data-item');
    if (dataKey != null) {
        let stone = {};

        stone.dataGrade = $($_stone).attr('data-grade');
        stone.imgSrc = $($_stone).find('img').attr('src');
        stone.name = profile.Equip[dataKey].Element_000.value.split(/\<.*?\>/)[2];
        stone.health = [];

        stone.health.push(profile.Equip[dataKey].Element_004.value.Element_001);
        stone.engraves = [];
        let effect = profile.Equip[dataKey].Element_005.value.Element_001;
        if (effect != null) {
            // [로 시작하면 각인 효과 (보너스 체력 효과 없음)
            if (effect[0] === '[') {
                let engraves = effect.split(/\<.*?\>|\[|\]/);

                stone.engraves.push(engraves[2] + engraves[4]);
                stone.engraves.push(engraves[7] + engraves[9]);
                stone.penalty = engraves[12] + engraves[14];
            } else {
                // 보너스 체력 효과가 있는 경우
                stone.health.push(effect);
                // 각인 효과까지 추가 추출
                effect = profile.Equip[dataKey].Element_006.value.Element_001;
                if (effect != null) {
                    let engraves = effect.split(/\<.*?\>|\[|\]/);

                    stone.engraves.push(engraves[2] + engraves[4]);
                    stone.engraves.push(engraves[7] + engraves[9]);
                    stone.penalty = engraves[12] + engraves[14];
                }
            }
        }
        equipment.stone = stone;
    }

    return equipment;
}
// 보석 추출
function getJewel($, profile) {
    let jewels = [];

    $('#profile-jewel > div > div.jewel__wrap').children('span').map((i, v) => {
        let jewel = {};
        let dataKey = $(v).attr('data-item');

        if (dataKey != null) {
            jewel.dataGrade = $(v).attr('data-grade');
            jewel.imgSrc = $($(v).children('span')[1]).find('img').attr('src');
            jewel.level = profile.Equip[dataKey].Element_001.value.slotData.rtString;
            jewel.name = profile.Equip[dataKey].Element_000.value.split(/\<.*?\>/)[2];
            // 보석 효과 설명에서 style관련 태그 제거
            let tagRemoved = profile.Equip[dataKey].Element_004.value.Element_001.split(/\[.*?\]|\<.*?\>/);
            let effect = [];
            // 유효한 문자열만 추출
            tagRemoved.map((v, i) => {
                if (v.trim().length > 0) {
                    effect.push(v.trim());
                }
            });
            jewel.effect = {};
            // 적용 스킬
            jewel.effect.skill = effect[0];
            // 적용 효과
            jewel.effect.effect = effect[1];
            jewels.push(jewel);
        }
    });

    return jewels;
}
// 카드 효과 추출
function getCard($) {
    let cards = [];

    $('#cardSetList').children('li').map((i, v) => {
        let card = {};

        card.title = $(v).find('div.card-effect__title').text();
        card.effect = $(v).find('div.card-effect__dsc').text();
        cards.push(card);
    });

    return cards;
}
// 스킬 포인트 및 세부정보 추출
function getSkill($) {
    let skill = {};

    skill.point = getSkillPoint($);
    skill.skills = getSkillDetail($);

    return skill;
}
// 스킬 포인트 추출
function getSkillPoint($) {
    let point = {};

    // 사용 포인트
    point.use = $('#profile-skill > div.profile-skill-battle > div.profile-skill__point > em:nth-child(1)').text();
    // 보유 포인트
    point.total = $('#profile-skill > div.profile-skill-battle > div.profile-skill__point > em:nth-child(2)').text();

    return point;
}
// 트라이포드 등 스킬 세부정보 추출
function getSkillDetail($) {
    let skills = [];
    let profile = getProfile($);
    
    $('#profile-skill > div.profile-skill-battle > div.profile-skill__list').children('div').map((i, v) => {
        let level = $(v).find('a > div.profile-skill__lv > em').text();
        let rune = $(v).find('a > div.profile-skill__lun').attr('data-runetooltip');
        
        // 레벨을 올렸거나, 룬을 착용한 스킬만 추출
        if (Number(level) > 1 || rune != null) {
            let skill = {};
            let dataKey = $(v).find('a > div.profile-skill__slot').attr('data-item');
            
            skill.level = level;
            skill.imgSrc = $(v).find('a > div.profile-skill__slot > img').attr('src');
            skill.name = profile.Skill[dataKey].Element_000.value;

            let tripods = [];
            let runeElementKey;
            for (let i = 0; i < 3; i++) {
                let element;

                // 자원 소모 유무에 따라 트라이포드와 룬정보의 key값이 달라짐
                // 자원소모O 트포O -> Element_006(트포) & Element_007(룬)
                // 자원소모X 트포O -> Element_005(트포) & Element_006(룬)
                // 자원소모X 트포X -> Element_005(룬)
                let type = profile.Skill[dataKey].Element_005.type;
                if (type === 'TripodSkillCustom') {
                    element = profile.Skill[dataKey].Element_005.value[`Element_00${i}`];
                    runeElementKey = 'Element_006';
                } else if (type === 'SingleTextBox') {
                    element = profile.Skill[dataKey].Element_006.value[`Element_00${i}`];
                    runeElementKey = 'Element_007';
                } else {
                    runeElementKey = 'Element_005';
                }

                if (element != null && element.lock === false) {
                    let tripod = {};

                    tripod.name = element.name.split(/\<.*?\>/)[1];
                    tripod.level = element.tier.split(/\<.*?\>/)[1];
                    tripods.push(tripod);
                }
            }
            skill.tripods = tripods;
            if (rune != null) {
                let rune = {};
                
                rune.dataGrade = $(v).find('a > div.profile-skill__lun').attr('data-grade');
                rune.imgSrc = $(v).find('a > div.profile-skill__lun > img').attr('src');
                let effect = profile.Skill[dataKey][runeElementKey].value.Element_001.split(/\<.*?\>|\[|\]/);
                
                rune.name = effect[2].trim();
                rune.effect = effect[4].trim();
                skill.rune = rune;
            }
            skills.push(skill);
        }
    });

    return skills;
}
// 수집품 추출을 위한 parameter(memberNo) 추출
function getMemberNo($) {
    let rawData = $('script')[12].children[0].data.trim().split(/_memberNo = \'|\'\;/);
    return rawData[1];
}
// 수집품 추출을 위한 parameter(pcId) 추출
function getPcId($) {
    let rawData = $('script')[12].children[0].data.trim().split(/_pcId = \'|\'\;/);
    return rawData[2];
}
// 수집품 추출을 위한 parameter(worldNo) 추출
function getWorldNo($) {
    let rawData = $('script')[12].children[0].data.trim().split(/_worldNo = \'|\'\;/);
    return rawData[3];
}
// 수집품 정보 추출
function getCollection($) {
    const lists = ['island', 'star', 'heart', 'art', 'seed', 'voyage', 'medal', 'tree'];
    let collections = {};
    let i = 1;

    for (let name of lists) {
        let selectorNow = `#lui-tab1-${i} > div > div.collection-list > div > p > span.now-count`;
        let selectorMax = `#lui-tab1-${i} > div > div.collection-list > div > p > span.max-count`;
        let selectorList = `#lui-tab1-${i} > div > div.collection-list > ul`;
        let collection = {};

        // 수집 포인트
        collection.point = {};
        collection.point.now = $(selectorNow).text();
        collection.point.max = $(selectorMax).text();
        // 수집 목록
        collection.list = [];
        $(selectorList).children('li').map((j, li) => {
            let element = {};

            // 모코코 씨앗 외 : { name, acquire }
            if (i != 5) {
                let replace = j + 1;
                let regex = new RegExp(replace);

                element.name = $(li).text().replace(regex, '').split(' 획득')[0];
                if ($(li).attr('class') != null) {
                    element.acquire = true;
                } else {
                    element.acquire = false;
                }
            } else {
                // 모코코 씨앗 정보 : { now, max, continent }
                element.now = $(li).find('em > span:nth-child(1)').text();
                element.max = $(li).find('em > span:nth-child(2)').text();
                
                let replace = j + 1;
                let regex = new RegExp(replace);
                element.continent = $(li).text().replace(/\n/g, '').trim().replace(regex, '');
                replace = element.now;
                regex = new RegExp(replace);
                element.continent = element.continent.split(regex)[0].trim();
            }
            collection.list.push(element);
        });

        collections[name] = collection;
        i++;
    }

    return collections;
}

/*
반환 객체 형식
{
    exist,
    name,
    characterList[] : {class, name},
    class : {name, imgSrc},
    server,
    level : {expedition, battle, itemEquip, itemMax},
    gameInfo : {title, guild, pvp, dominion},
    specialItems[] : {imgSrc, dataGrade, name},
    stats : {
        abilityBasic : {maxHp, attack, attackEngrave},
        abilityBattle : {critical, specialization, domination, swift, endurance, expertise},
        engrave[],
        propensity : {intelligence, courage, charm, kindness},
        equipment : {
            weapon : {dataGrade, imgSrc, name, quality, effect0, effect1},
            armors[] : {dataGrade, imgSrc, name, quality, effect0, effect1},
            accessories[] : {dataGrade, imgSrc, name, quality, effect0, effect1, engraves[], penalty},
            bracelet : {dataGrade, imgSrc, name, effects[]},
            stone : {dataGrade, imgSrc, name, health[], engraves[], penalty},
            jewels[] : {dataGrade, imgSrc, level, name, effect : {skill, effect}},
            card[] : {title, effect}
        }
    },
    skill : {
        point : {use, total}, 
        skills[] : {
            level, 
            imgSrc, 
            name, 
            tripods[] : {name, level}, 
            rune : {dataGrade, imgSrc, name, effect}
        }
    },
    collection : {
        island : { point : {now, max}, list : [...{name, acquire}] },
        star : { point : {now, max}, list : [...{name, acquire}] },
        heart : { point : {now, max}, list : [...{name, acquire}] },
        art : { point : {now, max}, list : [...{name, acquire}] },
        seed : { point : {now, max}, list : [...{now, max, continent}] },
        voyage : { point : {now, max}, list : [...{name, acquire}] },
        medal : { point : {now, max}, list : [...{name, acquire}] },
        tree : { point : {now, max}, list : [...{name, acquire}] }
    }
}
*/
router.get('/:nickname', (req, res) => {
    let info = {};

    if (req.params.nickname != null) {
        let url = URL_PROFILE + encodeURI(req.params.nickname);
        let collectionParam = {};

        axios.get(url).then((result) => {
            let html = result.data;
            let $ = cheerio.load(html);
            let find = $($('.profile-attention').children('span')[1]).text();

            if (find == '캐릭터명을 확인해주세요.') {
                info.exist = false;
                res.send(info);
            } else {
                // DEBUG
                fs.writeFileSync('../../temp/profile.html', html, 'utf-8');

                info.exist = true;
                info.name = req.params.nickname;
                info.characterList = getCharacters($);
                info.class = getClass($);
                info.server = getServer($);
                info.level = getLevel($);
                info.gameInfo = getGameInfo($);
                info.specialItems = getSpecialItems($);
                info.stats = getStats($);
                info.skill = getSkill($);

                collectionParam.memberNo = getMemberNo($);
                collectionParam.worldNo = getWorldNo($);
                collectionParam.pcId = getPcId($);

                url = URL_COLLECTION;
                axios.post(url, collectionParam).then((result) => {
                    html = result.data;
                    $ = cheerio.load(html);

                    // DEBUG
                    fs.writeFileSync('../../temp/collection.html', html, 'utf-8');

                    info.collection = getCollection($);
                    res.send(info);
                });
            }
        });
    } else {
        data.exist = false;
        res.send(info);
    }
});

module.exports = router;