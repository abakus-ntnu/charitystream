import Alert from "./Alert";
import Link from "next/link";

const SetPasswordBox = ({ action = "gjøre dette" }) => {
  return (
    <div className="flex items-center justify-between">
      <Alert
        header="Obs!"
        text={`Du må sette et passord for å ${action}. Gå til forsiden`}
      />
      <div className="bg-gray-400 px-3 py-2 mx-5 rounded-md text-large font-medium text-black">
        <Link href="/admin">Sett passord</Link>
      </div>
    </div>
  );
};

export default SetPasswordBox;
