import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Nav, Container, Row, Col, Table, Button } from 'react-bootstrap';
import Meteors from './abrelshudMeteor.js';
import './ContentRaid.css';

function AbrelshudContent(props) {
    let [meteors, setMeteors] = useState(Meteors);
    // Meteor Timer
    let timerId_ref = useRef(null);
    let timerCount_ref = useRef(100);
    let [timerCount, setTimerCount] = useState(100);
    let [timerState, setTimerState] = useState(false);

    useEffect(() => {
        if (timerState) {
            // TimerStart
            timerId_ref.current = setInterval(() => {
                timerCount_ref.current -= 1;
                if (timerCount_ref.current == 0) {
                    setTimerState(false);
                } else {
                    setTimerCount(timerCount_ref.current);
                }
            }, 1000);
        } else {
            // TimerStop, Reset variables
            timerCount_ref.current = 100;
            setTimerCount(timerCount_ref.current);
            clearInterval(timerId_ref.current);
            timerId_ref.current = null;
        }
    }, [timerState]);

    if (props.gate == 5) {
        return (
            <div className="container mt-5">
                <img src={process.env.PUBLIC_URL + "/img/abrelshud_gate5.png"} />
            </div>
        );
    } else if (props.gate == 6) {
        return (
            <div className="container mt-5">
                <Container>
                    <Row>
                        <Col>
                            <Table bordered hover>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>메테오 위치</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        meteors.map((meteor, i) => {
                                            if (meteor.isYellow) {
                                                return (
                                                    <tr key={i} id="YellowMeteor">
                                                        <td>{i + 1}</td>
                                                        <td>
                                                            {
                                                                meteor.isPlaced == true
                                                                ? "-"
                                                                : meteor.position
                                                            }
                                                        </td>
                                                        <td><Button size="sm" onClick={() => {
                                                            var next = [...meteors];
                                                            next[i].isPlaced = !next[i].isPlaced;
                                                            setMeteors(next);
                                                            if (timerState == false) {
                                                                setTimerState(true);
                                                            }
                                                        }}>Toggle</Button></td>
                                                    </tr>
                                                );
                                            } else {
                                                return (
                                                    <tr key={i}>
                                                        <td>{i + 1}</td>
                                                        <td>
                                                            {
                                                                meteor.isPlaced == true
                                                                ? "-"
                                                                : meteor.position
                                                            }
                                                        </td>
                                                        <td><Button size="sm" onClick={() => {
                                                            var next = [...meteors];
                                                            next[i].isPlaced = !next[i].isPlaced;
                                                            setMeteors(next);
                                                        }}>Toggle</Button></td>
                                                    </tr>
                                                );
                                            }
                                            
                                        })
                                    }
                                    <tr>
                                        <td></td>
                                        <td></td>
                                        <td><Button size="sm" variant="success" onClick={() => {
                                            var resetMeteor = [...meteors];
                                            resetMeteor.map((m) => {m.isPlaced = false;});
                                            setMeteors(resetMeteor);
                                        }}>Reset</Button></td>
                                    </tr>
                                </tbody>
                            </Table>
                        </Col>
                        <Col>
                            <div className="mt-5">
                                <h2>바닥 재생 타이머</h2>
                                {
                                    timerCount > 20
                                    ? <div id="MeteorTimerNormal">{timerCount}</div>
                                    : <div id="MeteorTimerRed">{timerCount}</div>
                                }
                                <div className="mt-5">
                                    <Button size="lg" onClick={() => {
                                        if (timerState == false) {
                                            setTimerState(true);
                                        }
                                    }}>Start</Button> <Button size="lg" variant="danger" onClick={() => {
                                            if (timerState == true) {
                                                setTimerState(false);
                                            }
                                        }}>Reset</Button>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }
}

function Abrelshud() {
    let [gate, setGate] = useState(5);

    return (
        <>
            <Nav className="mt-3" variant="tabs" defaultActiveKey="gate5">
                <Nav.Item>
                    <Nav.Link eventKey="gate5" onClick={() => {setGate(5);}}>5관문</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="gate6" onClick={() => {setGate(6);}}>6관문</Nav.Link>
                </Nav.Item>
            </Nav>

            <AbrelshudContent gate={gate} />
        </>
    );
}

function ContentRaid() {
    let {id} = useParams();

    if (id == 0) {
        return (
            <Abrelshud />
        );
    }
}

export default ContentRaid;