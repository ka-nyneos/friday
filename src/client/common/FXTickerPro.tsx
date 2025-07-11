import { useEffect, useState } from "react";
import axios from "axios";

const API_KEY = "0a782d5b5d8f47dc95c51da1e83ac3f2";
const CURRENCIES = ["INR", "EUR", "JPY", "GBP", "AUD"];
const BASE = "USD";

interface RateData {
  current: number;
  previous: number;
  percentChange: number;
  direction: "up" | "down" | "neutral";
}

const FXTickerCompact = () => {
  const [rates, setRates] = useState<Record<string, RateData>>({});

  const fetchRates = async () => {
    try {
      const res = await axios.get(
        // `https://api.currencyfreaks.com/v2.0/rates/latest?apikey=${API_KEY}`
      );

      console.log(res.data.rates);

      const updatedRates: Record<string, RateData> = {};
      CURRENCIES.forEach((symbol) => {
        const current = parseFloat(res.data.rates[symbol]);
        const prev = rates[symbol]?.current || current;
        const diff = current - prev;
        const percentChange = ((diff) / prev) * 100;
        let direction: "up" | "down" | "neutral" = "neutral";
        if (percentChange > 0.01) direction = "up";
        else if (percentChange < -0.01) direction = "down";

        updatedRates[symbol] = {
          current,
          previous: prev,
          percentChange,
          direction,
        };
      });

      setRates(updatedRates);
    } catch (err) {
      console.error("FX API Error:", err);
    }
  };

  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center overflow-x-auto max-w-[500px] h-[3.5rem] px-3 z-40 rounded border border-primary-md shadow-sm bg-primary-xl space-x-5 scrollbar-hide">
      {Object.entries(rates).map(([symbol, data]) => {
        const { current, percentChange, direction } = data;
        const color =
          direction === "up"
            ? "text-green-600"
            : direction === "down"
            ? "text-red-500"
            : "text-gray-600";

        return (
          <div key={symbol} className="flex flex-col items-center w-[70px] shrink-0">
            <span className={`text-[13px] font-semibold leading-none ${color}`}>
              {current.toFixed(4)}
            </span>
            <span className="text-[10px] text-primary-lt leading-none">
              {`${BASE}/${symbol}`}
            </span>
            <span className={`text-[10px] font-medium ${color}`}>
              {percentChange.toFixed(2)}%
            </span>
            <div className="w-full h-[2px] mt-1 bg-gray-200 rounded-full">
              <div
                className={`h-full transition-all duration-500 ${
                  direction === "up"
                    ? "bg-green-500"
                    : direction === "down"
                    ? "bg-red-500"
                    : "bg-primary-md"
                }`}
                style={{ width: "100%" }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FXTickerCompact;
