function ClientTable({ clients = [] }) {

    return (

        <div className="clients-table-wrapper">

            <table className="clients-table">

                <thead>

                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>JL Balance</th>
                        <th>Deployments</th>
                        <th>Joined</th>
                    </tr>

                </thead>

                <tbody>

                    {clients.length === 0 ? (

                        <tr>

                            <td
                                colSpan="5"
                                className="empty-state"
                            >
                                No clients found.
                            </td>

                        </tr>

                    ) : (

                        clients.map((client) => (

                            <tr key={client.id}>

                                <td>
                                    {client.name}
                                </td>

                                <td>
                                    {client.email}
                                </td>

                                <td>
                                    {client.wallet?.balance ?? 0} JL
                                </td>

                                <td>
                                    {client.deployments?.length ?? 0}
                                </td>

                                <td>
                                    {client.createdAt
                                        ? new Date(
                                            client.createdAt
                                        ).toLocaleDateString("en-GB")
                                        : "—"
                                    }
                                </td>

                            </tr>

                        ))

                    )}

                </tbody>

            </table>

        </div>

    );

}

export default ClientTable;
