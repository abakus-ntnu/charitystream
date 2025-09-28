import Image from "next/image";

import { formatCurrency } from "@/lib/helpers";

import { BeerData } from "@/models/types";

type Props = { beerData: BeerData | null };

const BeerCounter = ({ beerData }: Props) => {
  const { count, price, maxDonation } = beerData ?? {
    count: 0,
    price: 0,
    maxDonation: 10000,
  };

  const total = Math.min(count * price, maxDonation);

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative animate-gentle-bounce">
        <Image
          className="max-w-[260px] md:max-w-[300px] opacity-90 drop-shadow-xl"
          src="/beer.png"
          alt="Illustrasjon av øl som teller antall solgte"
          width={700}
          height={500}
          priority
        />
      </div>
    </div>
  );
};

export default BeerCounter;
