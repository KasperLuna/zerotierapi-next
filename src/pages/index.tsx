import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { formatRelative, format } from "date-fns";
import { on } from "events";

type APIResponse = {
  id: string;
  type: string;
  clock: number;
  networkId: string;
  nodeId: string;
  controllerId: string;
  hidden: boolean;
  name: string;
  online: boolean;
  description: string;
  config: {
    activeBridge: boolean;
    address: string;
    authorized: boolean;
    capabilities: never;
    creationTime: number;
    id: string;
    identity: string;
    ipAssignments: number[];
    lastAuthorizedTime: number;
    lastDeauthorizedTime: number;
    noAutoAssignIps: boolean;
    nwid: string;
    objtype: string;
    remoteTraceLevel: number;
    remoteTraceTarget: string;
    revision: number;
    tags: string[];
    vMajor: number;
    vMinor: number;
    vRev: number;
    vProto: number;
    ssoExempt: boolean;
  };
  lastOnline: number;
  physicalAddress: string;
  physicalLocation: string | null;
  clientVersion: string;
  protocolVersion: number;
  supportsRulesEngine: boolean;
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const res = await fetch(
    `https://api.zerotier.com/api/v1/network/${process.env.ZT_NETWORK}/member`,
    {
      method: "GET",
      headers: {
        Authorization: `token ${process.env.ZT_API_KEY}`,
      },
    }
  );
  const data: APIResponse[] = await res.json();

  //cleaning prevents leaking unneeded data, this is done server side and should never sent to the client.
  const cleanedData = data.map((item) => {
    return {
      name: item.name,
      clock: item.clock,
      description: item.description,
      online: item.online,
      lastOnline: item.lastOnline,
      ipAssignment: item.config.ipAssignments,
    };
  });

  // sort by lastOnline
  cleanedData.sort((a, b) => {
    return b.lastOnline - a.lastOnline;
  });

  return {
    props: {
      data: cleanedData,
    },
  };
};

type HomeProps = {
  data: {
    name: string;
    clock: number;
    description: string;
    online: boolean;
    lastOnline: number;
    ipAssignment: number[];
  }[];
};

const ActiveIndicator = ({ online }: { online: boolean }) => {
  return <div className={online ? styles.active : styles.inactive} />;
};

const CopyIcon = ({ onClick }: { onClick: () => void }) => {
  return (
    <button
      title="Copy IP to Clipboard"
      style={{
        borderRadius: "8px",
        padding: "3px",
        paddingBottom: "0px",
        margin: "0px",
        marginLeft: "5px",
      }}
      onClick={onClick}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        x="0px"
        y="0px"
        viewBox="0 0 115.77 122.88"
        width={"15px"}
        style={{ margin: 0 }}
        className={styles.copyIcon}
      >
        <g>
          <path d="M89.62,13.96v7.73h12.19h0.01v0.02c3.85,0.01,7.34,1.57,9.86,4.1c2.5,2.51,4.06,5.98,4.07,9.82h0.02v0.02 v73.27v0.01h-0.02c-0.01,3.84-1.57,7.33-4.1,9.86c-2.51,2.5-5.98,4.06-9.82,4.07v0.02h-0.02h-61.7H40.1v-0.02 c-3.84-0.01-7.34-1.57-9.86-4.1c-2.5-2.51-4.06-5.98-4.07-9.82h-0.02v-0.02V92.51H13.96h-0.01v-0.02c-3.84-0.01-7.34-1.57-9.86-4.1 c-2.5-2.51-4.06-5.98-4.07-9.82H0v-0.02V13.96v-0.01h0.02c0.01-3.85,1.58-7.34,4.1-9.86c2.51-2.5,5.98-4.06,9.82-4.07V0h0.02h61.7 h0.01v0.02c3.85,0.01,7.34,1.57,9.86,4.1c2.5,2.51,4.06,5.98,4.07,9.82h0.02V13.96L89.62,13.96z M79.04,21.69v-7.73v-0.02h0.02 c0-0.91-0.39-1.75-1.01-2.37c-0.61-0.61-1.46-1-2.37-1v0.02h-0.01h-61.7h-0.02v-0.02c-0.91,0-1.75,0.39-2.37,1.01 c-0.61,0.61-1,1.46-1,2.37h0.02v0.01v64.59v0.02h-0.02c0,0.91,0.39,1.75,1.01,2.37c0.61,0.61,1.46,1,2.37,1v-0.02h0.01h12.19V35.65 v-0.01h0.02c0.01-3.85,1.58-7.34,4.1-9.86c2.51-2.5,5.98-4.06,9.82-4.07v-0.02h0.02H79.04L79.04,21.69z M105.18,108.92V35.65v-0.02 h0.02c0-0.91-0.39-1.75-1.01-2.37c-0.61-0.61-1.46-1-2.37-1v0.02h-0.01h-61.7h-0.02v-0.02c-0.91,0-1.75,0.39-2.37,1.01 c-0.61,0.61-1,1.46-1,2.37h0.02v0.01v73.27v0.02h-0.02c0,0.91,0.39,1.75,1.01,2.37c0.61,0.61,1.46,1,2.37,1v-0.02h0.01h61.7h0.02 v0.02c0.91,0,1.75-0.39,2.37-1.01c0.61-0.61,1-1.46,1-2.37h-0.02V108.92L105.18,108.92z" />
        </g>
      </svg>
    </button>
  );
};

const Home: NextPage<HomeProps> = (props) => {
  const data = props.data;

  const sortedData = [...data].sort();

  return (
    <div className={styles.container}>
      <Head>
        <title>{`Kasper's ${process.env.NEXT_PUBLIC_NETWORK_NAME} ZT Network`}</title>
        <meta name="description" content="Kasper's Zerotier Network Monitor" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <h3 className={styles.title}>
          <a href="https://kasperluna.com" target="_blank" rel="noreferrer">
            Kasper&apos;s
          </a>
          {` ${process.env.NEXT_PUBLIC_NETWORK_NAME} ZeroTier Network Monitor`}
        </h3>
        <h2
          className={styles.description}
        >{`Here are the nodes registered on the ${process.env.NEXT_PUBLIC_NETWORK_NAME} Zerotier network. Addresses are only relevant to each other.`}</h2>
        <small>{`Snapshot as of ${format(
          data[0].clock,
          "hh:mm aa"
        )}, sorted by last time online. `}</small>
        <button onClick={() => window.location.reload()}>Refresh</button>
        <ul className={styles.grid}>
          {sortedData.map((member) => (
            <li key={member.name} className={styles.item}>
              <div className={styles.nameGroup}>
                <h2 className={styles.name}>
                  <ActiveIndicator online={member.online} />
                  {member.name}
                </h2>
                <p>{member.description}</p>
                <small>{member.online ? "Online" : "Offline"}</small>
              </div>
              <div className={styles.activeStack}>
                <p className={styles.lastSeen}>{`Last seen: ${formatRelative(
                  new Date(member.lastOnline),
                  new Date()
                )}`}</p>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <p>{member.ipAssignment[0]}</p>
                  <CopyIcon
                    onClick={() => {
                      navigator.clipboard.writeText(
                        member.ipAssignment[0].toString()
                      );
                    }}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
};

export default Home;
