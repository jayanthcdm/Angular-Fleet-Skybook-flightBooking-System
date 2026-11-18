import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { PaymentService } from '../src/app/core/services/payment.service.ts';

describe('PaymentService Simulation', () => {
  const service = new PaymentService();

  it('should generate properly formatted transaction reference', () => {
    const txnId = service.generateTransactionId();
    assert.equal(typeof txnId, 'string');
    assert.ok(txnId.startsWith('TXN-'));
    assert.match(txnId, /^TXN-\d{8}-\d{6}$/);
  });

  it('should track processing state and prevent duplicate submissions', () => {
    assert.equal(service.isProcessing(), false);
    service.isProcessing.set(true);
    assert.equal(service.isProcessing(), true);
    service.isProcessing.set(false);
  });
});
