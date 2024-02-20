import { Badge } from "@/components/ui/badge";
import { CardHeader, CardContent, Card } from "@/components/ui/card";

export default function Component() {
  return (
    <main className="w-full px-4 py-12 mx-auto sm:px-6 lg:px-8">
      <h1 className="mb-6 text-5xl font-bold">API Reference</h1>
      <section id="auth" className="mb-12">
        <h2 className="mb-4 text-4xl font-semibold">Auth</h2>
        <Card className="bg-softBg border-borderColor text-primary">
          <CardHeader>
            <h3 className="text-2xl font-semibold">/auth/signup</h3>
            <Badge className="ml-2 w-fit">POST</Badge>
          </CardHeader>
          <CardContent>
            <p className="mb-2 text-gray-600">Register a new user for the developer dashboard and API.</p>
            <h4 className="text-xl font-semibold">Request Body:</h4>
            <p className="mb-2 text-gray-600">{`{ 'email': 'user@email.com', 'password': 'password' }`}</p>
            <h4 className="text-xl font-semibold">Response:</h4>
            <p className="text-gray-600">{`{ 'id': 'user-id', 'email': 'user@email.com', 'token': 'auth-token' }`}</p>
          </CardContent>
        </Card>
        <Card className="mt-4 bg-softBg border-borderColor text-primary">
          <CardHeader>
            <h3 className="text-2xl font-semibold">/auth/login</h3>
            <Badge className="ml-2 w-fit">POST</Badge>
          </CardHeader>
          <CardContent>
            <p className="mb-2 text-gray-600">User login</p>
            <h4 className="text-xl font-semibold">Request Body:</h4>
            <p className="mb-2 text-gray-600">{`{ 'email': 'user@email.com', 'password': 'password' }`}</p>
            <h4 className="text-xl font-semibold">Response:</h4>
            <p className="text-gray-600">{`{ 'id': 'user-id', 'email': 'user-email', 'token': 'auth-token' }`}</p>
          </CardContent>
        </Card>
      </section>
      <section id="table-editing" className="mb-12">
        <h2 className="mb-4 text-4xl font-semibold">Table Editing</h2>
        <Card className="bg-softBg border-borderColor text-primary">
          <CardHeader>
            <h3 className="text-2xl font-semibold">/createTable</h3>
            <Badge className="ml-2 w-fit">POST</Badge>
          </CardHeader>
          <CardContent>
            <p className="mb-2 text-gray-600">Creates a new table in the database with specified columns.</p>
            <h4 className="text-xl font-semibold">Request Body:</h4>
            <p className="mb-2 text-gray-600">{'{ "tableName": "table-name", "columns": [ /* column definitions */ ] }'}</p>
            <h4 className="text-xl font-semibold">Response:</h4>
            <p className="text-gray-600">Status message indicating success or failure.</p>
          </CardContent>
        </Card>
        {/* Delete Table Endpoint */}
        <Card className="mt-4 bg-softBg border-borderColor text-primary">
          <CardHeader>
            <h3 className="text-2xl font-semibold">/deleteTable/:tableName</h3>
            <Badge className="ml-2 w-fit">DELETE</Badge>
          </CardHeader>
          <CardContent>
            <p className="mb-2 text-gray-600">Deletes a specified table from the database. This action is irreversible.</p>
            <h4 className="text-xl font-semibold">URL Parameters:</h4>
            <p className="mb-2 text-gray-600">tableName: The name of the table to be deleted.</p>
            <h4 className="text-xl font-semibold">Response:</h4>
            <p className="text-gray-600">Status message indicating success or failure of the table deletion.</p>
          </CardContent>
        </Card>

        {/* Update Table Name Endpoint */}
        <Card className="mt-4 bg-softBg border-borderColor text-primary">
          <CardHeader>
            <h3 className="text-2xl font-semibold">/updateTableName</h3>
            <Badge className="ml-2 w-fit">PUT</Badge>
          </CardHeader>
          <CardContent>
            <p className="mb-2 text-gray-600">Renames an existing table to a new specified name.</p>
            <h4 className="text-xl font-semibold">Request Body:</h4>
            <p className="mb-2 text-gray-600">{'{ "oldTableName": "old-table-name", "newTableName": "new-table-name" }'}</p>
            <h4 className="text-xl font-semibold">Response:</h4>
            <p className="text-gray-600">Confirmation of the table name update along with the old and new names of the table.</p>
          </CardContent>
        </Card>
        {/* Add Column Endpoint */}
        <Card className="mt-4 bg-softBg border-borderColor text-primary">
          <CardHeader>
            <h3 className="text-2xl font-semibold">/addColumn</h3>
            <Badge className="ml-2 w-fit">POST</Badge>
          </CardHeader>
          <CardContent>
            <p className="mb-2 text-gray-600">Adds a new column to an existing table in the database.</p>
            <h4 className="text-xl font-semibold">Request Body:</h4>
            <p className="mb-2 text-gray-600">{'{ "tableName": "table-name", "columnName": "column-name", "columnType": "column-type" }'}</p>
            <h4 className="text-xl font-semibold">Response:</h4>
            <p className="text-gray-600">Status message indicating success or failure of column addition.</p>
          </CardContent>
        </Card>

        {/* Delete Column Endpoint */}
        <Card className="mt-4 bg-softBg border-borderColor text-primary">
          <CardHeader>
            <h3 className="text-2xl font-semibold">/deleteColumn</h3>
            <Badge className="ml-2 w-fit">DELETE</Badge>
          </CardHeader>
          <CardContent>
            <p className="mb-2 text-gray-600">Deletes a specified column from an existing table.</p>
            <h4 className="text-xl font-semibold">Request Body:</h4>
            <p className="mb-2 text-gray-600">{'{ "tableName": "table-name", "columnName": "column-name" }'}</p>
            <h4 className="text-xl font-semibold">Response:</h4>
            <p className="text-gray-600">Confirmation of column deletion.</p>
          </CardContent>
        </Card>

        {/* Rename Column Endpoint */}
        <Card className="mt-4 bg-softBg border-borderColor text-primary">
          <CardHeader>
            <h3 className="text-2xl font-semibold">/renameColumn</h3>
            <Badge className="ml-2 w-fit">PUT</Badge>
          </CardHeader>
          <CardContent>
            <p className="mb-2 text-gray-600">Renames an existing column in a specified table.</p>
            <h4 className="text-xl font-semibold">Request Body:</h4>
            <p className="mb-2 text-gray-600">{'{ "tableName": "table-name", "oldColumnName": "old-column-name", "newColumnName": "new-column-name" }'}</p>
            <h4 className="text-xl font-semibold">Response:</h4>
            <p className="text-gray-600">Confirmation of column rename.</p>
          </CardContent>
        </Card>

        {/* Get Columns Endpoint */}
        <Card className="mt-4 bg-softBg border-borderColor text-primary">
          <CardHeader>
            <h3 className="text-2xl font-semibold">/getColumns/:tableName</h3>
            <Badge className="ml-2 w-fit">GET</Badge>
          </CardHeader>
          <CardContent>
            <p className="mb-2 text-gray-600">Retrieves details of all columns in a specified table.</p>
            <h4 className="text-xl font-semibold">URL Parameters:</h4>
            <p className="mb-2 text-gray-600">tableName: Name of the table to retrieve columns from.</p>
            <h4 className="text-xl font-semibold">Response:</h4>
            <p className="text-gray-600">JSON object containing details of all columns in the table.</p>
          </CardContent>
        </Card>

        {/* Get Tables Endpoint */}
        <Card className="mt-4 bg-softBg border-borderColor text-primary">
          <CardHeader>
            <h3 className="text-2xl font-semibold">/getTables/:schema</h3>
            <Badge className="ml-2 w-fit">GET</Badge>
          </CardHeader>
          <CardContent>
            <p className="mb-2 text-gray-600">Lists all tables within a specified schema.</p>
            <h4 className="text-xl font-semibold">URL Parameters:</h4>
            <p className="mb-2 text-gray-600">schema: Schema name to list tables from.</p>
            <h4 className="text-xl font-semibold">Response:</h4>
            <p className="text-gray-600">JSON array containing names of all tables in the schema.</p>
          </CardContent>
        </Card>

        {/* Get Table Endpoint */}
        <Card className="mt-4 bg-softBg border-borderColor text-primary">
          <CardHeader>
            <h3 className="text-2xl font-semibold">/getTable/:tableName</h3>
            <Badge className="ml-2 w-fit">GET</Badge>
          </CardHeader>
          <CardContent>
            <p className="mb-2 text-gray-600">Retrieves all data from a specified table.</p>
            <h4 className="text-xl font-semibold">URL Parameters:</h4>
            <p className="mb-2 text-gray-600">tableName: Name of the table to retrieve data from.</p>
            <h4 className="text-xl font-semibold">Response:</h4>
            <p className="text-gray-600">JSON object containing all data entries in the table.</p>
          </CardContent>
        </Card>

        {/* Join Table Endpoint */}
        <Card className="mt-4 bg-softBg border-borderColor text-primary">
          <CardHeader>
            <h3 className="text-2xl font-semibold">/joinTables</h3>
            <Badge className="ml-2 w-fit">GET</Badge>
          </CardHeader>
          <CardContent>
            <p className="mb-2 text-gray-600">Joins tables</p>
            <h4 className="text-xl font-semibold">Request Body:</h4>
            <p className="mb-2 text-gray-600">
              {'{ "tableName": "table-name", "joinColumns": ["column-1", "column-2"], "joinType" : "INNER", "filter" :{ "column" : "column-1", "value" : "value" } }'}
            </p>
            <h4 className="text-xl font-semibold">Response:</h4>
            <p className="text-gray-600">JSON object containing all data entries in the table.</p>
          </CardContent>
        </Card>

        {/* Custom query for select Table Endpoint */}
        <Card className="mt-4 bg-softBg border-borderColor text-primary">
          <CardHeader>
            <h3 className="text-2xl font-semibold">/executeSelectQuery</h3>
            <Badge className="ml-2 w-fit">GET</Badge>
          </CardHeader>
          <CardContent>
            <p className="mb-2 text-gray-600">Retrieves all data using custom select query. Only for select queries.</p>
            <h4 className="text-xl font-semibold">Request Body:</h4>
            <p className="mb-2 text-gray-600">{'{ "query": "query" }'}</p>
            <h4 className="text-xl font-semibold">Response:</h4>
            <p className="text-gray-600">JSON object containing all data entries in the table.</p>
          </CardContent>
        </Card>

        {/* Get Table Value Endpoint */}
        <Card className="mt-4 bg-softBg border-borderColor text-primary">
          <CardHeader>
            <h3 className="text-2xl font-semibold">/getTableValue/:tableName/:columnName/:columnValue</h3>
            <Badge className="ml-2 w-fit">GET</Badge>
          </CardHeader>
          <CardContent>
            <p className="mb-2 text-gray-600">Fetches rows from a table where the specified column matches a given value.</p>
            <h4 className="text-xl font-semibold">URL Parameters:</h4>
            <p className="mb-2 text-gray-600">tableName, columnName, columnValue: Specify the table, column, and value to match.</p>
            <h4 className="text-xl font-semibold">Response:</h4>
            <p className="text-gray-600">JSON object containing rows that match the criteria.</p>
          </CardContent>
        </Card>
        {/* Insert Data Endpoint */}
        <Card className="mt-4 bg-softBg border-borderColor text-primary">
          <CardHeader>
            <h3 className="text-2xl font-semibold">/insertData</h3>
            <Badge className="ml-2 w-fit">POST</Badge>
          </CardHeader>
          <CardContent>
            <p className="mb-2 text-gray-600">Inserts new data into a specified table.</p>
            <h4 className="text-xl font-semibold">Request Body:</h4>
            <p className="mb-2 text-gray-600">{'{ "tableName": "table-name", "data": { /* data fields */ } }'}</p>
            <h4 className="text-xl font-semibold">Response:</h4>
            <p className="text-gray-600">Confirmation of data insertion.</p>
          </CardContent>
        </Card>

        {/* Delete Data Endpoint */}
        <Card className="mt-4 bg-softBg border-borderColor text-primary">
          <CardHeader>
            <h3 className="text-2xl font-semibold">/deleteData</h3>
            <Badge className="ml-2 w-fit">DELETE</Badge>
          </CardHeader>
          <CardContent>
            <p className="mb-2 text-gray-600">Deletes data from a table based on specified conditions.</p>
            <h4 className="text-xl font-semibold">Request Body:</h4>
            <p className="mb-2 text-gray-600">{'{ "tableName": "table-name", "condition": "delete condition" }'}</p>
            <h4 className="text-xl font-semibold">Response:</h4>
            <p className="text-gray-600">Confirmation of data deletion.</p>
          </CardContent>
        </Card>

        {/* Update Data Endpoint */}
        <Card className="mt-4 bg-softBg border-borderColor text-primary">
          <CardHeader>
            <h3 className="text-2xl font-semibold">/updateData</h3>
            <Badge className="ml-2 w-fit">PUT</Badge>
          </CardHeader>
          <CardContent>
            <p className="mb-2 text-gray-600">Updates existing data in a specified table based on given conditions.</p>
            <h4 className="text-xl font-semibold">Request Body:</h4>
            <p className="mb-2 text-gray-600">{'{ "tableName": "table-name", "data": { /* updated data fields */ }, "condition": "update condition" }'}</p>
            <h4 className="text-xl font-semibold">Response:</h4>
            <p className="text-gray-600">Confirmation of data update.</p>
          </CardContent>
        </Card>
      </section>
      <section id="web3" className="mb-12">
        <h2 className="mb-4 text-4xl font-semibold">Web3</h2>
        <Card className="bg-softBg border-borderColor text-primary">
          <CardHeader>
            <h3 className="text-2xl font-semibold">web3/token/mint</h3>
            <Badge className="ml-2 w-fit">Post</Badge>
          </CardHeader>
          <CardContent>
            <p className="mb-2 text-gray-600">Mints a token on specified contract. Can specify the network, quantity, and token type (ie ERC1155, ERC721, etc)</p>
            <h4 className="text-xl font-semibold">Request Parameters:</h4>
            <p className="mb-2 text-gray-600">{`{ 'collectionAddress': 'collection-address', 'tokenId': 'token-id', 'quantity': 'token-quantity', 'network': 'network', 'type': 'token-type' }`}</p>
            <h4 className="text-xl font-semibold">Response:</h4>
            <p className="text-gray-600">{`{ 'txHash': 'transaction hash' }`}</p>
          </CardContent>
        </Card>
        <Card className="mt-4 bg-softBg border-borderColor text-primary">
          <CardHeader>
            <h3 className="text-2xl font-semibold">web3/token/burn</h3>
            <Badge className="ml-2 w-fit">Post</Badge>
          </CardHeader>
          <CardContent>
            <p className="mb-2 text-gray-600">
              Burns specified quantity of a token on specified contract on specified network. Token must be owned by a player with a provisioned wallet.
            </p>
            <h4 className="text-xl font-semibold">Request Parameters:</h4>
            <p className="mb-2 text-gray-600">{`{ 'collectionAddress': 'collection-address', 'tokenId': 'token-id', 'quantity': 'token-quantity', 'network': 'network' }`}</p>
            <h4 className="text-xl font-semibold">Response:</h4>
            <p className="text-gray-600">{`{ 'txHash': 'transaction hash' }`}</p>
          </CardContent>
        </Card>
        <Card className="mt-4 bg-softBg border-borderColor text-primary">
          <CardHeader>
            <h3 className="text-2xl font-semibold">web3/token/transfer</h3>
            <Badge className="ml-2 w-fit">Post</Badge>
          </CardHeader>
          <CardContent>
            <p className="mb-2 text-gray-600">
              Transfers specified quantity of a token on specified contract on specified network. Token must be owned by a player with a provisioned wallet.
            </p>
            <h4 className="text-xl font-semibold">Request Parameters:</h4>
            <p className="mb-2 text-gray-600">{`{ 'collectionAddress': 'collection-address', 'tokenId': 'token-id', 'quantity': 'token-quantity', 'network': 'network', 'to': 'to-address', 'from': 'from-address'}`}</p>
            <h4 className="text-xl font-semibold">Response:</h4>
            <p className="text-gray-600">{`{ 'txHash': 'transaction hash' }`}</p>
          </CardContent>
        </Card>
        <Card className="mt-4 bg-softBg border-borderColor text-primary">
          <CardHeader>
            <h3 className="text-2xl font-semibold">web3/wallet/generate/[playerId]</h3>
            <Badge className="ml-2 w-fit">GET</Badge>
          </CardHeader>
          <CardContent>
            <p className="mb-2 text-gray-600">Generates a provisioned wallet that is safely stored in an enclave.</p>
            <h4 className="text-xl font-semibold">Response:</h4>
            <p className="text-gray-600">{`{ 'publicAddress': 'public address' }`}</p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
