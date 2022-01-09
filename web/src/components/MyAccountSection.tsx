import { useContext, useState } from "react";
import appContext from "../stores/appContext";
import { userService } from "../services";
import utils from "../helpers/utils";
import { validate, ValidatorConfig } from "../helpers/validator";
import useLoading from "../hooks/useLoading";
import useToggle from "../hooks/useToggle";
import toastHelper from "./Toast";
import showChangePasswordDialog from "./ChangePasswordDialog";
import "../less/my-account-section.less";

const validateConfig: ValidatorConfig = {
  minLength: 4,
  maxLength: 24,
  noSpace: true,
  noChinese: true,
};

interface Props {}

const MyAccountSection: React.FC<Props> = () => {
  const { userState } = useContext(appContext);
  const user = userState.user as Model.User;
  const [username, setUsername] = useState<string>(user.username);
  const resetBtnClickLoadingState = useLoading(false);
  const [showConfirmResetAPIBtn, toggleConfirmResetAPIBtn] = useToggle(false);
  const openAPIRoute = `${window.location.origin}/api/whs/memo/${user.openId}`;

  const handleUsernameChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextUsername = e.target.value as string;
    setUsername(nextUsername);
  };

  const handleConfirmEditUsernameBtnClick = async () => {
    if (user.username === "guest") {
      toastHelper.info("🈲 不要修改我的用户名");
      return;
    }

    if (username === user.username) {
      return;
    }

    const usernameValidResult = validate(username, validateConfig);
    if (!usernameValidResult.result) {
      toastHelper.error("用户名 " + usernameValidResult.reason);
      return;
    }

    try {
      const isUsable = await userService.checkUsernameUsable(username);

      if (!isUsable) {
        toastHelper.error("用户名无法使用");
        return;
      }

      await userService.updateUsername(username);
      await userService.doSignIn();
      toastHelper.info("修改成功~");
    } catch (error: any) {
      toastHelper.error(error.message);
    }
  };

  const handleChangePasswordBtnClick = () => {
    if (user.username === "guest") {
      toastHelper.info("🈲 不要修改我的密码");
      return;
    }

    showChangePasswordDialog();
  };

  const handleResetOpenIdBtnClick = async () => {
    if (!showConfirmResetAPIBtn) {
      toggleConfirmResetAPIBtn(true);
      return;
    }
    if (resetBtnClickLoadingState.isLoading) {
      return;
    }

    resetBtnClickLoadingState.setLoading();
    try {
      await userService.resetOpenId();
    } catch (error) {
      // do nth
    }
    resetBtnClickLoadingState.setFinish();
    toggleConfirmResetAPIBtn(false);
  };

  const handlePreventDefault = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <>
      <div className="section-container account-section-container">
        <p className="title-text">基本信息</p>
        <label className="form-label input-form-label">
          <span className="normal-text">ID：</span>
          <span className="normal-text">{user.id}</span>
        </label>
        <label className="form-label input-form-label">
          <span className="normal-text">创建时间：</span>
          <span className="normal-text">{utils.getDateString(user.createdAt)}</span>
        </label>
        <label className="form-label input-form-label username-label">
          <span className="normal-text">账号：</span>
          <input type="text" value={username} onChange={handleUsernameChanged} />
          <div className={`btns-container ${username === user.username ? "hidden" : ""}`} onClick={handlePreventDefault}>
            <span className="btn confirm-btn" onClick={handleConfirmEditUsernameBtnClick}>
              保存
            </span>
            <span
              className="btn cancel-btn"
              onClick={() => {
                setUsername(user.username);
              }}
            >
              撤销
            </span>
          </div>
        </label>
        <label className="form-label password-label">
          <span className="normal-text">密码：</span>
          <span className="btn" onClick={handleChangePasswordBtnClick}>
            修改密码
          </span>
        </label>
      </div>
      <div className="section-container openapi-section-container">
        <p className="title-text">Open API（实验性功能）</p>
        <p className="value-text">{openAPIRoute}</p>
        <span className={`reset-btn ${resetBtnClickLoadingState.isLoading ? "loading" : ""}`} onClick={handleResetOpenIdBtnClick}>
          {showConfirmResetAPIBtn ? "⚠️ 确定重置 API" : "重置 API"}
        </span>
        <div className="usage-guide-container">
          <p className="title-text">使用方法：</p>
          <pre>{`POST ${openAPIRoute}\nContent-type: application/json\n{\n  "content": "Hello, #memos ${window.location.origin}"\n}`}</pre>
        </div>
      </div>
    </>
  );
};

export default MyAccountSection;
