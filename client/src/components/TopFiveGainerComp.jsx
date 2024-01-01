/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import '../css/GainerLosser.css';
import buyAndSellEndpoint from '../apiCalls/buyAndSellEndpoint';
// import tralingStopLossEndpoint from '../apiCalls/trailingStopLossEndpoint';
import getStatusOfTheOrderEndpoint from '../apiCalls/getStatusOfTheOrderEndpoint';

const TopFiveGainerComp = ({ past }) => {
    const [prevTick, setPrevTick] = useState([]);
    const [latestTick, setLatestTick] = useState([]);
    const [changedInstruments, setChangedInstruments] = useState([]);
    // const [orderBook, setOrderBook] = useState([]);
    const [successfulBuys, setSuccessfulBuys] = useState(() => {
        // Retrieve successfulBuys from localStorage on component mount
        const storedBuys = localStorage.getItem('successfulBuys');
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



    // useEffect(() => {
    //     console.log(changedInstruments);
    // }, [changedInstruments])

    const handleBuy = async ({ instrument, qty }) => {
        try {
            // Step 1: Place the Buy Order
            const response = await buyAndSellEndpoint({ instrument, signal: 'BUY', qty });
            const orderId = response.data.data.order_id;

            // Step 2: Wait for the order to be processed
            const orderStatus = await getStatusOfTheOrderEndpoint({ orderId });

            // Step 3: Check the order status before updating state
            if (orderStatus.data.data.status === 'complete') {
                // Step 4: Update state if the order is complete
                setSuccessfulBuys((prevBuys) => [...prevBuys, instrument]);
                // setOrderBook((prevOrder) => [
                //     ...prevOrder,
                //     {
                //         instrument,
                //         "price": orderStatus.data.data.average_price,
                //         "side": "BUY",
                //         timestamp: new Date().toISOString(),
                //     }
                // ]);
                alert('Order placed successfully');
            } else {
                // Alert if the order processing failed
                alert(`Order processing failed. Status: ${orderStatus.data.data.status_message}`);
            }
        } catch (error) {
            // Handle errors during the process
            console.error('Error in handleBuy:', error);
            alert('Failed to place order. Please check the console for details.');
        }
    };


    // useEffect(() => {
    //     const handleSL = async () => {

    //         try {
    //             await tralingStopLossEndpoint({ orderBook });

    //         } catch (error) {
    //             console.log("error:", error);
    //         }
    //     }

    //     handleSL()
    // }, [orderBook]);

    // Store successfulBuys in localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('successfulBuys', JSON.stringify(successfulBuys));
    }, [successfulBuys]);

    return (
        <div className="gainer-table">
            <table>
                <thead>
                    <tr>
                        <th>ISIN Code</th>
                        <th>Symbol</th>
                        <th>LTP</th>
                        <th>Percentage Change</th>
                        <th>Qty</th>
                        <th>Prev Close</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {latestTick.map((data) => {
                        const prevTickData = prevTick.find((prevData) => prevData.instrument === data.instrument);
                        const isBought = successfulBuys.includes(data.instrument);
                        const ltpColorClass = prevTickData
                            ? data.ltp > prevTickData.ltp
                                ? 'green'
                                : data.ltp < prevTickData.ltp
                                    ? 'red'
                                    : ''
                            : '';
                        const percentageChangeColorClass = prevTickData
                            ? Number(data.percentageChange) > Number(prevTickData.percentageChange)
                                ? 'green'
                                : Number(data.percentageChange) < Number(prevTickData.percentageChange)
                                    ? 'red'
                                    : ''
                            : '';

                        const rowColor = successfulBuys.includes(data.instrument) ? 'tableSuccess' : (changedInstruments.includes(data.instrument) ? 'table-changed' : '');


                        return (
                            <tr key={data.instrument} className={rowColor}>
                                {/* ... (table cell code) */}
                                <td>{data.instrument}</td>
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
                                        className="buy"
                                        onClick={() => handleBuy({ instrument: data.instrument, ltp: data.ltp, qty: data.qty })}
                                        disabled={isBought}
                                    >
                                        {isBought ? 'Bought' : 'Buy'}
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

export default TopFiveGainerComp;
