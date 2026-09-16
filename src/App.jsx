import "./App.css";
import CookieConsent from "./Components/CookieConsent/CookieConsent";
import Routing from "./Routing/routing";
import { useHeartbeat } from "./useHeartbeat";

export default function App() {
  useHeartbeat();

  return (
    <>
      <Routing />
      <CookieConsent />
    </>
  );
}