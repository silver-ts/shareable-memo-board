type ShortcutId = number;

interface Shortcut {
  id: ShortcutId;

  rowStatus: RowStatus;
  createdTs: TimeStamp;
  updatedTs: TimeStamp;

  title: string;
  payload: string;
}

interface ShortcutCreate {
  title: string;
  payload: string;
}

interface ShortcutPatch {
  id: ShortcutId;
  title?: string;
  payload?: string;
  rowStatus?: RowStatus;
}
