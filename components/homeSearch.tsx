"use client";


import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";

import { StockInfo, searchAllTickers } from "@/actions/polygon";
import { ChangeEvent, useEffect, useState } from "react";
import Link from "next/link";

export function HomeSearch() {
  const [searchSuggestionOpen, setSearchSuggestionOpen] = useState(false);
  const [value, setValue] = useState("");
  const [search, setSearch] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<StockInfo[]>([]);
  const [timerId, setTimerId] = useState(null);

  const handleSearchChange = async (e: ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
    if (e.target.value.length <= 0) {
      setSearchSuggestionOpen(false);
    }

    const newTimerId = setTimeout(() => {
      if (e.target.value.length > 0) {
        setSearchSuggestionOpen(true);
        querySuggestion(e.target.value);
      }
    }, 300); // 300 milliseconds delay after the user stops typing
    setTimerId(newTimerId);
  };

  useEffect(() => {
    // Cleanup on component unmount
    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [timerId]);

  const querySuggestion = async (search: string) => {
    const result = await searchAllTickers({ search: search });
    console.log(result);
    setSearchSuggestions(result);
  };

  return (
    <>
      <Command className="rounded-lg border shadow-md" shouldFilter={false}>
        <CommandInput
          placeholder="Type a command or search..."
          onChangeCapture={handleSearchChange}
        />
        <CommandEmpty>
          <span className="text-gray-400">No results found.</span>
        </CommandEmpty>
        {searchSuggestionOpen && (
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {searchSuggestions && searchSuggestions.map((suggestion) => {
              console.log(suggestion);
              return (
                <CommandItem key={suggestion.ticker}>
                  <Link
                    className="flex flex-col w-full"
                    href={`ticker/${suggestion.ticker}`}
                  >
                    <span className="font-bold">{suggestion.ticker}</span>
                    <span>{suggestion.name}</span>
                  </Link>
                </CommandItem>
              );
            })}
          </CommandList>
        )}
      </Command>
    </>
  );
}
