import { useEffect, useState } from "react";
import axios from "axios";
import { usePlaidLink } from "react-plaid-link";

axios.defaults.baseURL = "http://localhost:8000";

function PlaidAuth({ publicToken }) {
  const [account, setAccount] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const accessTokenResponse = await axios.post("/exchange_public_token", {
          public_token: publicToken,
        });
        console.log("Access Token:", accessTokenResponse.data);

        const authResponse = await axios.post("/auth", {
          access_token: accessTokenResponse.data.accessToken,
        });
        console.log("Auth Data:", authResponse.data);

        if (authResponse.data.numbers?.ach?.length > 0) {
          setAccount(authResponse.data.numbers.ach[0]);
        } else {
          console.error("No ACH account data found.");
        }
      } catch (error) {
        console.error("Error fetching account data:", error);
      }
    }

    fetchData();
  }, [publicToken]);

  return account ? (
    <>
      <p>Account number: {account.account}</p>
      <p>Routing number: {account.routing}</p>
    </>
  ) : (
    <p>Loading account details...</p>
  );
}

function App() {
  const [linkToken, setLinkToken] = useState(null);
  const [publicToken, setPublicToken] = useState(null);

  useEffect(() => {
    async function fetchLinkToken() {
      try {
        const response = await axios.post("/create_link_token");
        setLinkToken(response.data.link_token);
      } catch (error) {
        console.error("Error creating link token:", error);
      }
    }

    fetchLinkToken();
  }, []);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: (public_token, metadata) => {
      setPublicToken(public_token);
      console.log("Plaid Link Success:", public_token, metadata);
    },
  });

  return publicToken ? (
    <PlaidAuth publicToken={publicToken} />
  ) : (
    <button onClick={open} disabled={!ready}>
      Connect a bank account
    </button>
  );
}

export default App;