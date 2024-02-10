import { useEffect, useState } from "react";
import { HomeViews } from "../constants";
import { HomeCrimeView } from "../partials/HomeCrimeView";

function Home() {
  const [view, setView] = useState(HomeViews.crimes)

  useEffect(() => {
    setView(HomeViews.crimes)
  }, [])
  return ( 
    <div className="flex items-start justify-start">
        <div className="w-[100px] flex-shrink-0 bg-blue-200 p-2 h-[300px] rounded-br-lg">
          <div className="mt-5">crimes</div>
          <div>agencies</div>
        </div>
        <div className="flex justify-center items-start w-full h-[90vh]">
          <div className="w-[80%] mx-auto">
            <HomeCrimeView/>
          </div>
        </div>
    </div>
  )
}

export { Home };