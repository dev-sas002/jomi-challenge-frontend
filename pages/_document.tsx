import Document, {
  Head,
  Html,
  Main,
  NextScript,
  type DocumentContext,
  type DocumentInitialProps,
} from "next/document";
import type { AppType } from "next/dist/shared/lib/utils";
import type { ComponentProps, ComponentType, ReactElement } from "react";
import type { EmotionCache } from "@emotion/react";
import createEmotionServer from "@emotion/server/create-instance";
import createEmotionCache from "lib/createEmotionCache";
import theme from "theme";

type MyDocumentProps = DocumentInitialProps & {
  emotionStyleTags: ReactElement[];
};

/**
 * Server-side style extraction for Emotion/MUI.
 *
 * Without it the statically generated HTML carries no CSS, so the first paint
 * is unstyled text that snaps into place on hydration — visible on every cold
 * load and especially on a slow connection.
 */
export default class MyDocument extends Document<MyDocumentProps> {
  render() {
    return (
      <Html lang="en">
        <Head>
          <meta name="theme-color" content={theme.palette.primary.main} />
          <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
          {this.props.emotionStyleTags}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

MyDocument.getInitialProps = async (
  ctx: DocumentContext
): Promise<MyDocumentProps> => {
  const originalRenderPage = ctx.renderPage;
  const cache = createEmotionCache();
  const { extractCriticalToChunks } = createEmotionServer(cache);

  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp: (App: AppType) =>
        function EnhanceApp(props: ComponentProps<AppType>) {
          // `AppType` does not know about the extra prop `_app.tsx` accepts,
          // and widening it hits a variance error on React's `propTypes`.
          const AppWithCache = App as ComponentType<
            ComponentProps<AppType> & { emotionCache?: EmotionCache }
          >;
          return <AppWithCache emotionCache={cache} {...props} />;
        },
    });

  const initialProps = await Document.getInitialProps(ctx);
  const emotionStyles = extractCriticalToChunks(initialProps.html);

  const emotionStyleTags = emotionStyles.styles.map((style) => (
    <style
      data-emotion={`${style.key} ${style.ids.join(" ")}`}
      key={style.key}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: style.css }}
    />
  ));

  return { ...initialProps, emotionStyleTags };
};
