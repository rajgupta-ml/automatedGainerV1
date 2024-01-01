import '../css/App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './Login'
import Authorization from './Authorization'
import Dashboard from './Dashboard'
import TradingArea from './TradingArea'

function RouteComponets() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' Component={Login} />
          <Route path='/authorization' Component={Authorization} />
          <Route path='/dashboard' Component={Dashboard} />
          <Route path='/trading-area' Component={TradingArea} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default RouteComponets
