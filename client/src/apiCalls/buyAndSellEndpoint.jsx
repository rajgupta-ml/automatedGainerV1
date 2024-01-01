import axios from "axios";

const buyAndSellEndpoint = async ({ instrument, signal, qty }) => {
    const token = localStorage.getItem('token')
    let config = {
        headers: {
            "api-version": 2.0,
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
            "accept": "application/json"
        }
    }
    const response = await axios.post(`https://api.upstox.com/v2/order/place`,
        { quantity: qty, product: "D", validity: "DAY", price: "0", instrument_token: instrument, order_type: "MARKET", transaction_type: signal, disclosed_quantity: 0, trigger_price: 0, is_amo: "False" }
        , config)
    return response;
}

export default buyAndSellEndpoint
