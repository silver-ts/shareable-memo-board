import { IEmojiData } from "emoji-picker-react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { deleteMemoResource, getMemoResourceList, upsertMemoResource } from "../helpers/api";
import { UNKNOWN_ID } from "../helpers/consts";
import { editorStateService, locationService, memoService, resourceService } from "../services";
import { useAppSelector } from "../store";
import * as storage from "../helpers/storage";
import Icon from "./Icon";
import toastHelper from "./Toast";
import Editor, { EditorRefActions } from "./Editor/Editor";
import EmojiPicker from "./Editor/EmojiPicker";
import "../less/memo-editor.less";

const getEditorContentCache = (): string => {
  return storage.get(["editorContentCache"]).editorContentCache ?? "";
};

const setEditorContentCache = (content: string) => {
  storage.set({
    editorContentCache: content,
  });
};

interface State {
  fullscreen: boolean;
  isUploadingResource: boolean;
  shouldShowEmojiPicker: boolean;
  resourceList: Resource[];
}

const MemoEditor: React.FC = () => {
  const { t, i18n } = useTranslation();
  const user = useAppSelector((state) => state.user.user);
  const editorState = useAppSelector((state) => state.editor);
  const tags = useAppSelector((state) => state.memo.tags);
  const [state, setState] = useState<State>({
    isUploadingResource: false,
    fullscreen: false,
    shouldShowEmojiPicker: false,
    resourceList: [],
  });
  const [allowSave, setAllowSave] = useState<boolean>(false);
  const prevGlobalStateRef = useRef(editorState);
  const editorRef = useRef<EditorRefActions>(null);
  const tagSeletorRef = useRef<HTMLDivElement>(null);
  const editorFontStyle = user?.setting.editorFontStyle || "normal";
  const mobileEditorStyle = user?.setting.mobileEditorStyle || "normal";

  useEffect(() => {
    if (editorState.markMemoId && editorState.markMemoId !== UNKNOWN_ID) {
      const editorCurrentValue = editorRef.current?.getContent();
      const memoLinkText = `${editorCurrentValue ? "\n" : ""}Mark: @[MEMO](${editorState.markMemoId})`;
      editorRef.current?.insertText(memoLinkText);
      editorStateService.clearMarkMemo();
    }
  }, [editorState.markMemoId]);

  useEffect(() => {
    if (
      editorState.editMemoId &&
      editorState.editMemoId !== UNKNOWN_ID &&
      editorState.editMemoId !== prevGlobalStateRef.current.editMemoId
    ) {
      const memo = memoService.getMemoById(editorState.editMemoId ?? UNKNOWN_ID);
      if (memo) {
        getMemoResourceList(memo.id).then(({ data: { data } }) => {
          setState({
            ...state,
            resourceList: data,
          });
        });
        editorRef.current?.setContent(memo.content ?? "");
        editorRef.current?.focus();
      }
    }

    prevGlobalStateRef.current = editorState;
  }, [state, editorState.editMemoId]);

  const handlePasteEvent = async (event: React.ClipboardEvent) => {
    if (event.clipboardData && event.clipboardData.files.length > 0) {
      event.preventDefault();
      const file = event.clipboardData.files[0];
      const resource = await handleUploadResource(file);
      if (resource) {
        setState({
          ...state,
          resourceList: [...state.resourceList, resource],
        });
      }
    }
  };

  const handleUploadResource = async (file: File) => {
    setState({
      ...state,
      isUploadingResource: true,
    });

    let resource = undefined;

    try {
      resource = await resourceService.upload(file);
    } catch (error: any) {
      console.error(error);
      toastHelper.error(error.response.data.message);
    }

    setState({
      ...state,
      isUploadingResource: false,
    });
    return resource;
  };

  const handleSaveBtnClick = async () => {
    const content = editorRef.current?.getContent();
    if (!content) {
      toastHelper.error(t("editor.cant-empty"));
      return;
    }

    try {
      const { editMemoId } = editorStateService.getState();
      if (editMemoId && editMemoId !== UNKNOWN_ID) {
        const prevMemo = memoService.getMemoById(editMemoId ?? UNKNOWN_ID);

        if (prevMemo) {
          await memoService.patchMemo({
            id: prevMemo.id,
            content,
          });
        }
        editorStateService.clearEditMemo();
      } else {
        await memoService.createMemo({
          content,
          resourceIdList: state.resourceList.map((resource) => resource.id),
        });
        locationService.clearQuery();
      }
    } catch (error: any) {
      console.error(error);
      toastHelper.error(error.response.data.message);
    }

    setState({
      ...state,
      fullscreen: false,
      resourceList: [],
    });
    setEditorContentCache("");
    editorRef.current?.setContent("");
  };

  const handleCancelEditing = () => {
    setState({
      ...state,
      resourceList: [],
    });
    editorStateService.clearEditMemo();
    editorRef.current?.setContent("");
    setEditorContentCache("");
  };

  const handleContentChange = (content: string) => {
    setAllowSave(content !== "");
    setEditorContentCache(content);
  };

  const handleEmojiPickerBtnClick = () => {
    handleChangeShouldShowEmojiPicker(!state.shouldShowEmojiPicker);
  };

  const handleCheckBoxBtnClick = () => {
    if (!editorRef.current) {
      return;
    }

    const cursorPosition = editorRef.current.getCursorPosition();
    const prevValue = editorRef.current.getContent().slice(0, cursorPosition);
    if (prevValue === "" || prevValue.endsWith("\n")) {
      editorRef.current?.insertText("- [ ] ");
    } else {
      editorRef.current?.insertText("\n- [ ] ");
    }
  };

  const handleCodeBlockBtnClick = () => {
    if (!editorRef.current) {
      return;
    }

    const cursorPosition = editorRef.current.getCursorPosition();
    const prevValue = editorRef.current.getContent().slice(0, cursorPosition);
    if (prevValue === "" || prevValue.endsWith("\n")) {
      editorRef.current?.insertText("```\n\n```");
    } else {
      editorRef.current?.insertText("\n```\n\n```");
    }
  };

  const handleUploadFileBtnClick = () => {
    const inputEl = document.createElement("input");
    inputEl.style.position = "fixed";
    inputEl.style.top = "-100vh";
    inputEl.style.left = "-100vw";
    document.body.appendChild(inputEl);
    inputEl.type = "file";
    inputEl.multiple = true;
    inputEl.accept = "*";
    inputEl.onchange = async () => {
      if (!inputEl.files || inputEl.files.length === 0) {
        return;
      }

      const resourceList: Resource[] = [];
      for (const file of inputEl.files) {
        const resource = await handleUploadResource(file);
        if (resource) {
          resourceList.push(resource);
          if (editorState.editMemoId) {
            await upsertMemoResource(editorState.editMemoId, resource.id);
          }
        }
      }
      setState({
        ...state,
        resourceList: [...state.resourceList, ...resourceList],
      });
      document.body.removeChild(inputEl);
    };
    inputEl.click();
  };

  const handleFullscreenBtnClick = () => {
    setState({
      ...state,
      fullscreen: !state.fullscreen,
    });
  };

  const handleTagSeletorClick = useCallback((event: React.MouseEvent) => {
    if (tagSeletorRef.current !== event.target && tagSeletorRef.current?.contains(event.target as Node)) {
      editorRef.current?.insertText(`#${(event.target as HTMLElement).textContent} ` ?? "");
      editorRef.current?.focus();
    }
  }, []);

  const handleChangeShouldShowEmojiPicker = (status: boolean) => {
    setState({
      ...state,
      shouldShowEmojiPicker: status,
    });
  };

  const handleEmojiClick = (_: any, emojiObject: IEmojiData) => {
    if (!editorRef.current) {
      return;
    }

    editorRef.current.insertText(`${emojiObject.emoji}`);
    handleChangeShouldShowEmojiPicker(false);
  };

  const handleDeleteResource = async (resourceId: ResourceId) => {
    setState({
      ...state,
      resourceList: state.resourceList.filter((resource) => resource.id !== resourceId),
    });

    if (editorState.editMemoId) {
      await deleteMemoResource(editorState.editMemoId, resourceId);
    }
  };

  const isEditing = Boolean(editorState.editMemoId && editorState.editMemoId !== UNKNOWN_ID);

  const editorConfig = useMemo(
    () => ({
      className: `memo-editor ${editorFontStyle}`,
      initialContent: getEditorContentCache(),
      placeholder: t("editor.placeholder"),
      fullscreen: state.fullscreen,
      onContentChange: handleContentChange,
    }),
    [state.fullscreen, i18n.language, editorFontStyle]
  );

  return (
    <div className={`memo-editor-container ${mobileEditorStyle} ${isEditing ? "edit-ing" : ""} ${state.fullscreen ? "fullscreen" : ""}`}>
      <div className={`tip-container ${isEditing ? "" : "!hidden"}`}>
        <span className="tip-text">{t("editor.editing")}</span>
        <button className="cancel-btn" onClick={handleCancelEditing}>
          {t("common.cancel")}
        </button>
      </div>
      <Editor ref={editorRef} {...editorConfig} onPaste={handlePasteEvent} />
      <div className="common-tools-wrapper">
        <div className="common-tools-container">
          <div className="action-btn tag-action">
            <Icon.Hash className="icon-img" />
            <div ref={tagSeletorRef} className="tag-list" onClick={handleTagSeletorClick}>
              {tags.length > 0 ? (
                tags.map((tag) => {
                  return (
                    <span className="item-container" key={tag}>
                      {tag}
                    </span>
                  );
                })
              ) : (
                <p className="tip-text" onClick={(e) => e.stopPropagation()}>
                  {t("common.null")}
                </p>
              )}
            </div>
          </div>
          <button className="action-btn">
            <Icon.Smile className="icon-img" onClick={handleEmojiPickerBtnClick} />
          </button>
          <button className="action-btn">
            <Icon.CheckSquare className="icon-img" onClick={handleCheckBoxBtnClick} />
          </button>
          <button className="action-btn">
            <Icon.Code className="icon-img" onClick={handleCodeBlockBtnClick} />
          </button>
          <button className="action-btn">
            <Icon.FileText className="icon-img" onClick={handleUploadFileBtnClick} />
            <span className={`tip-text ${state.isUploadingResource ? "!block" : ""}`}>Uploading</span>
          </button>
          <button className="action-btn" onClick={handleFullscreenBtnClick}>
            {state.fullscreen ? <Icon.Minimize className="icon-img" /> : <Icon.Maximize className="icon-img" />}
          </button>
        </div>
        <div className="btns-container">
          <button className="action-btn confirm-btn" disabled={!allowSave} onClick={handleSaveBtnClick}>
            {t("editor.save")} <span className="icon-text">✍️</span>
          </button>
        </div>
      </div>
      {state.resourceList.length > 0 && (
        <div className="resource-list-wrapper">
          {state.resourceList.map((resource) => {
            return (
              <div key={resource.id} className="resource-container">
                {resource.type.includes("image") ? <Icon.Image className="icon-img" /> : <Icon.FileText className="icon-img" />}
                <span className="name-text">{resource.filename}</span>
                <Icon.X className="close-icon" onClick={() => handleDeleteResource(resource.id)} />
              </div>
            );
          })}
        </div>
      )}
      <EmojiPicker
        shouldShow={state.shouldShowEmojiPicker}
        onEmojiClick={handleEmojiClick}
        onShouldShowEmojiPickerChange={handleChangeShouldShowEmojiPicker}
      />
    </div>
  );
};

export default MemoEditor;
