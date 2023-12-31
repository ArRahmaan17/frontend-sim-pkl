import React, { useEffect, useRef, useState } from "react";
import Root from "../../routes/Root";
import Webcam from "react-webcam";
import { Form, Field, Formik, ErrorMessage } from "formik";
import * as Yub from "yup";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Attendance() {
  const navigate = useNavigate();
  const ref = useRef(null);
  let [img, getSourceImage] = useState("");
  let [width, getWidthSource] = useState(0);
  let [height, getHeightSource] = useState(0);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Cant Get Your Current Location");
      return;
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
        },
        (error) => {
          setError(error.message);
        }
      );
    }
  }, []);
  const capture = () => {
    getWidthSource(ref.current.video.clientWidth);
    getHeightSource(ref.current.video.clientHeight);
    getSourceImage(ref.current.getScreenshot());
  };
  const reload = () => {
    getSourceImage("");
  };
  const validationSchema = Yub.object().shape({
    username: Yub.string()
      .trim()
      .test(
        "WHITE_SPACE_EXISTS",
        "username cant contain a white space",
        (value) => {
          return value.split(" ").length < 2;
        }
      )
      .required(),
    status: Yub.string().required(),
    photo: Yub.mixed().test(
      "NOT_NULL",
      "please take e photo for attendance evidence",
      (value) => {
        return (
          document.getElementById("photo").value !== undefined &&
          document.getElementById("photo").value !== ""
        );
      }
    ),
  });
  const attendanceSubmit = (data) => {
    data.photo = document.getElementById("photo").value;
    data.location = document.getElementById("location").value;
    axios
      .post("http://localhost:3001/users/attendance", data)
      .then((response) => {
        navigate("/");
      });
  };
  return (
    <>
      <Root />
      <div className="main-content">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Attendance Form</div>
          </div>
          <div className="card-body">
            <div className="">{error}</div>
            <Formik
              validateOnChange={false}
              validateOnBlur={false}
              validateOnMount={false}
              initialValues={{
                username: "",
                status: "",
                photo: "",
              }}
              validationSchema={validationSchema}
              onSubmit={attendanceSubmit}
            >
              <Form id="form-attendance">
                <label className="label" htmlFor="username">
                  Username
                </label>
                <Field name="username" id="username" className="form-control" />
                <ErrorMessage
                  name="username"
                  component="span"
                  className="invalid"
                />
                <label className="label" htmlFor="status">
                  Status
                </label>
                <Field
                  autoComplete="off"
                  as="select"
                  id="status"
                  name="status"
                  className="form-control-select"
                  defaultValue="IN"
                >
                  <option disabled value="">
                    Please Select An Option
                  </option>
                  <option value="IN">IN</option>
                  <option value="SICK">SICK</option>
                  <option value="ABSENT">ABSENT</option>
                  <option value="OUT">OUT</option>
                </Field>
                <ErrorMessage
                  name="status"
                  component="span"
                  className="invalid"
                />
                <label className="label" htmlFor="">
                  Photo
                </label>
                <Webcam ref={ref} className="camera-stream" alt="camera" />
                <img
                  className="camera-stream"
                  src={img}
                  alt="container_attendance_photo"
                  width={width / 1.3}
                  height={height / 1.3}
                />
                <Field
                  value={img.replace(/^data\:image\/\w+\;base64\,/, "") ?? ""}
                  type="hidden"
                  id="photo"
                  name="photo"
                />
                <ErrorMessage
                  name="photo"
                  component="span"
                  className="invalid"
                />
                <Field
                  value={JSON.stringify(location)}
                  type="hidden"
                  id="location"
                  name="location"
                />
                <div className="btn-group">
                  <button
                    type="button"
                    className="btn btn-warning"
                    onClick={() => {
                      capture();
                    }}
                  >
                    Capture
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => {
                      reload();
                    }}
                  >
                    Reload
                  </button>
                </div>
                <div className="btn-group">
                  <button type="submit" className="btn btn-success">
                    Attendance
                  </button>
                </div>
              </Form>
            </Formik>
          </div>
        </div>
      </div>
    </>
  );
}

export default Attendance;
