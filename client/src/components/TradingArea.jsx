/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import socketIOClient from 'socket.io-client';
import TopFiveGainerComp from "./TopFiveGainerComp";
import "../css/trade.css";
import TopFiveLosserComp from "./topFiveLosserComp";

const TradingArea = () => {
    const [realTimeData, setRealTimeData] = useState([]);
    const [topFiveGainer, setTopFiveGainer] = useState([]);
    const [topFiveLosser, setTopFiveLosser] = useState([]);
    const [pastTopFiveGainer, setPastTopFiveGainer] = useState([]);
    const [pastTopFiveLosser, setPastTopFiveLosser] = useState([]);
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

    useEffect(() => {
        const snapShotData = realTimeData.filter(item => item.snapShotPercentageChangeValue !== null);

        if (snapShotData.length > 0) {
            snapShotData.sort((a, b) => b.snapShotPercentageChangeValue - a.snapShotPercentageChangeValue);
            snapShotData.forEach((item, index) => {
                item.rank = index + 1;
            });

            const sortedDataWithRankMap = new Map(snapShotData.map(item => [item.instrument, { ISIN_Code: item.instrument, rank: item.rank }]));
            localStorage.setItem('sortedDataWithRank', JSON.stringify([...sortedDataWithRankMap.values()]));
        }

        const storedSortedDataWithRank = JSON.parse(localStorage.getItem('sortedDataWithRank')) || [];
        const sortedDataWithRankMap = new Map(storedSortedDataWithRank.map(item => [item.ISIN_Code, item.rank]));

        const sortedData = [...realTimeData].sort((a, b) => b.percentageChange - a.percentageChange);
        sortedData.forEach(item => {
            item.rank = sortedDataWithRankMap.get(item.instrument) || null;
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

    // ...


    return (
        <div>
            <div>
                <h1>Trading Area</h1>
                <div className="trading-view">
                    <div>
                        <h1>Top 5 Gainer</h1>
                        <TopFiveGainerComp past={pastTopFiveGainer} />
                    </div>

                    <div>
                        <h1>Top 5 Loser</h1>
                        <TopFiveLosserComp past={pastTopFiveLosser} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TradingArea;
