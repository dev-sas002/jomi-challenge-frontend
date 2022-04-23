import type { AppProps } from "next/app";
import Head from "next/head";
import { CacheProvider, type EmotionCache } from "@emotion/react";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import createEmotionCache from "lib/createEmotionCache";
import theme from "theme";

const clientSideEmotionCache = createEmotionCache();

type MyAppProps = AppProps & {
  /** Supplied by `_document` during server rendering. */
  emotionCache?: EmotionCache;
};

const MyApp = ({
  Component,
  pageProps,
  emotionCache = clientSideEmotionCache,
}: MyAppProps) => (
  <CacheProvider value={emotionCache}>
    <Head>
      <meta name="viewport" content="initial-scale=1, width=device-width" />
    </Head>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Component {...pageProps} />
    </ThemeProvider>
  </CacheProvider>
);

export default MyApp;
