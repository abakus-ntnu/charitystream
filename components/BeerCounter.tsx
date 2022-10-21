import { BeerData } from "../models/types";

const BeerCounter = ({ beerData }: { beerData: BeerData }) => {
  const { count, price, maxDonation } = beerData;
  return (
    <div className={"flex align-center justify-center relative"}>
      <img
        className={"max-w-lg z-0 max-w-full"}
        src="beeer.png"
        alt="Picture of a beer"
        width={700}
      />
      <div
        className="text-center text-3xl md:text-5xl z-10 absolute text-black font-extrabold -ml-2"
        style={{ top: "40%" }}
      >
        {count}stk
      </div>
      <div
        className="text-center text-2xl md:text-4xl z-10 absolute text-black font-extrabold -ml-2"
        style={{ top: "50%" }}
      >
        {Math.min(count * price, maxDonation)}kr
      </div>
    </div>
  );
};

export default BeerCounter;
