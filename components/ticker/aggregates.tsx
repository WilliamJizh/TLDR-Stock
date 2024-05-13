"use client";

import { Aggregates, TimeSpan, tickerAggregates } from "@/actions/polygon";
import { Tabs, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { time } from "console";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts";

export const AggregateDisplay = ({ ticker }: { ticker: string }) => {
  const [aggregates, setAggregates] = useState<Aggregates[]>([]);
  const [timeSpan, setTimeSpan] = useState<TimeSpan>("1D");

  useEffect(() => {
    tickerAggregates(ticker, timeSpan).then((data) => {
      setAggregates(data);
    });
  }, [timeSpan]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutesFormatted = minutes < 10 ? "0" + minutes : minutes;

    if (timeSpan === "1D") {
      return `${hours}:${minutesFormatted} ${ampm}`;
    } else {
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }
  };

  console.log(aggregates);

  const TimeSpanSelection = () => {
    return (
      <div className="flex space-x-2 py-2 px-4 bg-gray-100 rounded-lg">
        <button
          className="px-3 py-1 rounded text-white bg-blue-500 hover:bg-blue-700"
          onClick={() => setTimeSpan("1D")}
        >
          1D
        </button>
        <button
          className="px-3 py-1 rounded text-white bg-blue-500 hover:bg-blue-700"
          onClick={() => setTimeSpan("5D")}
        >
          5D
        </button>
        <button
          className="px-3 py-1 rounded text-white bg-blue-500 hover:bg-blue-700"
          onClick={() => setTimeSpan("1M")}
        >
          1M
        </button>
        <button
          className="px-3 py-1 rounded text-white bg-blue-500 hover:bg-blue-700"
          onClick={() => setTimeSpan("6M")}
        >
          6M
        </button>
        <button
          className="px-3 py-1 rounded text-white bg-blue-500 hover:bg-blue-700"
          onClick={() => setTimeSpan("YTD")}
        >
          YTD
        </button>
        <button
          className="px-3 py-1 rounded text-white bg-blue-500 hover:bg-blue-700"
          onClick={() => setTimeSpan("1Y")}
        >
          1Y
        </button>
        <button
          className="px-3 py-1 rounded text-white bg-blue-500 hover:bg-blue-700"
          onClick={() => setTimeSpan("5Y")}
        >
          5Y
        </button>
        <button
          className="px-3 py-1 rounded text-white bg-blue-500 hover:bg-blue-700"
          onClick={() => setTimeSpan("MAX")}
        >
          MAX
        </button>
      </div>
    );
  };

  const calcRange = (aggregates: Aggregates[]) => {
    if (!aggregates) return [0, 0];
    const max = aggregates.reduce((acc, curr) => {
      return Math.max(acc, curr.c);
    }, 0);
    const min = aggregates.reduce((acc, curr) => {
      return Math.min(acc, curr.c);
    }, max);

    const offset = (max - min) * 0.1;
    return [min - offset, max + offset];
  };

  return (
    <div className="p-4 bg-white shadow-lg rounded-lg">
      {aggregates && aggregates?.length === 0 ? (
        <div>Loading...</div>
      ) : (
        <AreaChart
          width={600}
          height={300}
          data={aggregates}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <defs>
            <linearGradient id="colorC" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="t" tickFormatter={formatDate} />
          <YAxis domain={calcRange(aggregates)} />
          <Tooltip labelFormatter={formatDate} />
          <Legend />
          <Area
            type="monotone"
            dataKey="c"
            stroke="#8884d8"
            fillOpacity={1}
            fill="url(#colorC)"
          />
        </AreaChart>
      )}
      <TimeSpanSelection />
    </div>
  );
};
