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
                props.chart == null ? 
                <td className="fs-7 text-dark mb-3 fw-bold align-middle" width="200px"><span className={"data-grade-" + item.dataGrade}>{item.name}</span></td> :
                <td className="fs-7 text-dark mb-3 fw-bold align-middle" width="170px"><span className={"data-grade-" + item.dataGrade} >{item.name}</span></td>
            }
            {
                props.chart == null ?
                <td className="fs-7 text-dark mb-3 fw-bold align-middle" width="70px">{item.price} <img src={process.env.PUBLIC_URL + "/img/gold.png"} /></td> :
                <td className="fs-7 text-dark mb-3 fw-bold align-middle" width="100px">
                    <Button variant="dark" size="sm" onClick={() => {setShow(true)}}>시세</Button>
                    <Modal size="xl" show={show} onHide={() => {setShow(false)}} aria-labelledby="modal-price-chart">
                        <Modal.Header closeButton id="modal-price-chart">
                            {item.name}
                        </Modal.Header>
                        <Modal.Body>
                            <HighPriceChart id={item.name} param={props.chart} />
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
}

function ItemInfo(props) {
    const [itemList, setItemList] = useState([]);
    const [itemLoad, setItemLoad] = useState(false);
    const [sortDesc, setSortDesc] = useState(null);

    useEffect(() => {
        axios.get(props.url, {
            params: {
                items: props.items
            }
        })
        .then((result) => {
            let items = [];

            result.data.map((item) => {
                items.push(item);
            });
            setItemList([...itemList, ...items]);
            setItemLoad(true);
        })
        .catch((err) => {
            console.log('[ERR] : ' + err);
        })
    }, []);
    useEffect(() => {
        let sortedItem = [...itemList];

        if (sortDesc) {
            sortedItem.sort((a, b) => {
                return Number(b.price.replace(/,/g, "")) - Number(a.price.replace(/,/g, ""));
            });
        } else {
            sortedItem.sort((a, b) => {
                return Number(a.price.replace(/,/g, "")) - Number(b.price.replace(/,/g, ""));
            });
        }
        setItemList([...sortedItem]);
    }, [sortDesc]);

    function ClickSort() {
        if (sortDesc === false) {
            setSortDesc(true);
        } else {
            setSortDesc(false);
        }
    }

    if (itemLoad) {
        return (
            <Table className="mt-3 mx-auto" hover variant="dark" width="350px">
                <TableHead category={props.category} sortDesc={sortDesc} clickSort={ClickSort}/>
                    <tbody className="table-light">
                        {
                            itemList.map((item, i) => {
                                return (
                                    <TableRow key={i} item={item} />
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

function HighPrice() {
    const [itemsAuction, setItemsAuction] = useState([]);
    const [itemsMarket, setItemsMarket] = useState([]);
    const [auctionLoad, setAuctionLoad] = useState(false);
    const [marketLoad, setMarketLoad] = useState(false);
    const params = {"에스더의 기운":"esther", "10레벨 멸화의 보석":"myul", "10레벨 홍염의 보석":"hong"};

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_URL_SERVER}/exchange/auction`, {
            params: {
                items: ['10레벨 멸화', '10레벨 홍염']
            }
        })
        .then((result) => {
            let jewels = [];

            result.data.map((item) => {
                jewels.push(item);
            });
            setItemsAuction([...itemsAuction, ...jewels]);
            setAuctionLoad(true);
        })
        .catch((err) => {
            console.log('[ERR] : ' + err);
        })
    }, []);
    useEffect(() => {
        axios.get(`${process.env.REACT_APP_URL_SERVER}/exchange/market`, {
            params: {
                items: ['에스더'],
            }
        })
        .then((result) => {
            let esther = [];

            result.data.map((item) => {
                esther.push(item);
            });
            setItemsMarket([...itemsMarket, ...esther]);
            setMarketLoad(true);
        })
        .catch((err) => {
            console.log('[ERR] : ' + err);
        })
    }, []);

    if (auctionLoad && marketLoad) {
        return (
            <Table className="mt-3 w-75 mx-auto" hover variant="dark">
                <TableHead />
                <tbody className="table-light">
                    {
                        itemsAuction.map((item, i) => {
                            return (
                                <TableRow key={i} item={item} chart={params[item.name]}/>
                            )
                        })
                    }
                    {
                        itemsMarket.map((item, i) => {
                            return (
                                <TableRow key={i} item={item} chart={params[item.name]}/>
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
    const URL_MARKETPRICE = `${process.env.REACT_APP_URL_SERVER}/marketprice/`;
    //let data = [];
    const [data, setData] = useState([]);
    const [dataLoaded, setDataLoaded] = useState(false);

    useEffect(async () => {
        let newData = [];
        let item = {};

        item.id = props.id;
        item.data = [];
        await axios.get(URL_MARKETPRICE + props.param).then((result) => {
            result.data.map((value, j) => {
                item.data.push({x:value.time, y:Number(value.price.replace(/,/g, ''))});
            });
        });
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
    let reforgingMain = [
        '수호석 결정', '수호강석', '파괴석 결정', '파괴강석', '명예의 파편 주머니(소)', '명예의 파편 주머니(중)', '명예의 파편 주머니(대)',
        '명예의 돌파석', '위대한 명예의 돌파석', '경이로운 명예의 돌파석', '하급 오레하', '중급 오레하', '상급 오레하'
    ];
    let reforgingSub = [
        '태양의 은총', '태양의 축복', '태양의 가호'
    ];
    let health = [
        '회복약', '고급 회복약', '정령의 회복약', '빛나는 정령의 회복약'
    ];
    let battle = [
        '성스러운 폭탄', '부식 폭탄', '수면 폭탄', '파괴 폭탄', '섬광 수류탄', '냉기 수류탄', '암흑 수류탄', '점토 수류탄', '화염 수류탄', '회오리 수류탄'
    ];
    let battlePlus = [
        '빛나는 성스러운 폭탄', '빛나는 부식 폭탄', '빛나는 수면 폭탄', '빛나는 파괴 폭탄', '빛나는 섬광 수류탄', '빛나는 냉기 수류탄', '빛나는 암흑 수류탄', '빛나는 점토 수류탄', '빛나는 화염 수류탄', '빛나는 회오리 수류탄'
    ];
    let etc = [
        '신호탄', '성스러운 부적', '빛나는 성스러운 부적', '만능 물약', '빛나는 만능 물약', '페로몬 폭탄', '시간 정지 물약', '각성 물약', '아드로핀 물약', '신속 로브', '빛나는 신속 로브'
    ];
    const marketUrl = `${process.env.REACT_APP_URL_SERVER}/exchange/market`;
    const auctionUrl = `${process.env.REACT_APP_URL_SERVER}/exchange/auction`;
    const engraveCommonUrl = `${process.env.REACT_APP_URL_SERVER}/exchange/engravesCommon4`;
    const engraveClassUrl = `${process.env.REACT_APP_URL_SERVER}/exchange/engravesClass4`;

    return (
        <Container className="mt-3">
            <Tabs defaultActiveKey="에스더" className="mt-3 fs-7 text-dark fw-bold">
                <Tab eventKey="에스더" title="에스더 / 10렙 보석">
                    <HighPrice />
                </Tab>
                <Tab eventKey="강화 재료" title="강화 재료">
                    <Container>
                        <Row>
                            <Col><ItemInfo url={marketUrl} items={reforgingMain}/></Col>
                            <Col><ItemInfo url={marketUrl} items={reforgingSub}/></Col>
                        </Row>
                    </Container>
                </Tab>
                <Tab eventKey="회복약" title="회복약">
                    <Container className="w-75">
                        <ItemInfo url={marketUrl} items={health}/>
                    </Container>
                </Tab>
                <Tab eventKey="폭탄 / 수류탄" title="폭탄 / 수류탄">
                    <Container>
                        <Row>
                            <Col><ItemInfo url={marketUrl} items={battle} category="일반"/></Col>
                            <Col><ItemInfo url={marketUrl} items={battlePlus} category="빛나는"/></Col>
                        </Row>
                    </Container>
                </Tab>
                <Tab eventKey="유틸" title="유틸">
                    <Container className="w-75">
                        <ItemInfo url={marketUrl} items={etc}/>
                    </Container>
                </Tab>
                <Tab eventKey="각인서" title="각인서">
                    <Container>
                        <Row>
                            <Col><ItemInfo url={engraveCommonUrl} items={null} category="공용"/></Col>
                            <Col><ItemInfo url={engraveClassUrl} items={null} category="직업"/></Col>
                        </Row>
                    </Container>
                </Tab>
            </Tabs>
        </Container>
    )
}

export default Exchange;