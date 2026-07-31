const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
export async function api(path, options={}) {
  const token=sessionStorage.getItem("avinext_platform_token");
  const response=await fetch(`${BASE_URL}/api${path}`,{...options,headers:{"Content-Type":"application/json",...(token?{Authorization:`Bearer ${token}`}:{})}});
  if(response.status===204)return null; const data=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(data.message||"No fue posible completar la solicitud."); return data;
}

