import { fireEvent, render, screen, waitFor, cleanup } from '@testing-library/react';
import { beforeEach, afterEach, expect, test, vi } from 'vitest';
import EgresoHuevos from './EgresoHuevos';
import { api } from '../services/api';
import { saveOperation } from '../services/operations';
vi.mock('../hooks/useOperationalCatalogs', () => ({ useOperationalCatalogs: () => ({
 bodegas: [
 {id: 'a', code:'COM-A', name:'Huevo Comercial salida', locationId:'1'},
 {id: 'b', code:'COM-B', name:'Huevo Comercial destino', locationId:'2'},
 {id: 'c', code:'INC-A', name:'Huevo Incubable', locationId:'1'},
 {id: 'd', code:'INC-B', name:'Huevo Incubable', locationId:'3'}],
 localidades:[{id:'1',name:'Granja'},{id:'2',name:'Centro'},{id:'3',name:'Incubadora'}],
 clientes:[], opciones:()=>[]
}) }));
vi.mock('../services/api', () => ({ api:vi.fn() }));
vi.mock('../services/operations', async (original) => ({ ...await original(), saveOperation:vi.fn() }));
vi.mock('../components/OperationRecordsModal', () => ({ compareMovementDesc:()=>0, default:({onEdit})=><button onClick={()=>onEdit({id:'saved'})}>Editar prueba</button> }));
const change=(node,value)=>fireEvent.change(node,{target:{value}});
const locality=(container,text)=>Array.from(container.querySelectorAll('label')).find(x=>x.textContent===text).nextElementSibling;
beforeEach(()=>{
 vi.spyOn(window,'alert').mockImplementation(()=>{});
 api.mockImplementation(async path=> path.includes('siguiente') ? {shipmentNumber:1} : path.includes('resumen') ? {availableUnits:100} : [{grade_code:'COM_XL_M_NEST',available_units:100}]);
 saveOperation.mockResolvedValue({});
});
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.clearAllMocks();});
test('bodegas dependen de su localidad y se limpian al cambiarla',()=>{
 const {container}=render(<EgresoHuevos/>);
 const source=screen.getByLabelText('Bodega Salida'), target=screen.getByLabelText('Bodega Destino');
 expect(source.disabled).toBe(true); expect(target.disabled).toBe(true);
 change(locality(container,'Localidad Salida'),'1'); expect(source.disabled).toBe(false);
 change(source,'COM-A'); change(locality(container,'Localidad Destino'),'2'); expect(target.disabled).toBe(false);
 change(target,'BODEGA:COM-B'); change(locality(container,'Localidad Destino'),''); expect(target.disabled).toBe(true);expect(target.value).toBe('');
 change(locality(container,'Localidad Salida'),'');expect(source.disabled).toBe(true);expect(source.value).toBe('');
});
test('agrega varias lineas comerciales, guarda y vuelve a editar sin perder colores',async()=>{
 const {container}=render(<EgresoHuevos/>);
 change(locality(container,'Localidad Salida'),'1');change(screen.getByLabelText('Bodega Salida'),'COM-A');
 change(locality(container,'Localidad Destino'),'2');change(screen.getByLabelText('Bodega Destino'),'BODEGA:COM-B');
 fireEvent.click(screen.getByRole('button',{name:'Agregar línea de huevos'}));
 const colors=Array.from(container.querySelectorAll('select')).filter(s=>Array.from(s.options).some(o=>o.value==='Blanco'));
 expect(colors.length).toBe(2);change(colors[0],'Blanco');change(colors[1],'Rojo');
 await waitFor(()=>expect(api.mock.calls.filter(([p])=>p.includes('color=')).length).toBeGreaterThanOrEqual(2));
 const tables=container.querySelectorAll('table');
 change(tables[0].querySelector('tbody tr td:nth-child(5) input'),'2');change(tables[1].querySelector('tbody tr td:nth-child(5) input'),'3');
 fireEvent.click(screen.getByText('Registrar Egreso'));
 await waitFor(()=>expect(saveOperation).toHaveBeenCalledOnce());
 const body=saveOperation.mock.calls[0][1];expect(body.detalles.map(d=>d.color)).toEqual(['Blanco','Rojo']);
 api.mockImplementation(async path=>path.endsWith('/saved')?{movement_date:'2026-10-14',source_warehouse_code:'COM-A',destination_warehouse_code:'COM-B',detalles:body.detalles.map(d=>({grade_code:d.clasificacion,color:d.color,loose_units:d.unidades,existing_units:100}))}:path.includes('siguiente')?{shipmentNumber:2}:[]);
 fireEvent.click(screen.getByText('Editar prueba'));
 await screen.findByText('Guardar cambios');
 await waitFor(()=>expect(Array.from(container.querySelectorAll('select')).filter(s=>s.value==='Blanco'||s.value==='Rojo').length).toBe(2));
 fireEvent.click(screen.getByText('Guardar cambios'));
 await waitFor(()=>expect(saveOperation).toHaveBeenCalledTimes(2));
 expect(saveOperation.mock.calls[1][2]).toBe('saved');expect(saveOperation.mock.calls[1][1].detalles).toHaveLength(2);
});
test('permite agregar lineas incubables',()=>{
 const {container}=render(<EgresoHuevos/>);change(locality(container,'Localidad Salida'),'1');change(screen.getByLabelText('Bodega Salida'),'INC-A');
 fireEvent.click(screen.getByRole('button',{name:'Agregar línea de huevos'}));
 expect(Array.from(container.querySelectorAll('select')).filter(s=>s.value==='Incubable')).toHaveLength(2);
});
test('suma las lineas repetidas para impedir exceder la existencia',async()=>{
 const {container}=render(<EgresoHuevos/>);
 change(locality(container,'Localidad Salida'),'1');change(screen.getByLabelText('Bodega Salida'),'COM-A');
 change(locality(container,'Localidad Destino'),'2');change(screen.getByLabelText('Bodega Destino'),'BODEGA:COM-B');
 fireEvent.click(screen.getByRole('button',{name:'Agregar línea de huevos'}));
 const colors=Array.from(container.querySelectorAll('select')).filter(s=>Array.from(s.options).some(o=>o.value==='Blanco'));
 colors.forEach(s=>change(s,'Blanco'));
 await waitFor(()=>expect(container.querySelector('tbody tr input').value).toBe('100'));
 container.querySelectorAll('table').forEach(t=>change(t.querySelector('tbody tr td:nth-child(5) input'),'60'));
 fireEvent.click(screen.getByText('Registrar Egreso'));
 await waitFor(()=>expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Solicitado: 120')));
 expect(saveOperation).not.toHaveBeenCalled();
});
