  # Kasper's Zerotier Dashboard/Monitor.

  Made this so I can keep track of my machines' status running Zerotier without having to log into the [Zerotier](https://www.zerotier.com/) Dashboard.

  ------

  ## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables
----
This uses environment variables to keep Network ID's and API Keys from being exposed to the frontend.

- `ZT_NETWORK`: is the Network ID of the network to be monitored.
- `ZT_API_KEY`: is the API Key generated from the Zerotier Dashboard.
- `NEXT_PUBLIC_NETWORK_NAME` : is the name of the network being monitored.