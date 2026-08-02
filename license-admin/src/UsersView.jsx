import { useCallback, useEffect, useState } from "react";
import { api } from "./api";

const blank = { fullName:"",username:"",password:"",roleCode:"OPERATOR",status:"ACTIVE" };

export default function UsersView({ organizations, notify }) {
  const [scope,setScope]=useState("CLIENT");
  const [organizationId,setOrganizationId]=useState(organizations[0]?.id || "");
  const [users,setUsers]=useState([]),[roles,setRoles]=useState([]),[quota,setQuota]=useState(null);
  const [form,setForm]=useState(blank),[editing,setEditing]=useState(null),[busy,setBusy]=useState(false);
  const load=useCallback(async()=>{
    if(scope==="CLIENT"&&!organizationId){setUsers([]);setQuota(null);return;}
    try{const params=new URLSearchParams({scope});if(scope==="CLIENT")params.set("organizationId",organizationId);
      const [data,roleData]=await Promise.all([api(`/platform/users?${params}`),api("/platform/users/roles")]);
      setUsers(data.users);setQuota(data.quota);setRoles(roleData);
    }catch(e){notify("error",e.message);}
  },[scope,organizationId,notify]);
  useEffect(()=>{load();},[load]);
  function reset(){setEditing(null);setForm(blank);}
  function edit(user){setEditing(user);setForm({fullName:user.full_name,username:user.username,password:"",roleCode:user.role_code,status:user.status});}
  async function save(event){event.preventDefault();setBusy(true);try{
    const payload={...form,userScope:scope,organizationId:scope==="CLIENT"?organizationId:null};
    const result=editing?await api(`/platform/users/${editing.id}`,{method:"PUT",body:JSON.stringify(payload)}):await api("/platform/users",{method:"POST",body:JSON.stringify(payload)});
    notify("ok",result.message);reset();await load();
  }catch(e){notify("error",e.message);}finally{setBusy(false);}}
  async function resetPassword(user){const password=window.prompt(`Nueva contraseña temporal para ${user.full_name} (mínimo 8 caracteres):`);if(!password)return;
    try{const result=await api(`/platform/users/${user.id}/password`,{method:"PATCH",body:JSON.stringify({password})});notify("ok",result.message);}catch(e){notify("error",e.message);}}
  async function closeSession(user){if(!window.confirm(`¿Cerrar la sesión activa de ${user.full_name}?`))return;
    try{const result=await api(`/platform/users/${user.id}/session`,{method:"DELETE"});notify("ok",result.message);await load();}catch(e){notify("error",e.message);}}
  return <>
    <section className="card filters"><div><h2>Clasificación de usuarios</h2><p>Separa el control central de las cuentas de cada cliente.</p></div>
      <label>Aplicación<select value={scope} onChange={e=>{setScope(e.target.value);reset();}}><option value="CLIENT">Aplicación del cliente</option><option value="PLATFORM">Administración de licencias</option></select></label>
      {scope==="CLIENT"&&<label>Cliente<select value={organizationId} onChange={e=>{setOrganizationId(e.target.value);reset();}} required><option value="">Seleccionar cliente</option>{organizations.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select></label>}
    </section>
    {scope==="CLIENT"&&quota&&<section className="metrics"><article><span>Usuarios activos</span><strong>{quota.active_users}</strong></article><article><span>Cupo autorizado</span><strong>{quota.max_users}</strong></article><article><span>Disponibles</span><strong>{Math.max(0,quota.max_users-quota.active_users)}</strong></article></section>}
    <div className="forms client-layout"><form className="card" onSubmit={save}><h2>{editing?"Editar usuario":"Crear usuario"}</h2>
      <label>Nombre completo<input value={form.fullName} onChange={e=>setForm({...form,fullName:e.target.value})} required/></label>
      <label>Usuario<input minLength="3" maxLength="60" pattern="[A-Za-z0-9._-]+" value={form.username} onChange={e=>setForm({...form,username:e.target.value})} required/></label>
      {!editing&&<label>Contraseña temporal<input type="password" minLength="8" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required/></label>}
      {scope==="CLIENT"&&<label>Rol<select value={form.roleCode} onChange={e=>setForm({...form,roleCode:e.target.value})}>{roles.map(r=><option key={r.code} value={r.code}>{r.name}</option>)}</select></label>}
      {editing&&<label>Estado<select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option value="ACTIVE">Activo</option><option value="INACTIVE">Inactivo</option><option value="LOCKED">Bloqueado</option></select></label>}
      <div className="modal-actions"><button disabled={busy}>{editing?"Guardar cambios":"Crear usuario"}</button>{editing&&<button type="button" className="secondary" onClick={reset}>Cancelar</button>}</div></form>
      <section className="card list client-list"><div className="section-title"><div><h2>Usuarios registrados</h2><p>{users.length} usuario(s)</p></div></div><div className="scroll"><table><thead><tr><th>Usuario</th><th>Clasificación</th><th>Rol</th><th>Estado</th><th>Sesión</th><th>Acciones</th></tr></thead><tbody>{users.map(user=><tr key={user.id}><td><strong>{user.full_name}</strong><small>@{user.username}</small></td><td>{user.user_scope==="PLATFORM"?"Licencias":user.organization_name}</td><td>{user.role_name}</td><td><span className={`pill ${user.status.toLowerCase()}`}>{user.status}</span></td><td>{user.session_active?<span className="pill active">Abierta</span>:"Sin sesión"}</td><td><div className="actions"><button type="button" className="secondary" onClick={()=>edit(user)}>Editar</button><button type="button" className="secondary" onClick={()=>resetPassword(user)}>Contraseña</button>{user.session_active&&<button type="button" className="warning" onClick={()=>closeSession(user)}>Cerrar sesión</button>}</div></td></tr>)}</tbody></table>{!users.length&&<div className="empty">No hay usuarios para esta selección.</div>}</div></section>
    </div>
  </>;
}
