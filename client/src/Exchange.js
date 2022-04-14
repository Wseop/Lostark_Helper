import { React, useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Spinner, Table, Tabs, Tab, Row, Col } from 'react-bootstrap';

import './App.css';

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
                <th width="200px"></th>
                <ThPrice />
            </tr>
        </thead>
    )
}

function TableRow(props) {
    let item = props.item;

    return (
        <tr>
            <td><img className="border border-secondary m-1" src={item.imgSrc} width="50px"/></td>
            <td className="fs-7 text-dark mb-3 fw-bold align-middle" width="200px"><span className={"data-grade-" + item.dataGrade}>{item.name}</span></td>
            <td className="fs-7 text-dark mb-3 fw-bold align-middle" width="70px">{item.price} <img src={process.env.PUBLIC_URL + "/img/gold.png"} /></td>
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
                return b.price - a.price;
            });
        } else {
            sortedItem.sort((a, b) => {
                return a.price - b.price;
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
                <TableHead sortDesc={sortDesc} clickSort={ClickSort}/>
                    <tbody className="table-light">
                        {
                            itemList.map((item) => {
                                return (
                                    <TableRow item={item} />
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

    useEffect(() => {
        axios.get('http://localhost:8942/exchange/auction', {
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
        axios.get('http://localhost:8942/exchange/market', {
            params: {
                items: ['에스더']
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
                        itemsAuction.map((item) => {
                            return (
                                <TableRow item={item} />
                            )
                        })
                    }
                    {
                        itemsMarket.map((item) => {
                            return (
                                <TableRow item={item} />
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

function Exchange() {
    let reforgingMain = [
        '수호석 결정', '수호강석', '파괴석 결정', '파괴강석', '명예의 파편 주머니(소)', '명예의 파편 주머니(중)', '명예의 파편 주머니(대)',
        '명예의 돌파석', '위대한 명예의 돌파석', '경이로운 명예의 돌파석'
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
    const marketUrl = 'http://localhost:8942/exchange/market';
    const auctionUrl = 'http://localhost:8942/exchange/auction';

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
                            <Col><ItemInfo url={marketUrl} items={battle}/></Col>
                            <Col><ItemInfo url={marketUrl} items={battlePlus}/></Col>
                        </Row>
                    </Container>
                </Tab>
                <Tab eventKey="기타" title="기타">
                    <Container className="w-75">
                        <ItemInfo url={marketUrl} items={etc}/>
                    </Container>
                </Tab>
            </Tabs>
        </Container>
    )
}

export default Exchange;