import { NewsArticle } from "@/actions/polygon";
import { Card } from "../ui/card";

export const NewsDisplay = ({ articles }: { articles: NewsArticle[] }) => {
  const parseUTCDate = (utcString: string) => {
    const date = new Date(utcString);

    // Get the current date/time
    const now = new Date();

    // Calculate the difference in hours
    const diffDays = (now.getTime() - date.getTime()) / (1000 * 3600 * 24);

    if (diffDays < 1) {
      // Less than 24 hours
      const diffHours = Math.floor(diffDays * 24);
      return `${diffHours} hours ago`;
    } else if (diffDays < 10) {
      // Between 1 day and 10 days
      return `${Math.floor(diffDays)} days ago`;
    } else {
      // More than 10 days
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const month = monthNames[date.getUTCMonth()];
      const day = date.getUTCDate().toString().padStart(2, "0");
      return `${month}-${day}`;
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <Card key={article.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img
                src={article.publisher.logo_url}
                alt={article.publisher.name}
                className="w-8 h-8 rounded-full"
              />
              <h3 className="text-lg font-semibold">
                {article.publisher.name}
              </h3>
            </div>
            <p className="text-sm text-gray-500">
              {parseUTCDate(article.published_utc)}
            </p>
          </div>
          <h2 className="mt-2 text-xl font-semibold">{article.title}</h2>
          <p className="mt-2 text-sm text-gray-600">{article.description}</p>
        </Card>
      ))}
    </div>
  );
};
