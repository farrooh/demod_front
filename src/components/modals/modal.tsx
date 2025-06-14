import { Box, Modal, SxProps } from "@mui/material";
import * as React from "react";
import LoadingBar from "react-top-loading-bar";
import {
  setAddingProjectState,
  setConfirmState,
  setEditingProjectState,
  setLoginState,
  setOpenModal,
  setProfileEditState,
  setProfileImagePreview,
  setProfileImageState,
  setSignupState,
  setVerifyState,
  setWarningMessage,
  setWarningState,
} from "../../data/modal_checker";
import { useDispatch, useSelector } from "../../store";
import {
  AddProjectContext,
  ConfirmContext,
  EditProfileContext,
  EditProjectContext,
  ForgotPasswordContext,
  LoginContext,
  ProfileImageContext,
  ProjectsContext,
  SignUpContext,
  VerificationContext,
  WarningContext,
} from "./context";

export default function BasicModal(props: { styles?: SxProps }) {
  const [userEmail, setUserEmail] = React.useState("");
  const [progress, setProgress] = React.useState(0);

  //open certain modal by its status
  const isProfileImageOpen = useSelector(
    (state: any) => state?.modal_checker?.isProfileImage
  );
  const isConfirmOpen = useSelector(
    (state: any) => state?.modal_checker?.isConfirm
  );
  const isLoginOpen = useSelector(
    (state: any) => state?.modal_checker?.isLogin
  );
  const isForgotPasswordOpen = useSelector(
    (state: any) => state?.modal_checker?.isForgotPassword
  );
  const isWarningOpen = useSelector(
    (state: any) => state?.modal_checker?.isWarning
  );
  const isSignupOpen = useSelector(
    (state: any) => state?.modal_checker?.isSignup
  );
  const isVerifyOpen = useSelector(
    (state: any) => state?.modal_checker?.isVerify
  );
  const isProfileEditOpen = useSelector(
    (state: any) => state?.modal_checker?.isProfileEdit
  );
  const isProjectsListOpen = useSelector(
    (state: any) => state?.modal_checker?.isProjectsList
  );
  const isAddingProjectOpen = useSelector(
    (state: any) => state?.modal_checker?.isAddingProject
  );
  const isEditingProjectOpen = useSelector(
    (state: any) => state?.modal_checker?.isEditingProject
  );
  const isModalOpen = useSelector(
    (state: any) => state?.modal_checker?.isModalOpen
  );

  const style: SxProps = {
    minWidth: { xs: "360px", sm: "380px", md: "440px" },
    maxWidth: isProfileEditOpen
      ? { lg: "676px", md: "676px", sm: "90%", xs: "90%" }
      : { lg: "440px", md: "440px", sm: "90%", xs: "90%" },
    overflow: "hidden",
    m: "0 auto",
    position: "absolute",
    top: "50%",
    left: { xs: "50%", sm: "50%" },
    transform: "translate(-50%, -50%)",
    bgcolor: "#ffff",
    border: "1px solid #fff",
    boxShadow: 24,
    p: "24px",
    ":focus-visible": {
      outline: "none",
    },
    ...props?.styles,
  };

  //declare dispatcher
  const dispatch = useDispatch();

  const handleClose = () => {
    dispatch(setSignupState(false));
    dispatch(setLoginState(false));
    dispatch(setVerifyState(false));
    dispatch(setConfirmState(false));
    dispatch(setProfileEditState(false));
    dispatch(setAddingProjectState(false));
    dispatch(setEditingProjectState(false));
    dispatch(setProfileImageState(false));
    dispatch(setWarningState(false));
    dispatch(setWarningMessage(""));
    dispatch(setProfileImagePreview(null));
    dispatch(setOpenModal(false));
  };

  return (
    <div>
      <LoadingBar color={"#ff0000"} progress={progress} />
      {/* <AlertWrapper /> */}
      <Modal
        open={isModalOpen}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box className="login__modals--wrap" sx={style}>
          {isProfileImageOpen ? (
            <ProfileImageContext />
          ) : isWarningOpen ? (
            <WarningContext />
          ) : isConfirmOpen ? (
            <ConfirmContext />
          ) : isSignupOpen ? (
            <SignUpContext
              setUserEmail={(email: any) => {
                setUserEmail(email);
              }}
            />
          ) : isLoginOpen ? (
            <LoginContext
              setUserEmail={(email: any) => {
                setUserEmail(email);
              }}
            />
          ) : isForgotPasswordOpen ? (
            <ForgotPasswordContext />
          ) : isVerifyOpen ? (
            <VerificationContext
              userEmail={userEmail}
              setProgress={(val: any) => {
                setProgress(val);
              }}
            />
          ) : isProfileEditOpen ? (
            <EditProfileContext />
          ) : isAddingProjectOpen ? (
            <AddProjectContext />
          ) : isEditingProjectOpen ? (
            <EditProjectContext />
          ) : isProjectsListOpen ? (
            <ProjectsContext />
          ) : null}
        </Box>
      </Modal>
    </div>
  );
}
