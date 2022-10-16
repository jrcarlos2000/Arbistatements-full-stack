import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { Chain, chain, configureChains, createClient, WagmiConfig } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { Toaster } from 'react-hot-toast'

const bobaChain = {
  id: 1297,
  name: 'Boba',
  network: 'Boba',
  nativeCurrency: {
    decimals: 18,
    name: 'BOBA Network ',
    symbol: 'BOBA',
  },
  rpcUrls: {
    default: 'https://replica.bobabase.boba.network',
  },
  blockExplorers: {
    default: { name: 'SnowTrace', url: 'https://snowtrace.io' },
  },
  testnet: false,
}

const { chains, provider } = configureChains(
  [chain.optimismGoerli, chain.polygonMumbai, chain.localhost,bobaChain ],
  [alchemyProvider({ apiKey: process.env.ALCHEMY_ID }), publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: "My RainbowKit App",
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider chains={chains} theme={darkTheme()}>
          <Component {...pageProps} />
        </RainbowKitProvider>
      </WagmiConfig>
      <Toaster
          toastOptions={{
            style: {
              fontWeight: '600',
            },
          }}
        />
    </div>
  );
}

export default MyApp;
