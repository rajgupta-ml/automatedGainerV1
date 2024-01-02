import { useNavigate } from 'react-router-dom'
import '../css/dashboard.css'
import endTradingEndpoint from '../apiCalls/endTradingEndpoint'
// import startTradingEndpoint from '../apiCalls/startTradingEndpoint'
import getPrevCloseEndpoint from '../apiCalls/GetPrevCloseEndpoint'
import StartTrading from './StartTrading'
const Dashboard = () => {

    const navigate = useNavigate()


    const handleEndTrading = async () => {
        const date = new Date();
        const hour = date.getHours();
        const min = date.getMinutes();

        if (hour < 3 && min < 30) {
            alert("Can't End trading sorry")

        } else if (hour >= 3 && min >= 30) {
            localStorage.clear();
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
            <StartTrading></StartTrading>
            <button type="button" onClick={handleEndTrading}>End Trading</button>
        </div>
    )
}

export default Dashboard
