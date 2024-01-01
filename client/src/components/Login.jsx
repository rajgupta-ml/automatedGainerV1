import { useNavigate } from "react-router-dom"
import handleLogin from "../apiCalls/handleLogin"

const Login = () => {
    const navigate = useNavigate()
    const loginHandle = async (e) => {
        e.preventDefault();

        const res = await handleLogin()
        console.log(res)

        if(res.data.success){
            setTimeout(() => {
                navigate("/authorization")

            }, 1000);
            
        } 
    }

  return (
    <div>
    <button onClick = {loginHandle} className=""> LOGIN</button>
    </div>
  )
}

export default Login
