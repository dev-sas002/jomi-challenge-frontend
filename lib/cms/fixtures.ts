import type { HomePagePayload } from "./mapHomePage";

/**
 * A deterministic `HomePage` payload, in exactly the shape Strapi returns.
 *
 * It exists so the app has something real to render when no CMS is reachable:
 * `yarn dev`, the Docker image, the screenshots in `docs/` and the tests all
 * run against it, which keeps the build reproducible and means a reviewer can
 * see the finished page without standing up Strapi first. Because it is a raw
 * GraphQL payload rather than a list of view models, it flows through the same
 * `mapHomePage` pipeline as live CMS content — so the fixtures exercise the
 * real code path instead of bypassing it.
 */

const image = (
  id: string,
  file: string,
  alternativeText: string
) => ({
  __typename: "UploadFileEntityResponse" as const,
  data: {
    __typename: "UploadFileEntity" as const,
    id,
    attributes: {
      __typename: "UploadFile" as const,
      url: `/seed/${file}`,
      previewUrl: null,
      alternativeText,
      width: 1200,
      height: 800,
    },
  },
});

export const homePageFixture: HomePagePayload = {
  homePage: {
    data: {
      attributes: {
        sections: [
          {
            __typename: "ComponentCommonHeader",
            id: "1",
            Text: "Peer-reviewed surgery, filmed in the operating room",
            ButtonText: "Browse the library",
            ButtonLink: "https://jomi.com/library",
          },
          {
            __typename: "ComponentCommonTwoColumnBlock",
            id: "1",
            TitleText: "Every step, from incision to closure",
            Description:
              "Each article is a full-length operative video, narrated by the attending surgeon and annotated with the anatomy, instruments and decisions that matter. Nothing is edited out of the difficult parts.",
            ButtonText: "Watch a procedure",
            ButtonUrl: "https://jomi.com/article/1",
            ImagePosition: "Left",
            Image: image(
              "1",
              "operating-room.jpg",
              "Abstract illustration of an operating theatre light over a surgical field"
            ),
          },
          {
            __typename: "ComponentCommonCarousel",
            id: "1",
            Item: [
              {
                __typename: "ComponentCommonTwoColumnBlock",
                id: "2",
                TitleText: "General surgery",
                Description:
                  "Laparoscopic and open approaches, recorded from the surgeon's viewpoint with the operative field kept in frame throughout.",
                ButtonText: "See the collection",
                ButtonUrl: "https://jomi.com/collections/general-surgery",
                ImagePosition: "Left",
                Image: image(
                  "2",
                  "general-surgery.jpg",
                  "Abstract illustration of laparoscopic instruments in an abdominal field"
                ),
              },
              {
                __typename: "ComponentCommonTwoColumnBlock",
                id: "3",
                TitleText: "Orthopaedics",
                Description:
                  "Arthroplasty, fixation and arthroscopy, with the implant choices and intra-operative measurements called out as they happen.",
                ButtonText: "See the collection",
                ButtonUrl: "https://jomi.com/collections/orthopaedics",
                ImagePosition: "Left",
                Image: image(
                  "3",
                  "orthopaedics.jpg",
                  "Abstract illustration of a joint replacement implant and bone contours"
                ),
              },
              {
                __typename: "ComponentCommonTwoColumnBlock",
                id: "4",
                TitleText: "Otolaryngology",
                Description:
                  "Endoscopic sinus and airway procedures, shot through the scope so trainees see precisely what the operator sees.",
                ButtonText: "See the collection",
                ButtonUrl: "https://jomi.com/collections/otolaryngology",
                ImagePosition: "Left",
                Image: image(
                  "4",
                  "otolaryngology.jpg",
                  "Abstract illustration of an endoscopic view of an airway"
                ),
              },
            ],
          },
          {
            __typename: "ComponentCommonTwoColumnBlock",
            id: "5",
            TitleText: "Built for residency programmes",
            Description:
              "Assign an article before a case, track what your residents have watched, and hand them the same reference in theatre. Institutional access covers the whole department.",
            ButtonText: "Request institutional access",
            ButtonUrl: "https://jomi.com/institutions",
            ImagePosition: "Right",
            Image: image(
              "5",
              "teaching.jpg",
              "Abstract illustration of a teaching screen viewed by a group"
            ),
          },
        ],
      },
    },
  },
} as HomePagePayload;

export default homePageFixture;
