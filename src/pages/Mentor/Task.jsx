import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Root from "../../routes/Root";
import DOMPurify from "dompurify";
import moment from "moment";
import { Toaster, toast } from "alert";
import { useDropzone } from "react-dropzone";
import {
  Button,
  Modal,
  FloatingLabel,
  Form,
  Card,
  Form as FormBootstrap,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faComments,
  faPlay,
  faTimeline,
  faUpload,
  faUser,
  faX,
} from "@fortawesome/free-solid-svg-icons";
import { jwtDecode } from "jwt-decode";
import FabButton from "../components/FabButton";
import { confirmAlert } from "react-confirm-alert"; // Import
import "react-confirm-alert/src/react-confirm-alert.css";
let env = require("../config/config.json");

function Task() {
  const { id } = useParams("id");
  const navigate = useNavigate();
  const [task, setTask] = useState({});
  const [update, setUpdate] = useState(false);
  const [taskDetail, setTaskDetail] = useState([]);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const loggedIn = localStorage.getItem("accessToken");
  const [openModal, setOpenModal] = useState(false);
  const [files, setFiles] = useState("");
  const showModal = () => setOpenModal(true);
  const hideModal = () => setOpenModal(false);
  const user = jwtDecode(loggedIn);
  let env = require("../config/config.json");
  const updateTimeline = (data) => {
    axios
      .post(`${env.backend_url}users/task/${id}/update`, data, {
        headers: { "X-Access-Token": loggedIn },
      })
      .then((response) => {})
      .catch((error) => {});
  };
  const confirmStartTask = () => {
    confirmAlert({
      title: "Confirm to start this Task",
      message: "Are you sure to start this task.",
      buttons: [
        {
          label: "Sure!",
          onClick: () =>
            updateTimeline({
              status: "Start",
              description: `${user.username} starting task ${task.title}`,
            }),
        },
        {
          label: "Cancel",
          onClick: () => toast.error("Canceling process"),
        },
      ],
    });
  };
  const commentSubmit = () => {
    if (comment.length < 1) {
      return;
    }
    let data = { content: comment };
    axios
      .post(`${env.backend_url}mentor/task/${id}/comment`, data, {
        headers: { "X-Access-Token": loggedIn },
      })
      .then((response) => {
        setComment("");
        setComments(response.data.data);
        toast.success("Your comment added");
        setUpdate(false);
      });
  };
  const fileSize = (file) => {
    if (file.size > 100000) {
      return {
        code: "file size to large",
        message: `size is larger than 100kb`,
      };
    }
    return null;
  };
  const updateFiles = (incomingFiles) => {
    setFiles(incomingFiles);
  };
  const { acceptedFiles, fileRejections, getRootProps, getInputProps } =
    useDropzone({
      accept: { "image/*": [".jpg", ".png", ".jpeg"] },
      maxFiles: 1,
      validator: fileSize,
    });
  const acceptedFileItems = acceptedFiles.map((file, index) => {
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = (e) => {
      updateFiles(e.currentTarget.result);
    };
    return <img key={index} className="img-thumbnail" src={files} alt="" />;
  });
  const fileRejectionsItems = fileRejections.map(({ file, errors }) => (
    <ul key={file.path}>
      {file.name} - {file.size / 1000}kb
      {errors.map((err) => (
        <li key={err.code}>{err.message}</li>
      ))}
    </ul>
  ));

  useEffect(() => {
    if (loggedIn) {
      axios
        .get(`${env.backend_url}mentor/task/${id}`, {
          headers: { "X-Access-Token": loggedIn },
        })
        .then((response) => {
          setTask(response.data.data);
          setComments(response.data.data.tasks_comments);
          setTaskDetail(response.data.data.tasks_details);
          setUpdate(false);
        })
        .catch((error) => {
          navigate("/mentor/task");
        });
    } else {
      navigate("/login");
    }
  }, [update]);
  return (
    <>
      <Root />
      <FabButton />
      <div className="main-content">
        <Toaster position="bottom-right" duration={3500} reverse={true} />
        <div className="card">
          <div className="card-footer">
            <button
              className="btn btn-danger"
              onClick={() => {
                navigate("/mentor/task");
              }}
            >
              <FontAwesomeIcon icon={faArrowLeft} /> Back
            </button>
          </div>
        </div>
        <div className="card">
          <img
            className="img-thumbnail-detail"
            src={"${env.backend_url}" + task.thumbnail}
            alt={task.title}
          />
          <div className="task-title">{task.title}</div>
          <div
            className="task-content"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(task.content),
            }}
          ></div>
          {taskDetail && taskDetail.length === 0 ? (
            <Button
              variant="success"
              className="mx-3"
              onClick={confirmStartTask}
            >
              <FontAwesomeIcon icon={faPlay} /> Start Task
            </Button>
          ) : (
            <Button variant="primary" className="mx-3" onClick={showModal}>
              <FontAwesomeIcon icon={faTimeline} /> Update Timeline Task
            </Button>
          )}
          <hr />
          <div className="comment-section">
            <FloatingLabel
              controlId="floatingTextarea2"
              label={
                comments && comments.length > 0
                  ? "add your comment for this task"
                  : "be first commenter at this task"
              }
            >
              <Form.Control
                name="content"
                as="textarea"
                onChange={(e) => {
                  setComment(e.currentTarget.value);
                }}
                placeholder={
                  comments && comments.length > 0
                    ? "add your comment for this task"
                    : "be first commenter at this task"
                }
                style={{ height: "100px" }}
                value={comment}
              />
            </FloatingLabel>
            <button
              type="submit"
              className="btn btn-success mt-3"
              onClick={commentSubmit}
            >
              <FontAwesomeIcon icon={faComments} /> Add Comment
            </button>
            <hr />
            <div className="comment-container">
              {comments &&
                comments.map((comment, key) => (
                  <Card className="mb-2 p-0" key={key}>
                    <Card.Body className="py-1">
                      <blockquote className="blockquote mb-0">
                        <p className="text-sm">
                          <FontAwesomeIcon icon={faComments} />{" "}
                          {comment.content}
                        </p>
                        <footer className="blockquote-footer text-sm">
                          {moment(comment.createdAt).fromNow()} by{" "}
                          <cite title="Source Title">
                            <FontAwesomeIcon icon={faUser} />{" "}
                            {comment.user.username}
                          </cite>
                        </footer>
                      </blockquote>
                    </Card.Body>
                  </Card>
                ))}
            </div>
          </div>
        </div>
      </div>
      <Modal
        show={openModal}
        onHide={hideModal}
        backdrop="static"
        keyboard={false}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Update your task timeline</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormBootstrap>
            <FloatingLabel label="Username" className="mb-3">
              <FormBootstrap.Control
                type="text"
                placeholder="Username"
                readOnly={true}
                value={user.username}
              />
            </FloatingLabel>
            <FloatingLabel label="Description" className="mb-3">
              <FormBootstrap.Control
                as="textarea"
                placeholder="Description"
                style={{ height: "100px" }}
              />
            </FloatingLabel>
            <div className="container">
              <div {...getRootProps({ className: "dropzone" })}>
                <input id="thumbnail" {...getInputProps()} />
                <p>click to select files</p>
                <em>(Only *.jpeg and *.png images will be accepted)</em>
              </div>
              <aside>
                <div className="d-flex flex-wrap">
                  <div className="col-12">Accepted Thumbnail:</div>
                  <div className="col-12">{acceptedFileItems}</div>
                </div>
                <div className="d-flex flex-wrap">
                  <div className="col-12">Rejected Thumbnail:</div>
                  <div className="col-12">{fileRejectionsItems}</div>
                </div>
              </aside>
            </div>
          </FormBootstrap>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={hideModal}>
            <FontAwesomeIcon icon={faX} /> Close
          </Button>
          <Button variant="warning" onClick={hideModal}>
            <FontAwesomeIcon icon={faUpload} /> Update Timeline
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Task;
