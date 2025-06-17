import React, { useEffect, useState } from "react";
import "../App.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
let Uniquekey = 0;

const LeftPanel = ({ getLocation, setLocation, place, setPlace }) => {
  const [getClinics, setClinics] = useState([]);
  const [isOpen, setOpen] = useState(false);
  const [targetedClinic, setTargetedClinic] = useState(null);
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [found, setFound] = useState("hospital");
  const Navigate = useNavigate();
  const [sorted, setSorted] = useState(false);
  const [bookId, setbookId] = useState(null);
  const [myData, setMyData] = useState({
    appointmentId: "",
    date: "",
    time: "",
    hospitalName: "",
  });
  const [allAppoint, setAllAppoint] = useState([]);
  const [isBooked, setBooked] = useState(false);
  const [cancelId, setCancelId] = useState("");
  const [startBook, setStartBook] = useState(false);

  const getPlace = async (lat, lng) => {
    if (!lat || !lng) {
      // console.error("Location is not set properly.");
      return;
    }

    try {
      const response = await axios.post(`${BACKEND_URL}/api/getAddress`, {
        lat,
        lng,
      });
      setPlace(response.data.address || "Address not available");
    } catch (error) {
      // console.error("Error fetching address:", error);
    }
  };

  function arrangeClinics() {
    setSorted(true);
    const sortedClinics = [...getClinics].sort((a, b) => {
      return a.distance - b.distance;
    });
    // console.log("Clinics sorted by distance:", sortedClinics);
    setClinics(sortedClinics);
  }

  const getNearbyClinics = async (lat, lng) => {
    if (!lat || !lng) return;
    // console.log("hospital dhundh rh hu");

    const query = `[out:json];node(around:8000,${lat},${lng})[amenity=${found}];out;`;
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
      query
    )}`;
    try {
      const res = await fetch(url);
      const json = await res.json();
      const data = json.elements;

      // console.log(data);

      const temp = data
        .filter(
          (item) =>
            item.tags.name &&
            item.lat &&
            item.lon &&
            item.tags["addr:full"] &&
            item.tags["addr:state"] &&
            item.tags["addr:postcode"] &&
            item.tags["addr:district"]
        )
        .map((item) => ({
          appointmentId: Uniquekey++,
          name: item.tags.name,
          lat: item.lat,
          lon: item.lon,
          address: item.tags["addr:full"] || "Address not available",
          state: item.tags["addr:state"] || "State not available",
          postcode: item.tags["addr:postcode"] || "Postcode not available",
          district: item.tags["addr:district"] || "District not available",
          distance: findDistance(lat, lng, item.lat, item.lon),
        }));
      setClinics(temp || []);
    } catch (err) {
      // console.error("Error fetching clinics:", err);
    }
  };

  // useEffect(() => console.log(allAppoint), [allAppoint]);

  async function saveBooking() {
    if (!myData.date || !myData.time) {
      toast.error("Fill timing and date");
      return;
    }
    // console.log("ye ho rh booking");
    // console.log(myData);
    await axios
      .post(`${BACKEND_URL}/api/appointment/addAppointment`, myData, {
        withCredentials: true,
      })
      .then((response) => {
        if (response.data.status) {
          // console.log("Booking saved successfully:", response.data);
          setStartBook(false);
          setBooked(true);
          // console.log(myData.appointmentId);
          setAllAppoint((prev) => [...prev, myData.appointmentId]);
          setMyData({
            appointmentId: "",
            date: "",
            time: "",
            hospitalName: "",
          });
          toast.success("Added to Wishlist");
        }
      })
      .catch((e) => {
        // console.error("Error saving booking:", e);
      });
  }

  // useEffect(() => console.log(allAppoint), [allAppoint]);

  // useEffect(() => {
    // console.log(getClinics);
  // }, [getClinics]);

  const myLocation = () => {
    setSorted(false);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        // console.log("long lat set krrha hu");
        getNearbyClinics(pos.coords.latitude, pos.coords.longitude);
        getPlace(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        // console.error("Failed to get location:", err);
      }
    );
    // console.log("clinics dhundh rha hu 2.0");
  };

  function findDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance.toFixed(2);
  }

  function bookKaro() {
    setMyData((prev) => ({
      ...prev,
      hospitalName: targetedClinic,
      appointmentId: bookId,
    }));
    setStartBook(true);
  }

  function changePlace(value) {
    setSorted(false);
    setFound(value);
    // console.log("Place changed to:", value);
    // getNearbyClinics(getLocation.lat, getLocation.lng);
  }

  useEffect(() => {
    if (getLocation.lat && getLocation.lng) {
      console.log("Searching for:", found);
      getNearbyClinics(getLocation.lat, getLocation.lng);
    }
  }, [found]);

  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  // useEffect(() => console.log("Location set:", getLocation), [getLocation]);
  // useEffect(() => {
  // console.log("Place set:", place);
  // }, [place]);
  // useEffect(() => console.log("Nearby clinics:", getClinics), [getClinics]);

  const targetData = (thisClinic, mylat, mylon, myID) => {
    setLocation({ lat: mylat, lng: mylon });
    setTargetedClinic(thisClinic);
    // console.log(myID);
    setCancelId(myID);
    setbookId(myID);
    setOpen((prev) => !prev);
  };

  async function cancelKaro() {
    // console.log("Cancelling appointment with ID:", cancelId);
    await axios
      .post(
        `${BACKEND_URL}/api/appointment/removeAppointment`,
        { appointmentId: cancelId },
        {
          withCredentials: true,
        }
      )
      .then((response) => {
        // console.log(response.data);
        if (response.data.status) {
          setAllAppoint((prev) => prev.filter((id) => id !== cancelId)); // ✅ fixed here
          setBooked(false);
          setMyData({
            appointmentId: "",
            date: "",
            time: "",
            hospitalName: "",
          });
          toast.success("Cancelled to Visit");
        }
      })
      .catch((e) => {
        // console.log("Error cancelling", e);
      });
  }

  // console.log(allAppoint);

  useEffect(() => {
    const getAllAppointed = async () => {
      // console.log("lele");
      await axios
        .get(`${BACKEND_URL}/api/appointment/getAllApointments`, {
          withCredentials: true,
        })
        .then((res) => {
          if (res.data.myData) {
            // console.log(res.data.myData);
            const T = [];
            for (let ele in res.data.myData) {
              T.push(res.data.myData[ele].appointmentId);
            }
            setAllAppoint(T);
            // setAllAppoint(res.data.myData.appointmentId);
          }
        })
        .catch((e) => {});
    };
    getAllAppointed();
  }, []);

  // console.log(allAppoint);

  const solve = (MYID) => {
    return Array.isArray(allAppoint) && allAppoint.includes(MYID);
  };

  return (
    <>
      <Toaster />
      <div className="w-full md:w-1/2 h-screen md:h-screen p-4 sm:p-6 flex flex-col gap-3 text-white overflow-y-auto">
        {/* Header */}
        <div className="flex flex-wrap gap-2 flex-col md:flex-row lg:flex-row sm:gap-4 lg:justify-between items-center">
          <p
            className="font-semibold cursor-pointer text-xl sm:text-2xl text-yellow-300"
            onClick={() => navigate("/")}
          >
            IntelliLocate
          </p>

          <div className="flex flex-row gap-4">
            <button
              onClick={myLocation}
              className="text-sm sm:text-base bg-white hover:bg-slate-200 text-slate-500 font-semibold px-4 py-2 rounded-full transition transform hover:scale-95 active:scale-105 shadow-lg"
            >
              Get Location
            </button>

            <button
              onClick={arrangeClinics}
              className={`text-sm sm:text-base font-semibold px-4 py-2 rounded-full transition transform hover:scale-95 ${
                sorted
                  ? "bg-gray-400 text-black"
                  : "bg-white hover:bg-slate-200 text-slate-500"
              } active:scale-105 shadow-lg`}
            >
              Filter
            </button>
            <div className="relative">
              <select
                onChange={(e) => changePlace(e.target.value)}
                value={found}
                className="appearance-none text-sm sm:text-base bg-white text-gray-700 font-medium px-4 py-2 pr-8 rounded-full shadow-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="hospital">🏥 Hospital</option>
                <option value="clinic">🏨 Clinic</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Modal */}
        {isOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
            <div className="bg-gradient-to-br from-blue-500/30 via-blue-700/30 to-indigo-900/30 backdrop-blur-md border border-white/20 rounded-xl p-6 w-[90%] max-w-md shadow-lg flex flex-col items-center gap-4 text-white">
              <p className="text-2xl font-semibold text-center">
                Want to Book an Appointment?
              </p>
              <p className="text-lg font-light text-white text-center">
                {targetedClinic}
              </p>
              <p
                onClick={() =>
                  window.open(
                    `https://www.google.com/search?q=${encodeURIComponent(
                      targetedClinic
                    )}`,
                    "_blank"
                  )
                }
                className="underline text-sm text-blue-200 hover:text-slate-300 cursor-pointer"
              >
                Get More Info
              </p>

              {!solve(bookId) && !startBook && (
                <button
                  onClick={() => bookKaro(targetedClinic)}
                  className="w-full bg-slate-300 hover:bg-slate-400 text-black px-4 py-2 rounded-lg"
                >
                  Add to Wishlist
                </button>
              )}

              {solve(cancelId) && (
                <button
                  onClick={cancelKaro}
                  className="w-full bg-yellow-500 hover:bg-yellow-400 px-4 py-2 rounded-lg text-white"
                >
                  Cancel Visit
                </button>
              )}

              {startBook && (
                <div className="flex flex-col gap-3 w-full">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex items-center gap-2 w-full">
                      <label className="text-sm text-white">Date:</label>
                      <input
                        type="date"
                        value={myData.date}
                        onChange={(e) =>
                          setMyData((prev) => ({
                            ...prev,
                            date: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-1 rounded-md border border-gray-300 text-white"
                      />
                    </div>
                    <div className="flex items-center gap-2 w-full">
                      <label className="text-sm text-white">Time:</label>
                      <input
                        type="time"
                        value={myData.time}
                        onChange={(e) =>
                          setMyData((prev) => ({
                            ...prev,
                            time: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-1 rounded-md border border-gray-300 text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {!startBook ? (
                <button
                  onClick={() => setOpen(false)}
                  className="w-full bg-red-800 hover:bg-red-700 px-4 py-2 rounded-lg"
                >
                  Close
                </button>
              ) : (
                <button
                  onClick={saveBooking}
                  className="w-full bg-green-800 hover:bg-green-700 px-4 py-2 rounded-lg"
                >
                  Save
                </button>
              )}
            </div>
          </div>
        )}

        {/* Clinic List */}
        <h2 className="text-xl sm:text-2xl pt-2 text-center font-bold mb-2">
          Nearby {found}
        </h2>
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl h-full shadow-xl p-4  overflow-y-auto hide-scrollbar">
          <div className="flex flex-col gap-4 justify-center">
            {getClinics.length > 0 ? (
              getClinics.map((clinic, index) => (
                <div
                  key={index}
                  onClick={() =>
                    targetData(
                      clinic.name,
                      clinic.lat,
                      clinic.lon,
                      clinic.appointmentId
                    )
                  }
                  className="bg-white/10 rounded-xl p-4 hover:bg-white/20 transition cursor-pointer"
                >
                  <h3 className="text-base sm:text-lg font-semibold">
                    {clinic.name || "Clinic Name Not Available"}
                  </h3>
                  <p className="text-sm text-gray-200">
                    {clinic.address} {clinic.district}, {clinic.state} -{" "}
                    {clinic.postcode}
                  </p>
                  <p className="text-sm text-gray-200">
                    {clinic.distance} km away
                  </p>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center mt-6 animate-fadeInSlow">
               
                <div className=" px-6 py-4  text-center max-w-xs sm:max-w-sm">
                  <p className="text-lg sm:text-xl font-semibold leading-relaxed">
                    Press{" "}
                    <span className="text-yellow-300 font-bold">
                      Get Location
                    </span>{" "}
                    to find nearby{" "}
                    {found === "hospital" ? "hospitals" : "clinics"}!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default LeftPanel;
