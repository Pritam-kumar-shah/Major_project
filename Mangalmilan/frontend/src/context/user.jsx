import React, { useContext, useState, useEffect, createContext } from "react";
import { authData } from "./auth";
import axios from "axios";

export const UserData = createContext();

function User({ children }) {
  const [userData, setUserData] = useState(null);
  const { serverURL } = useContext(authData);

  const getCurrentUser = async () => {
    try {
      let result = await axios.get(`${serverURL}/api/user/getCurrentUser`, {
        withCredentials: true,   // 👈 FIXED
      });
      setUserData(result.data);
      console.log("User:", result.data);
    } catch (error) {
      setUserData(null);
      console.error("getCurrentUser error:", error);
    }
  };

  useEffect(() => {
    getCurrentUser();
  }, []);

  const value = { userData, setUserData, getCurrentUser };

  return (
    <UserData.Provider value={value}>
      {children}
    </UserData.Provider>
  );
}

export default User;
