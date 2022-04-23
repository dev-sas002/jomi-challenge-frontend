import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import Box from "@mui/material/Box";
import { BlockList } from "components/blocks";
import EmptyState from "components/layout/EmptyState";
import PageFooter from "components/layout/PageFooter";
import type { HomeBlock } from "lib/cms/blocks";
import { loadHomePage } from "lib/cms/homePage";

const PAGE_TITLE = "JOMI Code Challenge";
const PAGE_DESCRIPTION =
  "Renders the Strapi CMS homepage dynamic zone: header, two-column and carousel blocks, in the order the editor arranged them.";

type HomeProps = {
  blocks: HomeBlock[];
};

/**
 * The homepage is a pure function of the blocks handed to it by
 * `getStaticProps`. There is no client-side query and no loading state: the
 * HTML that ships already contains the content.
 */
const Home: NextPage<HomeProps> = ({ blocks }) => (
  <>
    <Head>
      <title>{PAGE_TITLE}</title>
      <meta name="description" content={PAGE_DESCRIPTION} />
      <meta property="og:title" content={PAGE_TITLE} />
      <meta property="og:description" content={PAGE_DESCRIPTION} />
      <meta property="og:type" content="website" />
    </Head>

    <Box component="main">
      {blocks.length > 0 ? <BlockList blocks={blocks} /> : <EmptyState />}
    </Box>

    <PageFooter />
  </>
);

export default Home;

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const { blocks, revalidateSeconds } = await loadHomePage();

  return {
    props: { blocks },
    // Incremental static regeneration: CMS edits appear without a redeploy,
    // and a traffic spike costs one render per window rather than one per hit.
    revalidate: revalidateSeconds,
  };
};
