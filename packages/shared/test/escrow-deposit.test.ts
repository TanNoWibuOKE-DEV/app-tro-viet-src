import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createDepositEscrow,
  checkEscrowExpiry,
  releaseDepositEscrow,
  disputeDepositEscrow,
  resolveDisputedEscrow,
  evaluateAutoReleaseAfterExpiry,
  generateDepositEscrowCode,
  MIN_DEPOSIT_ESCROW_AMOUNT,
} from '../src/escrow/deposit';

describe('Phase 11 Secure Deposit Escrow Protocol', () => {
  const sampleParams = {
    listingId: 'l-001',
    listingTitle: 'Phòng trọ ban công ngõ 68 Cầu Giấy',
    tenantId: 'u-tenant-1',
    tenantName: 'Nguyễn Văn An',
    tenantPhone: '0905123456',
    landlordId: 'u-landlord-1',
    landlordName: 'Cô Lan',
    landlordPhone: '0912345678',
    amount: 500000,
    monthlyRent: 3500000,
  };

  it('generates a valid escrow code starting with DEP and 6 digits', () => {
    const code = generateDepositEscrowCode();
    assert.match(code, /^DEP\d{6}$/);
  });

  it('creates an escrow holding record with 48h expiration window', () => {
    const escrow = createDepositEscrow(sampleParams);
    assert.strictEqual(escrow.status, 'holding');
    assert.strictEqual(escrow.amount, 500000);
    assert.strictEqual(escrow.tenantId, 'u-tenant-1');
    assert.strictEqual(escrow.landlordId, 'u-landlord-1');
    assert.match(escrow.escrowCode, /^DEP\d{6}$/);

    // Verify 48h window
    const createdMs = new Date(escrow.createdAt).getTime();
    const holdUntilMs = new Date(escrow.holdUntil).getTime();
    const diffHours = (holdUntilMs - createdMs) / (3600 * 1000);
    assert.strictEqual(Math.round(diffHours), 48);
  });

  it('rejects deposit amount below minimum limit (200,000 VND)', () => {
    assert.throws(
      () =>
        createDepositEscrow({
          ...sampleParams,
          amount: 150000,
        }),
      (err: Error) => {
        return err.message.includes('tối thiểu là 200.000 ₫');
      }
    );
  });

  it('rejects deposit amount exceeding 1 month rent', () => {
    assert.throws(
      () =>
        createDepositEscrow({
          ...sampleParams,
          amount: 4000000,
          monthlyRent: 3500000,
        }),
      (err: Error) => {
        return err.message.includes('không được vượt quá 1 tháng tiền phòng');
      }
    );
  });

  it('calculates remaining time accurately and detects expiration', () => {
    const escrow = createDepositEscrow(sampleParams);

    // 10 hours after creation
    const tenHoursLater = new Date(new Date(escrow.createdAt).getTime() + 10 * 3600 * 1000);
    const check1 = checkEscrowExpiry(escrow, tenHoursLater);
    assert.strictEqual(check1.isExpired, false);
    assert.strictEqual(check1.remainingHours, 38);

    // 49 hours after creation (expired)
    const fortyNineHoursLater = new Date(new Date(escrow.createdAt).getTime() + 49 * 3600 * 1000);
    const check2 = checkEscrowExpiry(escrow, fortyNineHoursLater);
    assert.strictEqual(check2.isExpired, true);
    assert.strictEqual(check2.remainingHours, 0);
  });

  it('releases deposit to landlord upon handover confirmation', () => {
    const escrow = createDepositEscrow(sampleParams);
    const released = releaseDepositEscrow(escrow, {
      handoverId: 'ho-1029',
      notes: 'Đã kiểm tra phòng và ký biên bản bàn giao thành công.',
    });

    assert.strictEqual(released.status, 'released');
    assert.strictEqual(released.handoverId, 'ho-1029');
    assert.ok(released.releasedAt);
  });

  it('disallows releasing a deposit that is not in holding status', () => {
    const escrow = createDepositEscrow(sampleParams);
    const released = releaseDepositEscrow(escrow);

    assert.throws(
      () => releaseDepositEscrow(released),
      (err: Error) => err.message.includes('Không thể giải ngân')
    );
  });

  it('allows raising a dispute and halts release', () => {
    const escrow = createDepositEscrow(sampleParams);
    const disputed = disputeDepositEscrow(
      escrow,
      'Phòng thực tế không có ban công như trong ảnh tin đăng.'
    );

    assert.strictEqual(disputed.status, 'disputed');
    assert.strictEqual(
      disputed.disputeReason,
      'Phòng thực tế không có ban công như trong ảnh tin đăng.'
    );

    // Cannot release disputed escrow directly
    assert.throws(
      () => releaseDepositEscrow(disputed),
      (err: Error) => err.message.includes('Không thể giải ngân')
    );
  });

  it('resolves dispute with 100% refund to tenant when landlord misrepresents room', () => {
    const escrow = createDepositEscrow(sampleParams);
    const disputed = disputeDepositEscrow(
      escrow,
      'Chủ trọ không có mặt giao phòng và khóa máy.'
    );

    const resolved = resolveDisputedEscrow(
      disputed,
      'refund_to_tenant',
      'Đã đối soát vi phạm và hoàn tiền 100% cho người thuê qua STK ngân hàng.'
    );

    assert.strictEqual(resolved.status, 'refunded');
    assert.ok(resolved.refundedAt);
    assert.strictEqual(
      resolved.resolutionNotes,
      'Đã đối soát vi phạm và hoàn tiền 100% cho người thuê qua STK ngân hàng.'
    );
  });

  it('resolves dispute in favor of landlord if tenant cancelled without valid reason', () => {
    const escrow = createDepositEscrow(sampleParams);
    const disputed = disputeDepositEscrow(escrow, 'Tôi đổi ý không muốn thuê nữa');

    const resolved = resolveDisputedEscrow(
      disputed,
      'release_to_landlord',
      'Giải ngân cọc cho chủ trọ do người thuê đơn phương hủy cọc.'
    );

    assert.strictEqual(resolved.status, 'released');
    assert.ok(resolved.releasedAt);
  });

  it('auto-releases deposit after 48h limit if tenant does not dispute', () => {
    const escrow = createDepositEscrow(sampleParams);
    const pastTime = new Date(new Date(escrow.createdAt).getTime() + 50 * 3600 * 1000);

    const evaluated = evaluateAutoReleaseAfterExpiry(escrow, pastTime);
    assert.strictEqual(evaluated.status, 'released');
    assert.ok(evaluated.resolutionNotes?.includes('Tự động giải ngân'));
  });
});
