import { React, useEffect, useState } from 'react';
import { Container, InputGroup, FormControl, Button, Row, Col, Tabs, Tab, Tooltip, OverlayTrigger, ProgressBar } from 'react-bootstrap';
import axios from 'axios';
import '../App.css';

const URL_GET_CHARACTER = 'http://localhost:8942/character';

function SearchCharacter(props) {
    const [name, setName] = useState('');

    const Search = () => {
        axios.get(`${URL_GET_CHARACTER}/${name}`)
        .then((result) => {
            props.setInfo(result.data);
            setName('');
        })
        .catch((err) => {
            console.log(err);
        });
    };

    return (
        <InputGroup className="mt-3 mb-3">
            <FormControl placeholder="캐릭터명을 입력하세요."  value={name}
                onChange={(event) => {
                    setName(event.target.value);
                }} 
                onKeyPress={(event) => {
                if (event.key === 'Enter') { 
                    Search(); 
                }
            }}/>
            <Button variant="secondary" onClick={() => {Search()}}>검색</Button>
        </InputGroup>
    )
}

function CharacterInfo(props) {
    const info = props.info;

    const Title = () => {
        return (
            <Container className="p-1 bg-dark text-light">
                <img src={info.class.imgSrc} />
                <span className="fw-bold">&nbsp;{info.name}</span>
                <span className="fw-bold text-warning">&nbsp;{info.server}</span>
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
            <Container className="m-0 mb-1 p-2 bg-dark text-light text-start">
                <div>
                    <span className="m-0 ps-1 pe-1 bg-secondary rounded-3">칭 호</span>
                    <span className="fw-bold">&nbsp;&nbsp;{gameInfo.title}</span>
                </div>
                <div>
                    <span className="m-0 ps-1 pe-1 bg-secondary rounded-3">길 드</span>
                    <span className="fw-bold">&nbsp;&nbsp;{gameInfo.guild}</span>
                </div>
                <div>
                    <span className="m-0 ps-1 pe-1 bg-secondary rounded-3">&nbsp;pvp&nbsp;</span>
                    <span className="fw-bold">&nbsp;&nbsp;{gameInfo.pvp}</span>
                </div>
                <div>
                    <span className="m-0 ps-1 pe-1 bg-secondary rounded-3">영 지</span>
                    <span className="fw-bold">&nbsp;&nbsp;{gameInfo.dominion}</span>
                </div>
            </Container>
        )
    };
    const SpecialItems = () => {
        const items = info.specialItems;

        return(
            <Container className="m-0 p-2 bg-dark text-light text-start">
                <p className="m-0 bg-secondary rounded-pill mx-auto text-center w-50">&nbsp;특수 장비&nbsp;</p>
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
    const Stats = () => {
        const stats = info.stats;

        const AbilityBasic = () => {
            const abilityBasic = stats.abilityBasic;

            return (
                <Container className="m-0 mb-1 p-2 bg-dark text-light">
                    <p className="m-0 mb-1 bg-secondary rounded-pill mx-auto text-center w-50">기본 특성</p>
                    <Row>
                        <Col>
                            <p className="m-0 fw-bold" style={{color:"#e4ba27"}}>공격력</p>
                            <p className="m-0 fw-bold" style={{color:"#e4ba27"}}>최대 생명력</p>
                        </Col>
                        <Col>
                            <p className="m-0 fw-bold">{Number(abilityBasic.attack) + Number(abilityBasic.attackEngrave)}</p>
                            <p className="m-0 fw-bold">{abilityBasic.maxHp}</p>
                        </Col>
                    </Row>
                </Container>
            )
        };
        const AbilityBattle = () => {
            const abilityBattle = stats.abilityBattle;

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
            const engraves = stats.engrave;

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
            const cards = stats.card;

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

        const Equip = () => {
            const weapon = stats.equipment.weapon;
            const armors = stats.equipment.armors;

            const weaponDetail = () => {
                return (
                    <Container className="p-2 bg-secondary text-light w-auto">
                        {
                            weapon.quality == null ? null :
                                                    <div className="mb-2">
                                                        <div style={{color:"#a9d0f5"}}>품질&nbsp;<QualityValue quality={weapon.quality} /></div>
                                                        <QualityBar quality={weapon.quality} />
                                                    </div>
                        }
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
            };

            return (
                <Container className="m-0 p-0 mb-1 bg-dark text-light text-start w-auto">
                    {
                        armors.map((armor, i) => {
                            const armorDetail = () => {
                                return (
                                    <Container className="p-2 bg-secondary text-light w-auto">
                                        {
                                            armor.quality == null ? null :
                                                                    <div className="mb-2">
                                                                        <div style={{color:"#A9D0F5"}}>품질&nbsp;<QualityValue quality={armor.quality} /></div>
                                                                        <QualityBar quality={armor.quality} />
                                                                    </div>
                                        }
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
                                    <div key={i} className="p-2">
                                        <OverlayTrigger key={i} placement="right-start" overlay={armorDetail()}>
                                            <img className="border border-secondary rounded-3" src={armor.imgSrc} width="50px"/>
                                        </OverlayTrigger>
                                        <span className={"data-grade-" + armor.dataGrade + " fw-bold"}>&nbsp;&nbsp;{armor.name}</span>
                                    </div>
                            )
                        })
                    }
                    {
                        weapon == null ? null :
                                        <div className="p-2">
                                            <OverlayTrigger placement="right-start" overlay={weaponDetail()}>
                                                <img className="border border-secondary rounded-3" src={weapon.imgSrc} width="50px"/>
                                            </OverlayTrigger>
                                            <span className={"data-grade-" + weapon.dataGrade + " fw-bold"}>&nbsp;&nbsp;{weapon.name}</span>
                                        </div>
                    }
                </Container>
            )
        };
        const Accessory = () => {
            const accessories = stats.equipment.accessories;
            const bracelet = stats.equipment.bracelet;
            const stone = stats.equipment.stone;
            
            const accDetail = (acc) => {
                return (
                    <Container className="p-2 bg-secondary text-light w-auto">
                        {
                            acc.quality == null ? null :
                                                    <div className="mb-2">
                                                        <div style={{color:"#A9D0F5"}}>품질&nbsp;<QualityValue quality={acc.quality} /></div>
                                                        <QualityBar quality={acc.quality} />
                                                    </div>
                        }
                        {
                            acc.effect0 == null ? null :
                                                    <div className="mb-2">
                                                        <p className="m-0" style={{color:"#A9D0F5"}}>기본 효과</p>
                                                        {
                                                            acc.effect0.map((effect, i) => {
                                                                return (
                                                                    <p key={i} className="m-0">{effect}</p>
                                                                )
                                                            })
                                                        }
                                                    </div>
                        }
                        {
                            acc.effect1 == null ? null :
                                                    <div className="mb-2">
                                                        <p className="m-0" style={{color:"#A9D0F5"}}>추가 효과</p>
                                                        {
                                                            acc.effect1.map((effect, i) => {
                                                                return (
                                                                    <p key={i} className="m-0">{effect}</p>
                                                                )
                                                            })
                                                        }
                                                    </div>
                        }
                        {
                            acc.engraves == null ? null :
                                                    <div>
                                                        <p className="m-0" style={{color:"#A9D0F5"}}>각인 효과</p>
                                                        {
                                                            acc.engraves.map((engrave, i) => {
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
                                                            acc.penalty == null ? null : 
                                                                                    <p className="m-0">
                                                                                        <span style={{color:"#FE2E2E"}}>{acc.penalty.split("활성도")[0]}</span>
                                                                                        {acc.penalty.split("활성도")[1]}
                                                                                    </p>
                                                        }
                                                    </div>
                        }
                    </Container>
                )
            };
            const braceletDetail = () => {
                return (
                    <Container className="p-2 bg-secondary text-light w-auto" style={{maxWidth:"500px"}}>
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
            const stoneDetail = () => {
                const effectTitle = ["기본 효과", "세공 단계 보너스"];

                return (
                    <Container className="p-2 bg-secondary text-light w-auto">
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

            return (
                <Container className="m-0 p-0 mb-1 bg-dark text-light text-start">
                    {
                        accessories.map((accessory, i) => {
                            return (
                                <div key={i} className="p-2">
                                    <OverlayTrigger placement="right-start" overlay={accDetail(accessory)}>
                                        <img className="border border-secondary rounded-3" src={accessory.imgSrc} width="50px"/>
                                    </OverlayTrigger>
                                    <span className={"data-grade-" + accessory.dataGrade + " fw-bold"}>&nbsp;&nbsp;{accessory.name}</span>
                                </div>
                            )
                        })
                    }
                    {
                        bracelet == null ? null :
                                           <div className="p-2">
                                               <OverlayTrigger placement="right-start" overlay={braceletDetail()}>
                                                    <img className="border border-secondary rounded-3" src={bracelet.imgSrc} width="50px"/>
                                               </OverlayTrigger>
                                               <span className={"data-grade-" + bracelet.dataGrade + " fw-bold"}>&nbsp;&nbsp;{bracelet.name}</span>
                                           </div>
                                    
                    }
                    {
                        stone == null ? null :
                                        <div className="p-2">
                                            <OverlayTrigger placement="right-start" overlay={stoneDetail()}>
                                                <img className="border border-secondary rounded-3" src={stone.imgSrc} width="50px"/>
                                            </OverlayTrigger>
                                            <span className={"data-grade-" + stone.dataGrade + " fw-bold"}>&nbsp;&nbsp;{stone.name}</span>
                                        </div>
                    }
                </Container>
            )
        };
        const Jewel = () => {
            const jewels = stats.jewels;

            return (
                <Container className="p-0 bg-dark text-light" style={{width:"625px"}}>
                    {
                        jewels.map((jewel, i) => {
                            const jewelDetail = () => {
                                return (
                                    <Tooltip className="jewelDetail">
                                        <span className={"data-grade-" + jewel.dataGrade + " fw-bold"}>{jewel.level}</span>
                                        <span className="fw-bold">&nbsp;{jewel.effect.skill}</span>
                                        <p className="m-0 p-0">{jewel.effect.effect}</p>
                                    </Tooltip>
                                )
                            };

                            return (
                                <OverlayTrigger key={i} placement="top" overlay={jewelDetail()}>
                                    <img className="m-1 border border-secondary rounded-3" src={jewel.imgSrc} width="48px"/>
                                </OverlayTrigger>
                            )
                        })
                    }
                </Container>
            )
        };

        return (
            <Container className="p-0">
                <Row>
                    <Col xs={8}>
                        <Row>
                            <Col xs={7} className="pe-0"><Equip /></Col>
                            <Col xs={5} className="ps-1"><Accessory /></Col>
                        </Row>
                        <Row>
                            <Jewel />
                        </Row>
                    </Col>
                    <Col xs={4}>
                        <AbilityBasic />
                        <AbilityBattle />
                        <Engrave />
                        <Card />
                    </Col>
                </Row>
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

            const Detail = () => {
                return(
                    <Container className="ms-1 p-2 bg-secondary text-light w-auto" style={{maxWidth:"300px"}}>
                        <span>{rune.effect}</span>
                    </Container>
                )
            };

            if (rune == null) {
                return null;
            } else {
                return (
                    <Container>
                        <OverlayTrigger placement="top-start" overlay={Detail()}>
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
                <Container className="m-0 p-0 pt-2 ps-2 bg-dark text-light text-start">
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

    return (
        <Container>
            <Row className="mb-3">
                <Title />
            </Row>
            <Row>
                <Col xs={3} className="p-0">
                    <Level />
                    <GameInfo />
                    <SpecialItems />
                </Col>
                <Col className="ms-2 p-0">
                    <Tabs defaultActiveKey="stats" className="profileTab">
                        <Tab eventKey="stats" title="능력치">
                            <Stats />
                        </Tab>
                        <Tab eventKey="skill" title="스킬">
                            <Skill />
                        </Tab>
                    </Tabs>
                </Col>
            </Row>
        </Container>
    )
}

function Profile() {
    const [info, setInfo] = useState({});

    useEffect(() => {
        console.log(info);
    }, [info]);

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
                info.exist === true ? <CharacterInfo info={info} /> : 
                                      <NotFound />
            }
        </Container>
    );
}

export default Profile;