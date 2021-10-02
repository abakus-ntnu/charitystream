import {useContext, useState, FormEvent, useEffect} from "react";
import useSWR from "swr";
import State from "../../lib/State";
import Alerts from "../../lib/Alerts";
import Layout from "../../components/admin/Layout";
import SetPasswordBox from "../../components/admin/SetPasswordBox";

interface AuctionOptions {
  freezeBidding: Boolean | null,
  displayWinners: Boolean | null
}

const fetcher = (url) => fetch(url).then((res) => res.json());

const Auction = () => {
  const [auctionOptions, setAuctionOptions] = useState<AuctionOptions>({freezeBidding: null, displayWinners: null});
  const [bidToDelete, setBidToDelete] = useState<number>(NaN);

  const { state } = useContext(State);
  const { addAlert } = useContext(Alerts);

  const { data, error, mutate } = useSWR("/api/state", fetcher, {
    refreshInterval: 5000,
  });

  const fetchRequest = async (url: string, method: string, body: any, handleRes: (res: any) => any) => {
    const actualBody = method === "GET" ? null : JSON.stringify(
      { ...body }
  );
    const res = await fetch(url, {
      method: method,
      headers: {
        password: state.token,
        "Content-Type": "application/json",
      },
      body: actualBody,
    });
    await handleRes(res);
    if (res.status !== 200) {
      const json = await res.json();
      addAlert(
          `${res.statusText}: ${json?.message || JSON.stringify(json)}`,
          "red"
      );
    }
  };

  useEffect(() => {
    if (!state.token) {
      return;
    }
    fetchRequest("/api/auctionOptions", "GET", {}, (res) => {
      if (res.status !== 200) {
        return;
      }
      res.json().then(res => setAuctionOptions(res));
    });
  })

  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;

  const toggleFreezeBids = () => {
      updateAuctionOptions({ ...auctionOptions, freezeBidding: !auctionOptions.freezeBidding });
  };

  const toggleShowBiddders = () => {
    updateAuctionOptions({ ...auctionOptions, displayWinners: !auctionOptions.displayWinners });
  };

  const updateAuctionOptions = async (newOptions: AuctionOptions) => {
    fetchRequest("/api/auctionOptions", "POST", newOptions, (res) => {
      setAuctionOptions(newOptions);
      if (res.ok) {
        addAlert(`Auksjons-innstillinger er oppdatert`, "green");
      }
    });
  };

  const deleteBid = async (bidId: number) => {
    if (data.auctions.find(auction => auction.id == bidId).price === 0) {
      addAlert(`Du kan ikke slette bud på 0kr! `, "red");
      return;
    }
    fetchRequest("/api/bid", "DELETE", { item: bidId }, (res) => {
      if (res.ok) {
        addAlert(`Budet ble slettet! Det kan ta noen sekunder før lista reloades`, "green");
        mutate();
      }
    });
  };

  const submitDeleteBid = async (e: FormEvent) => {
    e.preventDefault();
    if (isNaN(bidToDelete)) {
      addAlert(
          `Du må velge et bud!`,
          "red"
      );
      return
    }
    deleteBid(bidToDelete);
  };

  return (
      <Layout full>
        {!state?.token ? (
            <SetPasswordBox action="legge til donasjoner" />
        ) : (
            <div className="w-full sm:px-10 sm:py-6
            bg-white rounded-lg shadow-md lg:shadow-lg">
              <h1 className="font-bold text-center text-3xl text-gray-900">
                Administrer auksjon
              </h1>
              <button
                        className={`w-full py-3 mt-10 mr-1/12 bg-gray-${auctionOptions.freezeBidding ? "600" : "800"} rounded-sm
                    font-medium text-white uppercase
                    focus:outline-none hover:bg-gray-${auctionOptions.freezeBidding ? "500" : "700"} hover:shadow-none`}
                    onClick={() => {toggleFreezeBids()}}
                    >
                      {auctionOptions.freezeBidding == null ? "Laster inn" : 
                      auctionOptions.freezeBidding ? "Tillat bud" : "Frys bud"}
                    </button>
                    <button
                        type="submit"
                        className={`w-full py-3 mt-5 bg-gray-${auctionOptions.displayWinners ? "600" : "800"} rounded-sm
                    font-medium text-white uppercase
                    focus:outline-none hover:bg-gray-${auctionOptions.displayWinners ? "500" : "700"} hover:shadow-none`}
                    onClick={() => {toggleShowBiddders()}}
                    >
                      {auctionOptions.displayWinners == null ? "Laster inn" :
                      auctionOptions.displayWinners ? "Skjul hvem som har gitt bud" : "Vis hvem som har gitt bud"}
                    </button>
              <h2 className="font-bold text-center text-2xl text-gray-900 mt-5">
                Fjern høyeste bud
              </h2>
              <div className="w-full">
                <div className="mt-5 w-full">
                  <form onSubmit={submitDeleteBid}>
                    <select
                    className="block w-full py-3 px-1 mt-2 mb-4
                    text-gray-800 appearance-none
                    border-b-2 border-gray-100
                    focus:text-gray-700 focus:outline-none focus:border-gray-200"
                    onChange={(e) => {setBidToDelete(parseInt(e.target.value))}}>
                      { 
                      !error && data ?
                        <>
                        <option>-- Velg et bud --</option>
                        {
                        data.auctions.filter(auction => auction.price !== 0)
                        .map(auction => <option value={auction.id} key={auction.id}>{ auction.price }kr &nbsp; - &nbsp; { auction.description }</option>) }
                      </> : 
                      <option>Loading...</option> 
                      }
                    </select>
                    <button
                        type="submit"
                        className="w-full py-3 bg-gray-800 rounded-sm
                    font-medium text-white uppercase
                    focus:outline-none hover:bg-gray-700 hover:shadow-none"
                    >
                      Fjern bud
                    </button>
                  </form>
                </div>
              </div>
            </div>
        )}
      </Layout>
  );
};

export default Auction;
