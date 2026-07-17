function BotCard({ bot }) {
  return (
    <div className="bot-card">

      <div className="bot-header">
        <h3>{bot.name}</h3>

        <span className={bot.status === "online" ? "online" : "offline"}>
          {bot.status}
        </span>
      </div>


      <div className="bot-info">

        <p>
          Version:
          <strong>{bot.version}</strong>
        </p>

        <p>
          Uptime:
          <strong>{bot.uptime}</strong>
        </p>

        <p>
          Commands:
          <strong>{bot.commands}</strong>
        </p>

      </div>


    </div>
  );
}

export default BotCard;