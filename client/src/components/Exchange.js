import { React, useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Spinner, Table, Tabs, Tab, Row, Col, OverlayTrigger, Tooltip, Button, Modal, Alert } from 'react-bootstrap';
import { ResponsiveLine } from '@nivo/line';

import '../App.css';

function TableHead(props) {
    function ThPrice() {
        return (
            props.sortDesc == null ? <th className="align-middle" width="70px" onClick={() => {props.clickSort()}} style={{cursor:"pointer"}}>현재 최저가</th> :
            props.sortDesc === false ? <th className="align-middle" width="70px" onClick={() => {props.clickSort()}} style={{cursor:"pointer"}}>현재 최저가 ▲</th> :
            <th className="align-middle" width="70px" onClick={() => {props.clickSort()}} style={{cursor:"pointer"}}>현재 최저가 ▼</th>
        )
    }

    return (
        <thead>
            <tr>
                <th className="align-middle" width="50px">아이템</th>
                <th width="200px">{props.category}</th>
                <ThPrice />
            </tr>
        </thead>
    )
}

function TableRow(props) {
    let item = props.item;
    const [show, setShow] = useState(false);

    if (item.dataGrade != null) {
        return (
            <tr>
                {
                    item.effect == null ? <td><img className="border border-secondary m-1" src={item.imgSrc} width="50px"/></td> :
                    <td><OverlayTrigger key="right" placement="right" overlay={
                        <Tooltip>
                            <div id="tooltip-content" dangerouslySetInnerHTML={{__html:item.effect}}></div>
                        </Tooltip>
                    }><img className="border border-secondary m-1" src={item.imgSrc} width="50px"/></OverlayTrigger></td>
                }
                {
                    props.chart === false ? 
                    <td className="fs-7 text-dark mb-3 fw-bold align-middle" width="200px"><span className={"data-grade-" + item.dataGrade}>{item.name}</span></td> :
                    <td className="fs-7 text-dark mb-3 fw-bold align-middle" width="170px"><span className={"data-grade-" + item.dataGrade} >{item.name}</span></td>
                }
                {
                    props.chart === false ?
                    <td className="fs-7 text-dark mb-3 fw-bold align-middle" width="70px">{item.price} <img src={process.env.PUBLIC_URL + "/img/gold.png"} /></td> :
                    <td className="fs-7 text-dark mb-3 fw-bold align-middle" width="100px">
                        <Button variant="dark" size="sm" onClick={() => {setShow(true)}}>시세</Button>
                        <Modal size="xl" show={show} onHide={() => {setShow(false)}} aria-labelledby="modal-price-chart">
                            <Modal.Header closeButton id="modal-price-chart">
                                {item.name}
                            </Modal.Header>
                            <Modal.Body>
                                <HighPriceChart id={item.name} />
                                <Alert variant="secondary">
                                    시세 정보는 1시간 단위로 업데이트되며, 최대 30개까지 표시됩니다. (서버가 꺼져있을 경우 데이터 수집이 진행되지 않습니다.)
                                </Alert>
                            </Modal.Body>
                        </Modal>
                        &nbsp;&nbsp;{item.price} <img src={process.env.PUBLIC_URL + "/img/gold.png"} />
                    </td>
                }
            </tr>
        )
    } else {
        return null;
    }
}

function ItemInfo(props) {
    const [items, setItems] = useState([]);
    const [isItemLoaded, setIsItemLoaded] = useState(false);
    const [sortDesc, setSortDesc] = useState(null);
    const urlExchange = process.env.REACT_APP_URL_SERVER + '/exchange';

    useEffect(() => {
        axios.get(urlExchange, {
            params: {
                category: props.category
            }
        })
        .then((result) => {
            let newItems = [];

            result.data.map((item) => {
                newItems.push(item);
            });
            setItems([...items, ...newItems]);
            setIsItemLoaded(true);
        })
        .catch((err) => {
            console.log('[Exchange] | [ItemInfo] | ' + err);
        })
    }, []);
    useEffect(() => {
        let sortedItem = [...items];

        if (sortDesc) {
            sortedItem.sort((a, b) => {
                return Number(b.price.replace(/,/g, "")) - Number(a.price.replace(/,/g, ""));
            });
        } else {
            sortedItem.sort((a, b) => {
                return Number(a.price.replace(/,/g, "")) - Number(b.price.replace(/,/g, ""));
            });
        }
        setItems([...sortedItem]);
    }, [sortDesc]);

    function ClickSort() {
        if (sortDesc === false) {
            setSortDesc(true);
        } else {
            setSortDesc(false);
        }
    }

    if (isItemLoaded) {
        return (
            <Table className="mt-3 mx-auto" hover variant="dark" width="350px">
                <TableHead sortDesc={sortDesc} clickSort={ClickSort}/>
                    <tbody className="table-light">
                        {
                            items.map((item, i) => {
                                return (
                                    <TableRow key={i} item={item} chart={props.chart}/>
                                )
                            })
                        }
                    </tbody>
            </Table>
        )
    } else {
        return (
            <Spinner animation="border" variant="dark" className="mt-3"/>
        )
    }
    
}

const PriceChart = (props) => (
    <ResponsiveLine
        data={props.data}
        margin={{ top: 50, right: 60, bottom: 50, left: 80 }}
        xScale={{ type: 'point' }}
        yScale={{
            type: 'linear',
            min: 'auto',
            max: 'auto',
            stacked: false,
            reverse: false
        }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
            orient: 'bottom',
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 40,
            legendOffset: 50,
            legendPosition: 'middle'
        }}
        axisLeft={{
            orient: 'left',
            tickSize: 1,
            tickPadding: 1,
            tickRotation: 0,
            legend: '가격',
            legendOffset: -60,
            legendPosition: 'middle'
        }}
        colors={{ scheme: 'category10' }}
        pointSize={10}
        pointColor={{ from: 'color', modifiers: [] }}
        pointBorderWidth={2}
        pointBorderColor={{ from: 'serieColor' }}
        pointLabelYOffset={-12}
        useMesh={true}
    />
)

const HighPriceChart = (props) => {
    const [data, setData] = useState([]);
    const [dataLoaded, setDataLoaded] = useState(false);
    const urlMarketprice = process.env.REACT_APP_URL_SERVER + '/marketprice';

    useEffect(async () => {
        let newData = [];
        let item = {};

        item.id = props.id;
        item.data = [];
        await axios.get(urlMarketprice, {
            params: {
                itemName:props.id
            }
        }).then((result) => {
            let elements = result.data.reverse();

            for (let i = 0; i < 30; i++) {
                if (i >= elements.length) break;
                item.data.push({x:elements[i].time, y:Number(elements[i].price.replace(/,/g, ''))});
            }
        });
        item.data = item.data.reverse();
        newData.push(item);

        setData([...data, ...newData]);
        setDataLoaded(true);
    }, []);

    if (dataLoaded) {
        return (
            <Container className="mb-4" style={{height:"500px"}}>
                <PriceChart data={data} />
            </Container>
        )
    } else {
        return null;
    }
};

function Exchange() {
    return (
        <Container className="mt-3">
            <Alert variant="secondary">
                서버 상태에 따라 실시간 가격과 차이가 있을 수 있습니다.
            </Alert>
            <Tabs defaultActiveKey="에스더" className="mt-3 fs-7 text-dark fw-bold">
                <Tab eventKey="에스더" title="에스더 / 10렙 보석">
                    <Container className="w-75">
                        <ItemInfo category="valuable" chart={true} />
                    </Container>
                </Tab>
                <Tab eventKey="강화 재료" title="강화 재료">
                    <Container className="w-75">
                        <ItemInfo category="reforge" chart={false} />
                    </Container>
                </Tab>
                <Tab eventKey="회복약" title="회복약">
                    <Container className="w-75">
                        <ItemInfo category="recovery" chart={false} />
                    </Container>
                </Tab>
                <Tab eventKey="폭탄 / 수류탄" title="폭탄 / 수류탄">
                    <Container>
                        <Row>
                            <Col><ItemInfo category="bomb" chart={false} /></Col>
                            <Col><ItemInfo category="bombShine" chart={false} /></Col>
                        </Row>
                    </Container>
                </Tab>
                <Tab eventKey="유틸" title="유틸">
                    <Container className="w-75">
                        <ItemInfo category="util" chart={false} />
                    </Container>
                </Tab>
                <Tab eventKey="각인서" title="각인서">
                    <Container>
                        <Row>
                            <Col><ItemInfo category="engraveCommon" chart={false} /></Col>
                            <Col><ItemInfo category="engraveClass" chart={false} /></Col>
                        </Row>
                    </Container>
                </Tab>
            </Tabs>
        </Container>
    )
}

export default Exchange;