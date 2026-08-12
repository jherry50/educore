import Modal from "./Modal";

export default function ConfirmDialog({
  open,
  title = "Confirm action",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
    >
      <p className="text-sm leading-6 text-slate-600">
        {message}
      </p>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          {cancelText}
        </button>

        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? "Processing..." : confirmText}
        </button>
      </div>
    </Modal>
  );
}