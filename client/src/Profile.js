import { React, useState } from 'react';
import { Container, InputGroup, FormControl, Button, Row, Col, Stack, OverlayTrigger, Tooltip, ProgressBar } from 'react-bootstrap';
import axios from 'axios';

import './Profile.css';

function Name(props) {
    return (
        <Container className="bg-dark bg-gradient profile-box mt-1">
            <div className="fs-5 text-light fw-bold">{props.name}</div>
        </Container>
    );
}
function Level(props) {
    return (
        <Container className="bg-dark bg-gradient profile-box mt-1">
            <Stack direction="horizontal" gap={3}>
                <Stack gap={3}>
                    <div className="bg-secondary text-white rounded-pill">원정대 Lv.</div>
                    <div className="bg-secondary text-white rounded-pill">전투 &nbsp;&nbsp;Lv.</div>
                    <div className="bg-secondary text-white rounded-pill">아이템 Lv.</div>
                </Stack>
                <Stack gap={3}>
                    <div className="text-light">{props.level.expedition}</div>
                    <div className="text-light">{props.level.battle}</div>
                    <div className="text-light">{props.level.item}</div>
                </Stack>
            </Stack>
        </Container>
    );
}
function BasicAbility(props) {
    return (
        <Container className="bg-dark bg-gradient profile-box mt-1">
            <div className="fs-7 text-white mb-3 fw-bold">[기본 특성]</div>
            <Stack direction="horizontal" gap={3}>
                <Stack gap={3}>
                    <div className="bg-secondary text-white rounded-pill">&nbsp;공격력&nbsp;</div>
                    <div className="bg-secondary text-white rounded-pill">최대 생명력</div>
                </Stack>
                <Stack gap={3}>
                    <div className="text-light">{Number(props.ability.attack) + Number(props.ability.engrave)}</div>
                    <div className="text-light">{props.ability.maxHP}</div>
                </Stack>
            </Stack>
        </Container>
    );
}
function BattleAbility(props) {
    return (
        <Container className="bg-dark bg-gradient profile-box mt-1">
            <div className="fs-7 text-white mb-3 fw-bold">[전투 특성]</div>
            <Stack direction="horizontal" gap={3}>
                <Stack gap={3}>
                    <div className="bg-secondary text-white rounded-pill">치명</div>
                    <div className="bg-secondary text-white rounded-pill">특화</div>
                    <div className="bg-secondary text-white rounded-pill">신속</div>
                    <div className="bg-secondary text-white rounded-pill">제압</div>
                    <div className="bg-secondary text-white rounded-pill">인내</div>
                    <div className="bg-secondary text-white rounded-pill">숙련</div>
                </Stack>
                <Stack gap={3}>
                    <div className="text-light">{props.ability.치명}</div>
                    <div className="text-light">{props.ability.특화}</div>
                    <div className="text-light">{props.ability.신속}</div>
                    <div className="text-light">{props.ability.제압}</div>
                    <div className="text-light">{props.ability.인내}</div>
                    <div className="text-light">{props.ability.숙련}</div>
                </Stack>
            </Stack>
        </Container>
    );
}
function Equipment(props) {
    function QualityBar(quality) {
        if (quality >= 0 && quality < 10) {
            return (
                <ProgressBar variant="danger" now={quality} label={quality}/>
            )
        } else if (quality >= 10 && quality < 30) {
            return (
                <ProgressBar variant="warning" now={quality} label={quality}/>
            )
        } else if (quality >= 30 && quality < 70) {
            return (
                <ProgressBar variant="success" now={quality} label={quality}/>
            )
        } else if (quality >= 70 && quality < 90) {
            return (
                <ProgressBar variant={"quality-70"} now={quality} label={quality}/>
            )
        } else if (quality >= 90 && quality < 100) {
            return (
                <ProgressBar variant={"quality-90"} now={quality} label={quality}/>
            )
        } else {
            return (
                <ProgressBar variant={"quality-100"} now={quality} label={quality}/>
            )
        }
    }

    return (
        <Container className="bg-dark bg-gradient profile-box mt-1">
            <Row>
                <Col>
                    <Stack gap={3}>
                        {
                            props.equip.equip.map((e, i) => {
                                return (
                                    <Stack key={i} direction="horizontal" gap={3} className="border border-secondary rounded-3 p-1">
                                        <img className="border border-secondary rounded-3" src={e.iconPath} width="60px"/>
                                        <Stack>
                                            <div dangerouslySetInnerHTML={{__html:e.name}}></div>
                                            {QualityBar(e.quality)}
                                        </Stack>
                                    </Stack>
                                )
                            })
                        }
                    </Stack>
                </Col>
                <Col>
                    <Stack gap={3}>
                        {
                            props.equip.accessory.map((e, i) => {
                                return (
                                    <Stack key={i} direction="horizontal" gap={3} className="border border-secondary rounded-3 p-1">
                                        <img className="border border-secondary rounded-3" src={e.iconPath} width="60px"/>
                                        <Stack>
                                            <div className="text-light" dangerouslySetInnerHTML={{__html:e.value}}></div>
                                            {QualityBar(e.quality)}
                                        </Stack>
                                    </Stack>
                                )
                            })
                        }
                        {
                            props.equip.stone == null ? null :
                            <Stack direction="horizontal" gap={3} className="border border-secondary rounded-3 p-1">
                                <img className="border border-secondary rounded-3" src={props.equip.stone.iconPath} width="60px"/>
                                <div className="text-light mx-auto" dangerouslySetInnerHTML={{__html:props.equip.stone.engrave}} ></div>
                            </Stack>
                        }
                        {
                            props.equip.bracelet == null ? null :
                            <Stack direction="horizontal" gap={3} className="border border-secondary rounded-3 p-1">
                                <img className="border border-secondary rounded-3" src={props.equip.bracelet.iconPath} width="60px"/>
                                <Stack>
                                    {
                                        props.equip.bracelet.effect === undefined ? null :
                                        props.equip.bracelet.effect.map((e, i) => {
                                            return (
                                                <div key={i} className="text-light" dangerouslySetInnerHTML={{__html:e}}></div>
                                            )
                                        })
                                    }
                                </Stack>
                            </Stack>
                        }
                    </Stack>
                </Col>
            </Row>
        </Container>
    );
}
function Engrave(props) {
    return (
        <Container className="bg-dark bg-gradient profile-box mt-1">
            <div className="fs-7 text-white mb-3 fw-bold">[각인 효과]</div>
            <Stack gap={3}>
                {
                    props.engrave.map((e, i) => {
                        if (e.engrave.slice(-2) === '감소') {
                            return (<div key={i} className="text-danger">{e.engrave} Lv.{e.level}</div>)
                        } else {
                            return (<div key={i} className="text-light">{e.engrave} Lv.{e.level}</div>)
                        }
                    })
                }
            </Stack>
        </Container>
    );
}
function Jewel(props) {
    if (props.jewel == null) {
        return null;
    }

    return (
        <Container className="bg-dark bg-gradient profile-box mt-1">
                    {
                        props.jewel.map((e, i) => {
                            return (
                                <OverlayTrigger key={i} placement='top' overlay={
                                    <Tooltip>
                                        <p className="fs-7 text-white mb-3 fw-bold">{e.level}</p>
                                        <p dangerouslySetInnerHTML={{__html:e.desc}}></p>
                                    </Tooltip>
                                }>
                                    <span>
                                        <img className="border border-secondary rounded-3 m-1" src={e.iconPath} width="50px"></img>
                                    </span>
                                </OverlayTrigger>
                            )
                        })
                    }
        </Container>
    );
}
function CardEffect(props) {
    return (
        <Container className="bg-dark bg-gradient profile-box mt-1">
            <div className="fs-7 text-white mb-3 fw-bold">[카드 효과]</div>
            <Stack gap={3}>
                {
                    props.card.map((e, i) => {
                        return (<div key={i}><div className="text-success">{e.title}</div><div className="text-light">{e.desc}</div></div>)
                    })
                }
            </Stack>
        </Container>
    );
}

function Profile() {
    let target = null;
    const [profile, setProfile] = useState({Name:''});

    function Search() {
        axios.get('http://localhost:8942/character/profile/' + target)
        .then((result) => {
            setProfile(result.data);
        })
        .catch((err) => {
            console.log(err);
        })
    }

    return (
        <Container>
            <Container>
                <InputGroup className="mt-3 mb-3" style={{width: '75%', margin: 'auto'}}>
                    <FormControl placeholder="캐릭터명을 입력하세요." 
                        onChange={(e) => {
                            target = e.target.value;
                        }} 
                        onKeyPress={(e) => {
                        if (e.key === 'Enter') { 
                            Search(); 
                        }
                    }}/>
                    <Button variant="secondary" onClick={() => {Search()}}>검색</Button>
                </InputGroup>
            </Container>
            <Container>
                {
                    profile.Name === '' ? null : 
                        profile.Name === '존재하지 않는 캐릭터명입니다.' ? profile.Name :
                    (
                        <Container className="bg-dark">
                            <Row>
                                <Col>
                                    <Name name={profile.Name} />
                                    <Level level={profile.Level} />
                                    <BasicAbility ability={profile.Ability.basic} />
                                    <BattleAbility ability={profile.Ability.battle} />
                                </Col>
                                <Col xs={7}>
                                    <Equipment equip={profile.Equipment} />
                                    <Jewel jewel={profile.Jewel} />
                                </Col>
                                <Col>
                                    <Engrave engrave={profile.Engrave} />
                                    <CardEffect card={profile.Card} />
                                </Col>
                            </Row>
                        </Container>
                    )
                }
            </Container>
        </Container>
    );
}

export default Profile;