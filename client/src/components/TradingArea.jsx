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
        // Sort the data and get top gainers and losers
        const sortedData = [...realTimeData].sort((a, b) => b.percentageChange - a.percentageChange);
        // console.log(sortedData);
        const newTopFiveGainer = sortedData.slice(0, 10);
        let newTopFiveLosser = sortedData.slice(-10);
        newTopFiveLosser = newTopFiveLosser.reverse();

        // Check if there is a change before updating the state
        if (!arraysEqual(newTopFiveGainer, topFiveGainer)) {
            setTopFiveGainer(newTopFiveGainer);
            setPastTopFiveGainer(prevPastData => [...prevPastData.slice(-1), newTopFiveGainer]);
        }

        if (!arraysEqual(newTopFiveLosser, topFiveLosser)) {
            setTopFiveLosser(newTopFiveLosser);
            setPastTopFiveLosser(prevPastData => [...prevPastData.slice(-1), newTopFiveLosser]);
        }
    }, [realTimeData, topFiveGainer, topFiveLosser]);

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
