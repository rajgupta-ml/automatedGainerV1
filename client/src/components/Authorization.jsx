import { useState } from "react"
import { useNavigate } from "react-router-dom"
import authEndpoint from "../apiCalls/authEndpoint"
import '../css/auth.css'



const handleAuth = async (e, inp, navigate ) => {
    e.preventDefault()
    const response = await authEndpoint({accessCode: inp})

    const token = response.data.token;
    if(response.data.success) {
        navigate("/dashboard")
        if(token) localStorage.setItem("token" , token)
    }
}

const Authorization = () => {
    const navigate = useNavigate()
    const [inp, setInp] = useState()

  return (
    <div>
        <form onSubmit={(e) => handleAuth(e, inp, navigate)} className="authorization">
            <label htmlFor="access-code" >
                Enter the access code
            <input placeholder = "Enter code" type="text" id = "access-code" onChange = {(e) => setInp(e.target.value)} ></input>
            </label>
            <button type = "submit"> Submit</button>
        </form>
    </div>
  )
}

export default Authorization
