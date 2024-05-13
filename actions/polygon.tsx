"use server";

import { time } from "console";

interface QueryVariables {
  market?: string;
  cik?: string;
  date?: string;
  search: string;
  active?: string;
  order?: string;
  limit?: string;
  sort?: string;
}

export type StockInfo = {
  ticker: string;
  name: string;
  market: string;
  locale: string;
  primary_exchange: string;
  type: string;
  active: boolean;
  currency_name: string;
  cik: string;
  composite_figi: string;
  share_class_figi: string;
  last_updated_utc: string;
};

const queryStringBuilder = (query: Object) => {
  return Object.entries(query)
    .map(([key, value]) => {
      if (value) {
        return `${key}=${value}`;
      }
      return null;
    })
    .join("&");
};

export const searchAllTickers = async (query: QueryVariables) => {
  const queryAllVariables = {
    market: query.market,
    cik: query.cik,
    date: query.date,
    search: query.search,
    active: query.active,
    order: query.order,
    limit: 5,
    sort: "ticker",
    apiKey: process.env.NEXT_PUBLIC_POLYGON_API_KEY,
  };

  const queryString = queryStringBuilder(queryAllVariables);

  const url = `https://api.polygon.io/v3/reference/tickers?${queryString}`;
  console.log(url);
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.results as StockInfo[];
  } catch (error) {
    // Handle the error here
    console.error(error);
    throw error;
  }
};

export type NewsArticle = {
  id: string;
  publisher: {
    name: string;
    homepage_url: string;
    logo_url: string;
    favicon_url: string;
  };
  title: string;
  author: string;
  published_utc: string;
  article_url: string;
  tickers: string[];
  amp_url: string;
  image_url: string;
  description: string;
  keywords: string[];
};

export const tickerNews = async (ticker: string) => {
  const queryNews = {
    ticker: ticker,
    sort: "published_utc",
    order: "desc",
    limit: 6,
    apiKey: process.env.NEXT_PUBLIC_POLYGON_API_KEY,
  };

  const queryString = queryStringBuilder(queryNews);

  const url = `https://api.polygon.io/v2/reference/news?${queryString}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.results as NewsArticle[];
  } catch (error) {
    // Handle the error here
    console.error(error);
    throw error;
  }
};

export type Aggregates = {
  c: number; // Close price
  h: number; // High price
  l: number; // Low price
  n: number; // Typically represents number of transactions or data points
  o: number; // Open price
  t: number | string; // Timestamp (UNIX epoch in milliseconds)
  v: number; // Trading volume (number of shares)
  vw: number; // Volume Weighted Average Price (VWAP)
};

export type TimeSpan = "1D" | "5D" | "1M" | "6M" | "YTD" | "1Y" | "5Y" | "MAX";

export const tickerAggregates = async (ticker: string, timespan: TimeSpan) => {
  function isWeekend(date: Date): boolean {
    const day = date.getUTCDay();
    return day === 0 || day === 6; // 0 (Sunday) or 6 (Saturday)
  }

  const getDateParameters = async () => {
    const currentDate = new Date();
    let startDate = new Date();

    switch (timespan) {
      case "1D":
        startDate.setDate(currentDate.getDate() - 1);
        break;
      case "5D":
        startDate.setDate(currentDate.getDate() - 5);
        break;
      case "1M":
        startDate.setMonth(currentDate.getMonth() - 1);
        break;
      case "6M":
        startDate.setMonth(currentDate.getMonth() - 6);
        break;
      case "YTD":
        startDate.setMonth(0);
        startDate.setDate(1);
        break;
      case "1Y":
        startDate.setFullYear(currentDate.getFullYear() - 1);
        break;
      case "5Y":
        startDate.setFullYear(currentDate.getFullYear() - 5);
        break;
      case "MAX":
        startDate.setFullYear(currentDate.getFullYear() - 20);
        break;
      default:
        startDate = new Date(currentDate);
        break;
    }

    while (isWeekend(startDate)) {
      startDate.setDate(startDate.getDate() - 1);
    }

    const FromDate = startDate.toISOString().split("T")[0];
    const ToDate = currentDate.toISOString().split("T")[0];
    let multiplier, timeUnit;

    switch (timespan) {
      case "1D":
        multiplier = 5;
        timeUnit = "minute";
        break;
      case "5D":
        multiplier = 30;
        timeUnit = "minute";
        break;
      default:
        multiplier = 1;
        timeUnit = "day";
        break;
    }

    return {
      multiplier: multiplier,
      timespan: timeUnit,
      from: FromDate,
      to: ToDate,
    };
  };

  const dateParameters = await getDateParameters();

  const queryAggregates = {
    adjusted: true,
    sort: "asc",
    apiKey: process.env.NEXT_PUBLIC_POLYGON_API_KEY,
  };

  const queryString = queryStringBuilder(queryAggregates);

  const getUrl = () => {
    const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/${dateParameters.multiplier}/${dateParameters.timespan}/${dateParameters.from}/${dateParameters.to}/?${queryString}`;
    console.log(url);
    return url;
  };

  let url = getUrl();

  const fetchDataWithRetries = async (maxRetries = 1) => {
    let attempts = 0;

    while (attempts < maxRetries) {
      try {
        const response = await fetch(url);
        const data = await response.json();
        console.log(data); // Log the data to see what was fetched

        // Check if data.results is empty and if attempts are less than maxRetries
        if (!(data.results?.length > 0) && attempts < maxRetries - 1) {
          console.log(`Attempt ${attempts + 1}: No results, retrying...`);
          // get the day before from
          const currentDate = new Date(dateParameters.from);
          currentDate.setDate(currentDate.getDate() - 1);
          dateParameters.from = currentDate.toISOString().split("T")[0];
          url = getUrl();
          attempts++;
        } else {
          return data.results as Aggregates[]; // Return results if not empty or if max retries reached
        }
      } catch (error) {
        console.error(`Attempt ${attempts + 1}:`, error);

        // Increment attempts and throw if max retries reached
        if (attempts >= maxRetries - 1) {
          throw error;
        }
        attempts++;
      }
    }

    // If all retries are exhausted and still no results, handle it as needed
    throw new Error("Max retries reached with no results");
  }
  return fetchDataWithRetries()

};
