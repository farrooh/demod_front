"use client";
import { Logo } from "@/components/logo";
import BasicModal from "@/components/modals/modal";
import SimpleTypography from "@/components/typography";
import { navItemsData } from "@/components/views/navbar/constants";
import MobileMode from "@/components/views/navbar/mobile_mode";
import { SearchBar } from "@/components/views/navbar/search_bar/serach_bar";
import { authTokens } from "@/constants";
import {
  selectNotificationCounts,
  selectNotificationCountsStatus,
} from "@/data/get_notifications";
import { setAuthState } from "@/data/login";
import { selectMyProfile } from "@/data/me";
import {
  setLoginState,
  setOpenModal,
  setSignupState,
} from "@/data/modal_checker";
import { switch_on } from "@/data/toggle_cart";
import { primaryColor } from "@/styles/styles";
import { ThemeProps } from "@/types/theme";
import { IMAGES_BASE_URL } from "@/utils/env_vars";
import { isPrivateRoute } from "@/utils/utils";
import { KeyboardArrowUp, SearchOutlined } from "@mui/icons-material";
import { Divider, IconButton } from "@mui/material";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";
import Cookies from "js-cookie";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Buttons from "../../buttons";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
  boxShadow: "none",
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

export default function Navbar() {
  const dispatch = useDispatch<any>();

  const isAuthenticated = useSelector(
    (state: any) => state?.auth_slicer?.authState
  );
  const notificationCountsStatus = useSelector(selectNotificationCountsStatus);
  const notificationCounts = useSelector(selectNotificationCounts);

  // const chatUnread = useSelector(selectChatUnread);
  const userData = useSelector(selectMyProfile);
  const [searchClicked, setSearchClicked] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Memoized logout handler
  const handleLogout = useCallback(() => {
    authTokens.forEach((cookie) => Cookies.remove(cookie));
    dispatch(setAuthState(false));
    router.push(isPrivateRoute(pathname) ? "/" : pathname);
    router.refresh();
    setAnchorEl(null);
  }, [dispatch, pathname, router]);

  const openRightBar = () => {
    dispatch(switch_on(true));
  };

  return (
    <>
      <BasicModal />
      {/* <WyNotificationToasts draggable appearance="internal" /> */}
      <Box
        sx={{ position: "fixed", zIndex: "1200", top: 0, right: 0, left: 0 }}
      >
        <Box
          sx={{
            flexGrow: 1,
            background: "#fff",
            borderBottom: "1px solid #e0e0e0",
            marginBottom: 0,
            padding: { xs: "0 18px", lg: 0 },
          }}
        >
          <Grid
            container
            spacing={2}
            sx={{
              maxWidth: "1200px",
              width: "100%",
              margin: "0 auto",
              alignItems: "center",
              position: "relative",
            }}
          >
            <DropDown
              id="basic-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                "aria-labelledby": "basic-button",
              }}
            >
              <MenuItem onClick={handleClose} sx={{ padding: "6px 12px" }}>
                <Link
                  href="/profile"
                  style={{
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Image
                    src="/icons/user-line.svg"
                    alt="user icon"
                    width={17}
                    height={17}
                  />
                  <SimpleTypography
                    className="drow-down__text"
                    text="Мой профилъ"
                  />
                </Link>
              </MenuItem>

              <MenuItem onClick={handleClose} sx={{ padding: "6px 12px" }}>
                <Link
                  href="/interiors/addnew"
                  style={{
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Image
                    src="/icons/plus-round.svg"
                    alt="logout icon"
                    width={17}
                    height={17}
                  />
                  <SimpleTypography
                    className="drow-down__text"
                    text="Добавить работу"
                  />
                </Link>
              </MenuItem>

              <Divider
                sx={{
                  my: "0 !important",
                  width: "100%",
                }}
              />

              <MenuItem sx={{ padding: "6px 12px" }} onClick={handleLogout}>
                <Image
                  src="/icons/logout-circle-r-line.svg"
                  alt="logout icon"
                  width={17}
                  height={17}
                />
                <SimpleTypography
                  sx={{ color: "#BC2020 !important" }}
                  className="drow-down__text"
                  text="Выйти"
                />
              </MenuItem>
            </DropDown>

            <Grid
              className="header__logo--wrapper"
              item
              md={2.5}
              xs={3}
              sx={{
                padding: "0 !important",
                paddingLeft: "0 !important",
                paddingTop: "0 !important",
                display: "flex",
                justifyContent: "start",
              }}
            >
              <Link href="/">
                <Item sx={{ padding: "0 !important", height: "27px" }}>
                  <Logo />
                </Item>
              </Link>
            </Grid>

            <Grid
              item
              md={9.5}
              xs={9}
              sx={{
                display: "flex",
                padding: "16px 0 !important",
                alignItems: "center",
                justifyContent: "flex-end",
              }}
              className="header__actions"
            >
              <Box
                className="header__nav"
                component={"nav"}
                sx={{
                  display: { xs: "none", md: "flex" },
                  marginRight: "16px",
                }}
              >
                <Box
                  component={"ul"}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    margin: "0",
                    padding: "0",
                  }}
                >
                  {navItemsData.map((item) => (
                    <Box
                      key={item.id}
                      component={"li"}
                      sx={{ listStyle: "none", padding: "9px 12px" }}
                    >
                      <Link href={item.link} style={{ textDecoration: "none" }}>
                        <SimpleTypography
                          text={item.text}
                          className="nav__item--text"
                          sx={{
                            color:
                              item.link === pathname
                                ? `${primaryColor} !important`
                                : "#424242 !important",
                          }}
                        />
                      </Link>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* <Box sx={{ overflow: "hidden", transform: 'translate(39px, 0)' }}>
                <Box
                  sx={{
                    width: searchClicked ? { xs: "200px", md: "212px" } : 0,
                    visibility: searchClicked ? "visible" : "hidden",
                    transition: "all 0.2s ease",
                  }}
                >
                  <form onSubmit={handleSearch}>
                    <SearchInput
                      sx={{
                        width: '100%',
                      }}
                      value={searchVal}
                      className="search__input--models"
                      onChange={(val) => setSearchVal(val)}
                      clic={setSearchClicked}
                      placeHolder="Поиск моделей"
                      startIcon={true}
                    />
                  </form>
                </Box>
              </Box> */}

              <IconButton
                onClick={() => {
                  setSearchClicked(!searchClicked);
                }}
                aria-label="menu"
                sx={{
                  marginRight: "8px",
                  transition: "all 0.4s ease",
                }}
              >
                {searchClicked ? (
                  <KeyboardArrowUp />
                ) : (
                  <SearchOutlined sx={{ color: "#424242" }} />
                )}
              </IconButton>

              {/* <IconButton
                onClick={AccountHandler}
                sx={{
                  display: { xs: "flex", md: "none" },
                }}
              >
                <PersonOutlineOutlined sx={{ color: '#424242' }} />
              </IconButton> */}

              {isAuthenticated ? (
                <>
                  <IconButton
                    onClick={openRightBar}
                    aria-label="menu"
                    sx={{
                      display: { xs: "none", md: "flex" },
                      marginRight: "8px",
                      backgroundColor: false
                        ? "rgba(0, 0, 0, 0.04)"
                        : "transparent",
                    }}
                  >
                    <Box
                      sx={{
                        width: 19,
                        height: 17,
                        position: "absolute",
                        borderRadius: "12px",
                        bgcolor: primaryColor,
                        top: 0,
                        right: 0,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <SimpleTypography
                        text={
                          notificationCountsStatus === "succeeded"
                            ? notificationCounts?.data?.unread_count || "0"
                            : "0"
                        }
                        sx={{
                          color: "#fff",
                          lineHeight: "11px",
                          fontWeight: 400,
                          fontSize: "12px",
                        }}
                      />
                    </Box>
                    <Image
                      src="/icons/bell-icon.svg"
                      alt="Bell"
                      width={21}
                      height={21}
                    ></Image>
                  </IconButton>
                  {/* Deprecated */}
                  {/*<Link href={"/chat"}>
                    <IconButton
                      sx={{
                        display: { xs: "none", md: "flex" },
                        position: "relative",
                        marginRight: "8px",
                      }}
                    >
                      <Box
                        sx={{
                          width: 19,
                          height: 17,
                          position: "absolute",
                          borderRadius: "12px",
                          bgcolor: primaryColor,
                          top: 0,
                          right: 0,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <SimpleTypography
                          text={
                            String(
                              Number(chatUnread?.private || 0) +
                                Number(chatUnread?.rooms || 0)
                            ) || "0"
                          }
                          sx={{
                            color: "#fff",
                            lineHeight: "11px",
                            fontWeight: 400,
                            fontSize: "12px",
                          }}
                        />
                      </Box>
                      <ChatOutlined htmlColor="#424242" />
                    </IconButton>
                  </Link>*/}
                </>
              ) : null}

              <MobileMode />

              <Box
                sx={{
                  background: "#fff",
                  display: "flex",
                  alignItems: "center",
                  zIndex: "100",
                  position: "relative",
                  padding: "1px 0",
                }}
              >
                <Box className="header__btns">
                  {isAuthenticated ? (
                    <Item
                      sx={{
                        padding: "0 !important",
                        display: { xs: "none", md: "flex" },
                      }}
                    >
                      <IconButton
                        id="basic-menu"
                        aria-controls={"basic-menu"}
                        aria-haspopup="true"
                        aria-expanded={true}
                        onClick={handleClick}
                        sx={{
                          display: "flex",
                          height: "auto",
                          alignItems: "center",
                          justifyContent: "center",
                          "&:hover": { background: "#F5F5F5" },
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Image
                            width="28"
                            height="28"
                            alt="user icon"
                            style={{
                              borderRadius: "50%",
                            }}
                            src={
                              userData?.image_src
                                ? `${IMAGES_BASE_URL}/${userData?.image_src}`
                                : "/img/avatar.png"
                            }
                          />
                          {/* <SimpleTypography
                              text={
                                userData?.full_name ? (
                                  userData?.full_name?.split(" ")[0]
                                ) : (
                                  <CircularProgress size="1rem" />
                                )
                              }
                              sx={
                                open
                                  ? {
                                    color: "#7210BE !important",
                                    marginLeft: "6px",
                                  }
                                  : { marginLeft: "6px" }
                              }
                              className={"user__name"}
                            /> */}
                          {/* <KeyboardArrowDownIcon
                              sx={
                                !open
                                  ? {
                                    minWidth: "11px",
                                    minHeight: "7px",
                                    color: "black",
                                  }
                                  : {
                                    minWidth: "11px",
                                    minHeight: "7px",
                                    color: prim,
                                    transform: "rotateZ(180deg)",
                                    transitionDuration: "1000ms",
                                  }
                              }
                            /> */}
                        </Box>
                      </IconButton>
                    </Item>
                  ) : (
                    <Item
                      sx={{ padding: "0", display: { xs: "none", md: "flex" } }}
                    >
                      <Box sx={{ marginRight: "16px" }}>
                        <Buttons
                          name="Регистрация"
                          onClick={() => {
                            dispatch(setSignupState(true));
                            dispatch(setOpenModal(true));
                          }}
                          className="bordered__btn--signup"
                        />
                      </Box>
                      <Buttons
                        name="Логин"
                        onClick={() => {
                          dispatch(setLoginState(true));
                          dispatch(setOpenModal(true));
                        }}
                        className="login__btn"
                      />
                    </Item>
                  )}
                </Box>
              </Box>
            </Grid>
            {/* <Grid item xs={3} sx={{ padding: "16px 0 !important", display: "flex", }}>
              <Item sx={{ padding: "0", width: "280px" }}>
                <SearchInput placeHolder="Поиск..." className='' startIcon={true}></SearchInput>
              </Item>
            </Grid> */}
          </Grid>
        </Box>
        <SearchBar isOpen={searchClicked} setIsOpen={setSearchClicked} />
      </Box>
    </>
  );
}
