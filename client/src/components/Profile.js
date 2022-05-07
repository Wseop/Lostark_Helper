import { React, useEffect, useState } from 'react';
import { Container, InputGroup, FormControl, Button, Row, Col, Tabs, Tab, OverlayTrigger, ProgressBar, Modal } from 'react-bootstrap';
import axios from 'axios';
import '../App.css';
import classIcon from './classIcon.js';

const Search = (props) => {
    const URL_GET_CHARACTER = `${process.env.REACT_APP_URL_SERVER}/character`;

    axios.get(`${URL_GET_CHARACTER}/${props.name}`)
    .then((result) => {
        props.setInfo(result.data);
        if (props.setName != null) {
            props.setName('');
        }
    })
    .catch((err) => {
        console.log(err);
    });
};

function SearchCharacter(props) {
    const [name, setName] = useState('');

    return (
        <InputGroup className="mt-3 mb-3">
            <FormControl placeholder="캐릭터명을 입력하세요."  value={name}
                onChange={(event) => {
                    setName(event.target.value);
                }} 
                onKeyPress={(event) => {
                if (event.key === 'Enter') { 
                    Search({name:name, setInfo:props.setInfo, setName:setName}); 
                }
            }}/>
            <Button variant="secondary" onClick={() => {Search({name:name, setInfo:props.setInfo, setName:setName})}}>검색</Button>
        </InputGroup>
    )
}

function CharacterInfo(props) {
    const info = props.info;

    const Title = () => {
        const characters = info.characterList;
        const [listShow, setListShow] = useState(false);

        const CharacterList = () => {
            let length = characters.length;

            return (
                [...Array(parseInt(((length - 1) / 3) + 1))].map((v, i) => {
                    return (
                        <Row key={i}>
                            {
                                [...Array(3)].map((u, j) => {
                                    let index = i * 3 + j;

                                    if (index >= length) {
                                        return <Col key={j} className="pt-2 pb-2"></Col>
                                    } else {
                                        return (
                                            <Col key={j} className="hoverable pt-2 pb-2" style={{cursor:"pointer"}} onClick={() => {
                                                    Search({name:characters[i * 3 + j].name, setInfo:props.setInfo})
                                                }}>
                                                <Row className="align-items-center text-center">
                                                    {
                                                        classIcon[characters[i * 3 + j].class] == null ? <Col xs={1} className="ps-5 pe-0" style={{height:"46px"}}></Col> :
                                                        <Col xs={1} className="ps-5 pe-0"><img src={classIcon[characters[i * 3 + j].class]} height="46px"/></Col>
                                                    }
                                                    <Col className="ps-0"><span>{characters[i * 3 + j].name}</span></Col>
                                                </Row>
                                            </Col>
                                        )
                                    }
                                })
                            }
                            <hr className="m-0" />
                        </Row>
                    )
                })
            )
        }

        return (
            <Container className="p-1 bg-dark text-light">
                <Row className="align-items-center">
                    <Col></Col>
                    <Col>
                        <img src={info.class.imgSrc} />
                        <span className="fw-bold">&nbsp;{info.name}</span>
                        <span className="fw-bold text-warning">&nbsp;{info.server}</span>
                    </Col>
                    <Col className="text-end">
                        <span className="me-3 fw-bold" style={{cursor:"pointer"}} onClick={() => setListShow(true)}>보유 캐릭터 ▼</span>

                        <Modal size="xl" show={listShow} onHide={() => {setListShow(false)}} aria-labelledby="modal-character-list">
                            <Modal.Header className="bg-dark text-light fw-bold" closeButton id="modal-character-list">
                                <span >보유 캐릭터&nbsp;({characters.length})</span>
                            </Modal.Header>
                            <Modal.Body className="pt-0 pb-1 bg-dark text-light fw-bold text-start">
                                {
                                    characters.length == null ? null : <CharacterList />
                                }
                            </Modal.Body>
                        </Modal>
                    </Col>
                </Row>
            </Container>
        )
    };
    const Level = () => {
        const level = info.level;

        return (
            <Container className="m-0 mb-1 me-0 p-2 bg-dark text-light">
                <Row>
                    <Col className="mt-1">
                        <p className="m-0 bg-secondary rounded-pill">전투 레벨</p>
                        <p className="m-2 fw-bold">{level.battle}</p>
                    </Col>
                    <Col className="mt-1">
                        <p className="m-0 bg-secondary rounded-pill">원정대 레벨</p>
                        <p className="m-2 fw-bold">{level.expedition}</p>
                    </Col>
                </Row>
                <Row className="mt-2">
                    <Col>
                        <p className="m-0 bg-secondary rounded-pill">장착 아이템 레벨</p>
                        <p className="m-2 fw-bold mb-0" style={{color:"#ff009b"}}>{level.itemEquip}</p>
                    </Col>
                    <Col>
                        <p className="m-0 bg-secondary rounded-pill">달성 아이템 레벨</p>
                        <p className="m-2 fw-bold mb-0" style={{color:"#f7b838"}}>{level.itemMax}</p>
                    </Col>
                </Row>
            </Container>
        )
    };
    const GameInfo = () => {
        const gameInfo = info.gameInfo;

        return (
            <Container className="m-0 mb-1 me-0 p-2 bg-dark text-light">
                <Row>
                    <Col className="mt-1">
                        <p className="m-0 bg-secondary rounded-pill">칭호</p>
                        <p className="m-2 fw-bold">{gameInfo.title}</p>
                    </Col>
                    <Col className="mt-1">
                        <p className="m-0 bg-secondary rounded-pill">길드</p>
                        <p className="m-2 fw-bold">{gameInfo.guild}</p>
                    </Col>
                </Row>
                <Row className="mt-2">
                    <Col>
                        <p className="m-0 bg-secondary rounded-pill">PVP</p>
                        <p className="m-2 fw-bold mb-0">{gameInfo.pvp}</p>
                    </Col>
                    <Col>
                        <p className="m-0 bg-secondary rounded-pill">영지</p>
                        <p className="m-2 fw-bold mb-0">{gameInfo.dominion}</p>
                    </Col>
                </Row>
            </Container>
        )
    };
    const AbilityBasic = () => {
        const abilityBasic = info.stats.abilityBasic;

        const AttackDetail = () => {
            return (
                <Container className="p-2 bg-secondary text-light w-auto">
                    <div className="mb-2">
                        <p className="m-0" style={{color:"#a9d0f5"}}>기본 공격력</p>
                        <p className="m-0">{abilityBasic.attack}</p>
                    </div>
                    <div>
                        <p className="m-0" style={{color:"#a9d0f5"}}>각인 효과</p>
                        <p className="m-0">{abilityBasic.attackEngrave}</p>
                    </div>
                </Container>
            )
        };
        return (
            <Container className="m-0 mb-1 p-2 bg-dark text-light">
                <p className="m-0 mb-1 bg-secondary rounded-pill mx-auto text-center w-50">기본 특성</p>
                <Row>
                    <Col>
                        <p className="m-0 fw-bold" style={{color:"#e4ba27"}}>공격력</p>
                        <p className="m-0 fw-bold" style={{color:"#e4ba27"}}>최대 생명력</p>    
                    </Col>
                    <Col>
                        <OverlayTrigger placement="right" overlay={AttackDetail()}>
                            <p className="m-0 fw-bold">{Number(abilityBasic.attack) + Number(abilityBasic.attackEngrave)}</p>
                        </OverlayTrigger>
                        <p className="m-0 fw-bold">{abilityBasic.maxHp}</p>
                    </Col>
                </Row>
            </Container>
        )
    };
    const AbilityBattle = () => {
        const abilityBattle = info.stats.abilityBattle;

        return (
            <Container className="m-0 mb-1 p-2 bg-dark text-light">
                <p className="m-0 mb-1 bg-secondary rounded-pill mx-auto text-center w-50">전투 특성</p>
                <Row>
                    <Col>
                        <Row><div className="text-start ms-5 fw-bold"><span style={{color:"#e4ba27"}}>치명&nbsp;</span><span>{abilityBattle.critical}</span></div></Row>
                        <Row><div className="text-start ms-5 fw-bold"><span style={{color:"#e4ba27"}}>특화&nbsp;</span><span>{abilityBattle.specialization}</span></div></Row>
                        <Row><div className="text-start ms-5 fw-bold"><span style={{color:"#e4ba27"}}>신속&nbsp;</span><span>{abilityBattle.swift}</span></div></Row>
                    </Col>
                    <Col>
                        <Row><div className="text-start ms-3 fw-bold"><span style={{color:"#e4ba27"}}>제압&nbsp;</span><span>{abilityBattle.domination}</span></div></Row>
                        <Row><div className="text-start ms-3 fw-bold"><span style={{color:"#e4ba27"}}>인내&nbsp;</span><span>{abilityBattle.endurance}</span></div></Row>
                        <Row><div className="text-start ms-3 fw-bold"><span style={{color:"#e4ba27"}}>숙련&nbsp;</span><span>{abilityBattle.expertise}</span></div></Row>
                    </Col>
                </Row>
            </Container>
        )
    };
    const Engrave = () => {
        const engraves = info.stats.engrave;

        return (
            <Container className="m-0 mb-1 p-2 bg-dark text-light">
                <p className="m-0 mb-1 bg-secondary rounded-pill mx-auto text-center w-50">각인</p>
                {
                    engraves.map((v, i) => {
                        return (
                            <div key={i} className="fw-bold">{v}</div>
                        )
                    })
                }
            </Container>
        )
    };
    const Card = () => {
        const cards = info.stats.card;

        return (
            <Container className="m-0 mb-1 p-2 bg-dark text-light">
                <p className="m-0 mb-1 bg-secondary rounded-pill mx-auto text-center w-50">카드</p>
                {
                    cards.map((v, i) => {
                        return (
                            <div key={i} className="fw-bold">
                                <p className="m-0 p-0" style={{color:"#63e925"}}>{v.title}</p>
                                <p>{v.effect}</p>
                            </div>
                        )
                    })
                }
            </Container>
        )
    };
    const Stats = () => {
        const stats = info.stats;

        const QualityValue = (props) => {
            const quality = props.quality;

            if (quality === 100) {
                return (
                    <span className="quality-grade-100 fw-bold">{quality}</span>
                )
            } else if (quality >= 90 && quality <= 99) {
                return (
                    <span className="quality-grade-90 fw-bold">{quality}</span>
                )
            } else if (quality >= 70 && quality <= 89) {
                return (
                    <span className="quality-grade-70 fw-bold">{quality}</span>
                )
            } else if (quality >= 30 && quality <= 69) {
                return (
                    <span className="quality-grade-30 fw-bold">{quality}</span>
                )
            } else if (quality >= 10 && quality <= 29) {
                return (
                    <span className="quality-grade-10 fw-bold">{quality}</span>
                )
            } else {
                return (
                    <span className="quality-grade-0 fw-bold">{quality}</span>
                )
            }
        };
        const QualityBar = (props) => {
            const quality = props.quality;

            if (quality === 100) {
                return (
                    <ProgressBar variant="quality-100" now={quality} />
                )
            } else if (quality >= 90 && quality <= 99) {
                return (
                    <ProgressBar variant="quality-90" now={quality} />
                )
            } else if (quality >= 70 && quality <= 89) {
                return (
                    <ProgressBar variant="quality-70" now={quality} />
                )
            } else if (quality >= 30 && quality <= 69) {
                return (
                    <ProgressBar variant="quality-30" now={quality} />
                )
            } else if (quality >= 10 && quality <= 29) {
                return (
                    <ProgressBar variant="quality-10" now={quality} />
                )
            } else {
                return (
                    <ProgressBar variant="quality-0" now={quality} />
                )
            }
        }
        const Weapon = () => {
            const weapon = stats.equipment.weapon;

            const WeaponDetail = () => {
                return (
                    <Container className="ms-2 p-2 bg-secondary text-light w-auto">
                        {
                            weapon.effect0 == null ? null :
                                                    <div className="mb-2">
                                                        <p className="m-0" style={{color:"#a9d0f5"}}>기본 효과</p>
                                                        <p className="m-0">{weapon.effect0}</p>
                                                    </div>
                        }
                        {
                            weapon.effect1 == null ? null :
                                                    <div>
                                                        <p className="m-0" style={{color:"#a9d0f5"}}>추가 효과</p>
                                                        <p className="m-0">{weapon.effect1}</p>
                                                    </div>
                        }
                    </Container>
                )
            }
            if (weapon == null) {
                return null;
            } else {
                return (
                    <Container className="m-0 p-0 pt-2 ps-2 pe-2 bg-dark text-light text-start">
                        <Row className="mb-2 align-items-center">
                            <Col>
                                <OverlayTrigger placement="right-start" overlay={WeaponDetail()}>
                                    <img className="border border-secondary rounded-3" src={weapon.imgSrc} width="50px"/>
                                </OverlayTrigger>
                                <span className={"data-grade-" + weapon.dataGrade + " fw-bold"}>&nbsp;&nbsp;{weapon.name}</span>
                            </Col>
                            <Col>
                                {
                                    weapon.quality == null ? null :
                                                            <Container>
                                                                <div>품질&nbsp;<QualityValue quality={weapon.quality} /></div>
                                                                <QualityBar quality={weapon.quality} />
                                                            </Container>
                                }
                            </Col>
                        </Row>
                        <hr className="m-0"/>
                    </Container>
                )
            }
        };
        const Armors = () => {
            const armors = stats.equipment.armors;

            const ArmorDetail = (armor) => {
                return (
                    <Container className="ms-2 p-2 bg-secondary text-light w-auto">
                        {
                            armor.effect0 == null ? null :
                                                    <div className="mb-2">
                                                        <p className="m-0" style={{color:"#A9D0F5"}}>기본 효과</p>
                                                        {
                                                            armor.effect0.map((effect, i) => {
                                                                return (
                                                                    <p key={i} className="m-0">{effect}</p>
                                                                )
                                                            })
                                                        }
                                                    </div>
                        }
                        {
                            armor.effect1 == null ? null :
                                                    <div>
                                                        <p className="m-0" style={{color:"#A9D0F5"}}>추가 효과</p>
                                                        {
                                                            armor.effect1.map((effect, i) => {
                                                                return (
                                                                    <p key={i} className="m-0">{effect}</p>
                                                                )
                                                            })
                                                        }
                                                    </div>
                        }
                    </Container>
                )
            };

            return (
                armors.map((armor, i) => {
                    if (armor == null) {
                        return null;
                    } else {
                        return (
                            <Container key={i} className="m-0 p-0 pt-2 ps-2 pe-2 bg-dark text-light text-start">
                                <Row className="mb-2 align-items-center">
                                    <Col>
                                        <OverlayTrigger placement="right-start" overlay={ArmorDetail(armor)}>
                                            <img className="border border-secondary rounded-3" src={armor.imgSrc} width="50px"/>
                                        </OverlayTrigger>
                                        <span className={"data-grade-" + armor.dataGrade + " fw-bold"}>&nbsp;&nbsp;{armor.name}</span>
                                    </Col>
                                    <Col>
                                        {
                                            armor.quality == null ? null :
                                                                    <Container>
                                                                        <div>품질&nbsp;<QualityValue quality={armor.quality} /></div>
                                                                        <QualityBar quality={armor.quality} />
                                                                    </Container>
                                        }
                                    </Col>
                                </Row>
                                <hr className="m-0" />
                            </Container>
                        )
                    }
                })
            )
        };
        const Accessories = () => {
            const accessories = stats.equipment.accessories;

            const AccessoryDetail = (accessory) => {
                return (
                    <Container className="ms-2 p-2 bg-secondary text-light w-auto">
                        {
                            accessory.effect0 == null ? null :
                                                    <div className="mb-2">
                                                        <p className="m-0" style={{color:"#A9D0F5"}}>기본 효과</p>
                                                        {
                                                            accessory.effect0.map((effect, i) => {
                                                                return (
                                                                    <p key={i} className="m-0">{effect}</p>
                                                                )
                                                            })
                                                        }
                                                    </div>
                        }
                        {
                            accessory.effect1 == null ? null :
                                                    <div className="mb-2">
                                                        <p className="m-0" style={{color:"#A9D0F5"}}>추가 효과</p>
                                                        {
                                                            accessory.effect1.map((effect, i) => {
                                                                return (
                                                                    <p key={i} className="m-0">{effect}</p>
                                                                )
                                                            })
                                                        }
                                                    </div>
                        }
                        {
                            accessory.engraves == null ? null :
                                                    <div>
                                                        <p className="m-0" style={{color:"#A9D0F5"}}>각인 효과</p>
                                                        {
                                                            accessory.engraves.map((engrave, i) => {
                                                                if (engrave != null) {
                                                                    const splited = engrave.split("활성도");

                                                                    return (
                                                                        <p key={i} className="m-0">
                                                                            <span style={{color:"#FFFFAC"}}>{splited[0]}</span>
                                                                            {splited[1]}
                                                                        </p>
                                                                    )
                                                                }
                                                            })
                                                        }
                                                        {
                                                            accessory.penalty == null ? null : 
                                                                                    <p className="m-0">
                                                                                        <span style={{color:"#FE2E2E"}}>{accessory.penalty.split("활성도")[0]}</span>
                                                                                        {accessory.penalty.split("활성도")[1]}
                                                                                    </p>
                                                        }
                                                    </div>
                        }
                    </Container>
                )
            };

            return (
                accessories.map((accessory, i) => {
                    if (accessory == null) {
                        return null;
                    } else {
                        return (
                            <Container key={i} className="m-0 p-0 pt-2 ps-2 pe-2 bg-dark text-light text-start">
                                <Row className="mb-2 align-items-center">
                                    <Col>
                                        <OverlayTrigger placement="right-start" overlay={AccessoryDetail(accessory)}>
                                            <img className="border border-secondary rounded-3" src={accessory.imgSrc} width="50px"/>
                                        </OverlayTrigger>
                                        <span className={"data-grade-" + accessory.dataGrade + " fw-bold"}>&nbsp;&nbsp;{accessory.name}</span>
                                    </Col>
                                    <Col>
                                        {
                                            accessory.quality == null ? null :
                                                                        <Container>
                                                                            <div>품질&nbsp;<QualityValue quality={accessory.quality} /></div>
                                                                            <QualityBar quality={accessory.quality} />
                                                                        </Container>
                                        }
                                    </Col>
                                </Row>
                                <hr className="m-0" />
                            </Container>
                        )
                    }
                })
            )
        };
        const Bracelet = () => {
            const bracelet = stats.equipment.bracelet;

            const BraceletDetail = () => {
                return (
                    <Container className="ms-2 p-2 bg-secondary text-light w-auto" style={{maxWidth:"500px"}}>
                        {
                            bracelet.effects == null ? null :
                                                        <div>
                                                            <p className="m-0" style={{color:"#A9D0F5"}}>팔찌 효과</p>
                                                            {
                                                                bracelet.effects.map((effect, i) => {
                                                                    return (
                                                                        <p key={i} className="m-0">-&nbsp;{effect}</p>
                                                                    )
                                                                })
                                                            }
                                                        </div>
                        }
                    </Container>
                )
            };
            
            if (bracelet == null) {
                return null;
            } else {
                return (
                    <Container className="m-0 p-0 pt-2 ps-2 pe-2 bg-dark text-light text-start">
                        <Row className="mb-2 align-items-center">
                            <Col>
                                <OverlayTrigger placement="right-start" overlay={BraceletDetail()}>
                                    <img className="border border-secondary rounded-3" src={bracelet.imgSrc} width="50px"/>
                                </OverlayTrigger>
                                <span className={"data-grade-" + bracelet.dataGrade + " fw-bold"}>&nbsp;&nbsp;{bracelet.name}</span>
                            </Col>
                        </Row>
                        <hr className="m-0" />
                    </Container>
                )
            }
        };
        const Stone = () => {
            const stone = stats.equipment.stone;

            const StoneDetail = () => {
                const effectTitle = ["기본 효과", "세공 단계 보너스"];

                return (
                    <Container className="ms-2 p-2 bg-secondary text-light w-auto">
                        {
                            stone.health == null ? null :
                                                    stone.health.map((v, i) => {
                                                        return (
                                                            <div key={i} className="mb-2">
                                                                <p className="m-0" style={{color:"#A9D0F5"}}>{effectTitle[i]}</p>
                                                                <p className="m-0">{v}</p>
                                                            </div>
                                                        )
                                                    })
                        }
                        {
                            stone.engraves == null ? null :
                                                     <div>
                                                         <p className="m-0" style={{color:"#A9D0F5"}}>각인 효과</p>
                                                         {
                                                             stone.engraves.map((engrave, i) => {
                                                                const splited = engrave.split("활성도");

                                                                return (
                                                                    <p key={i} className="m-0">
                                                                        <span style={{color:"#FFFFAC"}}>{splited[0]}</span>
                                                                        {splited[1]}
                                                                    </p>
                                                                )
                                                            })
                                                         }
                                                         {
                                                            <p className="m-0">
                                                                <span style={{color:"#FE2E2E"}}>{stone.penalty.split("활성도")[0]}</span>
                                                                {stone.penalty.split("활성도")[1]}
                                                            </p>
                                                        }
                                                     </div>
                        }
                    </Container>
                )
            };

            if (stone == null) {
                return null;
            } else {
                return (
                    <Container className="m-0 p-0 pt-2 ps-2 pe-2 bg-dark text-light text-start">
                        <Row className="mb-2 align-items-center">
                            <Col>
                            <OverlayTrigger placement="right-start" overlay={StoneDetail()}>
                                <img className="border border-secondary rounded-3" src={stone.imgSrc} width="50px"/>
                            </OverlayTrigger>
                            <span className={"data-grade-" + stone.dataGrade + " fw-bold"}>&nbsp;&nbsp;{stone.name}</span>
                            </Col>
                        </Row>
                        <hr className="m-0" />
                    </Container>
                )
            }
        };

        return (
            <Container className="m-0 mb-2 p-0">
                <Armors />
                <Weapon />
                <Accessories />
                <Bracelet />
                <Stone />
            </Container>
        )
    };
    const Skill = () => {
        const skill = info.skill;

        const Points = () => {
            return (
                <Container className="m-0 mb-1 p-0 bg-dark text-light">
                    사용 스킬 포인트&nbsp;
                    <span className="fw-bold" style={{color:"#ffb000"}}>{skill.point.use}</span>
                    &nbsp;/&nbsp;보유 스킬 포인트&nbsp;
                    <span className="fw-bold" style={{color:"#ffb000"}}>{skill.point.total}</span>
                </Container>
            )
        };
        const Tripods = (props) => {
            const tripods = props.tripods;
            
            return (
                <Container>
                    {
                        tripods.map((tripod, i) => {
                            if (tripod != null) {
                                if (i == 0) {
                                    return (
                                        <div key={i}>
                                            <span style={{color:"#0091cc"}}>&#8544;.&nbsp;{`${tripod.name} : ${tripod.level}`}</span>
                                        </div>
                                    )
                                } else if (i == 1) {
                                    return (
                                        <div key={i}>
                                            <span style={{color:"#498001"}}>&#8545;.&nbsp;{`${tripod.name} : ${tripod.level}`}</span>
                                        </div>
                                    )
                                } else if (i == 2) {
                                    return (
                                        <div key={i}>
                                            <span style={{color:"#c17502"}}>&#8546;.&nbsp;{`${tripod.name} : ${tripod.level}`}</span>
                                        </div>
                                    )
                                }
                            }
                        })
                    }
                </Container>
            )
        };
        const Rune = (props) => {
            const rune = props.rune;

            const detail = () => {
                return(
                    <Container className="p-2 bg-secondary text-light w-auto" style={{maxWidth:"300px"}}>
                        <span>{rune.effect}</span>
                    </Container>
                )
            };

            if (rune == null) {
                return null;
            } else {
                return (
                    <Container>
                        <OverlayTrigger placement="top-start" overlay={detail()}>
                            <img className="border border-secondary rounded-3" src={rune.imgSrc} width="50px"/>
                        </OverlayTrigger>
                        <div className={"data-grade-" + rune.dataGrade + " fw-bold ms-2"}>{rune.name}</div>
                    </Container>
                )
            }
        };
        const Detail = (props) => {
            const skill = props.skill;

            return (
                <Container className="m-0 p-0 pt-2 ps-2 pe-2 bg-dark text-light text-start">
                    <Row className="mb-2 align-items-center">
                        <Col xs={4}>
                            <img className="border border-secondary rounded-3" src={skill.imgSrc} width="50px"/>
                            <span className="fw-bold">&nbsp;{skill.name} Lv.{skill.level}</span>
                        </Col>
                        <Col xs={6} className="m-0 p-0">
                            <Tripods tripods={skill.tripods} />
                        </Col>
                        <Col>
                            <Rune rune={skill.rune} />
                        </Col>
                    </Row>
                    <hr className="m-0"/>
                </Container>
            )
        }

        return (
            <Container className="m-0 mb-2 p-0">
                <Points />
                {
                    skill.skills.map((skill, i) => {
                        return (
                            <Detail key={i} skill={skill}/>
                        )
                    })
                }
            </Container>
        )
    };
    const Jewel = () => {
        const jewels = info.stats.jewels;

        return (
            <Container className="m-0 mb-2 p-0">
                {
                    jewels.map((jewel, i) => {
                        if (jewel == null) {
                            return null;
                        } else {
                            return (
                                <Container key={i} className="m-0 p-0 pt-2 ps-2 pe-2 bg-dark text-light text-start">
                                    <Row className="mb-2 align-items-center">
                                        <Col>
                                            <img className="border border-secondary rounded-3" src={jewel.imgSrc} width="50px"/>
                                            <span className={"data-grade-" + jewel.dataGrade + " fw-bold + ms-3"}>{jewel.name}</span>
                                        </Col>
                                        <Col xs={3}>
                                            <span className="ms-3 fw-bold" style={{color:"#3cf"}}>{jewel.effect.skill}</span>
                                        </Col>
                                        <Col xs={5}>
                                            <span className="ms-3 fw-bold">{jewel.effect.effect}</span>
                                        </Col>
                                    </Row>
                                    <hr className="m-0"/>
                                </Container>
                            )
                        }
                    })
                }
            </Container>
        )
    };
    const Collection = () => {
        const SpecialItems = () => {
            const items = info.specialItems;

            return(
                <Container className="m-0 mb-1 p-2 bg-dark text-light text-start">
                    <p className="m-0 mb-1 bg-secondary rounded-pill mx-auto text-center w-50">&nbsp;특수 장비&nbsp;</p>
                    {
                        items.map((item, i) => {
                            return (
                                <div key={i} className="mt-2">
                                    <img className="border border-secondary rounded-3" src={item.imgSrc} width="50px"/>
                                    <span className={"data-grade-" + item.dataGrade + " fw-bold"}>&nbsp;&nbsp;{item.name}</span>
                                </div>
                            )
                        })
                    }
                </Container>
            )
        };
        const Propensity = () => {
            const propensity = info.stats.propensity;

            return (
                <Container className="m-0 mb-1 p-2 bg-dark text-light text-start">
                    <p className="m-0 mb-1 bg-secondary rounded-pill mx-auto text-center w-50">&nbsp;성향&nbsp;</p>
                    <div>
                        <div className="fw-bold d-flex justify-content-between"><span>지성</span><span>{propensity.intelligence}</span></div>
                        <ProgressBar variant="info" now={Number(propensity.intelligence) / 999 * 100}/>
                    </div>
                    <div>
                        <div className="fw-bold d-flex justify-content-between"><span>담력</span><span>{propensity.courage}</span></div>
                        <ProgressBar variant="info" now={Number(propensity.courage) / 999 * 100}/>
                    </div>
                    <div>
                        <div className="fw-bold d-flex justify-content-between"><span>매력</span><span>{propensity.charm}</span></div>
                        <ProgressBar variant="info" now={Number(propensity.charm) / 999 * 100}/>
                    </div>
                    <div>
                        <div className="fw-bold d-flex justify-content-between"><span>친절</span><span>{propensity.kindness}</span></div>
                        <ProgressBar variant="info" now={Number(propensity.kindness) / 999 * 100}/>
                    </div>
                </Container>
            )
        };
        const Point = () => {
            const collection = info.collection;
            const names = {
                island: "섬의 마음", star: "오르페우스의 별", heart: "거인의 심장", art: "위대한 미술품", 
                seed: "모코코 씨앗", voyage: "항해 모험물", medal: "이그네아의 징표", tree: "세계수의 잎"
            };
            const [detail, setDetail] = useState(collection.island.list);

            const Status = (key) => {
                const element = collection[key];
                const progress = Math.floor(Number(element.point.now.replace(/,/g, '')) / Number(element.point.max.replace(/,/g, '')) * 100);

                return (
                    <Container key={key} className="m-0 p-0 pt-2 ps-2 pe-2 bg-dark text-light text-start" style={{cursor:"pointer"}} onClick={() => {setDetail(element.list)}}>
                        <Row className="mb-2 align-items-center" style={{height:"50px"}}>
                            <Col xs={5} className="m-0 p-0 ps-3 fw-bold"><span>{names[key]}</span></Col>
                            <Col className="text-end">
                                <span className="fw-bold" style={{color:"#ffd200"}}>
                                    {element.point.now}&nbsp;/&nbsp;{element.point.max}&nbsp;
                                    <img src={process.env.PUBLIC_URL + `/img/icon_collect_${key}.png`} />
                                </span>
                                <ProgressBar variant="warning" now={progress} label={`${progress}%`}/>
                            </Col>
                        </Row>
                        <hr className="m-0" />
                    </Container>
                )
            };
            const Detail = () => {
                return (
                    <Container className="m-0 p-0 pt-2 ps-2 pe-2 bg-dark text-light text-start" style={{height:"536px", overflowY:"scroll" }}>
                        {
                            detail.map((element, i) => {
                                return (
                                        <Row key={i} className="align-items-center" style={{height:"50px"}}>
                                            <Col xs={1} className="m-0 p-0 ps-2 fw-bold"><span>{i + 1}.&nbsp;</span></Col>
                                            <Col className="m-0 p-0 ps-1">
                                                <span className="fw-bold">
                                                    {
                                                        element.name != null ? element.name : element.continent
                                                    }
                                                </span>
                                            </Col>
                                            <Col xs={3} className="m-0 p-0 pe-2 text-end">
                                                <span className="fw-bold" style={{color:"#ffd200"}}>
                                                    {
                                                        element.acquire != null ? element.acquire === true ? "획득" : null :
                                                        element.now + " / " + element.max
                                                    }
                                                </span>
                                            </Col>
                                            <hr className="m-0" />
                                        </Row>
                                )
                            })
                        }
                    </Container>
                )
            };
            return (
                <Container className="m-0 mb-2 p-0">
                    <Row>
                        <Col className="pe-1">
                            {
                                Object.keys(collection).map((key, i) => {
                                    return Status(key);
                                })
                            }
                        </Col>
                        <Col className="ps-0">
                            <Detail />
                        </Col>
                    </Row>
                </Container>
            )
        };

        return (
            <Container className="m-0 mb-2 p-0">
                <Row>
                    <Col className="pe-1">
                        <Point />
                    </Col>
                    <Col xs={3} className="ps-0">
                        <SpecialItems />
                        <Propensity />
                    </Col>
                </Row>
            </Container>
        )
    };

    return (
        <Container>
            <Row className="mb-3">
                <Title />
            </Row>
            <Row>
                <Col xs={3} className="p-0">
                    <Level />
                    <AbilityBasic />
                    <AbilityBattle />
                    <Engrave />
                    <Card />
                    <GameInfo />
                </Col>
                <Col className="ms-2 p-0">
                    <Tabs defaultActiveKey="stats" className="profileTab">
                        <Tab eventKey="stats" title="장비">
                            <Stats />
                        </Tab>
                        <Tab eventKey="skill" title="스킬">
                            <Skill />
                        </Tab>
                        <Tab eventKey="jewel" title="보석">
                            <Jewel />
                        </Tab>
                        <Tab eventKey="collection" title="수집">
                            <Collection />
                        </Tab>
                    </Tabs>
                </Col>
            </Row>
        </Container>
    )
}

function Profile() {
    const [info, setInfo] = useState({});

    const NotFound = () => {
        return (
            <Container>
                <p>존재하지 않는 캐릭터명 입니다.</p>
            </Container>
        )
    };

    return (
        <Container>
            <SearchCharacter setInfo={setInfo}/>
            {
                info.exist == null  ? null : 
                info.exist === true ? <CharacterInfo info={info} setInfo={setInfo}/> : 
                                      <NotFound />
            }
        </Container>
    );
}

export default Profile;