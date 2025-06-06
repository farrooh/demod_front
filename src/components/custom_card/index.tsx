import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { Box, Grid, Menu, MenuItem, Paper, styled } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { getMyInteriors } from "../../data/get_my_interiors";
import { getMyProjects } from "../../data/get_my_projects";
import {
  ConfirmContextProps,
  resetConfirmData,
  resetConfirmProps,
  setConfirmProps,
  setConfirmState,
  setEditingProject,
  setEditingProjectState,
  setOpenModal,
} from "../../data/modal_checker";
import { ThemeProps } from "../../types/theme";
import instance from "../../utils/axios";
import { IMAGES_BASE_URL } from "../../utils/env_vars";
import SimpleTypography from "../typography";

type InputProps = {
  item?: object;
};

type CustomCardProps = {
  readonly type?: any;
  readonly model?: any;
  readonly link?: any;
  readonly imgHeight?: string;
  readonly tagText?: string;
  readonly tagIcon?: string;
  readonly withAuthor?: boolean;
  readonly settingsBtn?: boolean;
  readonly useButton?: boolean;
  readonly imageSplit?: number;
  readonly brandBox?: boolean;
};
const Label = styled(Paper)(({ theme }: ThemeProps) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(0.5),
  textAlign: "center",
  color: theme.palette.text.secondary,
  borderBottomLeftRadius: 0,
  borderBottomRightRadius: 0,
}));

const DropDown = styled(Menu)(
  ({ theme }: ThemeProps) => `

  .MuiList-root{
    width:162px;
    border: 1px solid #E0E0E0;
    border-radius: 4px;
    padding: 4px 0;
    // margin:10px 12px;
    
  }

  .MuiPaper-root{
    border-radius:0 !important;
    // box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.18);
    box-shadow: 0px 8px 18px 0px #00000029;
  }
  `
);

function CustomCard({
  model,
  type,
  link,
  imgHeight,
  tagIcon,
  tagText,
  withAuthor,
  settingsBtn,
  imageSplit,
  useButton = false,
  brandBox = true,
}: CustomCardProps) {
  const dispatch = useDispatch<any>();
  const router = useRouter();
  const [selectedInterior, setSelectedInterior] = React.useState<any>(null);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const [images, setImages] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (!!imageSplit && images.length < 4) {
      const imagesArr: any[] = [];
      for (let i = 0; i < 4; i++) {
        const element = model?.project_models[i];
        imagesArr.push({
          src: !!element
            ? `${IMAGES_BASE_URL}/${element["model.cover"][0]?.image_src}`
            : null,
        });
      }
      setImages(imagesArr);
    }
  }, [model]);

  const handleClick = (event: any, interior) => {
    event.preventDefault();
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedInterior(interior);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedInterior(null);
  };

  function openEditProject(project) {
    dispatch(setEditingProject(project));
    dispatch(setEditingProjectState(true));
    dispatch(setOpenModal(true));
  }

  function handleBoxClick(e, link) {
    const classes = [...e.target!["classList"]];
    if (!classes.includes("settings")) {
      router.push(link);
    }
  }

  function handleClickDelete() {
    const modalContent: ConfirmContextProps = {
      message: `Вы уверены, что хотите удалить ${
        type == "projects" ? "проект" : "интерьер"
      } «${selectedInterior?.name}»?`,
      actions: {
        on_click: {
          args: [selectedInterior?.id],
          func: async (checked: boolean, id: number) => {
            dispatch(setConfirmProps({ is_loading: true }));
            instance
              .delete(
                `${
                  type == "projects" ? "projects" : "interiors"
                }/${id}/?cascade=${!checked}`
              )
              .then((res) => {
                if (res?.data?.success) {
                  toast.success(res?.data?.message);
                  dispatch(setConfirmState(false));
                  dispatch(setOpenModal(false));
                  dispatch(resetConfirmProps());
                  dispatch(resetConfirmData());
                  dispatch(resetConfirmData());
                  if (type == "projects") {
                    dispatch(getMyProjects());
                  } else {
                    dispatch(getMyInteriors());
                  }
                } else {
                  toast.success(res?.data?.message);
                }
              })
              .catch((err) => {
                toast.error(err?.response?.data?.message);
              })
              .finally(() => {
                dispatch(setConfirmProps({ is_loading: false }));
                handleClose();
              });
          },
        },
      },
    };
    dispatch(resetConfirmProps());
    dispatch(setConfirmProps(modalContent));
    dispatch(setConfirmState(true));
    dispatch(setOpenModal(true));
  }

  return (
    <>
      <DropDown
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <MenuItem
          onClick={() =>
            type == "projects" ? openEditProject(model) : handleClose()
          }
          sx={{ padding: "6px 12px" }}
        >
          {type == "projects" ? (
            <>
              <Image
                src="/icons/edit-pen.svg"
                alt="icon"
                width={17}
                height={17}
              />
              <SimpleTypography
                className="drow-down__text"
                text="Редактировать"
              />
            </>
          ) : (
            <Link
              href={`/interiors/edit/${selectedInterior?.slug}`}
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Image
                src="/icons/edit-pen.svg"
                alt="icon"
                width={17}
                height={17}
              />
              <SimpleTypography
                className="drow-down__text"
                text="Редактировать"
              />
            </Link>
          )}
        </MenuItem>

        <MenuItem onClick={handleClickDelete} sx={{ padding: "6px 12px" }}>
          <Image src="/icons/trash.svg" alt="icon" width={17} height={17} />
          <SimpleTypography className="drow-down__text" text="Удалить" />
        </MenuItem>
      </DropDown>
      {useButton ? (
        <Box
          key={model?.id}
          onClick={(e) => handleBoxClick(e, link)}
          style={{ margin: "0", textDecoration: "none" }}
        >
          <Box
            sx={{
              height: "auto",
              width: "100%",
              border: " 1px solid #e0e0e0",
              background: "#fff",
              position: "relative",
              cursor: "pointer",
              transition: "all 0.4s ease",
              padding: "8px 8px 0 8px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",

              "&:hover > .settings": {
                opacity: 1,
              },
            }}
          >
            {tagText ? (
              <SimpleTypography text={tagText || ""} className="card__sale" />
            ) : tagIcon ? (
              <Box
                sx={{
                  position: "absolute",
                  width: "24px",
                  height: "24px",
                  top: "5px",
                  right: "5px",
                  color: "#fff",
                  backgroundColor: "#7210be",
                  border: "1.5px solid #fff",
                  borderRadius: "3px",
                  zIndex: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image src={tagIcon} alt="icon" width={14} height={14} />
              </Box>
            ) : !!settingsBtn ? (
              <Box
                className="settings"
                sx={{
                  transition: "all 0.4s ease",
                  opacity: !!open ? 1 : 0,
                  position: "absolute",
                  p: "6px 8px",
                  backdropFilter: "blur(2px)",
                  top: "5px",
                  right: "5px",
                  color: "#fff",
                  backgroundColor: "#00000066",
                  border: "1px solid #0000001A",
                  borderRadius: "32px",
                  zIndex: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",

                  "&:hover > .settings_icon": {
                    transform: "rotateZ(60deg)",
                    transitionDuration: "500ms",
                  },
                }}
                onClick={(e) => handleClick(e, model)}
              >
                <Image
                  className="settings settings_icon"
                  src={"/icons/settings-icon.svg"}
                  alt="icon"
                  width={20}
                  height={20}
                />
                <ArrowDropDownIcon
                  className="settings"
                  sx={{
                    minWidth: "11px",
                    minHeight: "7px",
                    color: "#fff",
                    ...(!!open
                      ? {
                          transform: "rotateZ(180deg)",
                          transitionDuration: "1000ms",
                        }
                      : {}),
                  }}
                />
              </Box>
            ) : null}
            {!imageSplit ? (
              <LazyLoadImage
                src={
                  model?.cover
                    ? model?.cover[0]?.image_src
                      ? `${IMAGES_BASE_URL}/${model?.cover[0]?.image_src}`
                      : ""
                    : ""
                }
                style={{ objectFit: "cover" }}
                alt=""
                effect="blur"
                width={"100%"}
                height={imgHeight}
                placeholderSrc="/img/placeholder.svg"
                delayTime={100}
              />
            ) : (
              <Grid
                container
                rowGap={"4px"}
                columnGap={"4px"}
                sx={{
                  width: "100%",
                }}
              >
                {images.map((i, index) =>
                  i?.src && i?.src != null ? (
                    <Grid
                      item
                      key={i?.src + index}
                      lg={5.85}
                      md={5.85}
                      sm={5.85}
                      xs={2.85}
                      sx={{
                        // width: '49%',
                        height: imgHeight ?? "171px",
                        border: "2px solid #F5F5F5",
                      }}
                    >
                      <LazyLoadImage
                        style={{
                          objectFit: "cover",
                        }}
                        src={i?.src}
                        alt="cover"
                        effect="blur"
                        width={"100%"}
                        height={`100%`}
                        placeholderSrc={"/img/card-loader.jpg"}
                        delayTime={500}
                      />
                    </Grid>
                  ) : (
                    <Grid
                      item
                      key={i?.src + index}
                      lg={5.85}
                      md={5.85}
                      sm={5.85}
                      xs={2.85}
                      sx={{
                        // width: '49%',
                        height: imgHeight ?? "171px",
                        bgcolor: "#F5F5F5",
                        border: "2px solid #F5F5F5",
                      }}
                    ></Grid>
                  )
                )}
              </Grid>
            )}
            <Label
              sx={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: {
                  xs: "8px 0",
                  sm: "8px 0",
                  md: "12px 0",
                  lg: "12px 0",
                  xl: "12px 0",
                },
              }}
            >
              {withAuthor ? (
                <Box
                  sx={{ display: "flex", alignItems: "center", width: "100%" }}
                >
                  <Image
                    src={
                      model?.author?.image_src
                        ? `${IMAGES_BASE_URL}/${model?.author?.image_src}`
                        : "/img/avatar.png"
                    }
                    alt="avatar"
                    width={28}
                    height={28}
                    style={{
                      borderRadius: "50%",
                    }}
                  />
                  <SimpleTypography
                    sx={{
                      marginLeft: "8px",
                      display: "flex",
                      alignItems: "center",
                      textAlign: "left",
                    }}
                    text={model?.author?.company_name}
                    className="card__title"
                  />
                </Box>
              ) : type == "projects" ? (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                  }}
                >
                  <SimpleTypography
                    text={model?.name}
                    sx={{
                      fontSize: "16px",
                      fontWeight: 500,
                      lineHeight: "22px",
                      textAlign: "start",
                      color: "#141414",
                    }}
                  />
                  <SimpleTypography
                    text={`${
                      !!model?.project_models[0]
                        ? model?.project_models?.length
                        : 0
                    } ${
                      !!model?.project_models[0] &&
                      model?.project_models?.length > 1
                        ? "мебели"
                        : "мебель"
                    }`}
                    sx={{
                      fontSize: "14px",
                      fontWeight: 400,
                      lineHeight: "20px",
                      textAlign: "start",
                      color: "#848484",
                    }}
                  />
                </Box>
              ) : (
                <SimpleTypography
                  text={model?.name}
                  title={model?.name}
                  sx={{
                    ...(!brandBox || type == "projects"
                      ? { width: "100% !important" }
                      : {}),
                  }}
                  className="card__title"
                />
              )}
              {model?.brand && model?.brand?.name && !!brandBox && (
                <SimpleTypography
                  text={`${model?.brand?.name}`}
                  className="card__title-brand"
                />
              )}
            </Label>
          </Box>
        </Box>
      ) : (
        <Link
          key={model?.id}
          href={link ? link : ""}
          style={{ margin: "0", textDecoration: "none" }}
        >
          <Box
            sx={{
              height: "auto",
              width: "100%",
              border: " 1px solid #e0e0e0",
              background: "#fff",
              position: "relative",
              cursor: "pointer",
              transition: "all 0.4s ease",
              padding: {
                xs: "8px 8px 0 8px",
                sm: "8px 8px 0 8px",
                md: "12px 12px 0 12px",
                lg: "12px 12px 0 12px",
                xl: "12px 12px 0 12px",
              },
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",

              "&:hover > .settings": {
                opacity: 1,
              },
            }}
          >
            {tagText ? (
              <SimpleTypography text={tagText || ""} className="card__sale" />
            ) : tagIcon ? (
              <Box
                sx={{
                  position: "absolute",
                  width: "24px",
                  height: "24px",
                  top: "5px",
                  right: "5px",
                  color: "#fff",
                  backgroundColor: "#7210be",
                  border: "1.5px solid #fff",
                  borderRadius: "3px",
                  zIndex: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image src={tagIcon} alt="icon" width={14} height={14} />
              </Box>
            ) : !!settingsBtn ? (
              <Box
                className="settings"
                sx={{
                  transition: "all 0.4s ease",
                  opacity: !!open ? 1 : 0,
                  position: "absolute",
                  p: "6px 8px",
                  backdropFilter: "blur(2px)",
                  top: "5px",
                  right: "5px",
                  color: "#fff",
                  backgroundColor: "#00000066",
                  border: "1px solid #0000001A",
                  borderRadius: "32px",
                  zIndex: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",

                  "&:hover > .settings_icon": {
                    transform: "rotateZ(60deg)",
                    transitionDuration: "500ms",
                  },
                }}
                onClick={(e) => handleClick(e, model)}
              >
                <Image
                  className="settings settings_icon"
                  src={"/icons/settings-icon.svg"}
                  alt="icon"
                  width={20}
                  height={20}
                />
                <ArrowDropDownIcon
                  className="settings"
                  sx={{
                    minWidth: "11px",
                    minHeight: "7px",
                    color: "#fff",
                    ...(!!open
                      ? {
                          transform: "rotateZ(180deg)",
                          transitionDuration: "1000ms",
                        }
                      : {}),
                  }}
                />
              </Box>
            ) : null}
            {!imageSplit ? (
              <LazyLoadImage
                src={
                  model?.cover
                    ? model?.cover[0]?.image_src
                      ? `${IMAGES_BASE_URL}/${model?.cover[0]?.image_src}`
                      : ""
                    : ""
                }
                style={{ objectFit: "cover" }}
                alt=""
                effect="blur"
                width={"100%"}
                height={imgHeight}
                placeholderSrc="/img/placeholder.svg"
                delayTime={100}
              />
            ) : (
              <Grid
                container
                rowGap={"4px"}
                columnGap={"4px"}
                sx={{
                  width: "100%",
                }}
              >
                {images.map((i, index) =>
                  i?.src && i?.src != null ? (
                    <Grid
                      item
                      key={index}
                      lg={5.85}
                      md={5.85}
                      sm={5.85}
                      xs={2.85}
                      sx={{
                        // width: '49%',
                        height: imgHeight || "171px",
                        border: "2px solid #F5F5F5",
                      }}
                    >
                      <LazyLoadImage
                        style={{
                          objectFit: "cover",
                        }}
                        src={i?.src}
                        alt="cover"
                        effect="blur"
                        width={"100%"}
                        height={`100%`}
                        placeholderSrc={"/img/card-loader.jpg"}
                        delayTime={500}
                      />
                    </Grid>
                  ) : (
                    <Grid
                      item
                      key={index}
                      lg={5.85}
                      md={5.85}
                      sm={5.85}
                      xs={2.85}
                      sx={{
                        // width: '49%',
                        height: imgHeight || "171px",
                        bgcolor: "#F5F5F5",
                        border: "2px solid #F5F5F5",
                      }}
                    ></Grid>
                  )
                )}
              </Grid>
            )}
            <Label
              sx={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: {
                  xs: "8px 0",
                  sm: "8px 0",
                  md: "12px 0",
                  lg: "12px 0",
                  xl: "12px 0",
                },
              }}
            >
              {withAuthor ? (
                <Box
                  sx={{ display: "flex", alignItems: "center", width: "100%" }}
                >
                  <Image
                    src={
                      model?.author?.image_src
                        ? `${IMAGES_BASE_URL}/${model?.author?.image_src}`
                        : "/img/avatar.png"
                    }
                    alt="avatar"
                    width={28}
                    height={28}
                    style={{
                      borderRadius: "50%",
                    }}
                  />
                  <SimpleTypography
                    sx={{
                      marginLeft: "8px",
                      display: "flex",
                      alignItems: "center",
                      textAlign: "left",
                    }}
                    text={model?.author?.company_name}
                    className="card__title"
                  />
                </Box>
              ) : type == "projects" ? (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                  }}
                >
                  <SimpleTypography
                    text={model?.name}
                    sx={{
                      fontSize: "16px",
                      fontWeight: 500,
                      lineHeight: "22px",
                      textAlign: "start",
                      color: "#141414",
                    }}
                  />
                  <SimpleTypography
                    text={`${
                      !!model?.project_models[0]
                        ? model?.project_models?.length
                        : 0
                    } ${
                      !!model?.project_models[0] &&
                      model?.project_models?.length > 1
                        ? "мебели"
                        : "мебель"
                    }`}
                    sx={{
                      fontSize: "14px",
                      fontWeight: 400,
                      lineHeight: "20px",
                      textAlign: "start",
                      color: "#848484",
                    }}
                  />
                </Box>
              ) : (
                <SimpleTypography
                  text={model?.name}
                  title={model?.name}
                  sx={{
                    ...(!brandBox || type == "projects"
                      ? { width: "100% !important" }
                      : {}),
                  }}
                  className="card__title"
                />
              )}
              {model?.brand && model?.brand?.name && !!brandBox && (
                <SimpleTypography
                  text={`${model?.brand?.name}`}
                  className="card__title-brand"
                />
              )}
            </Label>
          </Box>
        </Link>
      )}
    </>
  );
}

export default CustomCard;
