import { BeerData } from "../models/types";

type Props = { beerData: BeerData | null };

const BeerCounter = ({ beerData }: Props) => {
  const { count, price, maxDonation } = beerData ?? {
    count: 0,
    price: 0,
    maxDonation: 10000,
  };

  return (
    <div
      className={
        "flex align-center justify-center relative animate-[bounce_3s_ease-in-out_infinite] "
      }
    >
      <img
        className={"max-w-lg z-0 max-w-full "}
        src="beer.png"
        alt="Picture of a beer"
        width={700}
      />
      <div
        className="text-center text-3xl md:text-5xl z-10 bg-gray-200 absolute text-black font-extrabold -ml-2 p-3 rounded"
        style={{ top: "40%" }}
      >
        {count}stk
      </div>
      <div
        className="text-center text-2xl md:text-4xl z-10 bg-gray-200 absolute text-black font-extrabold -ml-2 p-3 rounded"
        style={{ top: "60%" }}
      >
        {Math.min(count * price, maxDonation)}kr
      </div>
    </div>
  );
};

export default BeerCounter;
