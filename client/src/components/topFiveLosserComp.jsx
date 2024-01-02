/* eslint-disable react/prop-types */

import { useEffect, useState } from 'react';
import '../css/GainerLosser.css';
import buyAndSellEndpoint from '../apiCalls/buyAndSellEndpoint';
import getStatusOfTheOrderEndpoint from '../apiCalls/getStatusOfTheOrderEndpoint';

const TopFiveLosserComp = ({ past, sellAllTrigger }) => {


    const [prevTick, setPrevTick] = useState([]);
    const [latestTick, setLatestTick] = useState([]);
    const [changedInstruments, setChangedInstruments] = useState([]);
    // const [orderBook, setOrderBook] = useState([]);
    const [successfulSells, setsuccessfulSells] = useState(() => {
        // Retrieve successfulSells from localStorage on component mount
        const storedBuys = localStorage.getItem('successfulSells');
        return storedBuys ? JSON.parse(storedBuys) : [];
    });


    useEffect(() => {
        if (past.length >= 2) {
            setPrevTick(past[0]);
            setLatestTick(past[1]);
        }
    }, [past]);

    // useEffect(() => {
    //     const timer = setTimeout(() => {
    //         setChangedInstruments([]);
    //     }, 60000 * 5); // 1 minute in milliseconds

    //     return () => clearTimeout(timer);
    // }, [changedInstruments]);

    useEffect(() => {
        // Find instruments in prevTick that are not present in latestTick
        const changedInstrumentsList = latestTick
            .filter((latestTickData) => !prevTick.some((prevTickData) => prevTickData.instrument === latestTickData.instrument))
            .map((changedInstrument) => changedInstrument.instrument);

        // Update the state with the list of changed instruments
        setChangedInstruments(changedInstrumentsList);
    }, [prevTick, latestTick]);


    const handleSell = async ({ instrument, qty }) => {
        try {
            const response = await buyAndSellEndpoint({ instrument, signal: 'SELL', qty });
            const orderId = response.data.data.order_id;


            const orderStatus = await getStatusOfTheOrderEndpoint({ orderId });

            if (orderStatus.data.data.status === "complete") {
                setsuccessfulSells((prevBuys) => [...prevBuys, instrument]);
                // setOrderBook((prevBook) => [
                //     ...prevBook,
                //     {
                //         instrument,
                //         "price": orderStatus.data.data.average_price,
                //         "side" : "SELL",
                //         timestamp: new Date().toISOString(),
                //     }
                // ]);

                alert("Order Placed Successfully")

            } else {
                alert(`Order processing failed. Status: ${orderStatus.data.data.status_message}`);
            }

        } catch (error) {
            console.error('Error in handleBuy:', error);
            alert('Failed to place order. Please check the console for details.');
        }
    };

    useEffect(() => {
        localStorage.setItem('successfulSells', JSON.stringify(successfulSells));
    }, [successfulSells]);

    useEffect(() => {
        console.log("Order placed succefully")
    }, [sellAllTrigger]);


    return (
        <div className="gainer-table">
            <table>
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th className='hide'>ISIN Code</th>
                        <th>Symbol</th>
                        <th>LTP</th>
                        <th>Percentage Change</th>
                        <th>qty</th>
                        <th>Prev Close</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {latestTick.map((data) => {
                        const isSold = successfulSells.includes(data.instrument);
                        const prevTickData = prevTick.find((prevData) => prevData.instrument === data.instrument);
                        const ltpColorClass = prevTickData ? (data.ltp > prevTickData.ltp ? 'green' : data.ltp < prevTickData.ltp ? 'red' : '') : '';
                        const percentageChangeColorClass = prevTickData ? (
                            Number(data.percentageChange) > Number(prevTickData.percentageChange) ? 'green' :
                                Number(data.percentageChange) < Number(prevTickData.percentageChange) ? 'red' :
                                    ''
                        ) : '';



                        const rowColor = successfulSells.includes(data.instrument) ? 'tableSuccessSell' : (changedInstruments.includes(data.instrument) ? 'table-changed' : '');

                        return (
                            <tr key={data.instrument} className={rowColor}>
                                <td>{data.rank}</td>
                                <td className='hide'>{data.instrument}</td>
                                <td>{data.companyName}</td>
                                <td className={ltpColorClass}>{data.ltp}</td>
                                <td className={percentageChangeColorClass}>
                                    {data.percentageChange !== null && data.percentageChange !== undefined
                                        ? `${data.percentageChange.toFixed(2)}%`
                                        : 'N/A'}
                                </td>
                                <td>{data.qty}</td>
                                <td>{data.prevDayClosingP}</td>
                                <td>
                                    <button
                                        className="sell"
                                        onClick={() => handleSell({ instrument: data.instrument, ltp: data.ltp, qty: data.qty })}
                                        disabled={isSold}
                                    >
                                        {isSold ? 'Sold' : 'Sell'}
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default TopFiveLosserComp;
