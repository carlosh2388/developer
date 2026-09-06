export default function CancelEditButton({ onCancel }) {
  return <button type="button" className="cancel-edit-button new-record-button" onClick={onCancel}><span aria-hidden="true">&#43;</span> Nuevo</button>;
}
