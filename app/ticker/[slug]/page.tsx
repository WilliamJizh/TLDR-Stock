import { tickerNews, tickerAggregates } from "@/actions/polygon";
import { AggregateDisplay } from "@/components/ticker/aggregates";
import { NewsDisplay } from "@/components/ticker/news";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import Image from "next/image";

export default async function Page({ params }: { params: { slug: string } }) {
  const tickerInfo = await tickerNews(params.slug);
  return (
    <div className="grid gap-10 p-4">
      <AggregateDisplay ticker={params.slug} />
      <NewsDisplay articles={tickerInfo}/>
    </div>
  );
}
