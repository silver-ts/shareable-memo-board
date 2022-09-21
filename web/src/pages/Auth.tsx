import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import * as api from "../helpers/api";
import { validate, ValidatorConfig } from "../helpers/validator";
import useLoading from "../hooks/useLoading";
import { globalService, userService } from "../services";
import Icon from "../components/Icon";
import toastHelper from "../components/Toast";
import "../less/auth.less";

const validateConfig: ValidatorConfig = {
  minLength: 4,
  maxLength: 24,
  noSpace: true,
  noChinese: true,
};

const Auth = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const pageLoadingState = useLoading(true);
  const [siteHost, setSiteHost] = useState<User>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const actionBtnLoadingState = useLoading(false);

  useEffect(() => {
    api.getSystemStatus().then(({ data }) => {
      const { data: status } = data;
      setSiteHost(status.host);
      if (status.profile.mode === "dev") {
        setEmail("demo@silver-ts.com");
        setPassword("secret");
      }
      pageLoadingState.setFinish();
    });
  }, []);

  const handleEmailInputChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value as string;
    setEmail(text);
  };

  const handlePasswordInputChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value as string;
    setPassword(text);
  };

  const handleSigninBtnsClick = async (e: React.FormEvent<EventTarget>) => {
    e.preventDefault();

    if (actionBtnLoadingState.isLoading) {
      return;
    }

    const emailValidResult = validate(email, validateConfig);
    if (!emailValidResult.result) {
      toastHelper.error(t("common.email") + ": " + emailValidResult.reason);
      return;
    }

    const passwordValidResult = validate(password, validateConfig);
    if (!passwordValidResult.result) {
      toastHelper.error(t("common.password") + ": " + passwordValidResult.reason);
      return;
    }

    try {
      actionBtnLoadingState.setLoading();
      await api.signin(email, password);
      const user = await userService.doSignIn();
      if (user) {
        navigate("/");
      } else {
        toastHelper.error(t("message.login-failed"));
      }
    } catch (error: any) {
      console.error(error);
      toastHelper.error(error.response.data.message);
    }
    actionBtnLoadingState.setFinish();
  };

  const handleSignUpAsHostBtnsClick = async (e: React.FormEvent<EventTarget>) => {
    e.preventDefault();

    if (actionBtnLoadingState.isLoading) {
      return;
    }

    const emailValidResult = validate(email, validateConfig);
    if (!emailValidResult.result) {
      toastHelper.error(t("common.email") + ": " + emailValidResult.reason);
      return;
    }

    const passwordValidResult = validate(password, validateConfig);
    if (!passwordValidResult.result) {
      toastHelper.error(t("common.password") + ": " + passwordValidResult.reason);
      return;
    }

    try {
      actionBtnLoadingState.setLoading();
      await api.signup(email, password, "HOST");
      const user = await userService.doSignIn();
      if (user) {
        navigate("/");
      } else {
        toastHelper.error(t("common.singup-failed"));
      }
    } catch (error: any) {
      console.error(error);
      toastHelper.error(error.response.data.message);
    }
    actionBtnLoadingState.setFinish();
  };

  const handleLocaleItemClick = (locale: Locale) => {
    globalService.setLocale(locale);
  };

  return (
    <div className="page-wrapper auth">
      <div className="page-container">
        <form className="auth-form-wrapper" onSubmit={(e) => (siteHost ? handleSigninBtnsClick(e) : handleSignUpAsHostBtnsClick(e))}>
          <div className="page-header-container">
            <div className="title-container">
              <img className="logo-img" src="/logo-full.webp" alt="" />
            </div>
            <p className="slogan-text">{t("slogan")}</p>
          </div>
          <div className={`page-content-container ${actionBtnLoadingState.isLoading ? "requesting" : ""}`}>
            <div className="form-item-container input-form-container">
              <span className={`normal-text ${email ? "not-null" : ""}`}>{t("common.email")}</span>
              <input type="email" value={email} onChange={handleEmailInputChanged} required />
            </div>
            <div className="form-item-container input-form-container">
              <span className={`normal-text ${password ? "not-null" : ""}`}>{t("common.password")}</span>
              <input type="password" value={password} onChange={handlePasswordInputChanged} required />
            </div>
          </div>
          <div className="action-btns-container">
            {!pageLoadingState.isLoading && (
              <button className={`btn signin-btn ${actionBtnLoadingState.isLoading ? "requesting" : ""}`} type="submit">
                {actionBtnLoadingState.isLoading && <Icon.Loader className="img-icon" />}
                {siteHost ? t("common.sign-in") : t("auth.signup-as-host")}
              </button>
            )}
          </div>
          <p className={`tip-text ${siteHost || pageLoadingState.isLoading ? "" : "host-tip"}`}>
            {siteHost || pageLoadingState.isLoading ? t("auth.not-host-tip") : t("auth.host-tip")}
          </p>
        </form>
        <div className="footer-container">
          <div className="language-container">
            <span className={`locale-item ${i18n.language === "en" ? "active" : ""}`} onClick={() => handleLocaleItemClick("en")}>
              English
            </span>
            <span className="split-line">/</span>
            <span className={`locale-item ${i18n.language === "zh" ? "active" : ""}`} onClick={() => handleLocaleItemClick("zh")}>
              中文
            </span>
            <span className="split-line">/</span>
            <span className={`locale-item ${i18n.language === "vi" ? "active" : ""}`} onClick={() => handleLocaleItemClick("vi")}>
              Tiếng Việt
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
