import { Link } from "react-router-dom";

function Header(){

    return(
        <header className="bg-white text-black shadow-md p-4 flex justify-between w-full">
            <div className="flex items-center">
                <img src="/logoTrans.png" alt="FinBridge Logo" className="h-10 w-10 mr-4"/>
                <h1 className="text-left font-serif text-2xl font-medium">FinBridge</h1>
            </div>
            <nav className="flex items-center">
                <ul>
                    <li className="inline-block mx-4"><Link to="/home">Home</Link></li>
                    <li className="inline-block mx-4"><Link to="/dashboard">Dashboard</Link></li>
                    <li className="inline-block mx-4"><Link to="/about">About</Link></li>
                </ul>
            </nav>
        </header>
    )
}

export default Header