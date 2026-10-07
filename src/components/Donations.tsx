import { formatCurrency } from "@/lib/helpers";

import { Donation } from "@/models/types";

type Props = {
  name: string;
  amount: number;
};

const DonationCard = (props: Props) => {
  return (
    <li className="flex items-center gap-3 py-2.5 border-b border-border-dim last:border-b-0 animate-pop-in">
      <div className="flex justify-between w-full min-w-0 text-sm md:text-base">
        <span className="font-medium truncate" title={props.name}>
          {props.name}
        </span>
        <span className="font-bold text-green-6 tabular-nums ml-4 whitespace-nowrap">
          {formatCurrency(props.amount)}
        </span>
      </div>
    </li>
  );
};

const TopDonation = ({ topDonor }: { topDonor: Donation }) => {
  if (!topDonor) return null;
  return (
    <div className="mb-6">
      <div className="eyebrow mb-2">Største vippser</div>
      <div className="flex items-stretch gap-4 bg-ink-alt">
        <div className="w-2 flex-shrink-0 bg-gold" />
        <div className="flex items-center gap-3 py-3 pr-4 w-full min-w-0">
          <div className="flex justify-between items-baseline w-full min-w-0">
            <span className="font-bold text-lg truncate" title={topDonor.name}>
              {topDonor.name}
            </span>
            <span className="font-extrabold text-xl text-gold ml-4 tabular-nums whitespace-nowrap">
              {formatCurrency(topDonor.amount)}
            </span>
          </div>
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
      <div className="eyebrow mb-1">Siste transaksjoner</div>
      <ol
        className="flex flex-col flex-1 overflow-y-auto"
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
        <p className="text-sm mt-4 text-text-faint">
          Ingen Vipps-donasjoner er registrert enda! :(
        </p>
      )}
    </div>
  );
};

export default Donations;
