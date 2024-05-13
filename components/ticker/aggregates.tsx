"use client";

import { Aggregates, TimeSpan, tickerAggregates } from "@/actions/polygon";
import { convertDateToStringFormat, convertTimeToAMPM } from "@/utils/time";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ReferenceArea,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";

export const AggregateDisplay = ({ ticker }: { ticker: string }) => {
  const [aggregates, setAggregates] = useState<Aggregates[]>([]);
  const [timeSpan, setTimeSpan] = useState<TimeSpan>("1D");
  const [uniqueTicks, setUniqueTicks] = useState<number[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPoint, setStartPoint] = useState<Aggregates>();
  const [endPoint, setEndPoint] = useState<Aggregates>();

  useEffect(() => {
    tickerAggregates(ticker, timeSpan).then((data) => {
      setAggregates(data);
      setUniqueTicks(getUniqueTicks(data));
    });
  }, [timeSpan]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);

    if (timeSpan === "1D") {
      return convertTimeToAMPM(date);
    } else {
      return convertDateToStringFormat(date);
    }
  };

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

    const offset = (max - min) * 0.5;
    return [min - offset, max + offset];
  };

  const getUniqueTicks = (aggregates: Aggregates[]) => {
    const tickMap = new Map<string, number>(); // Use a Map to track the first unique timestamp for each formatted date

    aggregates.forEach((aggregate) => {
      const formattedTick = formatDate(aggregate.t as number);
      // Only add the timestamp to the map if the formatted date hasn't been added yet
      if (!tickMap.has(formattedTick)) {
        tickMap.set(formattedTick, aggregate.t as number);
      }
    });
    // Convert the values of the map to an array, which will be the original timestamps of the first non-duplicate dates
    return Array.from(tickMap.values());
  };
  // Start selection
  const handleMouseDown = (e: any) => {
    console.log(e);
    if (e) {
      setIsSelecting(true);
      setStartPoint(e.activePayload[0].payload);
      setEndPoint(e.activePayload[0].payload); // Reset endpoint on new selection start
    }
  };

  // Update selection
  const handleMouseMove = (e: any) => {
    if (isSelecting && e) {
      const currEndpoint = e.activePayload[0].payload as Aggregates;
      setEndPoint(currEndpoint);
      console.log(`Selected from ${startPoint} to ${currEndpoint}`); // Here you can do your logic or calculation
      const diffPercantage = calculateDiffPercentage(
        startPoint?.c as number,
        currEndpoint.c
      );
      console.log(diffPercantage);
    }
  };

  // End selection
  const handleMouseUp = () => {
    setIsSelecting(false);
  };

  // Calculate the rate difference in percentage
  const calculateDiffPercentage = (start: number, end: number) => {
    const percentage = ((end - start) / start) * 100;
    // Round to 2 decimal places, if it's positive add a '+' sign, otherwise add a '-'
    return `${percentage > 0 ? "+" : ""}${percentage.toFixed(2)}%`;
  };

  const renderTooltipContent = (props: TooltipProps<ValueType, NameType>) => {
    const { active, payload, label } = props;
    if (active && payload) {
      const currentData = payload[0].payload;
      let diffPercentage = "";
      if (isSelecting && startPoint) {
        diffPercentage = calculateDiffPercentage(startPoint.c, currentData.c);
      }

      return (
        <div
          className="custom-tooltip"
          style={{
            backgroundColor: "#fff",
            padding: "10px",
            border: "1px solid #ccc",
          }}
        >
          <p>{formatDate(label)}</p>
          <p>Value: {currentData.c}</p>
          {isSelecting && <p>Difference: {diffPercentage}</p>}
        </div>
      );
    }

    return null;
  };

  const formatStockIndex = (index: number) => {
    return index.toFixed(0);
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
          onMouseDown={handleMouseDown}
          onMouseMove={isSelecting ? handleMouseMove : undefined}
          onMouseUp={handleMouseUp}
        >
          <defs>
            <linearGradient id="colorC" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="t"
            type="category"
            ticks={uniqueTicks}
            tickFormatter={formatDate}
          />
          <YAxis
            domain={calcRange(aggregates)}
            tickFormatter={formatStockIndex}
          />
          <Tooltip labelFormatter={formatDate} content={renderTooltipContent} />
          <Area
            type="monotone"
            dataKey="c"
            stroke="#8884d8"
            fillOpacity={1}
            fill="url(#colorC)"
          />
          {isSelecting && startPoint && endPoint && (
            <ReferenceArea
              x1={startPoint.t}
              x2={endPoint.t}
              strokeOpacity={0.3}
              fill="red"
              fillOpacity={0.3}
            />
          )}
        </AreaChart>
      )}
      <TimeSpanSelection />
    </div>
  );
};
