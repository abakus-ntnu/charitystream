import Image from "next/image";

import { formatCurrency } from "@/lib/helpers";

import { Donation } from "@/models/types";

type Props = {
  name: string;
  amount: number;
};

const DonationCard = (props: Props) => {
  return (
    <li className="group flex items-start gap-3 rounded-lg p-3 pr-4 border border-neutral-700/60 bg-neutral-800/40 transition-colors shadow-sm">
      <Image
        src="https://i.imgur.com/RVgB3E6.png"
        className="mt-1 flex-shrink-0 opacity-90 transition-transform"
        alt="Vipps logo"
        width={25}
        height={25}
      />
      <div className="flex flex-col w-full min-w-0">
        <div className="flex justify-between w-full text-sm md:text-base">
          <span className="font-medium truncate max-w-[50%]" title={props.name}>
            {props.name}
          </span>
          <span className="font-semibold text-red-400 tabular-nums ml-4">
            {formatCurrency(props.amount)}
          </span>
        </div>
      </div>
    </li>
  );
};

const TopDonation = ({ topDonor }: { topDonor: Donation }) => {
  if (!topDonor) return null;
  return (
    <div className="mb-4">
      <div className="text-sm uppercase tracking-wide text-neutral-400 mb-1 font-semibold">
        Største vippser
      </div>
      <div className="flex items-center rounded-lg p-3 pl-2 border border-emerald-500/50 bg-emerald-600/20">
        <Image
          src="https://i.imgur.com/RVgB3E6.png"
          className="m-2 mr-3"
          width={28}
          height={28}
          alt="Vipps logo"
        />
        <div className="flex justify-between w-full items-center text-sm md:text-base">
          <span
            className="font-semibold truncate max-w-[55%]"
            title={topDonor.name}
          >
            {topDonor.name}
          </span>
          <span className="font-bold text-emerald-300 ml-4 tabular-nums">
            {formatCurrency(topDonor.amount)}
          </span>
        </div>
      </div>
    </div>
  );
};

const Donations = ({
  donations,
  topDonor,
}: {
  donations: Donation[];
  topDonor: Donation;
}) => {
  const vipps = donations.slice(0, 10);

  return (
    <div className="flex flex-col h-full max-w-full">
      <TopDonation topDonor={topDonor} />
      <div className="text-sm uppercase tracking-wide text-neutral-400 mb-1 font-semibold">
        Siste transaksjoner
      </div>
      <ol
        className="donation-grid flex-1 overflow-y-auto"
        aria-label="Nyeste Vipps-donasjoner"
      >
        {vipps.map((donation) => (
          <DonationCard
            name={donation.name}
            amount={donation.amount}
            key={donation._id}
          />
        ))}
      </ol>
      {donations.length === 0 && (
        <p className="text-center text-sm mt-4 opacity-70">
          Ingen Vipps-donasjoner er registrert enda! :(
        </p>
      )}
    </div>
  );
};

export default Donations;
