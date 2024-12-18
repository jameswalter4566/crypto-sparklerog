import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  ResponsiveContainer
} from 'recharts';
import { Button } from "@/components/ui/button";
import { Zap, ChevronDown, Settings2, AlertCircle } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface PriceChartProps {
  data: Array<{
    date: string;
    price: number;
  }>;
}

export const PriceChart = ({ data }: PriceChartProps) => {
  const [selectedWallet, setSelectedWallet] = useState("Wallet 1");
  const [buyAmount, setBuyAmount] = useState("");

  return (
    <div className="grid grid-cols-[1fr,320px] gap-6">
      <Card className="w-full h-[600px]">
        <CardHeader>
          <CardTitle>Price Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={500}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9945FF" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#9945FF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date"
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `$${value.toFixed(2)}`}
              />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke="#9945FF" 
                fillOpacity={1} 
                fill="url(#colorPrice)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="bg-card rounded-lg p-4 h-[600px] flex flex-col">
        <div className="flex gap-2 mb-6">
          <Button variant="default" className="flex-1">
            <Zap className="mr-2 h-4 w-4" />
            Buy
          </Button>
          <Button variant="outline" className="flex-1">
            Sell
          </Button>
        </div>

        <RadioGroup defaultValue="buy-now" className="flex gap-2 mb-6">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="buy-now" id="buy-now" />
            <Label htmlFor="buy-now">Buy Now</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="buy-dip" id="buy-dip" />
            <Label htmlFor="buy-dip">Buy Dip</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="insta-buy" id="insta-buy" />
            <Label htmlFor="insta-buy">Insta Buy</Label>
          </div>
        </RadioGroup>

        <Button variant="outline" className="justify-between mb-4">
          {selectedWallet}
          <ChevronDown className="h-4 w-4" />
        </Button>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {[0.25, 0.5, 1, 2, 5, 10].map((amount) => (
            <Button
              key={amount}
              variant="outline"
              onClick={() => setBuyAmount(amount.toString())}
              className="text-sm"
            >
              {amount}
            </Button>
          ))}
        </div>

        <div className="relative mb-4">
          <Input
            type="text"
            placeholder="Amount to buy in SOL"
            value={buyAmount}
            onChange={(e) => setBuyAmount(e.target.value)}
            className="pl-8"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            ≈
          </span>
        </div>

        <Button variant="outline" className="justify-between mb-4">
          <span className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            Advanced Settings
          </span>
          <ChevronDown className="h-4 w-4" />
        </Button>

        <Button className="w-full bg-primary hover:bg-primary/90 mb-2">
          <Zap className="mr-2 h-4 w-4" />
          Quick Buy
        </Button>

        <p className="text-sm text-muted-foreground text-center mb-4">
          Once you click on Quick Buy, your transaction is sent immediately.
        </p>

        <Button variant="outline" className="justify-between mt-auto">
          <span className="flex items-center gap-2">
            Data & Security
            <span className="bg-destructive/20 text-destructive text-xs px-2 py-0.5 rounded-full">
              2 Issues
            </span>
          </span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};