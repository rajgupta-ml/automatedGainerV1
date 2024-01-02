/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import socketIOClient from 'socket.io-client';
import TopFiveGainerComp from "./TopFiveGainerComp";
import "../css/trade.css";
import TopFiveLosserComp from "./topFiveLosserComp";
import buyAndSellEndpoint from "../apiCalls/buyAndSellEndpoint";
import getStatusOfTheOrderEndpoint from "../apiCalls/getStatusOfTheOrderEndpoint";
import startTradingEndpoint from "../apiCalls/startTradingEndpoint";
import { useNavigate } from "react-router-dom";
import endTradingEndpoint from "../apiCalls/endTradingEndpoint";

const TradingArea = () => {
    const [realTimeData, setRealTimeData] = useState([]);
    const [topFiveGainer, setTopFiveGainer] = useState([]);
    const [topFiveLosser, setTopFiveLosser] = useState([]);
    const [pastTopFiveGainer, setPastTopFiveGainer] = useState([]);
    const [pastTopFiveLosser, setPastTopFiveLosser] = useState([]);
    const [buyAndSellAllTrigger, setBuyAndSellAllTrigger] = useState(false);
    const [disableBuyButton, setDisableBuyButton] = useState(false);
    const [disableSellButton, setDisableSellButton] = useState(false);
    // ...

    useEffect(() => {
        const socket = socketIOClient('http://localhost:8080');

        socket.on('realTimeData', (data) => {
            setRealTimeData(prevData => {
                const existingIndex = prevData.findIndex(item => item.instrument === data.data.instrument);

                if (existingIndex !== -1) {
                    // If the instrument is already present, check if percentageChange has changed
                    if (prevData[existingIndex].percentageChange !== data.data.percentageChange) {
                        // If changed and the new percentageChange is not null, update the state
                        if (data.data.percentageChange !== null) {
                            const updatedData = [...prevData];
                            updatedData[existingIndex] = data.data;
                            return updatedData;
                        }
                    }
                    // If percentageChange has not changed or is null, return the existing state
                    return prevData;
                }

                // If the instrument is not present and the new percentageChange is not null, add it to the array
                if (data.data.percentageChange !== null) {
                    return [...prevData, data.data];
                }

                // If percentageChange is null, return the existing state
                return prevData;
            });
        });

        return () => socket.disconnect();
    }, []);


    // ...
    function arraysEqual(arr1, arr2) {
        return JSON.stringify(arr1) === JSON.stringify(arr2);
    }


    // console.log(localStorage.getItem("isRankUpdate"));

    useEffect(() => {
        let isRankUpdated = localStorage.getItem("isRankUpdate");
        if (isRankUpdated === "false" || isRankUpdated === null) {
            alert();
            const snapShotData = [...realTimeData]
            snapShotData.sort((a, b) => b.snapShotPercentageChangeValue - a.snapShotPercentageChangeValue);
            snapShotData.forEach((item, index) => {
                item.rank = index + 1;
            });
            const sortedDataWithRankMap = new Map(snapShotData.map(item => [item.instrument, item.rank]));
            localStorage.setItem('sortedDataWithRank', JSON.stringify([...sortedDataWithRankMap.entries()]));
            localStorage.setItem("isRankUpdate", true);
        }

        const storedSortedDataWithRank = JSON.parse(localStorage.getItem('sortedDataWithRank')) || [];
        const storeDataInMap = new Map(storedSortedDataWithRank.map(item => [item[0], item[1]]));
        const sortedData = [...realTimeData].sort((a, b) => b.percentageChange - a.percentageChange);
        sortedData.forEach(item => {
            item.rank = storeDataInMap.get(item.instrument) || null;
        });

        const newTopFiveGainer = sortedData.slice(0, 10);
        let newTopFiveLosser = sortedData.slice(-10).reverse();

        // Check if there is a change before updating the state
        if (!arraysEqual(newTopFiveGainer, topFiveGainer)) {
            setTopFiveGainer(newTopFiveGainer);
            setPastTopFiveGainer(prevPastData => [...prevPastData.slice(-1), newTopFiveGainer]);
        }

        if (!arraysEqual(newTopFiveLosser, topFiveLosser)) {
            setTopFiveLosser(newTopFiveLosser);
            setPastTopFiveLosser(prevPastData => [...prevPastData.slice(-1), newTopFiveLosser]);
        }
    }, [realTimeData, topFiveGainer, topFiveLosser, setTopFiveGainer, setTopFiveLosser, setPastTopFiveGainer, setPastTopFiveLosser]);




    const handleBuyAll = async () => {
        const dataToBought = new Map([...topFiveGainer].map(item => [item.instrument, item]));
        const successfulBuys = JSON.parse(localStorage.getItem("successfulBuys"));
        // Removing already Bought shares
        successfulBuys.map((item) => {
            if (dataToBought.get(item)) {
                dataToBought.delete(item);
            }
        })

        // Placing order

        const boughtShareDetailPromises = [];


        for (const value of dataToBought.values()) {
            const response = buyAndSellEndpoint({ instrument: value.instrument, signal: "BUY", qty: value.qty })
            boughtShareDetailPromises.push(response);
        }


        const orderdetails = await Promise.all(boughtShareDetailPromises)
        const orderId = [];
        orderdetails.forEach((item) => {
            orderId.push(item.data.data.order_id)
        })


        const orderStatusPromises = []

        orderId.map((value) => {
            const response = getStatusOfTheOrderEndpoint({ orderId: value })
            orderStatusPromises.push(response)
        })


        const orderSuccessDetails = await Promise.all(orderStatusPromises)
        // console.log(orderSuccessDetails);


        orderSuccessDetails.forEach((item) => {
            if (item.data.data.status === 'complete') {
                // Step 4: Update state if the order is complete
                successfulBuys.push(item.data.data.instrument_token);
                // alert('Order placed successfully');
            } else {
                // Alert if the order processing failed
                alert(`Order processing failed. Status: ${item.data.data.status_message}`);
            }
        })

        localStorage.setItem("successfulBuys", JSON.stringify(successfulBuys))

        setDisableBuyButton(true);
        setBuyAndSellAllTrigger(!buyAndSellAllTrigger);
    }


    const handleSellAll = async () => {
        const dataToBeSold = new Map([...topFiveLosser].map(item => [item.instrument, item]));
        const successfulSells = JSON.parse(localStorage.getItem("successfulSells"));
        // Removing already Bought shares
        successfulSells.map((item) => {
            if (dataToBeSold.get(item)) {
                dataToBeSold.delete(item);
            }
        })

        // Placing order

        const SoldSharesDetsPromises = [];


        for (const value of dataToBeSold.values()) {
            const response = buyAndSellEndpoint({ instrument: value.instrument, signal: "SELL", qty: value.qty })
            SoldSharesDetsPromises.push(response);
        }


        const orderdetails = await Promise.all(SoldSharesDetsPromises)
        const orderId = [];
        orderdetails.forEach((item) => {
            orderId.push(item.data.data.order_id)
        })


        const orderStatusPromises = []

        orderId.map((value) => {
            const response = getStatusOfTheOrderEndpoint({ orderId: value })
            orderStatusPromises.push(response)
        })


        const orderSuccessDetails = await Promise.all(orderStatusPromises)
        // console.log(orderSuccessDetails);


        orderSuccessDetails.forEach((item) => {
            if (item.data.data.status === 'complete') {
                // Step 4: Update state if the order is complete
                successfulSells.push(item.data.data.instrument_token);
                // alert('Order placed successfully');
            } else {
                // Alert if the order processing failed
                alert(`Order processing failed. Status: ${item.data.data.status_message}`);
            }
        })

        localStorage.setItem("successfulSells", JSON.stringify(successfulSells))

        setBuyAndSellAllTrigger(!buyAndSellAllTrigger);
        setDisableSellButton(true);
    }

    const handleReconnection = async () => {
        const response = await startTradingEndpoint()


        try {
            if (response.data.success) alert(`Websocket ReConnected`)
        } catch (error) {
            alert("Something is wrong")

        }
        setBuyAndSellAllTrigger(!buyAndSellAllTrigger);
    }


    const navigate = useNavigate();

    const handleEndTrading = async () => {

        const date = new Date();
        const hour = date.getHours();
        const min = date.getMinutes();

        if (hour < 3 && min < 30) {
            alert("Can't End trading sorry")

        } else if (hour >= 3 || min >= 30) {
            const response = await endTradingEndpoint()
            if (response.data.success) {
                localStorage.clear()
                alert("Logout Successful")
                navigate('/')
            } else {
                alert("Access Token in invalid")
            }
        }
    }




    return (
        <div>
            <div>
                <div className="flex">

                    <div style={{ "display": "flex", "gap": "1rem" }}>
                        <button onClick={handleEndTrading}>End Trading</button>
                        <button onClick={handleReconnection}>Reconnect WebSocket</button>
                    </div>

                </div>
                <div className="trading-view">
                    <div>
                        <div className="buyAll">
                            <h1>Top Gainer</h1>
                            <button className={!disableBuyButton ? "buyAllBtn" : "boughtAllBtn"} onClick={handleBuyAll}>{!disableBuyButton ? "BUY ALL" : "BOUGHT ALL"}</button>
                        </div>
                        <TopFiveGainerComp key={buyAndSellAllTrigger} past={pastTopFiveGainer} buyAllTrigger={buyAndSellAllTrigger} />
                    </div>

                    <div>
                        <div className="sellAll">
                            <h1>Top Loser</h1>
                            <button className={!disableSellButton ? "sellAllBtn" : "SoldAllBtn"} onClick={handleSellAll}>{!disableSellButton ? "SELL ALL" : "SOLD ALL"}</button>
                        </div>
                        <TopFiveLosserComp key={buyAndSellAllTrigger} past={pastTopFiveLosser} sellAllTrigger={buyAndSellAllTrigger} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TradingArea;
