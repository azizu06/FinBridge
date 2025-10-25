import { Link } from "react-router-dom";

function Header(){

    return(
        <header className="bg-white text-black shadow-md p-4 flex justify-between w-full">
            <h1 className="text-left font-mono font-medium">FinBridge</h1>
            <nav>
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