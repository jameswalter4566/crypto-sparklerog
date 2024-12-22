export interface CoinData {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change_24h: number;
  imageUrl?: string;
  price_sol?: number;
  supply?: number;
  liquidity?: number;
  market_cap?: number;
  volume_24h?: number;
}

export const mockCoins: CoinData[] = [
  {
    id: "hoshino-ai",
    name: "Hoshino Ai",
    symbol: "HOSHINO",
    price: 0.0006626,
    change_24h: 2.5,
    supply: 1000000000, // 1B
    liquidity: 40000, // $40K
    market_cap: 123230, // $123.23K
    imageUrl: "/placeholder.svg"
  },
  {
    id: "xrp",
    name: "XRP",
    symbol: "XRP",
    price: 45000,
    change_24h: 2.5,
    imageUrl: "/xrppic.jpg"
  },
  {
    id: "robotchinese",
    name: "Robot Chinese",
    symbol: "RBC",
    price: 3000,
    change_24h: 1.8,
    imageUrl: "/robotchinese.jpg"
  },
  {
    id: "player1",
    name: "Player One",
    symbol: "P1",
    price: 100,
    change_24h: 5.2,
    imageUrl: "/player1.png"
  },
  {
    id: "savethelog",
    name: "Save The Log",
    symbol: "STL",
    price: 1.2,
    change_24h: -0.8,
    imageUrl: "/savethelog.jpg"
  },
  {
    id: "penguin",
    name: "Penguin",
    symbol: "PNG",
    price: 0.038761,
    price_sol: 0.053962,
    change_24h: 3.2,
    imageUrl: "/penguin.jpg",
    supply: 1000000000, // 1B
    liquidity: 121000, // $121K
    market_cap: 876150, // $876.15K
    volume_24h: 1300000, // $1.3M
  },
  {
    id: "blackcat",
    name: "Black Cat",
    symbol: "CAT",
    price: 85.3,
    change_24h: 4.7,
    imageUrl: "/blakccat.jpg"
  },
  {
    id: "armadillo",
    name: "Armadillo",
    symbol: "ARM",
    price: 15.8,
    change_24h: -1.2,
    imageUrl: "/armadillo.jpg"
  },
  {
    id: "unicornfartdust",
    name: "Unicorn Fart Dust",
    symbol: "UFD",
    price: 1.45,
    change_24h: 2.1,
    imageUrl: "/unicornfartdust.jpg"
  },
  {
    id: "colonycoin",
    name: "Colony Coin",
    symbol: "CLNY",
    price: 7.8,
    change_24h: -0.5,
    imageUrl: "/COLONYCOIN.png"
  },
  {
    id: "bailythebluecat",
    name: "Baily The Blue Cat",
    symbol: "BTBC",
    price: 180.6,
    change_24h: 1.9,
    imageUrl: "/BAILYTHEBLUECAT.jpg"
  },
  {
    id: "shimaai",
    name: "Shima AI",
    symbol: "SHAI",
    price: 28.4,
    change_24h: 3.7,
    imageUrl: "/SHIMAAI.jpg"
  },
  {
    id: "penguinzupsidedown",
    name: "Penguinz Upside Down",
    symbol: "PUD",
    price: 0.95,
    change_24h: -2.3,
    imageUrl: "/penguinzupsidedown.png"
  }
];