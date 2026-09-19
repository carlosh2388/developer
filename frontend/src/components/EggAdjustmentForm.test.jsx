import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import EggAdjustmentForm from './EggAdjustmentForm';

const mockOperationalCatalogs = {
  bodegas: [
    { id: 1, code: 'INC-01', name: 'Bodega HUEVO INCUBABLE', locationId: 2, status: 'ACTIVE' },
  ],
  localidades: [
    { id: 2, name: 'Localidad 1', status: 'ACTIVE' },
  ],
  opciones: (name) => (name === 'lotes' ? [{ value: 'LT-001', label: 'LT-001' }] : []),
};

vi.mock('../hooks/useOperationalCatalogs', () => ({
  useOperationalCatalogs: () => mockOperationalCatalogs,
}));

vi.mock('../services/api', () => ({
  api: vi.fn(() => Promise.resolve([])),
}));

describe('EggAdjustmentForm', () => {
  test('muestra el boton de agregar lote sin crear filas de detalle', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const { container } = render(
      <EggAdjustmentForm
        date="2026-09-16"
        movementType="ADJUSTMENT_IN"
        onSaved={() => {}}
      />
    );

    fireEvent.change(screen.getByLabelText(/clasificaci/i), { target: { value: 'INCUBABLE' } });
    fireEvent.change(screen.getByLabelText(/localidad/i), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText(/bodega/i), { target: { value: 'INC-01' } });

    expect(await screen.findByRole('button', { name: /agregar lote/i })).toBeInTheDocument();
    expect(container.querySelectorAll('tbody tr')).toHaveLength(1);

    fireEvent.click(screen.getByRole('button', { name: /agregar lote/i }));
    expect(container.querySelectorAll('tbody tr')).toHaveLength(1);
    expect(alertSpy).toHaveBeenCalledWith('Para agregar un lote nuevo, usa Datos Maestros > Lotes.');

    alertSpy.mockRestore();
  });

  test('no agrega una fila nueva cuando la linea actual esta incompleta', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const { container } = render(
      <EggAdjustmentForm
        date="2026-09-16"
        movementType="ADJUSTMENT_IN"
        onSaved={() => {}}
      />
    );

    fireEvent.change(screen.getByLabelText(/clasificaci/i), { target: { value: 'INCUBABLE' } });
    fireEvent.change(screen.getByLabelText(/localidad/i), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText(/bodega/i), { target: { value: 'INC-01' } });

    fireEvent.click(await screen.findByRole('button', { name: /\+ Nuevo/i }));

    expect(container.querySelectorAll('tbody tr')).toHaveLength(1);
    expect(alertSpy).toHaveBeenCalledWith('Completa la linea actual antes de agregar una nueva.');

    alertSpy.mockRestore();
  });
});
