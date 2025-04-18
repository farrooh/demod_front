"use client"
import React, { createContext, useContext, useEffect, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Cookies from 'js-cookie';
import { usePathname, useRouter } from "next/navigation";
import { toast } from "react-toastify";

// Redux actions
import { setAuthState } from "../../data/login";
import { getMyProfile, selectMyProfile } from '../../data/me';
import { getChatToken, selectChatToken } from "../../data/get_chat_token";
import { setAuthToken } from "../../utils/axios";
import { getNotifications, selectNotificationsStatus } from "../../data/get_notifications";
import {
  setLoginState,
  setOpenModal,
  setVerifyState,
  setWarningMessage,
  setWarningState
} from '../../data/modal_checker';
import { accountBannedMessage } from "../../variables";
import { tokenFactory } from "../../utils/chat";
import { isPrivateRoute } from "../../utils/utils";
import { authTokens } from "../../constants";

const AuthContext = createContext({});
const PasswordResetContext = createContext<{
  recoveryToken: string | null;
  consumeRecoveryToken: () => string | null;
}>({
  recoveryToken: null,
  consumeRecoveryToken: () => null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch<any>();
  const router = useRouter();
  const pathname = usePathname();
  const [hash, setHash] = useState<string | null>(null);

  useEffect(() => {
    setHash(window.location.hash);
  }, []);

  // Selectors
  const myProfile = useSelector(selectMyProfile);
  const myProfileStatus = useSelector((state: any) => state?.profile_me?.status);
  const myProfileError = useSelector((state: any) => state?.profile_me?.error);
  const chatToken = useSelector(selectChatToken);
  const notificationsStatus = useSelector(selectNotificationsStatus);

  // Memoized logout handler
  const handleLogout = useCallback(() => {
    authTokens.forEach(cookie => Cookies.remove(cookie));
    dispatch(setAuthState(false));
    console.log(isPrivateRoute(pathname))
    router.push(isPrivateRoute(pathname) ? '/' : pathname);
    router.refresh();
  }, [dispatch, pathname, router]);

  const [recoveryToken, setRecoveryToken] = React.useState<string | null>(null);

  // Add this useEffect to handle the recovery token from URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const token = url.searchParams.get('token');
      const type = url.searchParams.get('type');

      if (token && type === 'recovery') {
        setRecoveryToken(token);
        // Clear the token from URL without reloading
        window.history.replaceState({}, '', '/account/change-password');
      }
    }
  }, []);

  // Load notifications when profile is available
  useEffect(() => {
    if (myProfile && notificationsStatus === 'idle') {
      dispatch(getNotifications());
    }
  }, [myProfile, notificationsStatus, dispatch]);

  // Handle profile loading and authentication state
  const loadUserFromCookies = useCallback(async () => {
    const accessToken = Cookies.get('accessToken');

    if (!accessToken) {
      handleLogout();
      return;
    }

    setAuthToken(accessToken);

    try {
      if (myProfileStatus === 'idle' && !myProfile) {
        await dispatch(getMyProfile({}));
      }

      if (myProfileStatus === 'succeeded' && !myProfile) {
        handleLogout();
        return;
      }

      if (myProfile) {
        if (!Cookies.get('chatToken') || !chatToken) {
          await dispatch(getChatToken());
          await tokenFactory();
        }
      }

      if (myProfileStatus === 'failed') {
        if (myProfileError?.reason === 'token_expired') {
          handleLogout();
          dispatch(setLoginState(true));
          dispatch(setOpenModal(true));
        } else if (myProfileError?.reason === 'banned') {
          handleLogout();
          dispatch(setWarningMessage(accountBannedMessage));
          dispatch(setWarningState(true));
          dispatch(setOpenModal(true));
        } else {
          handleLogout();
        }
        return;
      }

      dispatch(setAuthState(true));
    } catch (error) {
      console.error('Authentication error:', error);
      handleLogout();
    }
  }, [myProfile, myProfileStatus, myProfileError, chatToken, dispatch, handleLogout]);

  // Handle hash parameters for OAuth callback
  const handleHashParams = useCallback(() => {
    if (!hash) return;

    const hashParams = new URLSearchParams(hash.slice(1));
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');
    const expiresAt = hashParams.get('expires_at');

    if (accessToken && refreshToken && expiresAt) {
      Cookies.set('accessToken', accessToken, {
        expires: new Date(parseInt(expiresAt) * 1000),
        path: '/',
        sameSite: 'Lax',
        secure: true,
      });

      Cookies.set('refreshToken', refreshToken, {
        path: '/',
        sameSite: 'Lax',
        secure: true
      });

      // Set auth state and redirect
      dispatch(setAuthState(true));
      dispatch(setVerifyState(false));

      toast.success("Электронная почта успешно подтверждена");
      router.replace(pathname.includes('change-password') ? '/account/change-password' : '/');
    } else {
      toast.error("Не удалось подтвердить электронную почту! Пожалуйста, попробуйте еще раз");
      router.push('/');
    }
  }, [hash, dispatch, router, pathname]);

  // Initial load and hash handling
  useEffect(() => {
    loadUserFromCookies();

    if (hash) {
      handleHashParams();
    } else if (pathname.includes("unauthorized_client")) {
      toast.error("Не удалось подтвердить электронную почту! Пожалуйста, попробуйте еще раз");
      router.push('/');
    }
  }, [loadUserFromCookies, handleHashParams, hash, pathname, router]);

  return (
    <AuthContext.Provider value={{}}>
      <PasswordResetContext.Provider
        value={{
          recoveryToken,
          consumeRecoveryToken: () => {
            const token = recoveryToken;
            setRecoveryToken(null);
            return token;
          },
        }}
      >
        {children}
      </PasswordResetContext.Provider>
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export const usePasswordReset = () => useContext(PasswordResetContext);