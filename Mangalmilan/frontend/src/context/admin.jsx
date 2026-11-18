import { createContext, useContext, useState, useEffect } from "react";
import apiClient from "../api/apiClient";

export const AdminContext = createContext();
export const useAdmin = () => useContext(AdminContext);

export function AdminProvider({ children }) {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingVendors = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get("/api/admin/vendors/pending", { withCredentials: true });
      setVendors(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingVendors();
  }, []);

  const value = { vendors, fetchPendingVendors, loading };
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}
