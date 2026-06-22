import { ChannelCatalogList } from "@/components/stream/channel-catalog-list";
import type { LegacyApiEnvelope, Stream } from "@/lib/api/types";

const LEGACY_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://radioter.io";

type SearchPageProps = {
  params: Promise<{
    query: string;
  }>;
};

async function getSearchResults(query: string) {
  const url = new URL("/api/v2/channels/search", LEGACY_API_BASE_URL);
  url.searchParams.set("query", query);

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });
  const envelope = (await response.json()) as LegacyApiEnvelope<{
    channels: {
      items: Stream[];
    };
  }>;

  if (!response.ok || envelope.code !== 1) {
    return [];
  }

  return envelope.data.channels.items;
}

export default async function SearchPage({ params }: SearchPageProps) {
  const { query: encodedQuery } = await params;
  const query = decodeURIComponent(encodedQuery);
  const channels = await getSearchResults(query);
  const count = channels.length;
  const heading =
    count === 1 ? (
      <>
        <b>1</b> radio station found for request <b>{query}</b>
      </>
    ) : (
      <>
        <b>{count}</b> radio stations found for request <b>{query}</b>
      </>
    );

  return (
    <div className="fixed-width">
      <div id="page-contents">
        <div className="page-sub-title">{heading}</div>
        <div className="new-stream-catalog-badge">
          <ChannelCatalogList
            channels={channels}
            key={query}
            legacyApiBaseUrl={LEGACY_API_BASE_URL}
          />
          {channels.length === 0 ? (
            <div className="no-streams">No streams found.</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
