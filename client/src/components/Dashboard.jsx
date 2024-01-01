import { useNavigate } from 'react-router-dom'
import '../css/dashboard.css'
import endTradingEndpoint from '../apiCalls/endTradingEndpoint'
import startTradingEndpoint from '../apiCalls/startTradingEndpoint'
import getPrevCloseEndpoint from '../apiCalls/GetPrevCloseEndpoint'
const Dashboard = () => {

    const navigate = useNavigate()
    const handleStartTrading = async () => {
        const response = await startTradingEndpoint()


        try {
            if (response.data.success) alert(`Trading started on ${Date.now()}`)
            navigate("/trading-area");
        } catch (error) {
            alert("Something is wrong")

        }

    }

    const handleEndTrading = async () => {
        const response = await endTradingEndpoint()

        if (response.data.success) {
            localStorage.clear()
            alert("Logout Successful")
            navigate('/')
        } else {
            alert("Access Token in invalid")
        }
    }


    const handleGetPrevClose = async () => {
        try {
            const response = await getPrevCloseEndpoint();
            alert(response.data.message);
        } catch (error) {
            alert("Something went wrong")
        }
    }
    return (
        <div className="dashboard-btn">
            <button type='button' onClick={handleGetPrevClose}>Get Previous Day close</button>
            <button type="button" onClick={handleStartTrading}>Start Trading</button>
            <button type="button" onClick={handleEndTrading}>End Trading</button>
        </div>
    )
}

export default Dashboard
