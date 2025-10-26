import express, { response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

const configuration = new Configuration({
    basePath: PlaidEnvironments.sandbox,
    baseOptions: {
        headers: {
            'PLAID-CLIENT-ID': '68fcf9e8c77fc80023aaf7c9',
            'PLAID-SECRET': 'c0fe6bcf57b9254e3a3971ff1a6a6c',
        },
    },
});

const plaidClient = new PlaidApi(configuration);

const app = express();
const port = 8000; // Define the port number

app.use(cors());
app.use(bodyParser.json());

app.post("/hello", (req, res) => {
    response.json({ message: "Hello" + response.body.name });
});

app.post('/create_link_token', async function (request, response) {
    const plaidRequest = {
        user: {
            client_user_id: 'user',
        },
        client_name: 'Plaid Test App',
        products: ['auth'],
        language: 'en',
        redirect_uri: 'http://localhost:5173/',
        country_codes: ['US'],
    };

    try {
        const createTokenResponse = await plaidClient.linkTokenCreate(plaidRequest);
        response.json(createTokenResponse.data);
    } catch (error) {
        response.status(500).send("failure");
        // handle error
    }
});

app.post("/auth", async function (request, response) {
    try {
        const access_token = request.body.access_token;
        const plaidRequest = {
            access_token: access_token,
        };

        const plaidResponse = await plaidClient.authGet(plaidRequest);
        response.json(plaidResponse.data);
    } catch (e) {
        response.status(500).send("failed");
    }
});

app.post('/exchange_public_token', async function (request, response) {
    const publicToken = request.body.public_token;

    try {
        const plaidResponse = await plaidClient.itemPublicTokenExchange({
            public_token: publicToken,
        });

        // These values should be saved to a persistent database and
        // associated with the currently signed-in user
        const accessToken = plaidResponse.data.access_token;
        response.json({ accessToken });
    } catch (error) {
        response.status(500).send("failed");
    }
});

app.listen(port, () => {
    console.log(`Server has started on port ${port}`);
});