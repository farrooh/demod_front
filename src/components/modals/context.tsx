import { usernameRegex } from '@/types/regex';
import { ErrorOutline } from '@mui/icons-material';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import { Box, Button, Checkbox, Divider, FormControlLabel, Grid, List, ListItem, ListItemText, Skeleton, styled, SxProps, Tooltip, tooltipClasses, TooltipProps } from '@mui/material';
import { Formik } from 'formik';
import Cookies from 'js-cookie';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import { accountBannedMessage } from '../../constants';
import { getMyInteriors } from '../../data/get_my_interiors';
import { getMyProjects, selectMyProjects } from '../../data/get_my_projects';
import { selectOneModel } from '../../data/get_one_model';
import { getSavedModels } from '../../data/get_saved_models';
import { setAuthState } from "../../data/login";
import { getMyProfile, resetMyProfile, selectMyProfile } from '../../data/me';
import { ConfirmContextProps, ConfirmData, resetConfirmData, resetConfirmProps, selectEditingProject, setAddingProjectState, setConfirmData, setConfirmState, setEditingProjectState, setForgotPasswordState, setLoginState, setOpenModal, setProfileEditState, setProfileImagePreview, setProfileImageState, setProjectsListState, setSignupState, setVerifyState, setWarningMessage, setWarningState } from '../../data/modal_checker';
import { myInteriorsLimit, projectsLimit, savedModelsLimit } from '../../types/filters';
import { default as axios, default as instance, setAuthToken } from '../../utils/axios';
import { ACCESS_TOKEN_EXPIRATION_DAYS, IMAGES_BASE_URL, REFRESH_TOKEN_EXPIRATION_DAYS } from '../../utils/env_vars';
import { formatMessage } from '../../utils/format_message';
import Buttons from '../buttons';
import ImageCropper from '../crop_image';
import EmailInputAdornments from '../inputs/email';
import PasswordInputAdornments from '../inputs/password';
import SimpleInp from '../inputs/simple_input';
import UsernameInputAdornments from '../inputs/username';
import SimpleTypography from '../typography';
//Login context
interface LoginContextProps {
  // setAlertMessage: any
  setModalChange__Viewer?: any,
  setOpen?: any,
  setUserEmail?: any,
  userEmail?: any,
  setProgress?: any,
}

const CustomTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: 200,
    fontSize: '16px',
    pointerEvents: 'none',
  },
});

export const ConfirmContext = () => {
  const dispatch = useDispatch()
  const authState = useSelector((state: any) => state?.auth_slicer?.authState);
  const confirm_props: ConfirmContextProps = useSelector((state: any) => state?.modal_checker?.confirm_props);
  const confirmation_data: ConfirmData = useSelector((state: any) => state?.modal_checker?.confirmation_data);

  const [checked, setChecked] = React.useState<boolean>(false)
  const [loading, setLoading] = React.useState<boolean>(Boolean(confirm_props.is_loading))

  React.useEffect(() => {
    dispatch(resetConfirmData())
  }, [])
  React.useMemo(() => {
    setLoading(Boolean(confirm_props.is_loading))
  }, [confirm_props.is_loading])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked)
    dispatch(setConfirmData({ checkbox_checked: event.target.checked }));
  };

  return (
    <Grid
      container
      width={'100%'}
      display={'flex'}
      flexDirection={'column'}
      alignItems={'center'}
      justifyContent={'center'}
    >
      <Grid
        item
        width={'100%'}
        display={'flex'}
        flexDirection={'column'}
        alignItems={'center'}
        justifyContent={'center'}
        mb={'32px'}
      >
        <SimpleTypography
          text={confirm_props?.message || 'Вы уверены, что предпримете это действие?'}
          sx={{
            fontWeight: 400,
            fontSize: '22px',
            lineHeight: '28px',
            textAlign: 'center'
          }}
        />
        {
          confirm_props?.info ?
            <SimpleTypography
              text={confirm_props?.info}
              sx={{
                fontWeight: 400,
                fontSize: '16px',
                lineHeight: '22px',
                textAlign: 'center',

              }}
            />
            : null
        }
        {
          confirm_props?.checkbox && confirm_props?.checkbox?.checkbox_label ?
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                marginTop: '16px'
              }}
            >
              {
                confirm_props?.checkbox?.checkbox_info ?
                  <CustomTooltip title={confirm_props?.checkbox?.checkbox_info} placement='left'>
                    <FormControlLabel
                      label={confirm_props?.checkbox?.checkbox_label}
                      control={
                        <Checkbox checked={checked} onChange={handleChange} />
                      }
                    />
                  </CustomTooltip>
                  : <FormControlLabel
                    label={confirm_props?.checkbox?.checkbox_label}
                    control={
                      <Checkbox checked={checked} onChange={handleChange} />
                    }
                  />

              }
            </Box>
            : null
        }
      </Grid>

      <Grid
        item
        width={'100%'}
        display={'flex'}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        <Buttons
          name='Отмена'
          sx={{ width: '48%' }}
          className='cancel__btn'
          disabled={loading}
          onClick={() => {
            dispatch(setConfirmState(false))
            dispatch(setOpenModal(false))
            dispatch(resetConfirmProps())
            dispatch(resetConfirmData())
          }}
        ></Buttons>

        <Buttons
          sx={{ width: '48%' }}
          className='confirm__btn'
          startIcon={loading}
          disabled={loading}
          loadingColor='#fff'
          onClick={async () => {
            await confirm_props?.actions?.on_click.func(checked, ...confirm_props?.actions?.on_click.args)
          }}
        >
          Да
        </Buttons>
      </Grid>
    </Grid >
  );
}

export const LoginContext = (props: LoginContextProps) => {
  const dispatch = useDispatch<any>();
  const [values, setValues] = React.useState({
    amount: '',
    password: '',
    weight: '',
    weightRange: '',
    showPassword: false,
  });
  const handleClickShowPassword = () => {
    setValues({
      ...values,
      showPassword: !values.showPassword,
    });
  };
  return (
    <>
      <Formik
        initialValues={{
          email: '',
          password: '',
          submit: null
        }}
        // 998971113539
        validationSchema={Yup.object().shape({
          email: Yup.string()
            .min(4, "too short")
            .max(50, "too long")
            .email('Указанный адрес электронной почты должен быть действительным адресом электронной почты.')
            .required('Поле обязательно для заполнения.'),
          password: Yup.string()
            .required('Пароль не указан.')
            .max(255)
            .min(6, 'Пароль слишком короткий — минимум 6 символов.')
          // .matches(/[a-zA-Z]/, 'Пароль can only contain Latin letters.')
        })}
        onSubmit={async (
          _values,
          { resetForm, setErrors, setStatus, setSubmitting }
        ) => {
          try {
            const res = await axios.post(
              `auth/signin/designer`,
              { email: _values.email, password: _values?.password },
            );
            resetForm();
            props?.setUserEmail(_values?.email);
            // dispatch(resetMyProfile())
            if (res?.data?.data?.user?.is_verified) {
              toast.success(res?.data?.message || 'Авторизация прошла успешна');

              const accessToken = res?.data?.data?.token?.accessToken;
              const refreshToken = res?.data?.data?.token?.refreshToken;

              Cookies.set('accessToken', accessToken, {
                expires: ACCESS_TOKEN_EXPIRATION_DAYS, path: '/', sameSite: 'Lax', secure: true
              });
              Cookies.set('refreshToken', refreshToken, {
                expires: REFRESH_TOKEN_EXPIRATION_DAYS, path: '/', sameSite: 'Lax', secure: true
              });

              setAuthToken(accessToken); // Set the token for axios instance

              await dispatch(setOpenModal(false));
              await dispatch(setAuthState(true));
              await dispatch(getMyProfile({ Authorization: `Bearer ${accessToken}` }));
              await dispatch(getMyInteriors({ Authorization: `Bearer ${accessToken}`, limit: myInteriorsLimit }));
              await dispatch(getMyProjects({ Authorization: `Bearer ${accessToken}`, limit: projectsLimit }));
              await dispatch(getSavedModels({ Authorization: `Bearer ${accessToken}`, limit: savedModelsLimit }));
            } else {
              // dispatch(setVerifyState(true));
              // toast.success("Please verify your email!")
            }
            dispatch(setLoginState(false));
            setStatus({ success: true });
            setSubmitting(false);
          } catch (err: any) {
            if (err?.response?.data?.reason == 'banned') {
              dispatch(setLoginState(false))
              dispatch(setWarningMessage(accountBannedMessage))
              dispatch(setWarningState(true))
            } else {
              setStatus({ success: false });
              setErrors({ submit: err.message });
              setSubmitting(false);
              if (err.response.data.message) {
                toast.error(err.response.data.message);
              }
            }
          }
        }}

      >
        {({
          errors,
          handleBlur,
          handleChange,
          handleSubmit,
          isSubmitting,
          touched,
          values
        }) => (
          <form onSubmit={handleSubmit}>
            <Grid style={{ transformOrigin: '0 0 0', }}>
              <Grid sx={{ display: 'flex', alignItems: "start", justifyContent: "start", flexDirection: "column" }}>
                <SimpleTypography
                  className="modal__title"
                  variant="h6"
                  text="Вход"
                />
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    alignItems: { xs: "start", md: "center" },
                    justifyContent: "start",
                    marginBottom: "26px"
                  }}>
                  <SimpleTypography
                    className="modal__sub-title"
                    variant="h6"
                    text="Еще не зарегистрировались?"
                  />
                  <Buttons
                    sx={{ marginLeft: { xs: 0, md: '8px' } }}
                    name="Зарегистрироваться"
                    onClick={() => {
                      dispatch(setSignupState(true));
                      dispatch(setLoginState(false))
                    }}
                    className='underlined__btn'
                  />
                </Box>
                <Box sx={{ marginBottom: "26px", width: "100%" }}>
                  <EmailInputAdornments
                    error={Boolean(touched.email && errors.email)}
                    helperText={touched.email && errors.email}
                    name="email"
                    type="email"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.email}
                    placeholderText='example@example.com'
                  />
                </Box>

                <PasswordInputAdornments
                  error={Boolean(touched.password && errors.password)}
                  helperText={touched.password && errors.password}
                  name="password"
                  label='Пароль'
                  type="password"
                  onBlur={handleBlur}
                  required={true}
                  onChange={handleChange}
                  value={values.password}
                  placeholderText='Введите пароль'
                />

                <Box width={'100%'} mt={"10px"}>
                  <Buttons
                    name="Забыли пароль?"
                    className='underlined__btn'
                    onClick={() => {
                      dispatch(setLoginState(false))
                      dispatch(setForgotPasswordState(true))
                    }}
                  />

                  <Buttons
                    type="submit"
                    name="Войти"
                    startIcon={isSubmitting}
                    disabled={Boolean(errors.submit) || isSubmitting}
                    className='signIn__btn'
                    sx={{ mt: '24px' }}
                  />
                </Box>
              </Grid>
            </Grid>
          </form>)}
      </Formik>
    </>
  );
}

//Sign up context

export const SignUpContext = (props: LoginContextProps) => {
  const dispatch = useDispatch<any>();


  return (
    <>
      <Formik
        initialValues={{
          first_name: '',
          last_name: '',
          email: '',
          company_name: '',
          password: '',
          password_repeat: '',
          submit: null
        }}
        validationSchema={Yup.object().shape({
          first_name: Yup.string()
            .max(255, 'Слишком длинное имя.')
            .min(2, 'Слишком короткое имя - минимум 2 символа.')
            .required('Имя не указано.'),
          last_name: Yup.string()
            .max(255, 'Слишком длинная фамилия.')
            .min(2, 'Слишком короткая фамилия - минимум 2 символа.'),
          company_name: Yup.string()
            .max(64, 'Слишком длинное название компании'),
          email: Yup.string()
            .min(4, "Слишком короткий email.")
            .max(50, "Слишком длинный email.")
            .email('Указанный email должен быть действительным адресом электронной почты.')
            .required('Поле обязательно для заполнения.'),
          password: Yup.string()
            // .matches(
            //   passwordRegex,
            //   'Пароль должен содержать от 8 до 32 символов, включая хотя бы одну заглавную и одну строчную латинскую букву, хотя бы одну цифру и хотя бы один специальный символ.'
            // )
            .required('Поле обязательно для заполнения.'),
          password_repeat: Yup.string()
            .oneOf([Yup.ref('password'), undefined], 'Пароли не совпадают')
            .required('Поле обязательно для заполнения.')
        })}

        onSubmit={async (
          _values,
          { resetForm, setErrors, setStatus, setSubmitting }
        ) => {
          try {
            const res = await instance.post(`auth/signup`, {
              full_name: `${_values.first_name} ${_values.last_name}`,
              email: _values.email,
              company_name: _values.company_name,
              password: _values?.password,
            });
            if (res?.data?.data?.user?.is_verified) {
              toast.success(res?.data?.message || 'Авторизация прошла успешна');

              const accessToken = res?.data?.data?.token?.accessToken;
              const refreshToken = res?.data?.data?.token?.refreshToken;

              Cookies.set('accessToken', accessToken, {
                expires: ACCESS_TOKEN_EXPIRATION_DAYS, path: '/', sameSite: 'Lax', secure: true
              });
              Cookies.set('refreshToken', refreshToken, {
                expires: REFRESH_TOKEN_EXPIRATION_DAYS, path: '/', sameSite: 'Lax', secure: true
              });

              setAuthToken(accessToken); // Set the token for axios instance

              await dispatch(setOpenModal(false));
              await dispatch(setAuthState(true));
              await dispatch(getMyProfile({ Authorization: `Bearer ${accessToken}` }));
              await dispatch(getMyInteriors({ Authorization: `Bearer ${accessToken}`, limit: myInteriorsLimit }));
              await dispatch(getMyProjects({ Authorization: `Bearer ${accessToken}`, limit: projectsLimit }));
              await dispatch(getSavedModels({ Authorization: `Bearer ${accessToken}`, limit: savedModelsLimit }));
            } else {
              // dispatch(setVerifyState(true));
              // toast.success("Please verify your email!")
            }

          } catch (err: any) {
            setStatus({ success: false });
            toast.error(err?.response?.data?.message)
            setErrors({ submit: err.message });
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({
          errors,
          handleBlur,
          handleChange,
          handleSubmit,
          isSubmitting,
          touched,
          values
        }) => (
          <form onSubmit={handleSubmit}>
            <Grid style={{ transformOrigin: '0 0 0' }}>
              <Grid sx={{ display: 'flex', alignItems: "start", justifyContent: "start", flexDirection: "column" }}>
                <SimpleTypography className="modal__title" variant="h6" text="Регистрация" />
                <Grid sx={{ display: "flex", alignItems: "center", justifyContent: "start" }}>
                  <SimpleTypography className="modal__sub-title" variant="h6" text="Уже зарегистрирован?" />
                  <Buttons
                    sx={{ marginLeft: '8px' }}
                    name="Войти"
                    onClick={() => {
                      dispatch(setLoginState(true))
                      dispatch(setSignupState(false))
                    }}
                    className='underlined__btn'
                  />
                </Grid>

                <Box sx={{ display: "flex", marginTop: "26px", width: "100%", marginBottom: "26px" }}>
                  <Box sx={{ paddingRight: "8px", width: "50%" }}>
                    <SimpleInp
                      error={Boolean(touched.first_name && errors.first_name)}
                      helperText={touched.first_name && errors.first_name}
                      name="first_name"
                      type="first_name"
                      label="Имя"
                      autoComplete="off"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.first_name}
                      placeholderText='Имя'
                    />
                  </Box>
                  <Box sx={{ paddingLeft: "8px", width: "50%" }}>
                    <SimpleInp
                      error={Boolean(touched.last_name && errors.last_name)}
                      helperText={touched.last_name && errors.last_name}
                      name="last_name"
                      type="surname"
                      label="Фамилия"
                      autoComplete="off"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.last_name}
                      placeholderText='Фамилия'
                    />
                  </Box>
                </Box>

                <Box sx={{ marginBottom: "26px", width: "100%" }}>
                  <EmailInputAdornments
                    error={Boolean(touched.email && errors.email)}
                    helperText={touched.email && errors.email}
                    name="email"
                    type="email"
                    label='Электронная почта'
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.email}
                    placeholderText='example@example.com'
                  />
                </Box>

                <Box sx={{ marginBottom: "26px", width: "100%" }}>
                  <UsernameInputAdornments
                    error={Boolean(touched.company_name && errors.company_name)}
                    helperText={touched.company_name && errors.company_name}
                    name="company_name"
                    type="text"
                    label='Название компании'
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.company_name}
                    placeholderText='Название компании'
                  />
                </Box>

                <Box sx={{ marginBottom: "26px", width: "100%" }}>
                  <PasswordInputAdornments
                    error={Boolean(touched.password && errors.password)}
                    helperText={touched.password && errors.password}
                    name="password"
                    label='Пароль'
                    type="password"
                    autoComplete="off"
                    onBlur={handleBlur}
                    required={true}
                    onChange={handleChange}
                    value={values.password}
                    placeholderText='Придумайте пароль'
                  />
                </Box>

                <Box sx={{ marginBottom: "26px", width: "100%" }}>
                  <PasswordInputAdornments
                    error={Boolean(touched.password_repeat && errors.password_repeat)}
                    helperText={touched.password_repeat && errors.password_repeat}
                    name="password_repeat"
                    label='Подтвердите пароль'
                    type="password"
                    autoComplete="off"
                    onBlur={handleBlur}
                    required={true}
                    onChange={handleChange}
                    value={values.password_repeat}
                    placeholderText='Подтвердите пароль'
                  />
                </Box>

                {/* <Buttons name="Forgot your password?" className='underlined__btn' /> */}
                <Buttons
                  type="submit"
                  name="Зарегистрироваться"
                  startIcon={isSubmitting}
                  disabled={Boolean(errors.submit) || isSubmitting}
                  className='signIn__btn'
                />
                <Box sx={{ marginBottom: "16px", width: "100%" }}></Box>
                <SimpleTypography className='signIn__text' text=''
                  sx={{
                    fontSize: '12px',
                    fontWeight: 400,
                    lineHeight: '14px',
                    letterSpacing: '-0.02em',
                    color: '#424242',
                    textAlign: 'left'
                  }}
                >
                  {'Создавая учетную запись, вы соглашаетесь с нашими '}
                  <Buttons className='underlined__btn'
                    sx={{
                      fontSize: '12px',
                      fontWeight: 400,
                      lineHeight: '14px !important',
                      letterSpacing: '-0.02em',
                      color: '#424242',
                    }}
                  >
                    <Link href={"/terms_and_conditions"} target='_blank'>Пользовательского соглашения</Link>
                  </Buttons>

                  &nbsp;и&nbsp;

                  <Buttons className='underlined__btn'
                    sx={{
                      fontSize: '12px',
                      fontWeight: 400,
                      lineHeight: '14px !important',
                      letterSpacing: '-0.02em',
                      color: '#424242',
                    }}
                  >
                    <Link href={"/privacy_policy"} target='_blank'>Политикой конфиденциальности</Link>
                  </Buttons>

                </SimpleTypography>

              </Grid>
            </Grid>
          </form>)}
      </Formik>
    </>
  );
}


export const ForgotPasswordContext = () => {

  const dispatch = useDispatch<any>();

  return (
    <Formik
      initialValues={{
        email: '',
        submit: null,
      }}
      validationSchema={Yup.object().shape({
        email: Yup.string()
          .email('Указанный адрес электронной почты должен быть действительным адресом электронной почты.')
          .required('Поле обязательно для заполнения.'),
      })}
      onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
        try {
          const res = await instance.post(`auth/sendResetPasswordEmail`, {
            email: values.email,
          });
          toast.success(res?.data?.message || 'Ссылка для сброса пароля отправлена на вашу почту.');
          dispatch(setForgotPasswordState(false));
          dispatch(setOpenModal(false));
          setStatus({ success: true });
        } catch (err: any) {
          setStatus({ success: false });
          toast.error(err?.response?.data?.message || 'Произошла ошибка. Попробуйте снова.');
          setErrors({ submit: err.message });
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({
        errors,
        handleBlur,
        handleChange,
        handleSubmit,
        isSubmitting,
        touched,
        values,
      }) => (
        <form onSubmit={handleSubmit}>
          <Grid container direction="column" alignItems="flex-start" spacing={2}>
            <Grid item>
              <SimpleTypography
                className="modal__title"
                variant="h6"
                text="Сброс пароля"
              />
            </Grid>
            <Grid item>
              <SimpleTypography
                className="modal__sub-title"
                variant="body1"
                text="Введите адрес электронной почты, чтобы получить ссылку для сброса пароля."
              />
            </Grid>
            <Grid item sx={{ width: '100%' }}>
              <EmailInputAdornments
                error={Boolean(touched.email && errors.email)}
                helperText={touched.email && errors.email}
                name="email"
                type="email"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.email}
                placeholderText="example@example.com"
              />
            </Grid>
            <Grid item sx={{ width: '100%' }}>
              <Buttons
                type="submit"
                name="Отправить"
                startIcon={isSubmitting}
                disabled={Boolean(errors.submit) || isSubmitting}
                className="signIn__btn"
              />
            </Grid>
          </Grid>
        </form>
      )}
    </Formik>
  );
}

export const WarningContext = () => {

  const dispatch = useDispatch<any>();
  const message = useSelector((state: any) => state?.modal_checker?.warningMessage)

  const content = { __html: `${formatMessage(message)}` }

  return (
      <Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            color: '#ff6666'
          }}
        >
          <ErrorOutline sx={{ width: '50px', height: '50px', mr: '8px' }} />
          <SimpleTypography
            text='Предупреждение'
            sx={{
              fontSize: '24px',
              fontWeight: 500,
            }}
          />
        </Box>
        <p dangerouslySetInnerHTML={content} />
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mt: '24px',
          }}
        >
          <Buttons
            type="button"
            name="Закрыть"
            className='bookmark__btn'
            sx={{ width: '100%' }}
            onClick={() => {
              dispatch(setWarningState(false))
              dispatch(setWarningMessage(''))
              dispatch(setOpenModal(false))
            }}
          />
          {/* <Buttons
            sx={{ width: '49% !important' }}
            name=""
            className='signIn__btn'
          >
            <Launch sx={{ width: '18px', height: '18px', mr: '6px' }} />
            <Link href={`mailto:support@tridmo.com`}>Служба поддержки</Link>
          </Buttons> */}
        </Box>
      </Box>
  );
}

export const VerificationContext = (props: LoginContextProps) => {
  interface RenderTypes {
    minutes: any,
    seconds: any,
    completed: boolean,
  }


  //declare dispatcher
  const dispatch = useDispatch<any>();

  return (
      <Formik
        initialValues={{
          code: '',
          password: '',
          submit: null
        }}
        validationSchema={Yup.object().shape({
          code: Yup.string()
            .max(255)
            .min(6, 'Too short - should be 6 chars minimum.')
            .required('Code field is required'),
        })}

        onSubmit={async (
          _values,
          { resetForm, setErrors, setStatus, setSubmitting }
        ) => {
          try {
            let res = await instance.post(
              `auth/verify`,
              { code: parseFloat(_values?.code), email: props?.userEmail }
            );
            resetForm();

            Cookies.set(
              'accessToken',
              res?.data?.data?.token?.accessToken,
              { expires: ACCESS_TOKEN_EXPIRATION_DAYS, path: '/', sameSite: 'Lax', secure: true },
            )

            Cookies.set(
              'refreshToken',
              res?.data?.data?.token?.refreshToken,
              { expires: REFRESH_TOKEN_EXPIRATION_DAYS, path: '/', sameSite: 'Lax', secure: true }
            )
            setStatus({ success: true });
            dispatch(resetMyProfile())
            dispatch(setAuthState(true))
            dispatch(setVerifyState(false))
            dispatch(setOpenModal(false));
            toast.success(res?.data?.message || 'Регистрация прошла успешно');
            setSubmitting(false);
          } catch (err: any) {
            setStatus({ success: false });
            if (err?.response?.data?.message) {
              toast.error(err?.response?.data?.message)
              setErrors({ submit: err?.response?.data?.message });
            }
            setSubmitting(false);
          }
        }}
      >
        {({
          errors,
          handleBlur,
          handleChange,
          handleSubmit,
          isSubmitting,
          touched,
          values
        }) => (
          <form onSubmit={handleSubmit}>
            <Grid style={{ transformOrigin: '0 0 0' }}>
              <Grid sx={{ display: 'flex', alignItems: "start", justifyContent: "start", flexDirection: "column" }}>
                <Button
                  sx={{ padding: "0 10px 0 0", marginBottom: "13px" }}
                  onClick={() => {
                    dispatch(setSignupState(true))
                    dispatch(setVerifyState(false))
                  }}
                >
                  <KeyboardArrowLeftIcon />
                  <SimpleTypography className='verification__back' text='Назад' />
                </Button>
                <SimpleTypography
                  className="modal__title"
                  variant="h6"

                  text="Подтвердите Ваш электронный адрес"
                />
                <Grid sx={{ display: "flex", alignItems: "center", justifyContent: "start", marginBottom: "10px" }}>

                  <SimpleTypography
                    className="modal__sub-title"
                    variant="h6"
                    text={`Мы отправили электронное письмо с подтверждением на адрес ${props?.userEmail}. Если вы не можете найти письмо в почтовом ящике, проверьте`}
                  >
                    <b style={{ marginLeft: "3px" }}>папку «Спам».</b>
                  </SimpleTypography>
                </Grid>


                {/* <SimpleInp
                  error={Boolean(touched.code && errors.code)}
                  helperText={touched.code && errors.code}
                  name="code"
                  type="code"
                  label="Confirmation code"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.code}
                  placeholderText='******'
                /> */}

                {/* 
                <EmailInputAdornments
                  error={Boolean(touched.code && errors.code)}
                  helperText={touched.code && errors.code}
                  name="code"
                  type="code"
                  label="Confirmation code"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.code}
                  placeholderText='******'
                /> */}
                {/* <Grid sx={{ display: 'flex', alignItems: "center" }}>

                  <Typography>
                    <Countdown
                      date={Date.now() + 75000}
                      renderer={Renderer}
                    />
                  </Typography>
                </Grid> */}
                {/* <Link 
                  href={"https://mail.google.com/mail/u/0/#inbox"}
                  >
                  <a rel="noopener noreferrer" target="_blank"> */}
                <Buttons
                  type="button"
                  onClick={() => window.open("https://mail.google.com/mail/u/0/#inbox", '_blank', 'noopener,noreferrer')}
                  name="Проверить электронную почту"
                  endIcon='checkout'
                  startIcon={isSubmitting}
                  disabled={Boolean(errors.submit) || isSubmitting}
                  className='signIn__btn'
                >
                </Buttons>
                {/* </a>
                </Link> */}
              </Grid>
            </Grid>
          </form>)}
      </Formik>
  );
}

export const EditProfileContext = () => {
  const dispatch = useDispatch<any>();
  const profile = useSelector(selectMyProfile)

  const formControlSx: SxProps = {
    width: { lg: '90%', md: '90%', sm: '100%', xs: '100%' },

    ':not(:last-child)': {
      marginBottom: '26px'
    }
  }

  return (
      <Formik
        initialValues={{
          full_name: profile?.full_name || '',
          username: profile?.username || '',
          company_name: profile?.company_name || '',
          address: profile?.address || '',
          telegram: profile?.telegram || '',
          instagram: profile?.instagram || '',
          phone: profile?.phone?.split('+998')[1] || '',
          portfolio_link: profile?.portfolio_link || '',
          submit: null
        }}
        validationSchema={Yup.object().shape({
          full_name: Yup.string()
            .max(255, 'Очень длинный')
            .min(2, 'Очень короткий - минимум 2 символа.'),
          company_name: Yup.string()
            .max(255, 'Очень длинный')
            .min(2, 'Очень короткий - минимум 2 символа.'),
          username: Yup.string()
            .max(255, 'Очень длинный')
            .min(5, 'Очень короткий - минимум 5 символа.')
            .matches(
              usernameRegex,
              'Имя пользователя может содержать только буквы, цифры, символы подчеркивания (_), тире (-) и точки (.).'
            ),
          address: Yup.string().optional(),
          telegram: Yup.string().optional(),
          instagram: Yup.string().optional(),
          phone: Yup.string().optional(),
          portfolio_link: Yup.string().optional(),
        })}

        onSubmit={async (
          _values,
          { resetForm, setErrors, setStatus, setSubmitting }
        ) => {
          try {

            if (_values.username && _values.username != profile?.username) {
              const res = await axios.get(`users/check/${_values.username}`);
              if (res.data.data.exists) {
                setStatus({ success: false });
                toast.error('Имя пользователя не доступно');
                setErrors({ submit: 'Имя пользователя не доступно' });
                return
              }
            }

            const formData = new FormData()

            if (_values.full_name != profile?.full_name) formData.append('full_name', _values.full_name)
            if (_values.username != profile?.username) formData.append('username', _values.username)
            if (_values.company_name != profile?.company_name) formData.append('company_name', _values.company_name)
            if (_values.address != profile?.address) formData.append('address', _values.address)
            if (_values.telegram != profile?.telegram) formData.append('telegram', _values.telegram)
            if (_values.instagram != profile?.instagram) formData.append('instagram', _values.instagram)
            if (_values.phone != profile?.phone) formData.append('phone', `${_values.phone}`)
            if (_values.portfolio_link != profile?.portfolio_link) formData.append('portfolio_link', _values.portfolio_link)

            const res = await instance.put(`users/profile`, formData);
            setStatus({ success: true });
            dispatch(setProfileEditState(false));
            dispatch(setOpenModal(false));
            dispatch(getMyProfile({}));
            toast.success(res?.data?.message || 'Успешно сохранено');
          } catch (err: any) {
            setStatus({ success: false });
            toast.error(err?.response?.data?.message)
            setErrors({ submit: err.message });
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({
          errors,
          handleBlur,
          handleChange,
          handleSubmit,
          isSubmitting,
          touched,
          values
        }) => (
          <form onSubmit={handleSubmit}>
            <Grid style={{ transformOrigin: '0 0 0' }}>
              <Grid sx={{ display: 'flex', alignItems: "start", justifyContent: "start", flexDirection: "column" }}>
                <SimpleTypography
                  sx={{ mb: '8px', fontSize: { sm: '24px !important', xs: '24px !important' } }}
                  className="modal__title"
                  variant="h6"
                  text="Редактировать профиль"
                />

                <Grid container
                  sx={{
                    width: { lg: '600px', md: '600px', sm: '100%', xs: '100%' },
                    display: 'flex',
                    flexDirection: { lg: 'row', md: 'row', sm: 'column', xs: 'column' },
                    alignItems: 'flex-start',
                    justifyContent: 'space-between'
                  }}
                >

                  <Grid
                    item
                    sx={{
                      display: 'flex',
                      width: { lg: '50%', md: '50%', sm: '100%', xs: '100%' },
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      justifyContent: 'flex-start',
                      borderRight: { lg: '1px solid #E0E0E0', md: '1px solid #E0E0E0', sm: 'none', xs: 'none' }
                    }}
                  >
                    <Box sx={{ ...formControlSx }}>
                      <SimpleInp
                        error={Boolean(touched.full_name && errors.full_name)}
                        helperText={touched.full_name && errors.full_name}
                        name="full_name"
                        type="full_name"
                        label="Ф.И.О"
                        autoComplete="off"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        value={values.full_name}
                        placeholderText='Имя'
                      />
                    </Box>

                    <Box sx={formControlSx}>
                      <SimpleInp
                        error={Boolean(touched.username && errors.username)}
                        helperText={touched.username && errors.username}
                        name="username"
                        type="text"
                        label='Имя пользователя'
                        onBlur={handleBlur}
                        onChange={handleChange}
                        value={String(values.username).trim()}
                        placeholderText='username'
                      />
                    </Box>

                    <Box sx={formControlSx}>
                      <SimpleInp
                        error={Boolean(touched.company_name && errors.company_name)}
                        helperText={touched.company_name && errors.company_name}
                        name="company_name"
                        type="text"
                        label='Название компании'
                        onBlur={handleBlur}
                        onChange={handleChange}
                        value={values.company_name}
                        placeholderText='company_name'
                      />
                    </Box>

                    <Box sx={formControlSx}>
                      <SimpleInp
                        error={Boolean(touched.address && errors.address)}
                        helperText={touched.address && errors.address}
                        name="address"
                        type="text"
                        label='Адрес'
                        onBlur={handleBlur}
                        onChange={handleChange}
                        value={values.address}
                        placeholderText='пример: Ташкент, Узбекистан'
                      />
                    </Box>

                  </Grid>

                  <Grid
                    item
                    sx={{
                      mt: { lg: 0, md: 0, sm: '24px', xs: '24px' },
                      display: 'flex',
                      width: { lg: '50%', md: '50%', sm: '100%', xs: '100%' },
                      flexDirection: 'column',
                      alignItems: { lg: 'flex-end', md: 'flex-end', sm: 'flex-start', xs: 'flex-start' },
                      justifyContent: 'flex-start',
                    }}
                  >
                    <Box sx={formControlSx}>
                      <SimpleInp
                        error={Boolean(touched.telegram && errors.telegram)}
                        helperText={touched.telegram && errors.telegram}
                        name="telegram"
                        type="text"
                        label='Телеграм'
                        onBlur={handleBlur}
                        onChange={handleChange}
                        value={String(values.telegram).trim()}
                        placeholderText='username'
                      />
                    </Box>

                    <Box sx={formControlSx}>
                      <SimpleInp
                        error={Boolean(touched.instagram && errors.instagram)}
                        helperText={touched.instagram && errors.instagram}
                        name="instagram"
                        type="text"
                        label='Инстаграм'
                        onBlur={handleBlur}
                        onChange={handleChange}
                        value={String(values.instagram).trim()}
                        placeholderText='username'
                      />
                    </Box>

                    <Box sx={formControlSx}>
                      <SimpleInp
                        // startAdornment={
                        //   <InputAdornment sx={{ ml: '7px' }} position="start">
                        //     <SimpleTypography sx={{ fontWeight: '400', fontSize: '14px' }} text='+998' />
                        //   </InputAdornment>
                        // }
                        error={Boolean(touched.phone && errors.phone)}
                        helperText={touched.phone && errors.phone}
                        name="phone"
                        type="text"
                        label='Номер телефона'
                        onBlur={handleBlur}
                        onChange={handleChange}
                        value={String(values.phone).trim()}
                        placeholderText=''
                      />
                    </Box>

                    <Box sx={formControlSx}>
                      <SimpleInp
                        error={Boolean(touched.portfolio_link && errors.portfolio_link)}
                        helperText={touched.portfolio_link && errors.portfolio_link}
                        name="portfolio_link"
                        type="text"
                        label='Сайт'
                        onBlur={handleBlur}
                        onChange={handleChange}
                        value={String(values.portfolio_link).trim()}
                        placeholderText='https://example.com'
                      />
                    </Box>

                  </Grid>

                </Grid>

                {/* <Buttons name="Forgot your password?" className='underlined__btn' /> */}
                <Box
                  sx={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: { lg: 'flex-end', md: 'flex-end', sm: 'space-between', xs: 'space-between' },
                    mt: '24px',
                  }}
                >
                  <Buttons
                    sx={{ width: { lg: 'auto !important', md: 'auto !important', sm: '48% !important', xs: '48% !important' } }}
                    type="button"
                    name="Отмена"
                    disabled={Boolean(errors.submit) || isSubmitting}
                    className='bookmark__btn'
                    onClick={() => {
                      dispatch(setProfileEditState(false))
                      dispatch(setOpenModal(false))
                    }}
                  />
                  <Buttons
                    sx={{ width: { lg: 'auto !important', md: 'auto !important', sm: '48% !important', xs: '48% !important' }, ml: { lg: '16px', md: '16px', sm: 0, xs: 0 } }}
                    type="submit"
                    name="Сохранить"
                    startIcon={isSubmitting}
                    disabled={Boolean(errors.submit) || isSubmitting}
                    className='signIn__btn'
                  />
                </Box>

              </Grid>
            </Grid>
          </form>)}
      </Formik>
  );
}

export const AddProjectContext = () => {
  const dispatch = useDispatch<any>();
  const profile = useSelector(selectMyProfile)

  return (
      <Formik
        initialValues={{
          name: '',
          submit: null
        }}
        validationSchema={Yup.object().shape({
          name: Yup.string().required('Отсутствует название')
            .max(255, 'Слишком длинное имя.')
            .min(1, 'Слишком короткое имя - минимум 2 символа.'),
        })}

        onSubmit={async (
          _values,
          { resetForm, setErrors, setStatus, setSubmitting }
        ) => {
          try {

            const formData = new FormData()

            if (_values.name) formData.append('name', _values.name)

            const res = await instance.post(`/projects`, formData);
            setStatus({ success: true });
            dispatch(setAddingProjectState(false));
            dispatch(setOpenModal(false));
            dispatch(getMyProjects());
            toast.success(res?.data?.message || 'Успешно создано');
          } catch (err: any) {
            setStatus({ success: false });
            toast.error(err?.response?.data?.message)
            setErrors({ submit: err.message });
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({
          errors,
          handleBlur,
          handleChange,
          handleSubmit,
          isSubmitting,
          touched,
          values
        }) => (
          <form onSubmit={handleSubmit}>
            <Grid style={{ transformOrigin: '0 0 0' }}>
              <Grid sx={{ display: 'flex', alignItems: "start", justifyContent: "start", flexDirection: "column" }}>
                <SimpleTypography className="modal__title" variant="h6" text="Создать проект" />

                <Grid container
                  sx={{
                    mt: '24px',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center'
                  }}
                >
                  <SimpleInp
                    sx={{ width: '100%' }}
                    error={Boolean(touched.name && errors.name)}
                    helperText={touched.name && errors.name}
                    name="name"
                    type="name"
                    label="Название проекта"
                    autoComplete="off"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.name}
                    placeholderText=''
                  />
                </Grid>

                {/* <Buttons name="Forgot your password?" className='underlined__btn' /> */}
                <Box
                  sx={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    mt: '24px',
                  }}
                >
                  <Buttons
                    type="button"
                    name="Отмена"
                    disabled={Boolean(errors.submit) || isSubmitting}
                    className='bookmark__btn'
                    onClick={() => {
                      dispatch(setAddingProjectState(false))
                      dispatch(setOpenModal(false))
                    }}
                  />
                  <Buttons
                    sx={{ width: 'auto !important', ml: '16px' }}
                    type="submit"
                    name="Создать"
                    startIcon={isSubmitting}
                    disabled={Boolean(errors.submit) || isSubmitting}
                    className='signIn__btn'
                  />
                </Box>

              </Grid>
            </Grid>
          </form>)}
      </Formik>
  );
}

export const EditProjectContext = () => {
  const dispatch = useDispatch<any>();
  const project = useSelector(selectEditingProject)

  return (
    <Formik
      initialValues={{
        name: project?.name ? project?.name : '',
        submit: null
      }}
      validationSchema={Yup.object().shape({
        name: Yup.string().optional()
          .max(255, 'Слишком длинное имя.')
          .min(1, 'Слишком короткое имя - минимум 2 символа.'),
      })}

      onSubmit={async (
        _values,
        { resetForm, setErrors, setStatus, setSubmitting }
      ) => {
        try {

          const formData = new FormData()

          if (_values.name) formData.append('name', _values.name)

          const res = await instance.put(`/projects/${project?.id}`, formData);
          setStatus({ success: true });
          dispatch(setEditingProjectState(false));
          dispatch(setOpenModal(false));
          dispatch(getMyProjects());
          toast.success(res?.data?.message || 'Успешно создано');
        } catch (err: any) {
          setStatus({ success: false });
          toast.error(err?.response?.data?.message)
          setErrors({ submit: err.message });
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({
        errors,
        handleBlur,
        handleChange,
        handleSubmit,
        isSubmitting,
        touched,
        values
      }) => (
        <form onSubmit={handleSubmit}>
          <Grid style={{ transformOrigin: '0 0 0' }}>
            <Grid sx={{ display: 'flex', alignItems: "start", justifyContent: "start", flexDirection: "column" }}>
              <SimpleTypography className="modal__title" variant="h6" text="Редактировать проект" />

              <Grid container
                sx={{
                  mt: '24px',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center'
                }}
              >
                <SimpleInp
                  sx={{ width: '100%' }}
                  error={Boolean(touched.name && errors.name)}
                  helperText={touched.name && errors.name}
                  name="name"
                  type="name"
                  label="Название проекта"
                  autoComplete="off"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.name}
                  placeholderText=''
                />
              </Grid>

              {/* <Buttons name="Forgot your password?" className='underlined__btn' /> */}
              <Box
                sx={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  mt: '24px',
                }}
              >
                <Buttons
                  type="button"
                  name="Отмена"
                  disabled={Boolean(errors.submit) || isSubmitting}
                  className='bookmark__btn'
                  onClick={() => {
                    dispatch(setEditingProjectState(false))
                    dispatch(setOpenModal(false))
                  }}
                />
                <Buttons
                  sx={{ width: 'auto !important', ml: '16px' }}
                  type="submit"
                  name="Сохранить"
                  startIcon={isSubmitting}
                  disabled={Boolean(errors.submit) || isSubmitting}
                  className='signIn__btn'
                />
              </Box>

            </Grid>
          </Grid>
        </form>)}
    </Formik>
  );
}

const brandImageWrapperSx: SxProps = {
  position: 'relative',
  backgroundColor: '#fff',
  width: '64px',
  height: '72px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}

const liSx: SxProps = {
  justifyContent: 'flex-start',
  padding: '12px',
  transition: '0.4s all ease',
}

const listSx: SxProps = {
  width: '100%',
  maxWidth: 1200,
  maxHeight: '400px',
  display: 'block',
  overflowY: 'auto',
  bgcolor: 'background.paper',
  borderRadius: '4px',
  padding: 0,
}


export const ProjectsContext = () => {
  const dispatch = useDispatch<any>();
  const model = useSelector(selectOneModel)
  const projects = useSelector(selectMyProjects)
  const getProjectsStatus = useSelector((state: any) => state?.get_my_projects?.status)
  const [selectedProjects, setSelectedProjects] = React.useState<any[]>([])

  const fakeData = [1, 2, 3]

  React.useEffect(() => {
    if (!projects || getProjectsStatus != 'succeeded') {
      dispatch(getMyProjects())
      setSelectedProjects(projects?.data?.projects)
    }
    else if (!!projects) {
      setSelectedProjects(projects?.data?.projects)
    }
  }, [projects, getMyProjects])


  return (
    <Formik
      initialValues={{
        projects: selectedProjects,
        submit: null
      }}

      onSubmit={async (
        _values,
        { resetForm, setErrors, setStatus, setSubmitting }
      ) => {
        try {
          const data = _values.projects?.filter(e => !!e?.selected).map(e => e.id)

          const res = await instance.post(`/projects/model/${model?.id}`, {
            projects: data
          });
          setStatus({ success: true });
          dispatch(setProjectsListState(false));
          dispatch(setOpenModal(false));
          dispatch(getMyProjects());
          toast.success(res?.data?.message || 'Успешно добавлено');
        } catch (err: any) {
          setStatus({ success: false });
          toast.error(err?.response?.data?.message)
          setErrors({ submit: err.message });
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({
        handleSubmit,
        setFieldValue,
        errors,
        isSubmitting,
        touched,
        values
      }) => (
        <form onSubmit={handleSubmit}>
          <Grid style={{ transformOrigin: '0 0 0' }}>
            <Grid sx={{ display: 'flex', alignItems: "start", justifyContent: "start", flexDirection: "column" }}>
              <SimpleTypography className="modal__title" variant="h6" text="Добавить в проект" />

              <Grid container
                sx={{
                  mt: '24px',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center'
                }}
              >
                <List
                  sx={listSx}
                >
                  {
                    getProjectsStatus == 'succeeded' ?
                      projects?.data?.projects?.map((project, index: any) => {
                        const imagesArr: any[] = []
                        for (let i = 0; i < 3; i++) {
                          const element = project?.project_models[i];
                          if (!!element) imagesArr.push({ src: `${IMAGES_BASE_URL}/${element["model.cover"][0]?.image_src}` })
                          else imagesArr.unshift({ src: null })
                        }
                        return <>
                          <ListItem key={index} alignItems="center"
                            sx={liSx}
                          >

                            <Box sx={{
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'flex-start'
                            }}
                            >
                              <Box
                                sx={brandImageWrapperSx}
                              >
                                {
                                  imagesArr?.map((img, i) =>
                                    <Box
                                      key={i}
                                      sx={{
                                        position: 'absolute',
                                        bottom: `${i != 0 ? (i * 4) : i}px`,
                                        width: '64px',
                                        height: '64px',
                                        bgcolor: '#F5F5F5',
                                        backgroundImage: `url(${img?.src && img?.src != null ? img?.src : ''})`,
                                        backgroundRepeat: 'no-repeat',
                                        backgroundSize: 'cover',
                                        boxShadow: '0px 1px 2px 0px #0000001A',
                                        border: '1px solid #E0E0E0',
                                      }}
                                    />
                                  )
                                }
                              </Box>

                              <Box sx={{
                                marginLeft: '24px',

                              }} >
                                <SimpleTypography
                                  text={project?.name}
                                  sx={{
                                    fontSize: '13px',
                                    fontWeight: 400,
                                    lineHeight: '18px',
                                    textAlign: 'start',
                                    color: '#141414'
                                  }}
                                />
                                <SimpleTypography
                                  text={`${!!project?.project_models[0] ? project?.project_models?.length : 0} ${!!project?.project_models[0] && project?.project_models?.length > 1 ? 'мебели' : 'мебель'}`}
                                  sx={{
                                    fontSize: '14px',
                                    fontWeight: 400,
                                    lineHeight: '20px',
                                    textAlign: 'start',
                                    color: '#848484'
                                  }}
                                />
                              </Box>
                            </Box>

                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-start'
                              }}
                            >
                              <Checkbox
                                onChange={() => {
                                  const arr = [...selectedProjects]
                                  const p = arr[index]
                                  if (!p?.selected) {
                                    arr[index] = { ...p, selected: true }
                                    setSelectedProjects(arr)
                                    setFieldValue('projects', arr)
                                    console.log(arr);
                                  }
                                }}
                              />
                            </Box>

                          </ListItem>
                          {
                            projects?.data?.projects?.length && index != projects?.data?.projects?.length - 1 ?
                              <Divider sx={{ margin: 0 }} variant="inset" component="li" />
                              : null
                          }
                        </>
                      })
                      :
                      fakeData.map((e, index) =>
                        <>
                          <ListItem key={index} alignItems="center"
                            sx={liSx}
                          >

                            <ListItemText sx={{
                              width: '100%',
                              '& span': {
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-start'
                              }
                            }}
                            >
                              <Skeleton
                                width={'64px'}
                                height={'72px'}
                                variant='rectangular'
                              />

                              <Box sx={{ display: 'block', marginLeft: '24px' }} >
                                <Skeleton
                                  width={90}
                                  height={22}
                                  variant='rectangular'
                                />
                                <Skeleton
                                  sx={{ mt: '8px' }}
                                  width={60}
                                  height={20}
                                  variant='rectangular'
                                />
                              </Box>
                            </ListItemText>

                          </ListItem>
                          {
                            index != fakeData.length - 1 ?
                              <Divider sx={{ margin: 0 }} variant="inset" component="li" />
                              : null
                          }
                        </>
                      )
                  }
                </List>
              </Grid>

              <Box
                sx={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mt: '24px',
                }}
              >
                <Buttons
                  type="button"
                  name="Новый проект"
                  childrenFirst
                  className='bookmark__btn'
                  onClick={() => {
                    dispatch(setProjectsListState(false))
                    dispatch(setAddingProjectState(true))
                  }}
                >
                  <Image
                    alt='icon'
                    width={18}
                    height={18}
                    src={'/icons/plus.svg'}
                  />
                </Buttons>
                <Buttons
                  sx={{ width: 'auto !important', ml: '16px' }}
                  type="submit"
                  name="Добавить"
                  startIcon={isSubmitting}
                  disabled={Boolean(errors.submit) || isSubmitting}
                  className='signIn__btn'
                />
              </Box>

            </Grid>
          </Grid>
        </form>)}
    </Formik>
  );
}

export const ProfileImageContext = () => {
  const dispatch = useDispatch<any>()
  const previewImage = useSelector((state: any) => state?.modal_checker?.profileImagePreview)

  return (
    <Formik
      initialValues={{
        image: '',
        submit: null
      }}
      onSubmit={async (
        _values,
        { resetForm, setErrors, setStatus, setSubmitting }
      ) => {
        try {

          const formData = new FormData()

          formData.append('image', _values.image)

          const res = await instance.put(`users/profile`, formData);
          setStatus({ success: true });
          dispatch(setProfileImageState(false));
          dispatch(setProfileImagePreview(null));
          dispatch(setOpenModal(false));
          dispatch(getMyProfile({}));
          toast.success(res?.data?.message || 'Успешно сохранено');
        } catch (err: any) {
          setStatus({ success: false });
          toast.error(err?.response?.data?.message)
          setErrors({ submit: err.message });
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({
        errors,
        handleBlur,
        handleChange,
        handleSubmit,
        setFieldValue,
        isSubmitting,
        touched,
        values
      }) => (
        <form onSubmit={handleSubmit}>
          <Grid style={{ transformOrigin: '0 0 0' }}>
            <Grid sx={{ display: 'flex', alignItems: "start", justifyContent: "start", flexDirection: "column" }}>

              <ImageCropper
                image={previewImage}
                updateAvatar={(url) => {
                  setFieldValue('image', url)
                }} />

              <Box
                sx={{
                  mt: '24px',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Buttons
                  sx={{ width: '48%' }}
                  name="Отмена"
                  className="cancel__btn"
                  onClick={() => {
                    dispatch(setProfileImageState(false))
                    dispatch(setProfileImagePreview(null))
                    dispatch(setOpenModal(false))
                  }}
                >
                </Buttons>
                <Buttons
                  sx={{ width: '48% !important', m: '0 !important' }}
                  name="Загрузить"
                  type="submit"
                  startIcon={isSubmitting}
                  disabled={Boolean(errors.submit) || isSubmitting}
                  className='signIn__btn'
                >
                </Buttons>
              </Box>

            </Grid>
          </Grid>
        </form>)}
    </Formik>
  )
}
