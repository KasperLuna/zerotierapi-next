import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { formatRelative, format } from "date-fns";

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
  },
  lastOnline: number;
  physicalAddress: string;
  physicalLocation: string | null;
  clientVersion: string;
  protocolVersion: number;
  supportsRulesEngine: boolean;
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const res = await fetch(`https://api.zerotier.com/api/v1/network/${process.env.ZT_NETWORK}/member`, {
    method: 'GET',
    headers: {
      "Authorization": `token ${process.env.ZT_API_KEY}`,
    }
  });
  const data: APIResponse[] = await res.json()

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
      data: cleanedData
    }
  }
}

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
  return (
    <div className={online ? styles.active : styles.inactive} />
  );
};

const Home: NextPage<HomeProps> = (props) => {
  const data = props.data;

  return (
    <div className={styles.container}>
      <Head>
        <title>{`Kasper's ${process.env.NEXT_PUBLIC_NETWORK_NAME} ZT Network`}</title>
        <meta name="description" content="Kasper's Zerotier Network Monitor" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <h3 className={styles.title}>
          <a href="https://kasperluna.com" target="_blank" rel="noreferrer">Kasper&apos;s</a> {process.env.NEXT_PUBLIC_NETWORK_NAME} ZeroTier Network Monitor
        </h3>
        <h2 className={styles.description}>{`Here are the nodes registered on the ${process.env.NEXT_PUBLIC_NETWORK_NAME} Zerotier network. Addresses are only relevant to each other.`}</h2>
        <small>{`Snapshot as of ${format(data[0].clock, "hh:mm aa")}, sorted by last time online. `}</small>
        <button onClick={() => window.location.reload()}>Refresh</button>
        <ul className={styles.grid}>

          {data.sort().map((member) => (
            <li key={member.name} className={styles.item}>
              <div className={styles.nameGroup}>
                <h2 className={styles.name}><ActiveIndicator online={member.online} />{member.name}</h2>
                <p>{member.description}</p>
                <small>{member.online ? "Online" : "Offline"}</small>
              </div>
              <div className={styles.activeStack}>
                <p className={styles.lastSeen}>{`Last seen: ${formatRelative(new Date(member.lastOnline), new Date())}`}</p>
                <p>{member.ipAssignment}</p>
              </div>
            </li>
          ))}
        </ul>
      </main>


    </div >
  )
}

export default Home
