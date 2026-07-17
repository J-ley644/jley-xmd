function ActivityFeed({activities}) {

 return (

  <div className="activity-card">

    <h3>
      Recent Activity
    </h3>


    {activities.map((item,index)=>(

      <div 
        className="activity-item"
        key={index}
      >

        <span>
          ✓
        </span>

        <p>
          {item}
        </p>

      </div>

    ))}


  </div>

 );

}

export default ActivityFeed;