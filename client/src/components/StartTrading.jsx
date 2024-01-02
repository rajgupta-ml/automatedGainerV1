import startTradingEndpoint from '../apiCalls/startTradingEndpoint'
import { useNavigate } from 'react-router-dom'

const StartTrading = () => {

    const navigate = useNavigate();
    const handleStartTrading = async () => {
        const response = await startTradingEndpoint()


        try {
            if (response.data.success) alert(`Trading started on ${Date.now()}`)
            navigate("/trading-area");
        } catch (error) {
            alert("Something is wrong")

        }

    }
    return (
        <div>
            <button type="button" onClick={handleStartTrading}>Start Trading</button>
        </div>
    )
}

export default StartTrading
