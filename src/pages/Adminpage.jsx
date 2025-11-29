import React, { useContext } from "react";
import AdminPanel from "../components/admin/adminpanel";
import { ThemeContext } from "../components/aaGLOBAL/ThemeContext";

export default function Adminpage() {
  const { theme } = useContext(ThemeContext);

  return <AdminPanel theme={theme} />;
}