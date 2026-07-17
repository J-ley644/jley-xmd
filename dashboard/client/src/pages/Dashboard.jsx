import { useEffect, useState } from "react";

import StatCard from "../components/StatCard";
import BotCard from "../components/BotCard";
import BalanceCard from "../components/BalanceCard";
import ActivityFeed from "../components/ActivityFeed";

import { apiRequest } from "../services/api";


function Dashboard() {


  const [stats, setStats] = useState(null);

  const [wallet, setWallet] = useState(null);



  useEffect(()=>{


    apiRequest("/api/dashboard/stats")

    .then(data=>{

        setStats(data);

    })

    .catch(err=>{

        console.log(err);

    });



    apiRequest("/api/wallet/me")

    .then(data=>{

        setWallet(data);

    })

    .catch(err=>{

        console.log(err);

    });


  },[]);





  const bots = [

    {
      name: "JLEY-XMD Main",
      status: "online",
      version: "v1.0.0",
      uptime: "14 days",
      commands: 245
    },


    {
      name: "JLEY Music Bot",
      status: "online",
      version: "v1.0.0",
      uptime: "7 days",
      commands: 120
    },


    {
      name: "Support Bot",
      status: "offline",
      version: "v0.9.5",
      uptime: "0 days",
      commands: 80
    }

  ];





  const activities = [

    "Bot JLEY-XMD started successfully",

    "AntiLink plugin enabled",

    "New deployment created",

    "System update checked"

  ];





  return (

    <div className="dashboard-content">


      <h1>
        JLEY-XMD Control Center
      </h1>


      <p>
        Manage your WhatsApp bots, deployments and JL credits.
      </p>





      <div className="stats">


        <StatCard

          title="Total Bots"

          value={
            stats
            ?
            stats.bots
            :
            "..."
          }

        />



        <StatCard

          title="Users"

          value={
            stats
            ?
            stats.users
            :
            "..."
          }

        />



        <StatCard

          title="Groups"

          value={
            stats
            ?
            stats.groups
            :
            "..."
          }

        />


      </div>





      <BalanceCard

        balance={
          wallet
          ?
          wallet.balance
          :
          "..."
        }

      />





      <h2>
        Active Bots
      </h2>





      <div className="bot-grid">


        {
          bots.map((bot,index)=>(

            <BotCard

              key={index}

              bot={bot}

            />

          ))
        }


      </div>





      <ActivityFeed

        activities={activities}

      />



    </div>

  );

}


export default Dashboard;