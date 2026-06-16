package com.smartestate.service;

import com.smartestate.dto.PaymentGenerateRequest;
import com.smartestate.dto.PaymentOverdueStats;
import com.smartestate.dto.PaymentRemindRequest;
import com.smartestate.entity.Payment;

import java.util.List;
import java.util.Map;

public interface PaymentService {
    List<Payment> list(Long userId, String role);
    Payment pay(Long id, String role);
    Payment generate(String role, PaymentGenerateRequest request);
    PaymentOverdueStats getOverdueStats(String role);
    Map<String, Object> sendReminders(String role, PaymentRemindRequest request);
}
