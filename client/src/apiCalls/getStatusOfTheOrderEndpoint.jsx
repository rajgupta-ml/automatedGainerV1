import axios from "axios"

const getStatusOfTheOrderEndpoint = async ({ orderId }) => {
    console.log(orderId);
    const token = localStorage.getItem("token");
    let config = {
        headers: {
            "api-version": 2.0,
            "Authorization": `Bearer ${token}`,
            "accept": "application/json"
        }
    }
    const response = await axios.get(`https://api.upstox.com/v2/order/details?order_id=${orderId}`, config)
    return response
}

export default getStatusOfTheOrderEndpoint
