function Home(){

    function deploy(){

        window.location.href="/deploy";

    }


    return (

        <div className="home">

            <h1>
                JLEY-XMD
            </h1>


            <p>
                Deploy your WhatsApp bot easily.
            </p>


            <button onClick={deploy}>

                Deploy Your Bot

            </button>


        </div>

    );

}


export default Home;