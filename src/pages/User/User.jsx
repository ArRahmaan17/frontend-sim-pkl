import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Root from "../../routes/Root";
import FabButton from "../components/FabButton";
let env = require("../config/config.json");
function User() {
  let navigate = useNavigate();
  let { id } = useParams();
  const [user, setUser] = useState({});
  useEffect(() => {
    const loggedIn = localStorage.getItem("accessToken");
    if (!loggedIn) {
      navigate("/login");
    } else {
      axios
        .get(`${env.backend_url}users/${id}/`, {
          headers: {
            "X-ACCESS-TOKEN": loggedIn,
          },
        })
        .then((response) => {
          if (Object.keys(response.data.data).length === 0) {
            navigate("/");
          }
          setUser(response.data.data);
        });
    }
  }, [id, navigate]);
  return (
    <>
      <Root />
      <FabButton />
      <div className="main-content">
        <div className="card">
          <div className="card-header">Detail User {id}</div>
          <div className="card-body">
            <div>
              Name:
              {user.first_name === null
                ? "Empty"
                : `${user.first_name} ${user.last_name}`}
            </div>
            <div>Username: {user.username ?? "Empty"}</div>
            <div>Email: {user.email ?? "Empty"}</div>
            <div>Phone Number: {user.phone_number ?? "Empty"}</div>
            <div>Address: {user.address ?? "Empty"}</div>
          </div>
          <div className="card-footer">
            <button
              className="btn btn-warning"
              onClick={() => {
                navigate(`update`);
              }}
            >
              Update
            </button>
            <button className="btn btn-danger">Delete</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default User;
