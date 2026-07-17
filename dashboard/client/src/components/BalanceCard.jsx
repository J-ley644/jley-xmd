function BalanceCard({ balance }) {

  return (

    <div className="balance-card">

      <h3>JL Balance</h3>

      <h1>
        {balance} JL
      </h1>

      <p>
        Available deployment credits
      </p>

    </div>

  );

}

export default BalanceCard;